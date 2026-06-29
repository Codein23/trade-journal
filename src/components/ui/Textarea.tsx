import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelClassName?: string;
}

export function Textarea({
  label,
  labelClassName,
  className,
  id,
  ...rest
}: TextareaProps) {
  const taId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={taId}
          className={cn("text-xs font-medium text-muted", labelClassName)}
        >
          {label}
        </label>
      )}
      <textarea
        id={taId}
        rows={rest.rows ?? 3}
        className={cn(
          "rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white",
          "placeholder:text-muted/60 focus:outline-none focus:border-brand-green/60 resize-y",
          className,
        )}
        {...rest}
      />
    </div>
  );
}
