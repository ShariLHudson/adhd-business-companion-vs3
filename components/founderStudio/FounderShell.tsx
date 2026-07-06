"use client";

import type { ReactNode } from "react";

import { FOUNDER_OFFICE_BACKGROUND } from "@/lib/founderStudio/founderConfig";

type FounderShellProps = {
  children: ReactNode;
  /** Keep center/right clear for overlays when true (default). */
  cleanRight?: boolean;
};

export function FounderShell({ children, cleanRight = true }: FounderShellProps) {
  return (
    <div
      className={`founder-shell${cleanRight ? " founder-shell--clean-right" : ""}`}
      style={
        {
          "--founder-office-bg": `url(${FOUNDER_OFFICE_BACKGROUND})`,
        } as React.CSSProperties
      }
    >
      <div className="founder-shell__scrim" aria-hidden="true" />
      <div className="founder-shell__content">{children}</div>
    </div>
  );
}
