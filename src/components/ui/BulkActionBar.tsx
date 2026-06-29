import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BulkActionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({ count, onDelete, onClear }: BulkActionBarProps) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-green/30 bg-brand-green/10 px-3 py-2">
      <span className="text-sm font-medium text-white">{count} selected</span>
      <Button size="sm" variant="danger" onClick={onDelete}>
        <Trash2 size={14} /> Delete selected
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        <X size={14} /> Clear
      </Button>
    </div>
  );
}
