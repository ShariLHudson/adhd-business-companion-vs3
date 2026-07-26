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
      className="relative flex min-h-full flex-col bg-cover bg-center bg-no-repeat"
      style={
        backgroundImage
          ? { backgroundImage: `url("${backgroundImage}")` }
          : undefined
      }
    >
      {/*
        Content fills the room and scrolls when needed — never a blank block
        beneath the image. A soft warm veil lifts text contrast over the plate
        while keeping the room clearly visible (the builder uses dark text, so
        the scrim is light rather than a heavy dark overlay).
      */}
      <div
        className={`relative z-10 flex-1 overflow-y-auto${
          backgroundImage
            ? // Light scrim only — the room fills the workspace and content
              // scrolls over it; readability comes from the content cards.
              " bg-gradient-to-b from-[#fbf7f1]/40 via-[#fbf7f1]/16 to-[#fbf7f1]/34"
            : ""
        }`}
      >
        {children}
      </div>
      {showAssist && onAskShari ? (
        <CompanionAssistButton onOpen={onAskShari} label={assistLabel} />
      ) : null}
    </div>
  );
}
