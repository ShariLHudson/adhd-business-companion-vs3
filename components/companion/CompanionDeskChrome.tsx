"use client";

import { useLayoutEffect, type ReactNode } from "react";

import { useCompanionDeskOptional } from "@/components/companion/CompanionDeskProvider";

/** Renders guided-workflow desk UI into the permanent app-level Companion Desk. */
export function CompanionDeskPortal({ children }: { children: ReactNode }) {
  const ctx = useCompanionDeskOptional();

  useLayoutEffect(() => {
    if (!ctx?.layerActive) return;
    ctx.setDeskOverride(children);
    return () => ctx.setDeskOverride(null);
  }, [ctx, children]);

  return null;
}

/** Companion Desk chrome — reserved for future bottom-dock workflows. */
export function CompanionDeskChrome({ children }: { children?: ReactNode }) {
  return (
    <div className="companion-desk companion-desk--chrome" data-testid="companion-desk">
      <div className="companion-desk__surface">{children}</div>
    </div>
  );
}
