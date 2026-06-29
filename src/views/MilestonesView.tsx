import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MilestoneList } from "@/components/milestones/MilestoneList";
import { MilestoneForm } from "@/components/milestones/MilestoneForm";
import { useMilestones, saveMilestone, deleteMilestone } from "@/hooks/useMilestones";
import { newMilestone } from "@/lib/factories";
import type { Milestone } from "@/types";

export function MilestonesView() {
  const milestones = useMilestones();
  const [editing, setEditing] = useState<Milestone | null>(null);

  const active = useMemo(() => milestones.filter((m) => m.status === "In progress" || m.status === "Not started"), [milestones]);
  const done = useMemo(() => milestones.filter((m) => m.status === "Completed" || m.status === "Failed"), [milestones]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Milestones <span className="text-muted">({milestones.length})</span></h2>
        <Button size="sm" variant="primary" onClick={() => setEditing(newMilestone())}><Plus size={14} /> Add milestone</Button>
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase text-muted">Active</h3>
        <MilestoneList milestones={active} onEdit={setEditing} onDelete={async (m) => { if (confirm("Delete milestone?")) await deleteMilestone(m.id); }} />
      </section>

      {done.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase text-muted">History</h3>
          <MilestoneList milestones={done} onEdit={setEditing} onDelete={async (m) => { if (confirm("Delete milestone?")) await deleteMilestone(m.id); }} />
        </section>
      )}

      {editing && (
        <MilestoneForm
          open
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (m) => { await saveMilestone(m); setEditing(null); }}
        />
      )}
    </div>
  );
}
