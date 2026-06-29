import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { finalizeTrade } from "@/lib/factories";
import type { Trade } from "@/types";

export function useTrades(): Trade[] {
  return (
    useLiveQuery(() => db.trades.orderBy("date").reverse().toArray(), [], []) ?? []
  );
}

export async function saveTrade(trade: Trade): Promise<void> {
  await db.trades.put(finalizeTrade(trade));
}

export async function deleteTrade(id: string): Promise<void> {
  await db.trades.delete(id);
}
