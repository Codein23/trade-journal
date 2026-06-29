import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MissedTradeTable } from "@/components/missed/MissedTradeTable";
import { MissedTradeForm } from "@/components/missed/MissedTradeForm";
import { useMissedTrades, saveMissedTrade, deleteMissedTrade } from "@/hooks/useMissedTrades";
import { newMissedTrade } from "@/lib/factories";
import type { MissedTrade } from "@/types";

export function MissedTradesView() {
  const missed = useMissedTrades();
  const [editing, setEditing] = useState<MissedTrade | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Missed Trades DB <span className="text-muted">({missed.length})</span></h2>
        <Button size="sm" variant="primary" onClick={() => setEditing(newMissedTrade())}><Plus size={14} /> Add missed trade</Button>
      </div>

      <MissedTradeTable
        trades={missed}
        onEdit={(t) => setEditing(t)}
        onDelete={async (t) => { if (confirm("Delete this missed trade?")) await deleteMissedTrade(t.id); }}
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
