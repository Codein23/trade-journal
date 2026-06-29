import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { DailyReview } from "@/types";

interface ReviewFormProps {
  open: boolean;
  initial: DailyReview;
  onClose: () => void;
  onSave: (review: DailyReview) => void;
}

export function ReviewForm({ open, initial, onClose, onSave }: ReviewFormProps) {
  const [draft, setDraft] = useState<DailyReview>(initial);
  const [lastId, setLastId] = useState(initial.id);
  if (initial.id !== lastId) {
    setLastId(initial.id);
    setDraft(initial);
  }

  function set<K extends keyof DailyReview>(key: K, value: DailyReview[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Daily Review"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(draft)}>Save Review</Button>
        </>
      }
    >
      <div className="grid gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Date" type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          <Input label="Rule Adherence Score (0-100)" type="number" min={0} max={100} value={draft.ruleAdherenceScore} onChange={(e) => set("ruleAdherenceScore", clamp(parseInt(e.target.value) || 0))} />
        </div>
        <Textarea label="Market context" value={draft.marketContext} onChange={(e) => set("marketContext", e.target.value)} />
        <Textarea label="What went well" value={draft.whatWentWell} onChange={(e) => set("whatWentWell", e.target.value)} />
        <Textarea label="What went wrong" value={draft.whatWentWrong} onChange={(e) => set("whatWentWrong", e.target.value)} />
        <Textarea label="Main mistake" value={draft.mainMistake} onChange={(e) => set("mainMistake", e.target.value)} />
        <Textarea label="Lesson of the day" value={draft.lessonOfTheDay} onChange={(e) => set("lessonOfTheDay", e.target.value)} />
        <Input label="Emotional state" value={draft.emotionalState} onChange={(e) => set("emotionalState", e.target.value)} />
        <Textarea label="Tomorrow focus" value={draft.tomorrowFocus} onChange={(e) => set("tomorrowFocus", e.target.value)} />
      </div>
    </Modal>
  );
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
