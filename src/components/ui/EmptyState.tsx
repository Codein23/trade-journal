import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <p className="text-sm font-medium text-white">{title}</p>
      {hint && <p className="max-w-md text-xs text-muted">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
