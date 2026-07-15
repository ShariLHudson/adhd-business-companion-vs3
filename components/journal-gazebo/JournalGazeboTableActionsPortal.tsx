"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./journal-gazebo-welcome-desk.css";

type Props = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

/**
 * Portals desk plaques to document.body so they sit above portaled estate chrome
 * (Spark Note, guidebook) and receive pointer events reliably.
 */
export function JournalGazeboTableActionsPortal({
  children,
  className = "",
  "aria-label": ariaLabel,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => setMounted(true), []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={["jg-table-actions-portal", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      data-testid="jg-table-actions-portal"
    >
      {children}
    </div>,
    document.body,
  );
}
