import { Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import type { Trade } from "@/types";

export interface TradeFilterState {
  search: string;
  date: string;
  pair: string;
  account: string;
  outcome: string;
}

export const EMPTY_FILTERS: TradeFilterState = {
  search: "",
  date: "",
  pair: "",
  account: "",
  outcome: "",
};

interface TradeFiltersProps {
  filters: TradeFilterState;
  onChange: (f: TradeFilterState) => void;
  pairs: string[];
  accounts: string[];
}

export function TradeFilters({ filters, onChange, pairs, accounts }: TradeFiltersProps) {
  function set<K extends keyof TradeFilterState>(key: K, value: TradeFilterState[K]) {
    onChange({ ...filters, [key]: value });
  }
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-2.5 text-muted" />
        <input
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search…"
          aria-label="Search trades"
          className="w-48 rounded-lg border border-border bg-surface2 py-2 pl-8 pr-3 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-brand-green/60"
        />
      </div>
      <input
        type="date"
        value={filters.date}
        onChange={(e) => set("date", e.target.value)}
        aria-label="Filter by date"
        className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green/60"
      />
      <Select aria-label="Filter by pair" options={pairs} placeholder="All pairs" value={filters.pair} onChange={(e) => set("pair", e.target.value)} />
      <Select aria-label="Filter by account" options={accounts} placeholder="All accounts" value={filters.account} onChange={(e) => set("account", e.target.value)} />
      <Select aria-label="Filter by result" options={["Win", "Loss", "BE"]} placeholder="All results" value={filters.outcome} onChange={(e) => set("outcome", e.target.value)} />
    </div>
  );
}

export function applyFilters(trades: Trade[], f: TradeFilterState): Trade[] {
  const q = f.search.trim().toLowerCase();
  return trades.filter((t) => {
    if (f.date && t.date !== f.date) return false;
    if (f.pair && t.pair !== f.pair) return false;
    if (f.account && t.account !== f.account) return false;
    if (f.outcome && t.outcome !== f.outcome) return false;
    if (q) {
      const hay = [
        t.pair, t.session, t.entryWindow, t.direction, t.model, t.account,
        t.notes, ...t.positiveTags, ...t.negativeTags,
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
