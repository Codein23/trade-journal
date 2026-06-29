import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { prettyDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Milestone, MilestoneStatus } from "@/types";

interface MilestoneListProps {
  milestones: Milestone[];
  onEdit: (m: Milestone) => void;
  onDelete: (m: Milestone) => void;
}

const statusTone: Record<MilestoneStatus, "green" | "blue" | "orange" | "red" | "neutral"> = {
  "Completed": "green",
  "In progress": "blue",
  "Not started": "neutral",
  "Failed": "red",
};

export function MilestoneList({ milestones, onEdit, onDelete }: MilestoneListProps) {
  if (milestones.length === 0) {
    return <EmptyState title="No milestones yet" hint="Set goals to track your progress over time." />;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {milestones.map((m) => {
        const pct = m.targetValue > 0 ? Math.max(0, Math.min(100, (m.currentValue / m.targetValue) * 100)) : 0;
        return (
          <Card key={m.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{m.title || "Untitled"}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge tone="purple">{m.type}</Badge>
                  <Badge tone={statusTone[m.status]}>{m.status}</Badge>
                  {m.deadline && <span className="text-xs text-muted">due {prettyDate(m.deadline)}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(m)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-white" aria-label="Edit milestone"><Pencil size={14} /></button>
                <button onClick={() => onDelete(m)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-brand-red" aria-label="Delete milestone"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>{m.currentValue} / {m.targetValue}</span>
                <span>{pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface2">
                <div className={cn("h-full rounded-full", m.status === "Failed" ? "bg-brand-red" : "bg-brand-green")} style={{ width: `${pct}%` }} />
              </div>
            </div>

            {m.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{m.notes}</p>}
          </Card>
        );
      })}
    </div>
  );
}
