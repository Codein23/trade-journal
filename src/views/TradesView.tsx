import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TradeTable } from "@/components/trades/TradeTable";
import {
  applyFilters,
  EMPTY_FILTERS,
  TradeFilters,
  type TradeFilterState,
} from "@/components/trades/TradeFilters";
import { exportAllJson, exportTradesCsv, importAllJson } from "@/lib/exportImport";
import { useRef } from "react";
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
  const fileRef = useRef<HTMLInputElement>(null);

  const pairs = useMemo(() => uniq(trades.map((t) => t.pair)), [trades]);
  const accounts = useMemo(() => uniq(trades.map((t) => t.account)), [trades]);
  const filtered = useMemo(() => applyFilters(trades, filters), [trades, filters]);

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

      <TradeTable trades={filtered} onOpen={onOpenTrade} onEdit={onEditTrade} onDelete={onDeleteTrade} />

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
