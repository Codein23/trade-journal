import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white",
          "placeholder:text-muted/60 focus:outline-none focus:border-brand-green/60",
          className,
        )}
        {...rest}
      />
    </div>
  );
}
