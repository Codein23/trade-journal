import type { Analytics, Trade } from "@/types";
import { dowShort, DOW_ORDER } from "@/lib/dates";

const EMPTY: Analytics = {
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  beTrades: 0,
  winRate: 0,
  totalPnl: 0,
  averageWin: 0,
  averageLoss: 0,
  profitFactor: 0,
  bestTrade: 0,
  worstTrade: 0,
  bestDay: 0,
  worstDay: 0,
  averageRating: 0,
  planAdherence: 0,
  consistencyScore: 0,
  recoveryFactor: 0,
  maxDrawdown: 0,
  returns: 0,
  byDow: DOW_ORDER.map((label) => ({ label, value: 0 })),
  daily: [],
  equity: [],
};

export function computeAnalytics(
  trades: Trade[],
  startingBalance: number,
): Analytics {
  if (trades.length === 0) return { ...EMPTY };

  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  const n = sorted.length;

  const wins = sorted.filter((t) => t.outcome === "Win");
  const losses = sorted.filter((t) => t.outcome === "Loss");
  const bes = sorted.filter((t) => t.outcome === "BE");

  const winPnls = wins.map((t) => t.profitLoss);
  const lossPnls = losses.map((t) => t.profitLoss);

  const totalPnl = sum(sorted.map((t) => t.profitLoss));
  const grossProfit = sum(sorted.filter((t) => t.profitLoss > 0).map((t) => t.profitLoss));
  const grossLoss = sum(sorted.filter((t) => t.profitLoss < 0).map((t) => t.profitLoss));

  // Win rate excludes BE trades.
  const decisive = wins.length + losses.length;
  const winRate = decisive > 0 ? (wins.length / decisive) * 100 : 0;

  const averageWin = winPnls.length ? sum(winPnls) / winPnls.length : 0;
  const averageLoss = lossPnls.length ? sum(lossPnls) / lossPnls.length : 0;
  const profitFactor = grossLoss !== 0 ? grossProfit / Math.abs(grossLoss) : grossProfit > 0 ? Infinity : 0;

  // Per-day aggregation.
  const byDayMap = new Map<string, { value: number; trades: number }>();
  for (const t of sorted) {
    const cur = byDayMap.get(t.date) ?? { value: 0, trades: 0 };
    cur.value += t.profitLoss;
    cur.trades += 1;
    byDayMap.set(t.date, cur);
  }
  const daily = [...byDayMap.entries()]
    .map(([date, v]) => ({ date, value: round(v.value), trades: v.trades }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const dayValues = daily.map((d) => d.value);

  // Day of week.
  const dowMap = new Map<string, number>();
  for (const t of sorted) {
    const d = dowShort(t.date);
    dowMap.set(d, (dowMap.get(d) ?? 0) + t.profitLoss);
  }
  const byDow = DOW_ORDER.map((label) => ({ label, value: round(dowMap.get(label) ?? 0) }));

  // Equity curve + max drawdown (trade order by date).
  let run = 0;
  let peak = 0;
  let maxDrawdown = 0;
  const equity: { date: string; value: number }[] = [];
  for (const t of sorted) {
    run += t.profitLoss;
    equity.push({ date: t.date, value: round(run) });
    peak = Math.max(peak, run);
    maxDrawdown = Math.min(maxDrawdown, run - peak);
  }

  const recoveryFactor = maxDrawdown < 0 ? totalPnl / Math.abs(maxDrawdown) : 0;
  const returns = startingBalance > 0 ? (totalPnl / startingBalance) * 100 : 0;
  const planAdherence = (sorted.filter((t) => t.followedRules).length / n) * 100;
  const ratings = sorted.map((t) => t.rating).filter((r) => r > 0);
  const averageRating = ratings.length ? sum(ratings) / ratings.length : 0;

  return {
    totalTrades: n,
    winningTrades: wins.length,
    losingTrades: losses.length,
    beTrades: bes.length,
    winRate: round(winRate),
    totalPnl: round(totalPnl),
    averageWin: round(averageWin),
    averageLoss: round(averageLoss),
    profitFactor: Number.isFinite(profitFactor) ? round(profitFactor) : 999,
    bestTrade: round(Math.max(...sorted.map((t) => t.profitLoss))),
    worstTrade: round(Math.min(...sorted.map((t) => t.profitLoss))),
    bestDay: dayValues.length ? round(Math.max(...dayValues)) : 0,
    worstDay: dayValues.length ? round(Math.min(...dayValues)) : 0,
    averageRating: round(averageRating),
    planAdherence: round(planAdherence),
    consistencyScore: round(consistencyScore(daily, planAdherence)),
    recoveryFactor: round(recoveryFactor),
    maxDrawdown: round(maxDrawdown),
    returns: round(returns),
    byDow,
    daily,
    equity,
  };
}

/**
 * Consistency score (0-100), blend of three signals:
 *  - profitableDayRatio: share of trading days that ended green
 *  - concentration: penalises when a single day dominates total profit
 *  - planAdherence: rewards following rules
 */
function consistencyScore(
  daily: { date: string; value: number }[],
  planAdherence: number,
): number {
  if (daily.length === 0) return 0;
  const profitableDays = daily.filter((d) => d.value > 0).length;
  const profitableDayRatio = (profitableDays / daily.length) * 100;

  const gains = daily.filter((d) => d.value > 0).map((d) => d.value);
  const totalGain = gains.reduce((a, b) => a + b, 0);
  const topDay = gains.length ? Math.max(...gains) : 0;
  // 100 when profit is spread out, lower when one day carries everything.
  const concentration = totalGain > 0 ? (1 - topDay / totalGain) * 100 : 0;

  return clamp(0.4 * profitableDayRatio + 0.3 * concentration + 0.3 * planAdherence, 0, 100);
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
