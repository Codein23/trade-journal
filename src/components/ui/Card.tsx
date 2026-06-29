import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  actions?: ReactNode;
}

export function Card({ children, className, title, actions }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
