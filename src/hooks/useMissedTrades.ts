import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { MissedTrade } from "@/types";

export function useMissedTrades(): MissedTrade[] {
  return (
    useLiveQuery(() => db.missedTrades.orderBy("date").reverse().toArray(), [], []) ??
    []
  );
}

export async function saveMissedTrade(t: MissedTrade): Promise<void> {
  await db.missedTrades.put({ ...t, updatedAt: new Date().toISOString() });
}

export async function deleteMissedTrade(id: string): Promise<void> {
  await db.missedTrades.delete(id);
}
