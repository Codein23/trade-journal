import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/ui/StarRating";
import { SelectCheckbox } from "@/components/ui/SelectCheckbox";
import { dowShort } from "@/lib/dates";
import { cn, formatMoney, pnlClass } from "@/lib/utils";
import type { Trade } from "@/types";

type SortKey = "date" | "profitLoss" | "rating";

interface TradeTableProps {
  trades: Trade[];
  onOpen: (trade: Trade) => void;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
}

export function TradeTable({
  trades,
  onOpen,
  onEdit,
  onDelete,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: TradeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [asc, setAsc] = useState(false);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((a) => !a);
    else { setSortKey(key); setAsc(false); }
  }

  const sorted = [...trades].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "date") cmp = a.date.localeCompare(b.date);
    else cmp = a[sortKey] - b[sortKey];
    return asc ? cmp : -cmp;
  });

  if (trades.length === 0) {
    return <EmptyState title="No trades match" hint="Adjust filters or add a new trade." />;
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (asc ? <ArrowUp size={11} /> : <ArrowDown size={11} />) : null;

  const visibleIds = sorted.map((t) => t.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected = visibleIds.some((id) => selectedIds.has(id));

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-surface2/60 text-left text-xs text-muted">
          <tr>
            <Th className="w-9 text-center">
              <SelectCheckbox
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={(checked) => onToggleAll(visibleIds, checked)}
                ariaLabel="Select all rows"
              />
            </Th>
            <Th onClick={() => toggleSort("date")} className="cursor-pointer">
              <span className="inline-flex items-center gap-1">Date <SortIcon k="date" /></span>
            </Th>
            <Th>Pairs</Th>
            <Th>Session</Th>
            <Th>Entry Window</Th>
            <Th>Direction</Th>
            <Th onClick={() => toggleSort("profitLoss")} className="cursor-pointer text-right">
              <span className="inline-flex items-center gap-1">Profit/Loss <SortIcon k="profitLoss" /></span>
            </Th>
            <Th className="text-center">Followed</Th>
            <Th className="text-center">BE</Th>
            <Th>Model</Th>
            <Th>Account</Th>
            <Th>Tags</Th>
            <Th onClick={() => toggleSort("rating")} className="cursor-pointer">
              <span className="inline-flex items-center gap-1">Rating <SortIcon k="rating" /></span>
            </Th>
            <Th className="text-center">WIN</Th>
            <Th>DOW</Th>
            <Th>Month</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr
              key={t.id}
              className={cn(
                "border-t border-border/60 hover:bg-surface2/40",
                selectedIds.has(t.id) && "bg-brand-green/10",
              )}
            >
              <Td className="text-center">
                <SelectCheckbox
                  checked={selectedIds.has(t.id)}
                  onChange={() => onToggleRow(t.id)}
                  ariaLabel={`Select trade ${t.pair} ${t.date}`}
                />
              </Td>
              <Td><button onClick={() => onOpen(t)} className="text-white hover:text-brand-green">{t.date}</button></Td>
              <Td className="font-medium text-white">{t.pair || "—"}</Td>
              <Td className="text-muted">{t.session || "—"}</Td>
              <Td className="text-muted">{t.entryWindow || "—"}</Td>
              <Td className="text-muted">{t.direction || "—"}</Td>
              <Td className={cn("text-right font-semibold", pnlClass(t.profitLoss))}>{formatMoney(t.profitLoss)}</Td>
              <Td className="text-center">{t.followedRules ? "✓" : ""}</Td>
              <Td className="text-center">{t.breakEven ? "✓" : ""}</Td>
              <Td className="text-muted">{t.model || "—"}</Td>
              <Td className="text-muted">{t.account || "—"}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {t.positiveTags.map((x) => <Badge key={x} tone="green">{x}</Badge>)}
                  {t.negativeTags.map((x) => <Badge key={x} tone="red">{x}</Badge>)}
                </div>
              </Td>
              <Td><StarRating value={t.rating} size={13} /></Td>
              <Td className="text-center">
                <Badge tone={t.outcome === "Win" ? "green" : t.outcome === "Loss" ? "red" : "neutral"}>{t.outcome}</Badge>
              </Td>
              <Td className="text-muted">{dowShort(t.date)}</Td>
              <Td className="text-muted">{t.month}</Td>
              <Td>
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(t)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-white" aria-label="Edit trade"><Pencil size={14} /></button>
                  <button onClick={() => onDelete(t)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-brand-red" aria-label="Delete trade"><Trash2 size={14} /></button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <th onClick={onClick} className={cn("whitespace-nowrap px-3 py-2.5 font-medium", className)}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("whitespace-nowrap px-3 py-2", className)}>{children}</td>;
}
