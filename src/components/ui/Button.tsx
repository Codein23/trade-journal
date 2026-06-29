import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand-green/90 hover:bg-brand-green text-black font-medium",
  secondary: "bg-surface2 hover:bg-[#272727] text-white border border-border",
  ghost: "hover:bg-surface2 text-muted hover:text-white",
  danger: "bg-brand-red/90 hover:bg-brand-red text-white font-medium",
};

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-2 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/60 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
