"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ENJOY_ESTATE_LABEL,
  ENJOY_ESTATE_MENU_ICON,
} from "@/lib/estate/justBeHere";

export type EnjoyEstateEntryProps = {
  visible?: boolean;
  onEnjoy: () => void;
};

/**
 * Tiny entry pill — 🌿 Enjoy the Estate — before visitor mode begins.
 */
export function EnjoyEstateEntry({
  visible = true,
  onEnjoy,
}: EnjoyEstateEntryProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !visible) return null;

  return createPortal(
    <button
      type="button"
      className="enjoy-estate-entry"
      data-testid="enjoy-estate-entry"
      aria-label={ENJOY_ESTATE_LABEL}
      title={ENJOY_ESTATE_LABEL}
      onClick={onEnjoy}
    >
      <span className="enjoy-estate-entry__icon" aria-hidden>
        {ENJOY_ESTATE_MENU_ICON}
      </span>
      <span className="enjoy-estate-entry__label">{ENJOY_ESTATE_LABEL}</span>
    </button>,
    document.body,
  );
}
