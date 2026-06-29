import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "green" | "red" | "blue" | "orange" | "purple" | "neutral";

const tones: Record<Tone, string> = {
  green: "bg-brand-green/15 text-brand-green border-brand-green/30",
  red: "bg-brand-red/15 text-brand-red border-brand-red/30",
  blue: "bg-brand-blue/15 text-brand-blue border-brand-blue/30",
  orange: "bg-brand-orange/15 text-brand-orange border-brand-orange/30",
  purple: "bg-brand-purple/15 text-brand-purple border-brand-purple/30",
  neutral: "bg-surface2 text-muted border-border",
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  onRemove?: () => void;
}

export function Badge({ children, tone = "neutral", className, onRemove }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs",
        tones[tone],
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-70 hover:opacity-100"
          aria-label="Remove"
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}
