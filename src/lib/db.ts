import Dexie, { type Table } from "dexie";
import type {
  Trade,
  DailyReview,
  MissedTrade,
  Milestone,
  Settings,
} from "@/types";

export class TradeJournalDB extends Dexie {
  trades!: Table<Trade, string>;
  reviews!: Table<DailyReview, string>;
  missedTrades!: Table<MissedTrade, string>;
  milestones!: Table<Milestone, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super("trade-journal");
    this.version(1).stores({
      trades: "id, date, pair, account, outcome, rating, profitLoss, year, month",
      reviews: "id, date",
      missedTrades: "id, date, pair",
      milestones: "id, status, type",
      settings: "id",
    });
  }
}

export const db = new TradeJournalDB();

export const DEFAULT_SETTINGS: Settings = {
  id: "app",
  startingBalance: 10000,
  demoSeeded: false,
};

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get("app");
  if (existing) return existing;
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
