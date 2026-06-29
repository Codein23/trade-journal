import { db } from "@/lib/db";
import { newMilestone, newReview, newTrade } from "@/lib/factories";
import type { Trade } from "@/types";

function demoTrade(p: Partial<Trade>): Trade {
  // Mark all rules checked when the trade followed the plan.
  const t = newTrade(p);
  if (t.followedRules) t.rules = t.rules.map((r) => ({ ...r, checked: true }));
  return t;
}

export function demoTrades(): Trade[] {
  return [
    demoTrade({
      date: "2026-01-08", pair: "EURUSD", session: "London", entryWindow: "London Open",
      direction: "Short", profitLoss: -100, outcome: "Loss", followedRules: false,
      model: "Model 2", account: "Main", rating: 2,
      positiveTags: [], negativeTags: ["impulsive"],
      preTradeState: "Slightly impatient, wanted to be in a trade.",
      postTradeState: "Frustrated, entered too early.",
      notes: "Counter-trend short with no confirmation.",
    }),
    demoTrade({
      date: "2026-01-13", pair: "GBPUSD", session: "New York AM", entryWindow: "Silver Bullet AM",
      direction: "Long", profitLoss: 400, outcome: "Win", followedRules: true,
      model: "Model 1", account: "Main", rating: 4,
      positiveTags: ["well-managed"], negativeTags: [],
      preTradeState: "Calm and prepared.", postTradeState: "Satisfied, clean execution.",
    }),
    demoTrade({
      date: "2026-01-14", pair: "EURUSD", session: "New York AM", entryWindow: "Silver Bullet AM",
      direction: "Long", profitLoss: 500, outcome: "Win", followedRules: true,
      model: "Model 1", account: "Main", rating: 5,
      positiveTags: ["perfect-entry"], negativeTags: [],
    }),
    demoTrade({
      date: "2026-01-15", pair: "GBPUSD", session: "London", entryWindow: "London Open",
      direction: "Long", profitLoss: 500, outcome: "Win", followedRules: true,
      model: "Model 1", account: "Main", rating: 4,
      positiveTags: ["well-managed"], negativeTags: ["early-exit"],
    }),
    demoTrade({
      date: "2026-01-16", pair: "EURUSD", session: "New York AM", entryWindow: "NY Open",
      direction: "Long", profitLoss: 600, outcome: "Win", followedRules: true,
      model: "Model 2", account: "Main", rating: 5,
      positiveTags: ["perfect-entry"], negativeTags: [],
    }),
    demoTrade({
      date: "2026-01-19", pair: "GBPUSD", session: "London", entryWindow: "Killzone",
      direction: "Short", profitLoss: -100, outcome: "Loss", followedRules: false,
      model: "Model 2", account: "Main", rating: 2,
      positiveTags: [], negativeTags: ["revenge-trading"],
      preTradeState: "Tilted after watching price run without me.",
    }),
  ];
}

export async function seedDemoData(): Promise<void> {
  await db.transaction("rw", db.trades, db.reviews, db.milestones, async () => {
    await db.trades.bulkPut(demoTrades());
    await db.reviews.put(
      newReview({
        date: "2026-01-16",
        marketContext: "Bullish bias on indices, USD soft into NY session.",
        whatWentWell: "Waited for the Silver Bullet window and took A+ setups only.",
        whatWentWrong: "Took partials a touch early on GBPUSD.",
        mainMistake: "Early exit on the runner.",
        lessonOfTheDay: "Let winners breathe to the target.",
        emotionalState: "Focused and patient.",
        ruleAdherenceScore: 90,
        tomorrowFocus: "Hold runners to target, no manual interference.",
      }),
    );
    await db.milestones.bulkPut([
      newMilestone({
        title: "Reach +$5,000 net P&L", type: "P&L", targetValue: 5000,
        currentValue: 1800, status: "In progress", deadline: "2026-03-31",
        notes: "Compounding the main account.",
      }),
      newMilestone({
        title: "Hold 60% win rate", type: "Win Rate", targetValue: 60,
        currentValue: 50, status: "In progress", deadline: "2026-02-28",
      }),
    ]);
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw", db.trades, db.reviews, db.missedTrades, db.milestones,
    async () => {
      await db.trades.clear();
      await db.reviews.clear();
      await db.missedTrades.clear();
      await db.milestones.clear();
    },
  );
}
