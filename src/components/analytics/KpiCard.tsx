import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "green" | "red" | "neutral";
}

export function KpiCard({ label, value, icon: Icon, tone = "neutral" }: KpiCardProps) {
  const valueColor =
    tone === "green" ? "text-brand-green" : tone === "red" ? "text-brand-red" : "text-white";
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        {Icon && <Icon size={15} className="text-muted" />}
      </div>
      <div className={cn("mt-1.5 text-2xl font-bold", valueColor)}>{value}</div>
    </div>
  );
}
