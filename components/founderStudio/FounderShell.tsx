"use client";

import type { ReactNode } from "react";

import { prepareOffice } from "@/lib/founder/concierge/services";
import { FOUNDER_OFFICE_BACKGROUND } from "@/lib/founderStudio/founderConfig";

import { ConciergeDrawer } from "./concierge/ConciergeDrawer";
import { FounderSideNav } from "./FounderSideNav";

type FounderShellProps = {
  children: ReactNode;
  /** Keep center/right clear for overlays when true (default). */
  cleanRight?: boolean;
};

export function FounderShell({ children, cleanRight = true }: FounderShellProps) {
  const drawerSections = prepareOffice().drawer;

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
      <ConciergeDrawer sections={drawerSections} />
      <div className="founder-shell__frame">
        <FounderSideNav />
        <div className="founder-shell__content">{children}</div>
      </div>
    </div>
  );
}
