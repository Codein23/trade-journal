import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReviewList } from "@/components/review/ReviewList";
import type { DailyReview } from "@/types";

interface ReviewViewProps {
  reviews: DailyReview[];
  onNew: () => void;
  onEdit: (r: DailyReview) => void;
  onDelete: (r: DailyReview) => void;
}

export function ReviewView({ reviews, onNew, onEdit, onDelete }: ReviewViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Daily Review <span className="text-muted">({reviews.length})</span></h2>
        <Button size="sm" variant="primary" onClick={onNew}><Plus size={14} /> New review</Button>
      </div>
      <ReviewList reviews={reviews} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
