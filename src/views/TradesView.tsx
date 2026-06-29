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
  const fileRef = useRef<HTMLInputElement>(null);

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
          <Button size="sm" onClick={() => exportAllJson()}><Download size={14} /> JSON</Button>
          <Button size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import</Button>
          <Button size="sm" onClick={() => exportTradesCsv()}><FileSpreadsheet size={14} /> CSV</Button>
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
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) {
            try { await importAllJson(await f.text()); } catch (err) { alert((err as Error).message); }
          }
          if (fileRef.current) fileRef.current.value = "";
        }}
      />
    </div>
  );
}

function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}
