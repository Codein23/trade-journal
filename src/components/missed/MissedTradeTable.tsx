import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { prettyDate } from "@/lib/dates";
import type { MissedTrade } from "@/types";

interface MissedTradeTableProps {
  trades: MissedTrade[];
  onEdit: (t: MissedTrade) => void;
  onDelete: (t: MissedTrade) => void;
}

export function MissedTradeTable({ trades, onEdit, onDelete }: MissedTradeTableProps) {
  if (trades.length === 0) {
    return <EmptyState title="No missed trades logged" hint="Track quality setups you didn't take to spot patterns." />;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-surface2/60 text-left text-xs text-muted">
          <tr>
            <th className="px-3 py-2.5 font-medium">Date</th>
            <th className="px-3 py-2.5 font-medium">Pair</th>
            <th className="px-3 py-2.5 font-medium">Session</th>
            <th className="px-3 py-2.5 font-medium">Direction</th>
            <th className="px-3 py-2.5 font-medium">Valid?</th>
            <th className="px-3 py-2.5 text-right font-medium">Potential R</th>
            <th className="px-3 py-2.5 font-medium">Reason</th>
            <th className="px-3 py-2.5 font-medium">Lesson</th>
            <th className="px-3 py-2.5 font-medium">Shot</th>
            <th className="px-3 py-2.5 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id} className="border-t border-border/60 hover:bg-surface2/40">
              <td className="whitespace-nowrap px-3 py-2 text-white">{prettyDate(t.date)}</td>
              <td className="px-3 py-2 font-medium text-white">{t.pair || "—"}</td>
              <td className="px-3 py-2 text-muted">{t.session || "—"}</td>
              <td className="px-3 py-2 text-muted">{t.direction || "—"}</td>
              <td className="px-3 py-2"><Badge tone={t.wasValid ? "green" : "neutral"}>{t.wasValid ? "Valid" : "No"}</Badge></td>
              <td className="px-3 py-2 text-right font-semibold text-brand-blue">{t.potentialR ? `${t.potentialR}R` : "—"}</td>
              <td className="max-w-[200px] truncate px-3 py-2 text-muted" title={t.reasonMissed}>{t.reasonMissed || "—"}</td>
              <td className="max-w-[200px] truncate px-3 py-2 text-muted" title={t.lesson}>{t.lesson || "—"}</td>
              <td className="px-3 py-2">
                {t.screenshot ? <a href={t.screenshot} target="_blank" rel="noreferrer"><img src={t.screenshot} alt="shot" className="h-8 w-12 rounded border border-border object-cover" /></a> : "—"}
              </td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(t)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-white" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => onDelete(t)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-brand-red" aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
