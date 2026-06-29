import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { SESSIONS, type MissedTrade } from "@/types";

interface MissedTradeFormProps {
  open: boolean;
  initial: MissedTrade;
  onClose: () => void;
  onSave: (t: MissedTrade) => void;
}

const DIRECTIONS = ["Long", "Short"] as const;

export function MissedTradeForm({ open, initial, onClose, onSave }: MissedTradeFormProps) {
  const [draft, setDraft] = useState<MissedTrade>(initial);
  const [lastId, setLastId] = useState(initial.id);
  if (initial.id !== lastId) {
    setLastId(initial.id);
    setDraft(initial);
  }

  function set<K extends keyof MissedTrade>(key: K, value: MissedTrade[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Missed Trade"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(draft)}>Save</Button>
        </>
      }
    >
      <div className="grid gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Date" type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          <Input label="Pair" value={draft.pair} placeholder="EURUSD" onChange={(e) => set("pair", e.target.value)} />
          <Select label="Session" options={SESSIONS} placeholder="Select…" value={draft.session} onChange={(e) => set("session", e.target.value as MissedTrade["session"])} />
          <Select label="Direction" options={DIRECTIONS} placeholder="Select…" value={draft.direction} onChange={(e) => set("direction", e.target.value as MissedTrade["direction"])} />
          <Input label="Potential R" type="number" step="any" value={draft.potentialR} onChange={(e) => set("potentialR", parseFloat(e.target.value) || 0)} />
          <div className="flex items-end">
            <Checkbox label="Was it a valid setup?" checked={draft.wasValid} onChange={(e) => set("wasValid", e.target.checked)} />
          </div>
        </div>
        <Textarea label="Reason missed" value={draft.reasonMissed} onChange={(e) => set("reasonMissed", e.target.value)} />
        <Textarea label="Lesson" value={draft.lesson} onChange={(e) => set("lesson", e.target.value)} />
        <div>
          <p className="mb-1 text-xs font-medium text-muted">Screenshot</p>
          <ImageUploader images={draft.screenshot ? [draft.screenshot] : []} onChange={(imgs) => set("screenshot", imgs[0] ?? "")} />
        </div>
      </div>
    </Modal>
  );
}
