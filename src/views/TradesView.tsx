import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BulkActionBar } from "@/components/ui/BulkActionBar";
import { TradeTable } from "@/components/trades/TradeTable";
import {
  applyFilters,
  EMPTY_FILTERS,
  TradeFilters,
  type TradeFilterState,
} from "@/components/trades/TradeFilters";
import { deleteTrade } from "@/hooks/useTrades";
import { exportAllJson, exportTradesCsv, importAllJson } from "@/lib/exportImport";
import { analyzeImport, commitImportedTrades, importSummary, parseTradesCsv } from "@/lib/csvImport";
import type { Trade } from "@/types";

interface TradesViewProps {
  trades: Trade[];
  onNewTrade: () => void;
  onOpenTrade: (t: Trade) => void;
  onEditTrade: (t: Trade) => void;
  onDeleteTrade: (t: Trade) => void;
}

export function TradesView({ trades, onNewTrade, onOpenTrade, onEditTrade, onDeleteTrade }: TradesViewProps) {
  const [filters, setFilters] = useState<TradeFilterState>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const jsonRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  async function handleCsv(file: File | undefined) {
    if (!file) return;
    try {
      const result = parseTradesCsv(await file.text());
      if (result.trades.length === 0) {
        alert("No completed trades found in this CSV.");
      } else {
        const plan = await analyzeImport(result);
        if (plan.fresh.length === 0) {
          alert(`All ${result.trades.length} trade(s) are already imported. Nothing added.`);
        } else if (confirm(importSummary(plan))) {
          await commitImportedTrades(plan.fresh);
          alert(`Imported ${plan.fresh.length} new trade(s)${plan.duplicates ? `, skipped ${plan.duplicates} duplicate(s)` : ""}. Analytics updated.`);
        }
      }
    } catch (err) {
      alert("CSV import failed: " + (err as Error).message);
    }
    if (csvRef.current) csvRef.current.value = "";
  }

  const pairs = useMemo(() => uniq(trades.map((t) => t.pair)), [trades]);
  const accounts = useMemo(() => uniq(trades.map((t) => t.account)), [trades]);
  const filtered = useMemo(() => applyFilters(trades, filters), [trades, filters]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[], checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selected.size} selected trade(s)? This cannot be undone.`)) return;
    await Promise.all([...selected].map((id) => deleteTrade(id)));
    setSelected(new Set());
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-white">Trades DB <span className="text-muted">({filtered.length})</span></h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => exportAllJson()}><Download size={14} /> Export JSON</Button>
          <Button size="sm" onClick={() => exportTradesCsv()}><FileSpreadsheet size={14} /> Export CSV</Button>
          <Button size="sm" onClick={() => jsonRef.current?.click()}><Upload size={14} /> Import JSON</Button>
          <Button size="sm" onClick={() => csvRef.current?.click()}><FileSpreadsheet size={14} /> Import CSV</Button>
          <Button size="sm" variant="primary" onClick={onNewTrade}><Plus size={14} /> Add trade</Button>
        </div>
      </div>

      <TradeFilters filters={filters} onChange={setFilters} pairs={pairs} accounts={accounts} />

      <BulkActionBar count={selected.size} onDelete={deleteSelected} onClear={() => setSelected(new Set())} />

      <TradeTable
        trades={filtered}
        onOpen={onOpenTrade}
        onEdit={onEditTrade}
        onDelete={onDeleteTrade}
        selectedIds={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
      />

      <input
        ref={jsonRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) {
            try { await importAllJson(await f.text()); alert("Backup restored."); }
            catch (err) { alert((err as Error).message); }
          }
          if (jsonRef.current) jsonRef.current.value = "";
        }}
      />
      <input
        ref={csvRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleCsv(e.target.files?.[0])}
      />
    </div>
  );
}

function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}
