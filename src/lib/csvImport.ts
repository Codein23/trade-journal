import { newTrade } from "@/lib/factories";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import type { Trade } from "@/types";

/* ------------------------------------------------------------------ *
 * CSV parsing
 * ------------------------------------------------------------------ */

/** Parse CSV text into rows of cells. Handles quoted fields and "" escapes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell); cell = "";
    } else if (c === "\n") {
      row.push(cell); rows.push(row); row = []; cell = "";
    } else {
      cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function num(s: string | undefined): number {
  if (!s) return NaN;
  return parseFloat(s.replace(/,/g, "").trim());
}

/* ------------------------------------------------------------------ *
 * Futures point-value map ($ per 1.0 index point, per contract)
 * ------------------------------------------------------------------ */

const POINT_VALUE: Record<string, number> = {
  ES: 50, MES: 5,
  NQ: 20, MNQ: 2,
  RTY: 50, M2K: 5,
  YM: 5, MYM: 0.5,
  CL: 1000, MCL: 100,
  GC: 100, MGC: 10,
  SI: 5000, NG: 10000,
  "6E": 125000, "6J": 12500000,
};

/** Root product code (MNQ from "MNQ" or "MNQU6"). */
function productRoot(product: string, contract: string): string {
  const p = (product || contract || "").toUpperCase().trim();
  if (POINT_VALUE[p] !== undefined) return p;
  // strip trailing month/year code from contract like MNQU6
  const m = p.match(/^([A-Z0-9]{1,4}?)[FGHJKMNQUVXZ]\d{1,2}$/);
  if (m && POINT_VALUE[m[1]] !== undefined) return m[1];
  return p;
}

function multiplier(root: string): number {
  return POINT_VALUE[root] ?? 1;
}

function toISODate(s: string): string {
  // "06/24/2026 16:51:50" or "6/24/26"
  const datePart = s.trim().split(/\s+/)[0];
  const m = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, mm, dd, yy] = m;
    if (yy.length === 2) yy = "20" + yy;
    return `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ *
 * Result type
 * ------------------------------------------------------------------ */

export interface CsvImportResult {
  trades: Trade[];
  totalPnl: number;
  openCycles: number; // positions left open (not flat) — not emitted
  symbols: { root: string; mult: number; unknown: boolean }[];
  source: "orders" | "journal";
}

/* ------------------------------------------------------------------ *
 * Round-trip reconstruction from an order/fill export
 * ------------------------------------------------------------------ */

interface Fill {
  time: string;
  side: 1 | -1; // Buy +1 / Sell -1
  qty: number;
  price: number;
  root: string;
  contract: string;
  account: string;
}

interface Lot { qty: number; price: number } // qty signed

/** Stable fingerprint so re-importing overlapping data doesn't duplicate trades. */
function makeKey(parts: (string | number)[]): string {
  return parts.map((p) => String(p).trim()).join("|");
}

function header(rows: string[][]): { head: string[]; idx: (name: string) => number } {
  const head = rows[0].map((h) => h.trim());
  const idx = (name: string) => head.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  return { head, idx };
}

function buildFromOrders(rows: string[][]): CsvImportResult {
  const { idx } = header(rows);
  const iStatus = idx("Status");
  const iBS = idx("B/S");
  const iProduct = idx("Product");
  const iContract = idx("Contract");
  const iFillTime = idx("Fill Time");
  const iFilledQty = idx("Filled Qty") >= 0 ? idx("Filled Qty") : idx("filledQty");
  const iAvgFill = idx("Avg Fill Price") >= 0 ? idx("Avg Fill Price") : idx("avgPrice");
  const iAccount = idx("Account");

  const fills: Fill[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if ((row[iStatus] ?? "").trim() !== "Filled") continue;
    const bs = (row[iBS] ?? "").trim().toLowerCase();
    const side: 1 | -1 = bs === "buy" ? 1 : -1;
    const qty = num(row[iFilledQty]);
    const price = num(row[iAvgFill]);
    const time = (row[iFillTime] ?? "").trim();
    if (!qty || Number.isNaN(price)) continue;
    const root = productRoot(row[iProduct] ?? "", row[iContract] ?? "");
    fills.push({
      time, side, qty: Math.abs(qty), price, root,
      contract: (row[iContract] ?? "").trim(),
      account: (row[iAccount] ?? "").trim(),
    });
  }

  // Sort by fill time chronologically.
  fills.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const trades: Trade[] = [];
  const usedSymbols = new Map<string, boolean>();
  let openCycles = 0;

  // Per-symbol position engine.
  const books = new Map<string, {
    lots: Lot[];
    position: number;
    cycle: null | {
      entryTime: string; exitTime: string; direction: "Long" | "Short"; realized: number;
      qtyTraded: number; entryPrice: number; exitPrice: number; contract: string; account: string;
    };
  }>();

  for (const f of fills) {
    usedSymbols.set(f.root, multiplier(f.root) === 1 && POINT_VALUE[f.root] === undefined);
    const mult = multiplier(f.root);
    let book = books.get(f.root);
    if (!book) { book = { lots: [], position: 0, cycle: null }; books.set(f.root, book); }

    if (book.position === 0) {
      book.cycle = {
        entryTime: f.time, exitTime: f.time, direction: f.side > 0 ? "Long" : "Short", realized: 0,
        qtyTraded: 0, entryPrice: f.price, exitPrice: f.price, contract: f.contract, account: f.account,
      };
    }

    let remaining = f.qty;
    // Close against opposite lots first.
    while (remaining > 0 && book.lots.length && Math.sign(book.lots[0].qty) !== f.side) {
      const lot = book.lots[0];
      const lotDir = Math.sign(lot.qty); // +1 long
      const match = Math.min(remaining, Math.abs(lot.qty));
      book.cycle!.realized += (f.price - lot.price) * lotDir * match * mult;
      book.cycle!.exitPrice = f.price;
      book.cycle!.exitTime = f.time;
      book.cycle!.qtyTraded += match;
      lot.qty -= lotDir * match;
      book.position -= lotDir * match;
      remaining -= match;
      if (lot.qty === 0) book.lots.shift();
    }
    // Any leftover opens a new lot in this direction.
    if (remaining > 0) {
      book.lots.push({ qty: f.side * remaining, price: f.price });
      book.position += f.side * remaining;
    }

    // Flat again → emit the completed round-trip as a trade.
    if (book.position === 0 && book.cycle) {
      const c = book.cycle;
      const pnl = Math.round(c.realized * 100) / 100;
      trades.push(newTrade({
        date: toISODate(c.entryTime),
        pair: f.root,
        direction: c.direction,
        profitLoss: pnl,
        account: c.account,
        outcome: c.realized > 0 ? "Win" : c.realized < 0 ? "Loss" : "BE",
        breakEven: c.realized === 0,
        notes: `Imported from CSV · ${c.contract} · qty ${c.qtyTraded} · entry ${c.entryPrice} → exit ${c.exitPrice}`,
        importKey: makeKey([c.account, f.root, c.contract, c.entryTime, c.exitTime, c.qtyTraded, pnl]),
      }));
      book.cycle = null;
    }
  }

  for (const book of books.values()) if (book.position !== 0) openCycles++;

  const totalPnl = Math.round(trades.reduce((s, t) => s + t.profitLoss, 0) * 100) / 100;
  const symbols = [...usedSymbols.entries()].map(([root, unknown]) => ({
    root, mult: multiplier(root), unknown,
  }));

  return { trades, totalPnl, openCycles, symbols, source: "orders" };
}

/* ------------------------------------------------------------------ *
 * Re-import of this app's own trades CSV export
 * ------------------------------------------------------------------ */

function buildFromJournalCsv(rows: string[][]): CsvImportResult {
  const { idx } = header(rows);
  const trades: Trade[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const pl = num(row[idx("Profit/Loss")]);
    const date = (row[idx("Date")] ?? "").trim();
    if (!date) continue;
    const outcomeRaw = (row[idx("WIN")] ?? "").trim();
    const outcome = outcomeRaw === "Win" || outcomeRaw === "Loss" || outcomeRaw === "BE"
      ? outcomeRaw : pl > 0 ? "Win" : pl < 0 ? "Loss" : "BE";
    const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : toISODate(date);
    const pair = (row[idx("Pairs")] ?? "").trim();
    const direction = (row[idx("Direction")] ?? "").trim();
    const account = (row[idx("Account")] ?? "").trim();
    trades.push(newTrade({
      date: isoDate,
      pair,
      session: ((row[idx("Session")] ?? "").trim() || "") as Trade["session"],
      direction: ((row[idx("Direction")] ?? "").trim() || "") as Trade["direction"],
      profitLoss: Number.isNaN(pl) ? 0 : pl,
      model: (row[idx("Model")] ?? "").trim(),
      account,
      followedRules: (row[idx("Followed rules")] ?? "").trim().toLowerCase() === "true",
      breakEven: (row[idx("BE")] ?? "").trim().toLowerCase() === "true",
      positiveTags: splitTags(row[idx("Positive tags")]),
      negativeTags: splitTags(row[idx("Negative tags")]),
      rating: num(row[idx("Rating")]) || 0,
      outcome,
      importKey: makeKey([account, pair, isoDate, direction, Number.isNaN(pl) ? 0 : pl]),
    }));
  }
  const totalPnl = Math.round(trades.reduce((s, t) => s + t.profitLoss, 0) * 100) / 100;
  return { trades, totalPnl, openCycles: 0, symbols: [], source: "journal" };
}

function splitTags(s: string | undefined): string[] {
  if (!s) return [];
  return s.split(";").map((x) => x.trim()).filter(Boolean);
}

/* ------------------------------------------------------------------ *
 * Entry point — auto-detect format
 * ------------------------------------------------------------------ */

export function parseTradesCsv(text: string): CsvImportResult {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { trades: [], totalPnl: 0, openCycles: 0, symbols: [], source: "orders" };
  }
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const isJournal = head.includes("profit/loss") && head.includes("pairs");
  return isJournal ? buildFromJournalCsv(rows) : buildFromOrders(rows);
}

export interface ImportPlan {
  result: CsvImportResult;
  fresh: Trade[]; // not already in the DB, de-duped within the batch
  duplicates: number; // skipped because already present or repeated
}

/**
 * Compare parsed trades against what's already stored and within the batch,
 * using the stable importKey, so re-importing overlapping data adds nothing twice.
 */
export async function analyzeImport(result: CsvImportResult): Promise<ImportPlan> {
  const existing = await db.trades.toArray();
  const known = new Set(existing.map((t) => t.importKey).filter(Boolean) as string[]);
  const seen = new Set<string>();
  const fresh: Trade[] = [];
  let duplicates = 0;
  for (const t of result.trades) {
    const k = t.importKey;
    if (k && (known.has(k) || seen.has(k))) {
      duplicates++;
      continue;
    }
    if (k) seen.add(k);
    fresh.push(t);
  }
  return { result, fresh, duplicates };
}

/** Human-readable preview shown before committing an import. */
export function importSummary(plan: ImportPlan): string {
  const { result: r, fresh, duplicates } = plan;
  if (r.trades.length === 0) return "No completed trades found in this CSV.";

  const freshPnl = Math.round(fresh.reduce((s, t) => s + t.profitLoss, 0) * 100) / 100;
  const kind = r.source === "orders" ? "round-trip trades reconstructed from order fills" : "trades";
  const lines = [`Parsed ${r.trades.length} ${kind}.`];

  if (duplicates > 0) {
    lines.push(`${duplicates} already imported — will be skipped (no duplicates).`);
  }
  lines.push(`${fresh.length} new trade(s) to import.`, `New P&L: ${formatMoney(freshPnl)}`);

  if (r.source === "orders") {
    const syms = r.symbols
      .map((s) => `${s.root} (×${s.mult}${s.unknown ? " — unknown, assumed 1pt=$1" : ""})`)
      .join(", ");
    if (syms) lines.push(`Symbols: ${syms}`);
    if (r.openCycles > 0) lines.push(`${r.openCycles} position(s) still open were skipped.`);
  }
  lines.push("", "Import the new trades?");
  return lines.join("\n");
}

/** Persist the de-duped fresh trades (adds; keeps existing data). */
export async function commitImportedTrades(trades: Trade[]): Promise<void> {
  await db.trades.bulkAdd(trades);
}
