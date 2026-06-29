import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function Checkbox({ label, className, id, ...rest }: CheckboxProps) {
  const cbId = id ?? rest.name;
  return (
    <label
      htmlFor={cbId}
      className="inline-flex cursor-pointer items-center gap-2 text-sm text-white"
    >
      <input
        id={cbId}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-border bg-surface2 accent-brand-green",
          className,
        )}
        {...rest}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
