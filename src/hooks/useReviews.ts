import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { DailyReview } from "@/types";

export function useReviews(): DailyReview[] {
  return (
    useLiveQuery(() => db.reviews.orderBy("date").reverse().toArray(), [], []) ?? []
  );
}

export async function saveReview(review: DailyReview): Promise<void> {
  await db.reviews.put({ ...review, updatedAt: new Date().toISOString() });
}

export async function deleteReview(id: string): Promise<void> {
  await db.reviews.delete(id);
}
