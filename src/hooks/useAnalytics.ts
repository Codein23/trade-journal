import { useMemo } from "react";
import { computeAnalytics } from "@/lib/analytics";
import type { Analytics, Trade } from "@/types";

export function useAnalytics(trades: Trade[], startingBalance: number): Analytics {
  return useMemo(
    () => computeAnalytics(trades, startingBalance),
    [trades, startingBalance],
  );
}
