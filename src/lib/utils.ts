export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatMoney(value: number, decimals = 2): string {
  const sign = value < 0 ? "-" : "";
  return (
    sign +
    "$" +
    Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

export function formatMoneyShort(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return (value < 0 ? "-$" : "$") + (abs / 1000).toFixed(1) + "K";
  }
  return formatMoney(value, abs % 1 === 0 ? 0 : 2);
}

export function formatPercent(value: number, decimals = 1): string {
  return value.toFixed(decimals) + "%";
}

export function pnlClass(value: number): string {
  if (value > 0) return "text-brand-green";
  if (value < 0) return "text-brand-red";
  return "text-muted";
}

/** Read a File as a base64 data URL. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
