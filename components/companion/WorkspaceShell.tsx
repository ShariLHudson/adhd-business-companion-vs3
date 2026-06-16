"use client";

import type { ReactNode } from "react";

import { CompanionAssistButton } from "@/components/companion/CompanionAssistButton";

/** Full-page workspace with optional companion assist entry point. */
export function WorkspaceShell({
  children,
  onAskShari,
  assistLabel = "Work With Shari",
  showAssist = true,
}: {
  children: ReactNode;
  onAskShari?: () => void;
  assistLabel?: string;
  showAssist?: boolean;
}) {
  return (
    <div className="relative min-h-full">
      {children}
      {showAssist && onAskShari ? (
        <CompanionAssistButton onOpen={onAskShari} label={assistLabel} />
      ) : null}
    </div>
  );
}
