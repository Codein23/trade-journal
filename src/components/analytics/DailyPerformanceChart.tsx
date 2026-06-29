import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/utils";

interface DailyPerformanceChartProps {
  data: { label: string; value: number }[];
}

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fill: "#a3a3a3", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#a3a3a3", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "#1f1f1f",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            color: "#f5f5f5",
            fontSize: 12,
          }}
          formatter={(v: number) => [formatMoney(v), "P&L"]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.value < 0 ? "#ef4444" : "#22c55e"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
