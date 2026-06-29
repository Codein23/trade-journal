import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatMoneyShort, pnlClass } from "@/lib/utils";

interface CalendarHeatmapProps {
  daily: { date: string; value: number; trades: number }[];
}

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function CalendarHeatmap({ daily }: CalendarHeatmapProps) {
  const byDay = useMemo(() => {
    const m = new Map<string, { value: number; trades: number }>();
    for (const d of daily) m.set(d.date, { value: d.value, trades: d.trades });
    return m;
  }, [daily]);

  const months = useMemo(
    () => [...new Set(daily.map((d) => d.date.slice(0, 7)))].sort(),
    [daily],
  );

  const [cursor, setCursor] = useState(() => {
    if (months.length) return months[months.length - 1];
    return new Date().toISOString().slice(0, 7);
  });

  // Data loads asynchronously; snap to the latest month with data until the
  // user navigates manually.
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current && months.length && !months.includes(cursor)) {
      setCursor(months[months.length - 1]);
    }
  }, [months, cursor]);

  const [yy, mm] = cursor.split("-").map(Number);
  const monthLabel = new Date(yy, mm - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthPnl = daily
    .filter((d) => d.date.slice(0, 7) === cursor)
    .reduce((s, d) => s + d.value, 0);
  const monthTrades = daily
    .filter((d) => d.date.slice(0, 7) === cursor)
    .reduce((s, d) => s + d.trades, 0);

  const weeks = useMemo(() => buildWeeks(yy, mm), [yy, mm]);

  function shift(n: number) {
    touched.current = true;
    let y = yy;
    let m = mm + n;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setCursor(`${y}-${String(m).padStart(2, "0")}`);
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-white" aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-white">{monthLabel}</span>
          <button onClick={() => shift(1)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-white" aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="text-xs text-muted">
          P/L: <b className={pnlClass(monthPnl)}>{formatMoneyShort(monthPnl)}</b>
          <span className="ml-3">Trades: {monthTrades}</span>
        </div>
      </div>

      <div className="overflow-x-auto p-2">
        <table className="w-full min-w-[640px] table-fixed border-collapse">
          <thead>
            <tr>
              {DOW.map((d) => (
                <th key={d} className="px-1 py-1.5 text-[11px] font-medium uppercase text-muted">{d}</th>
              ))}
              <th className="px-1 py-1.5 text-[11px] font-medium uppercase text-muted">Summary</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => {
              let weekPnl = 0;
              let weekTrades = 0;
              return (
                <tr key={wi}>
                  {week.map((day, di) => {
                    if (day === null) return <td key={di} className="border border-border" />;
                    const key = `${yy}-${String(mm).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const info = byDay.get(key);
                    if (info) {
                      weekPnl += info.value;
                      weekTrades += info.trades;
                    }
                    return (
                      <td
                        key={di}
                        className={cn(
                          "h-[78px] border border-border p-1.5 align-top",
                          info && info.value > 0 && "bg-brand-green/10",
                          info && info.value < 0 && "bg-brand-red/10",
                        )}
                      >
                        <span className="text-[11px] text-muted">{day}</span>
                        {info && (
                          <span className="mt-2 block text-center">
                            <span className="block text-[11px] text-white">
                              {info.trades} trade{info.trades > 1 ? "s" : ""}
                            </span>
                            <span className={cn("block text-sm font-bold", pnlClass(info.value))}>
                              {formatMoneyShort(info.value)}
                            </span>
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="h-[78px] border border-border bg-surface2/40 p-1.5 align-top">
                    {weekTrades > 0 && (
                      <span className="mt-3 block text-center">
                        <span className="block text-[11px] text-muted">{weekTrades} trades</span>
                        <span className={cn("block text-sm font-bold", pnlClass(weekPnl))}>
                          {formatMoneyShort(weekPnl)}
                        </span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildWeeks(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month - 1, 1);
  const startDow = (first.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 5)); // Mon-Fri only
  }
  return weeks;
}
