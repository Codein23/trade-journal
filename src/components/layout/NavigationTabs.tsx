import { BarChart3, BookOpen, Database, Flag } from "lucide-react";
import type { TabKey } from "@/types";
import { cn } from "@/lib/utils";

const TABS: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "review", label: "Review", icon: BookOpen },
  { key: "trades", label: "Trades DB", icon: Database },
  { key: "missed", label: "Missed Trades DB", icon: Database },
  { key: "milestones", label: "Milestones", icon: Flag },
];

interface NavigationTabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function NavigationTabs({ active, onChange }: NavigationTabsProps) {
  return (
    <nav className="rounded-xl border border-border bg-surface p-1.5">
      <ul className="flex flex-wrap items-center gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <li key={key} className="flex-1">
            <button
              onClick={() => onChange(key)}
              aria-current={active === key ? "page" : undefined}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active === key
                  ? "bg-surface2 text-brand-green"
                  : "text-muted hover:bg-surface2 hover:text-white",
              )}
            >
              <Icon size={15} className={active === key ? "text-brand-green" : ""} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
