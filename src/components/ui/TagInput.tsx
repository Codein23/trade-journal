import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/Badge";

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  tone?: "green" | "red";
  placeholder?: string;
}

export function TagInput({
  label,
  tags,
  onChange,
  tone = "green",
  placeholder = "Type a tag, press Enter",
}: TagInputProps) {
  const [value, setValue] = useState("");

  function add() {
    const v = value.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && value === "" && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface2 px-2 py-1.5">
        {tags.map((t) => (
          <Badge key={t} tone={tone} onRemove={() => onChange(tags.filter((x) => x !== t))}>
            {t}
          </Badge>
        ))}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-white placeholder:text-muted/60 focus:outline-none"
        />
      </div>
    </div>
  );
}
