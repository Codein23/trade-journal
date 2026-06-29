import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
        {children}
      </div>
    </div>
  );
}
