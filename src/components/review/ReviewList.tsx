import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { prettyDate } from "@/lib/dates";
import type { DailyReview } from "@/types";

interface ReviewListProps {
  reviews: DailyReview[];
  onEdit: (r: DailyReview) => void;
  onDelete: (r: DailyReview) => void;
}

export function ReviewList({ reviews, onEdit, onDelete }: ReviewListProps) {
  if (reviews.length === 0) {
    return <EmptyState title="No reviews yet" hint="Write a daily review to track lessons and discipline." />;
  }
  return (
    <div className="grid gap-3">
      {reviews.map((r) => (
        <Card key={r.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{prettyDate(r.date)}</span>
              <Badge tone={r.ruleAdherenceScore >= 70 ? "green" : r.ruleAdherenceScore >= 40 ? "orange" : "red"}>
                Adherence {r.ruleAdherenceScore}%
              </Badge>
              {r.emotionalState && <Badge tone="purple">{r.emotionalState}</Badge>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEdit(r)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-white" aria-label="Edit review"><Pencil size={14} /></button>
              <button onClick={() => onDelete(r)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-brand-red" aria-label="Delete review"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <ReviewField label="Market context" value={r.marketContext} />
            <ReviewField label="What went well" value={r.whatWentWell} color="text-brand-green" />
            <ReviewField label="What went wrong" value={r.whatWentWrong} color="text-brand-red" />
            <ReviewField label="Main mistake" value={r.mainMistake} color="text-brand-orange" />
            <ReviewField label="Lesson of the day" value={r.lessonOfTheDay} color="text-brand-blue" />
            <ReviewField label="Tomorrow focus" value={r.tomorrowFocus} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ReviewField({ label, value, color }: { label: string; value: string; color?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className={`text-xs font-semibold ${color ?? "text-muted"}`}>{label}</p>
      <p className="whitespace-pre-wrap text-sm text-white/90">{value}</p>
    </div>
  );
}
