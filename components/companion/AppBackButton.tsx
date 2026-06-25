"use client";

import {
  formatAppBackLabel,
  normalizeBackDestination,
} from "@/lib/navigationBack";

export type AppBackButtonProps = {
  /** Previous page name — e.g. "Clear My Mind™" (prefix added automatically). */
  destination: string;
  onBack: () => void;
  className?: string;
  size?: "default" | "compact";
  /** Override the computed aria-label. */
  ariaLabel?: string;
};

const base =
  "app-back-button inline-flex items-center gap-1.5 font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";

const sizes = {
  default: "mb-3 text-sm",
  compact: "text-sm",
};

/**
 * Global Back control — upper-left, predictable, muscle-memory consistent.
 * Format: ← Back to [Previous Page]
 */
export function AppBackButton({
  destination,
  onBack,
  className = "",
  size = "default",
  ariaLabel,
}: AppBackButtonProps) {
  const dest = normalizeBackDestination(destination);
  const label = formatAppBackLabel(dest);

  return (
    <button
      type="button"
      onClick={onBack}
      className={`${base} ${sizes[size]} ${className}`.trim()}
      aria-label={ariaLabel ?? label}
      data-testid="app-back-button"
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </button>
  );
}

/** Alias for design-spec naming. */
export const NavigationBackButton = AppBackButton;
