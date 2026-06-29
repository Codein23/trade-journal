import type {
  DailyReview,
  Milestone,
  MissedTrade,
  Trade,
  TradeRule,
} from "@/types";
import { uid } from "@/lib/utils";
import { todayISO, monthName, yearOf } from "@/lib/dates";

export function defaultRules(): TradeRule[] {
  return [
    { id: uid(), label: "Followed my trading plan", checked: false },
    { id: uid(), label: "Risk under 1%", checked: false },
    { id: uid(), label: "Valid setup / confluence", checked: false },
    { id: uid(), label: "No revenge / FOMO entry", checked: false },
    { id: uid(), label: "Respected stop loss", checked: false },
  ];
}

export function newTrade(partial: Partial<Trade> = {}): Trade {
  const date = partial.date ?? todayISO();
  const now = new Date().toISOString();
  return {
    id: uid(),
    date,
    pair: "",
    session: "",
    entryWindow: "",
    direction: "",
    profitLoss: 0,
    followedRules: false,
    breakEven: false,
    model: "",
    account: "",
    positiveTags: [],
    negativeTags: [],
    rating: 0,
    outcome: "Win",
    notes: "",
    preTradeState: "",
    duringTradeState: "",
    postTradeState: "",
    rules: defaultRules(),
    setupAnalysis: "",
    setupAnalysisImages: [],
    setupOutcome: "",
    setupOutcomeImages: [],
    month: monthName(date),
    year: yearOf(date),
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function newReview(partial: Partial<DailyReview> = {}): DailyReview {
  const now = new Date().toISOString();
  return {
    id: uid(),
    date: todayISO(),
    marketContext: "",
    whatWentWell: "",
    whatWentWrong: "",
    mainMistake: "",
    lessonOfTheDay: "",
    emotionalState: "",
    ruleAdherenceScore: 0,
    tomorrowFocus: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function newMissedTrade(partial: Partial<MissedTrade> = {}): MissedTrade {
  const now = new Date().toISOString();
  return {
    id: uid(),
    date: todayISO(),
    pair: "",
    session: "",
    direction: "",
    reasonMissed: "",
    wasValid: false,
    potentialR: 0,
    screenshot: "",
    lesson: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function newMilestone(partial: Partial<Milestone> = {}): Milestone {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: "",
    targetValue: 0,
    currentValue: 0,
    type: "P&L",
    deadline: "",
    status: "Not started",
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/** Recompute derived fields and bump updatedAt. */
export function finalizeTrade(t: Trade): Trade {
  return {
    ...t,
    month: monthName(t.date),
    year: yearOf(t.date),
    updatedAt: new Date().toISOString(),
  };
}

/** Share of checklist rules that are ticked (0-100). */
export function ruleAdherence(rules: TradeRule[]): number {
  if (rules.length === 0) return 0;
  return Math.round((rules.filter((r) => r.checked).length / rules.length) * 100);
}
