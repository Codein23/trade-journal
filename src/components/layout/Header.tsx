import { LineChart, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  onNewTrade: () => void;
  onNewReview: () => void;
  onOpenSettings: () => void;
}

export function Header({ onNewTrade, onNewReview, onOpenSettings }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/15 text-brand-green">
          <LineChart size={20} />
        </span>
        <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
          TRADE JOURNAL <span className="text-brand-green">+</span> ANALYTICS
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={onNewTrade}>
          <Plus size={14} /> Trade Entry
        </Button>
        <Button variant="secondary" size="sm" onClick={onNewReview}>
          <Plus size={14} /> Daily Review
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenSettings} aria-label="Settings">
          <Settings size={16} />
        </Button>
      </div>
    </header>
  );
}
