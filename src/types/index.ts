export type Direction = "Long" | "Short";
export type Outcome = "Win" | "Loss" | "BE";

export const SESSIONS = [
  "Asia",
  "London",
  "New York",
  "London AM",
  "New York AM",
  "New York PM",
] as const;
export type Session = (typeof SESSIONS)[number];

export const ENTRY_WINDOWS = [
  "Silver Bullet AM",
  "Silver Bullet PM",
  "NY Open",
  "London Open",
  "Killzone",
  "Other",
] as const;
export type EntryWindow = (typeof ENTRY_WINDOWS)[number];

export interface TradeRule {
  id: string;
  label: string;
  checked: boolean;
}

export interface Trade {
  id: string;
  date: string; // ISO yyyy-MM-dd
  pair: string;
  session: Session | "";
  entryWindow: EntryWindow | "";
  direction: Direction | "";
  profitLoss: number;
  followedRules: boolean;
  breakEven: boolean;
  model: string;
  account: string;
  positiveTags: string[];
  negativeTags: string[];
  rating: number; // 1..5
  outcome: Outcome;
  notes: string;
  // Mental state
  preTradeState: string;
  duringTradeState: string;
  postTradeState: string;
  // Rules checklist
  rules: TradeRule[];
  // Setup analysis / outcome
  setupAnalysis: string;
  setupAnalysisImages: string[]; // base64 data URLs
  setupOutcome: string;
  setupOutcomeImages: string[]; // base64 data URLs
  // Derived (stored for table convenience)
  month: string; // e.g. "January"
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string;
  date: string;
  marketContext: string;
  whatWentWell: string;
  whatWentWrong: string;
  mainMistake: string;
  lessonOfTheDay: string;
  emotionalState: string;
  ruleAdherenceScore: number; // 0..100
  tomorrowFocus: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissedTrade {
  id: string;
  date: string;
  pair: string;
  session: Session | "";
  direction: Direction | "";
  reasonMissed: string;
  wasValid: boolean;
  potentialR: number;
  screenshot: string; // base64 data URL
  lesson: string;
  createdAt: string;
  updatedAt: string;
}

export const MILESTONE_TYPES = [
  "P&L",
  "Win Rate",
  "Consistency",
  "Rule Adherence",
  "Account Challenge",
  "Other",
] as const;
export type MilestoneType = (typeof MILESTONE_TYPES)[number];

export const MILESTONE_STATUSES = [
  "Not started",
  "In progress",
  "Completed",
  "Failed",
] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  type: MilestoneType;
  deadline: string;
  status: MilestoneStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string; // always "app"
  startingBalance: number;
  demoSeeded: boolean;
}

export interface Analytics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  beTrades: number;
  winRate: number;
  totalPnl: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  bestDay: number;
  worstDay: number;
  averageRating: number;
  planAdherence: number;
  consistencyScore: number;
  recoveryFactor: number;
  maxDrawdown: number;
  returns: number;
  byDow: { label: string; value: number }[];
  daily: { date: string; value: number; trades: number }[];
  equity: { date: string; value: number }[];
}

export type TabKey =
  | "analytics"
  | "review"
  | "trades"
  | "missed"
  | "milestones"
  | "settings";
