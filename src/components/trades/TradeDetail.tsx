import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { prettyDate } from "@/lib/dates";
import { formatMoney, pnlClass } from "@/lib/utils";
import { ruleAdherence } from "@/lib/factories";
import type { Trade } from "@/types";

interface TradeDetailProps {
  trade: Trade | null;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className={`text-xs font-semibold ${color ?? "text-muted"}`}>{label}</p>
      <p className="whitespace-pre-wrap text-sm text-white/90">{value}</p>
    </div>
  );
}

export function TradeDetail({ trade, onClose, onEdit }: TradeDetailProps) {
  if (!trade) return null;
  return (
    <Modal
      open={Boolean(trade)}
      onClose={onClose}
      size="xl"
      title={`${trade.pair || "Trade"} · ${prettyDate(trade.date)}`}
      footer={<Button variant="primary" onClick={() => onEdit(trade)}><Pencil size={14} /> Edit</Button>}
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={trade.outcome === "Win" ? "green" : trade.outcome === "Loss" ? "red" : "neutral"}>{trade.outcome}</Badge>
          {trade.direction && <Badge tone="blue">{trade.direction}</Badge>}
          {trade.session && <Badge>{trade.session}</Badge>}
          {trade.entryWindow && <Badge>{trade.entryWindow}</Badge>}
          <span className={`ml-auto text-lg font-bold ${pnlClass(trade.profitLoss)}`}>{formatMoney(trade.profitLoss)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Meta label="Account" value={trade.account || "—"} />
          <Meta label="Model" value={trade.model || "—"} />
          <Meta label="Followed rules" value={trade.followedRules ? "Yes" : "No"} />
          <div>
            <p className="text-xs text-muted">Rating</p>
            <StarRating value={trade.rating} />
          </div>
        </div>

        {(trade.positiveTags.length > 0 || trade.negativeTags.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {trade.positiveTags.map((t) => <Badge key={t} tone="green">{t}</Badge>)}
            {trade.negativeTags.map((t) => <Badge key={t} tone="red">{t}</Badge>)}
          </div>
        )}

        <Field label="Notes" value={trade.notes} />

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-brand-green">Mental State &amp; Emotions</h4>
          <div className="grid gap-3">
            <Field label="Pre Trade State" value={trade.preTradeState} color="text-brand-orange" />
            <Field label="During Trade State" value={trade.duringTradeState} color="text-brand-blue" />
            <Field label="Post Trade State" value={trade.postTradeState} color="text-brand-purple" />
            {!trade.preTradeState && !trade.duringTradeState && !trade.postTradeState && (
              <p className="text-xs text-muted">No notes recorded.</p>
            )}
          </div>
        </div>

        {trade.rules.length > 0 && (
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-brand-green">Trade Rules</h4>
              <span className="text-xs text-muted">Adherence: <b className="text-white">{ruleAdherence(trade.rules)}%</b></span>
            </div>
            <ul className="grid gap-1.5">
              {trade.rules.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <span className={r.checked ? "text-brand-green" : "text-muted"}>{r.checked ? "☑" : "☐"}</span>
                  <span className={r.checked ? "text-white" : "text-muted line-through"}>{r.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(trade.setupAnalysis || trade.setupAnalysisImages.length > 0) && (
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 text-sm font-semibold text-brand-green">Setup Analysis</h4>
            <Field label="" value={trade.setupAnalysis} />
            <ImageRow images={trade.setupAnalysisImages} />
          </div>
        )}

        {(trade.setupOutcome || trade.setupOutcomeImages.length > 0) && (
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 text-sm font-semibold text-brand-green">Setup Outcome</h4>
            <Field label="" value={trade.setupOutcome} />
            <ImageRow images={trade.setupOutcomeImages} />
          </div>
        )}
      </div>
    </Modal>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function ImageRow({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {images.map((src, i) => (
        <a key={i} href={src} target="_blank" rel="noreferrer">
          <img src={src} alt={`img ${i + 1}`} className="h-32 w-auto rounded-lg border border-border object-cover" />
        </a>
      ))}
    </div>
  );
}
