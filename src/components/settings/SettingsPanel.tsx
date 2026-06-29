import { useRef, useState } from "react";
import { Download, Upload, RotateCcw, Trash2, FileSpreadsheet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveSettings } from "@/hooks/useSettings";
import { exportAllJson, exportTradesCsv, importAllJson } from "@/lib/exportImport";
import { clearAllData, seedDemoData } from "@/data/demoData";
import type { Settings } from "@/types";

interface SettingsPanelProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
}

export function SettingsPanel({ open, settings, onClose }: SettingsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [balance, setBalance] = useState(String(settings.startingBalance));
  const [msg, setMsg] = useState("");

  function flash(text: string) {
    setMsg(text);
    window.setTimeout(() => setMsg(""), 2500);
  }

  async function onImportFile(file: File | undefined) {
    if (!file) return;
    try {
      await importAllJson(await file.text());
      flash("Import successful.");
    } catch (e) {
      flash("Import failed: " + (e as Error).message);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings" size="md">
      <div className="grid gap-5">
        <div>
          <Input
            label="Starting balance"
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
          <Button
            variant="primary"
            size="sm"
            className="mt-2"
            onClick={async () => {
              await saveSettings({ startingBalance: parseFloat(balance) || 0 });
              flash("Balance saved.");
            }}
          >
            Save balance
          </Button>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted">Data</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => exportAllJson()}><Download size={14} /> Export JSON</Button>
            <Button size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import JSON</Button>
            <Button size="sm" onClick={() => exportTradesCsv()}><FileSpreadsheet size={14} /> Export CSV</Button>
          </div>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => onImportFile(e.target.files?.[0])} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted">Danger zone</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                if (confirm("Reset demo data? This adds the sample dataset back.")) {
                  await seedDemoData();
                  flash("Demo data restored.");
                }
              }}
            >
              <RotateCcw size={14} /> Reset demo data
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={async () => {
                if (confirm("Delete ALL trades, reviews, missed trades and milestones? This cannot be undone.")) {
                  await clearAllData();
                  flash("All data cleared.");
                }
              }}
            >
              <Trash2 size={14} /> Clear all data
            </Button>
          </div>
        </div>

        {msg && <p className="text-sm text-brand-green">{msg}</p>}
      </div>
    </Modal>
  );
}
