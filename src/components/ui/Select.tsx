import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: readonly string[];
  placeholder?: string;
}

export function Select({
  label,
  options,
  placeholder,
  className,
  id,
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white",
          "focus:outline-none focus:border-brand-green/60",
          className,
        )}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
