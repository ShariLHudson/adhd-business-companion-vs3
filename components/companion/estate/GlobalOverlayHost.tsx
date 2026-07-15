"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "@/app/companion/experience-controls-overlay.css";

export type GlobalOverlayHostProps = {
  children: ReactNode;
  /** Optional test id for the host shell. */
  testId?: string;
};

/**
 * One shared body portal for Experience Controls and similar overlays.
 * Never mounts inside destination page flow (Journal, Profile, etc.).
 */
export function GlobalOverlayHost({
  children,
  testId = "global-overlay-host",
}: GlobalOverlayHostProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || children == null) return null;

  return createPortal(
    <div
      className="global-overlay-host"
      data-testid={testId}
      data-global-overlay-host=""
    >
      {children}
    </div>,
    document.body,
  );
}
