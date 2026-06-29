import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS } from "@/lib/db";
import type { Settings } from "@/types";

export function useSettings(): Settings {
  return (
    useLiveQuery(() => db.settings.get("app"), [], DEFAULT_SETTINGS) ??
    DEFAULT_SETTINGS
  );
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  const current = (await db.settings.get("app")) ?? DEFAULT_SETTINGS;
  await db.settings.put({ ...current, ...patch, id: "app" });
}
