import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Milestone } from "@/types";

export function useMilestones(): Milestone[] {
  return (
    useLiveQuery(() => db.milestones.orderBy("createdAt").reverse().toArray(), [], []) ??
    []
  );
}

export async function saveMilestone(m: Milestone): Promise<void> {
  await db.milestones.put({ ...m, updatedAt: new Date().toISOString() });
}

export async function deleteMilestone(id: string): Promise<void> {
  await db.milestones.delete(id);
}
