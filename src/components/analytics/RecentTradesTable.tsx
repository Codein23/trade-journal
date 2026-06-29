import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { prettyDate } from "@/lib/dates";
import { formatMoney, pnlClass } from "@/lib/utils";
import type { Trade } from "@/types";

interface RecentTradesTableProps {
  trades: Trade[];
  onOpen: (trade: Trade) => void;
}

export function RecentTradesTable({ trades, onOpen }: RecentTradesTableProps) {
  const recent = trades.slice(0, 8);
  if (recent.length === 0) {
    return <EmptyState title="No trades yet" hint="Add a trade to see it here." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Pair</th>
            <th className="px-3 py-2 font-medium">Direction</th>
            <th className="px-3 py-2 font-medium">Session</th>
            <th className="px-3 py-2 font-medium">Result</th>
            <th className="px-3 py-2 text-right font-medium">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((t) => (
            <tr
              key={t.id}
              onClick={() => onOpen(t)}
              className="cursor-pointer border-b border-border/60 hover:bg-surface2/60"
            >
              <td className="px-3 py-2 text-muted">{prettyDate(t.date)}</td>
              <td className="px-3 py-2 font-medium text-white">{t.pair || "—"}</td>
              <td className="px-3 py-2 text-muted">{t.direction || "—"}</td>
              <td className="px-3 py-2 text-muted">{t.session || "—"}</td>
              <td className="px-3 py-2">
                <Badge tone={t.outcome === "Win" ? "green" : t.outcome === "Loss" ? "red" : "neutral"}>
                  {t.outcome}
                </Badge>
              </td>
              <td className={`px-3 py-2 text-right font-semibold ${pnlClass(t.profitLoss)}`}>
                {formatMoney(t.profitLoss)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
