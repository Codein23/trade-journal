import { Activity, DollarSign, Percent, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { KpiCard } from "@/components/analytics/KpiCard";
import { PerformanceRadar } from "@/components/analytics/PerformanceRadar";
import { DailyPerformanceChart } from "@/components/analytics/DailyPerformanceChart";
import { CalendarHeatmap } from "@/components/analytics/CalendarHeatmap";
import { RecentTradesTable } from "@/components/analytics/RecentTradesTable";
import { formatMoney, formatMoneyShort, formatPercent } from "@/lib/utils";
import type { Analytics, Trade } from "@/types";

interface AnalyticsViewProps {
  trades: Trade[];
  analytics: Analytics;
  onNewTrade: () => void;
  onNewReview: () => void;
  onOpenTrade: (t: Trade) => void;
}

export function AnalyticsView({ trades, analytics: a, onNewTrade, onNewReview, onOpenTrade }: AnalyticsViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* Left column */}
      <div className="flex flex-col gap-4">
        <Card title="Quick Actions">
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={onNewTrade} className="justify-start"><Plus size={14} /> Trade Entry</Button>
            <Button variant="secondary" onClick={onNewReview} className="justify-start"><Plus size={14} /> Daily Review</Button>
          </div>
        </Card>

        <Card title="Performance Profile">
          <PerformanceRadar a={a} />
        </Card>

        <Card title="Daily Performance">
          <DailyPerformanceChart data={a.byDow} />
        </Card>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Win Rate" value={formatPercent(a.winRate)} icon={Percent} tone={a.winRate >= 50 ? "green" : "red"} />
          <KpiCard label="Total P&L" value={formatMoneyShort(a.totalPnl)} icon={DollarSign} tone={a.totalPnl >= 0 ? "green" : "red"} />
          <KpiCard label="Returns" value={formatPercent(a.returns)} icon={Percent} tone={a.returns >= 0 ? "green" : "red"} />
          <KpiCard label="Profit Factor" value={a.profitFactor.toFixed(2)} icon={Activity} tone={a.profitFactor >= 1 ? "green" : "red"} />
          <KpiCard label="Total Trades" value={String(a.totalTrades)} icon={Activity} />
          <KpiCard label="Average Win" value={formatMoney(a.averageWin)} icon={TrendingUp} tone="green" />
          <KpiCard label="Average Loss" value={formatMoney(a.averageLoss)} icon={TrendingDown} tone="red" />
          <KpiCard label="Best Day" value={formatMoneyShort(a.bestDay)} icon={TrendingUp} tone="green" />
          <KpiCard label="Worst Day" value={formatMoneyShort(a.worstDay)} icon={TrendingDown} tone="red" />
        </div>

        <CalendarHeatmap daily={a.daily} />

        <Card title="Recent Trades">
          <RecentTradesTable trades={trades} onOpen={onOpenTrade} />
        </Card>
      </div>
    </div>
  );
}
