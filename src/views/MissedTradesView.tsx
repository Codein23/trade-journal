import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BulkActionBar } from "@/components/ui/BulkActionBar";
import { MissedTradeTable } from "@/components/missed/MissedTradeTable";
import { MissedTradeForm } from "@/components/missed/MissedTradeForm";
import { useMissedTrades, saveMissedTrade, deleteMissedTrade } from "@/hooks/useMissedTrades";
import { newMissedTrade } from "@/lib/factories";
import type { MissedTrade } from "@/types";

export function MissedTradesView() {
  const missed = useMissedTrades();
  const [editing, setEditing] = useState<MissedTrade | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
    if (!confirm(`Delete ${selected.size} selected missed trade(s)?`)) return;
    await Promise.all([...selected].map((id) => deleteMissedTrade(id)));
    setSelected(new Set());
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Missed Trades DB <span className="text-muted">({missed.length})</span></h2>
        <Button size="sm" variant="primary" onClick={() => setEditing(newMissedTrade())}><Plus size={14} /> Add missed trade</Button>
      </div>

      <BulkActionBar count={selected.size} onDelete={deleteSelected} onClear={() => setSelected(new Set())} />

      <MissedTradeTable
        trades={missed}
        onEdit={(t) => setEditing(t)}
        onDelete={async (t) => { if (confirm("Delete this missed trade?")) await deleteMissedTrade(t.id); }}
        selectedIds={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
      />

      {editing && (
        <MissedTradeForm
          open
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (t) => { await saveMissedTrade(t); setEditing(null); }}
        />
      )}
    </div>
  );
}
