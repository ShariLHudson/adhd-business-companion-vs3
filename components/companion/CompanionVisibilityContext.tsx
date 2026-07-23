"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CompanionVisibility } from "@/lib/conversationVisibility";

export type CompanionVisibilityContextValue = {
  /** Effective Companion On/Off for the current place */
  visibility: CompanionVisibility;
  destinationId: string | null;
  showControls: boolean;
  onToggle: () => void;
  onTurnOn: () => void;
  onNewChat: () => void;
  onNewDay: () => void;
  onOpenHistory?: () => void;
};

const CompanionVisibilityContext =
  createContext<CompanionVisibilityContextValue | null>(null);

export function CompanionVisibilityProvider({
  value,
  children,
}: {
  value: CompanionVisibilityContextValue;
  children: ReactNode;
}) {
  return (
    <CompanionVisibilityContext.Provider value={value}>
      {children}
    </CompanionVisibilityContext.Provider>
  );
}

export function useCompanionVisibility(): CompanionVisibilityContextValue | null {
  return useContext(CompanionVisibilityContext);
}
