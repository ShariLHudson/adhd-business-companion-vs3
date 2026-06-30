"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EstateMapCanvas } from "./EstateMapCanvas";
import type { EstateLocation, EstateMapPhase } from "./types";

type EstateMapOverlayProps = {
  phase: EstateMapPhase;
  headingMessage: string | null;
  onClose: () => void;
  onSelectLocation: (location: EstateLocation) => void;
};

export function EstateMapOverlay({
  phase,
  headingMessage,
  onClose,
  onSelectLocation,
}: EstateMapOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const open = phase === "lifting" || phase === "unfolding" || phase === "open";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || (!open && phase !== "closing")) return null;

  return createPortal(
    <div
      className={`em-overlay em-overlay--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="Spark Estate Map"
    >
      <button
        type="button"
        className="em-overlay__veil"
        aria-label="Close estate map"
        onClick={onClose}
      />

      <div className="em-overlay__parchment">
        <header className="em-overlay__header">
          <h1 className="em-overlay__title">The Spark Estate</h1>
          <p className="em-overlay__subtitle">
            A hand-painted guide to where you might spend time
          </p>
        </header>

        <EstateMapCanvas
          onSelect={onSelectLocation}
          headingMessage={headingMessage}
        />

        <button type="button" className="em-overlay__fold" onClick={onClose}>
          Fold map
        </button>
      </div>
    </div>,
    document.body,
  );
}
