"use client";

import type { ReactNode } from "react";

import { CompanionAssistButton } from "@/components/companion/CompanionAssistButton";

/** Full-page workspace with optional companion assist entry point. */
export function WorkspaceShell({
  children,
  onAskShari,
  assistLabel = "Work With Shari",
  showAssist = true,
  backgroundImage,
}: {
  children: ReactNode;
  onAskShari?: () => void;
  assistLabel?: string;
  showAssist?: boolean;
  /** Optional full-bleed background plate behind the workspace content. */
  backgroundImage?: string;
}) {
  return (
    <div
      className="relative min-h-full bg-cover bg-center bg-no-repeat"
      style={
        backgroundImage
          ? { backgroundImage: `url("${backgroundImage}")` }
          : undefined
      }
    >
      {children}
      {showAssist && onAskShari ? (
        <CompanionAssistButton onOpen={onAskShari} label={assistLabel} />
      ) : null}
    </div>
  );
}
