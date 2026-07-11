"use client";

import { useRef } from "react";
import { DecisionCompassPanel } from "@/components/companion/DecisionCompassPanel";
import { VisualizeThisButton } from "@/components/companion/VisualizeThisButton";
import type { DecisionCompassPrefill } from "@/lib/decisionCompass";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import { DecisionVisualPanel } from "@/components/visual-thinking/DecisionVisualPanel";
import type { SparkVisualEngineOpenRequest } from "@/lib/sparkVisualEngine";

export function DecisionCompassWorkspace({
  initialPrefill = null,
  restoredSession = null,
  onSessionChange,
  onComplete,
  onClose,
  projectId = null,
  projectName = null,
  onVisualizeThis,
}: {
  initialPrefill?: DecisionCompassPrefill | null;
  restoredSession?: PersistedDecisionCompassSession | null;
  onSessionChange?: (snapshot: PersistedDecisionCompassSession) => void;
  onComplete?: () => void;
  onClose?: () => void;
  projectId?: string | null;
  projectName?: string | null;
  /** #184 — open shared Spark Visual Engine (in addition to inline DecisionVisualPanel). */
  onVisualizeThis?: (request: SparkVisualEngineOpenRequest) => void;
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
    <div className="flex h-full min-h-0 flex-col">
      {onVisualizeThis ? (
        <div className="flex shrink-0 justify-end gap-2 px-3 pt-2">
          <VisualizeThisButton
            onVisualize={onVisualizeThis}
            request={{
              source: "decision-compass",
              viewId: "decision-view",
              seedText: restoredSession?.decision?.trim() || undefined,
              title: "Decision",
            }}
          />
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
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
    </div>
  );
}
