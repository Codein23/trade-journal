import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  MILESTONE_STATUSES,
  MILESTONE_TYPES,
  type Milestone,
  type MilestoneStatus,
  type MilestoneType,
} from "@/types";

interface MilestoneFormProps {
  open: boolean;
  initial: Milestone;
  onClose: () => void;
  onSave: (m: Milestone) => void;
}

export function MilestoneForm({ open, initial, onClose, onSave }: MilestoneFormProps) {
  const [draft, setDraft] = useState<Milestone>(initial);
  const [lastId, setLastId] = useState(initial.id);
  if (initial.id !== lastId) {
    setLastId(initial.id);
    setDraft(initial);
  }

  function set<K extends keyof Milestone>(key: K, value: Milestone[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Milestone"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(draft)}>Save</Button>
        </>
      }
    >
      <div className="grid gap-3">
        <Input label="Title" value={draft.title} placeholder="Reach +$5,000 net" onChange={(e) => set("title", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Target value" type="number" step="any" value={draft.targetValue} onChange={(e) => set("targetValue", parseFloat(e.target.value) || 0)} />
          <Input label="Current value" type="number" step="any" value={draft.currentValue} onChange={(e) => set("currentValue", parseFloat(e.target.value) || 0)} />
          <Select label="Type" options={MILESTONE_TYPES} value={draft.type} onChange={(e) => set("type", e.target.value as MilestoneType)} />
          <Select label="Status" options={MILESTONE_STATUSES} value={draft.status} onChange={(e) => set("status", e.target.value as MilestoneStatus)} />
          <Input label="Deadline" type="date" value={draft.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
        <Textarea label="Notes" value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
    </Modal>
  );
}
