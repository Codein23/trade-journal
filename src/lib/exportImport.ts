import { db } from "@/lib/db";
import { download } from "@/lib/utils";
import type { Trade } from "@/types";

interface ExportBundle {
  app: "trade-journal";
  version: 1;
  exportedAt: string;
  trades: unknown[];
  reviews: unknown[];
  missedTrades: unknown[];
  milestones: unknown[];
  settings: unknown[];
}

export async function exportAllJson(): Promise<void> {
  const bundle: ExportBundle = {
    app: "trade-journal",
    version: 1,
    exportedAt: new Date().toISOString(),
    trades: await db.trades.toArray(),
    reviews: await db.reviews.toArray(),
    missedTrades: await db.missedTrades.toArray(),
    milestones: await db.milestones.toArray(),
    settings: await db.settings.toArray(),
  };
  download(
    `trade-journal-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(bundle, null, 2),
    "application/json",
  );
}

export async function importAllJson(text: string): Promise<void> {
  const data = JSON.parse(text) as Partial<ExportBundle>;
  if (data.app !== "trade-journal") {
    throw new Error("Not a Trade Journal export file.");
  }
  await db.transaction(
    "rw",
    db.trades,
    db.reviews,
    db.missedTrades,
    db.milestones,
    db.settings,
    async () => {
      if (Array.isArray(data.trades)) await db.trades.bulkPut(data.trades as never[]);
      if (Array.isArray(data.reviews)) await db.reviews.bulkPut(data.reviews as never[]);
      if (Array.isArray(data.missedTrades)) await db.missedTrades.bulkPut(data.missedTrades as never[]);
      if (Array.isArray(data.milestones)) await db.milestones.bulkPut(data.milestones as never[]);
      if (Array.isArray(data.settings)) await db.settings.bulkPut(data.settings as never[]);
    },
  );
}

const CSV_COLUMNS: { key: keyof Trade; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "pair", label: "Pairs" },
  { key: "session", label: "Session" },
  { key: "entryWindow", label: "Entry Window" },
  { key: "direction", label: "Direction" },
  { key: "profitLoss", label: "Profit/Loss" },
  { key: "followedRules", label: "Followed rules" },
  { key: "breakEven", label: "BE" },
  { key: "model", label: "Model" },
  { key: "account", label: "Account" },
  { key: "positiveTags", label: "Positive tags" },
  { key: "negativeTags", label: "Negative tags" },
  { key: "rating", label: "Rating" },
  { key: "outcome", label: "WIN" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

export async function exportTradesCsv(): Promise<void> {
  const trades = await db.trades.toArray();
  const head = CSV_COLUMNS.map((c) => c.label).join(",");
  const rows = trades.map((t) =>
    CSV_COLUMNS.map((c) => csvCell(t[c.key])).join(","),
  );
  download(
    `trades-${new Date().toISOString().slice(0, 10)}.csv`,
    [head, ...rows].join("\n"),
    "text/csv",
  );
}

function csvCell(value: unknown): string {
  let s: string;
  if (Array.isArray(value)) s = value.join("; ");
  else if (typeof value === "boolean") s = value ? "true" : "false";
  else s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
