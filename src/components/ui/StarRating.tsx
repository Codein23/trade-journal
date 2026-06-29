import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 16 }: StarRatingProps) {
  const interactive = Boolean(onChange);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n === value ? 0 : n)}
          className={cn(interactive && "cursor-pointer", !interactive && "cursor-default")}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={n <= value ? "fill-brand-orange text-brand-orange" : "text-border"}
          />
        </button>
      ))}
    </div>
  );
}
