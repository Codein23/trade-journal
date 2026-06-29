import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { TagInput } from "@/components/ui/TagInput";
import { StarRating } from "@/components/ui/StarRating";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ENTRY_WINDOWS, SESSIONS, type Outcome, type Trade, type TradeRule } from "@/types";
import { uid } from "@/lib/utils";
import { ruleAdherence } from "@/lib/factories";
import { monthName, yearOf } from "@/lib/dates";

interface TradeFormProps {
  open: boolean;
  initial: Trade;
  onClose: () => void;
  onSave: (trade: Trade) => void;
}

const OUTCOMES: Outcome[] = ["Win", "Loss", "BE"];
const DIRECTIONS = ["Long", "Short"] as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-2 mt-1 text-sm font-semibold text-brand-green">{children}</h4>;
}

export function TradeForm({ open, initial, onClose, onSave }: TradeFormProps) {
  const [draft, setDraft] = useState<Trade>(initial);

  // Reset local draft whenever a different trade is opened.
  const [lastId, setLastId] = useState(initial.id);
  if (initial.id !== lastId) {
    setLastId(initial.id);
    setDraft(initial);
  }

  function set<K extends keyof Trade>(key: K, value: Trade[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setRule(id: string, patch: Partial<TradeRule>) {
    set("rules", draft.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRule() {
    set("rules", [...draft.rules, { id: uid(), label: `Rule ${draft.rules.length + 1}`, checked: false }]);
  }

  function removeRule(id: string) {
    set("rules", draft.rules.filter((r) => r.id !== id));
  }

  function submit() {
    const finalized: Trade = {
      ...draft,
      breakEven: draft.outcome === "BE" ? true : draft.breakEven,
      month: monthName(draft.date),
      year: yearOf(draft.date),
    };
    onSave(finalized);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={initial.pair ? `Edit Trade — ${initial.pair}` : "New Trade"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Save Trade</Button>
        </>
      }
    >
      <div className="grid gap-6">
        {/* Core fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Date" type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          <Input label="Pair" value={draft.pair} placeholder="EURUSD" onChange={(e) => set("pair", e.target.value)} />
          <Select label="Session" options={SESSIONS} placeholder="Select…" value={draft.session} onChange={(e) => set("session", e.target.value as Trade["session"])} />
          <Select label="Entry Window" options={ENTRY_WINDOWS} placeholder="Select…" value={draft.entryWindow} onChange={(e) => set("entryWindow", e.target.value as Trade["entryWindow"])} />
          <Select label="Direction" options={DIRECTIONS} placeholder="Select…" value={draft.direction} onChange={(e) => set("direction", e.target.value as Trade["direction"])} />
          <Input label="Profit / Loss" type="number" step="any" value={Number.isNaN(draft.profitLoss) ? "" : draft.profitLoss} onChange={(e) => set("profitLoss", parseFloat(e.target.value) || 0)} />
          <Select label="Outcome (WIN)" options={OUTCOMES} value={draft.outcome} onChange={(e) => set("outcome", e.target.value as Outcome)} />
          <Input label="Account" value={draft.account} placeholder="Main" onChange={(e) => set("account", e.target.value)} />
          <Input label="Model" value={draft.model} placeholder="Model 1" onChange={(e) => set("model", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TagInput label="Positive tags" tags={draft.positiveTags} tone="green" onChange={(t) => set("positiveTags", t)} />
          <TagInput label="Negative tags" tags={draft.negativeTags} tone="red" onChange={(t) => set("negativeTags", t)} />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Checkbox label="Followed rules" checked={draft.followedRules} onChange={(e) => set("followedRules", e.target.checked)} />
          <Checkbox label="Break-even (BE)" checked={draft.breakEven} onChange={(e) => set("breakEven", e.target.checked)} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Rating</span>
            <StarRating value={draft.rating} onChange={(v) => set("rating", v)} />
          </div>
        </div>

        <Textarea label="Notes" value={draft.notes} rows={2} onChange={(e) => set("notes", e.target.value)} />

        {/* A. Mental State & Emotions */}
        <div className="rounded-lg border border-border p-4">
          <SectionTitle>Mental State &amp; Emotions</SectionTitle>
          <div className="grid gap-3">
            <Textarea label="Pre Trade State" labelClassName="text-brand-orange" value={draft.preTradeState} onChange={(e) => set("preTradeState", e.target.value)} />
            <Textarea label="During Trade State" labelClassName="text-brand-blue" value={draft.duringTradeState} onChange={(e) => set("duringTradeState", e.target.value)} />
            <Textarea label="Post Trade State" labelClassName="text-brand-purple" value={draft.postTradeState} onChange={(e) => set("postTradeState", e.target.value)} />
          </div>
        </div>

        {/* B. Trade Rules */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <SectionTitle>Trade Rules</SectionTitle>
            <span className="text-xs text-muted">Adherence: <b className="text-white">{ruleAdherence(draft.rules)}%</b></span>
          </div>
          <div className="grid gap-2">
            {draft.rules.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <input type="checkbox" checked={r.checked} onChange={(e) => setRule(r.id, { checked: e.target.checked })} className="h-4 w-4 accent-brand-green" aria-label={r.label} />
                <input value={r.label} onChange={(e) => setRule(r.id, { label: e.target.value })} className="flex-1 rounded-md border border-border bg-surface2 px-2 py-1 text-sm text-white focus:outline-none focus:border-brand-green/60" />
                <button type="button" onClick={() => removeRule(r.id)} className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-brand-red" aria-label="Remove rule">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={addRule} className="mt-2">
            <Plus size={13} /> Add rule
          </Button>
        </div>

        {/* C. Setup Analysis */}
        <div className="rounded-lg border border-border p-4">
          <SectionTitle>Setup Analysis</SectionTitle>
          <div className="grid gap-3">
            <Textarea value={draft.setupAnalysis} rows={3} placeholder="What was the setup, the thesis, the confluence…" onChange={(e) => set("setupAnalysis", e.target.value)} />
            <ImageUploader images={draft.setupAnalysisImages} onChange={(imgs) => set("setupAnalysisImages", imgs)} />
          </div>
        </div>

        {/* D. Setup Outcome */}
        <div className="rounded-lg border border-border p-4">
          <SectionTitle>Setup Outcome</SectionTitle>
          <div className="grid gap-3">
            <Textarea value={draft.setupOutcome} rows={3} placeholder="How did it play out…" onChange={(e) => set("setupOutcome", e.target.value)} />
            <ImageUploader multiple images={draft.setupOutcomeImages} onChange={(imgs) => set("setupOutcomeImages", imgs)} label="Add image(s)" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
