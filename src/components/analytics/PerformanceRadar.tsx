import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { Analytics } from "@/types";

interface PerformanceRadarProps {
  a: Analytics;
}

export function PerformanceRadar({ a }: PerformanceRadarProps) {
  // Normalise each dimension to 0-100.
  const data = [
    { dim: "Win Rate", value: clamp(a.winRate) },
    { dim: "Recovery Factor", value: clamp(a.recoveryFactor * 20) },
    { dim: "Profit Factor", value: clamp(a.profitFactor * 20) },
    { dim: "Consistency Score", value: clamp(a.consistencyScore) },
    { dim: "Plan Adherence", value: clamp(a.planAdherence) },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#2a2a2a" />
        <PolarAngleAxis
          dataKey="dim"
          tick={{ fill: "#a3a3a3", fontSize: 11 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fill: "#5a5a5a", fontSize: 9 }}
          stroke="#2a2a2a"
        />
        <Radar
          dataKey="value"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
