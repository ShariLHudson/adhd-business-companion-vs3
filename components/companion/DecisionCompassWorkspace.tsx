"use client";

import { useRef } from "react";
import { DecisionCompassPanel } from "@/components/companion/DecisionCompassPanel";
import type { DecisionCompassPrefill } from "@/lib/decisionCompass";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import { DecisionVisualPanel } from "@/components/visual-thinking/DecisionVisualPanel";

export function DecisionCompassWorkspace({
  initialPrefill = null,
  restoredSession = null,
  onSessionChange,
  onComplete,
  onClose,
  projectId = null,
  projectName = null,
}: {
  initialPrefill?: DecisionCompassPrefill | null;
  restoredSession?: PersistedDecisionCompassSession | null;
  onSessionChange?: (snapshot: PersistedDecisionCompassSession) => void;
  onComplete?: () => void;
  onClose?: () => void;
  projectId?: string | null;
  projectName?: string | null;
}) {
  const explorationRef = useRef<HTMLDivElement>(null);

  function scrollToExploration(
    target: "action-plan" | "save-project" | "explore" | "export",
  ) {
    explorationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const root = explorationRef.current;
    if (!root) return;
    const selector =
      target === "action-plan"
        ? '[data-decision-action="create-action-plan"]'
        : target === "save-project"
          ? '[data-decision-action="save-project"]'
          : target === "explore"
            ? '[data-decision-action="continue-exploring"]'
            : '[data-decision-action="export"]';
    window.setTimeout(() => {
      root.querySelector<HTMLElement>(selector)?.focus();
      root.querySelector<HTMLElement>(selector)?.click();
    }, 400);
  }

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <DecisionCompassPanel
          initialPrefill={initialPrefill}
          restoredSession={restoredSession}
          onSessionChange={onSessionChange}
          onComplete={onComplete}
          onClose={onClose}
          hideInlineMap
          onScrollToExploration={scrollToExploration}
        />
      </div>
      <div ref={explorationRef} className="min-h-0 min-w-0 flex-1 lg:flex-none">
        <DecisionVisualPanel
          session={restoredSession ?? null}
          onSessionChange={onSessionChange}
          projectId={projectId}
          projectName={projectName}
        />
      </div>
    </div>
  );
}
