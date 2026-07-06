"use client";

import { useCallback, useMemo, useState } from "react";

import { composeExecutiveCommandCenterView } from "@/lib/executiveCommandCenter";
import type { ExecutivePanelId } from "@/lib/executiveCommandCenter/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { CommandCenterEntry } from "./commandCenterHeadquarters/CommandCenterEntry";
import { ExecutiveAssistantQueue } from "./commandCenterHeadquarters/ExecutiveAssistantQueue";
import { ExecutivePanelGrid } from "./commandCenterHeadquarters/ExecutivePanelGrid";
import { ExecutiveStatusBarView } from "./commandCenterHeadquarters/ExecutiveStatusBar";
import { SixQuestionsHero } from "./commandCenterHeadquarters/SixQuestionsHero";

export function FounderExecutiveCommandCenter() {
  const view = useMemo(() => composeExecutiveCommandCenterView(), []);
  const [expandedPanelId, setExpandedPanelId] = useState<ExecutivePanelId | null>(null);

  const handleSelectPanel = useCallback((panelId: ExecutivePanelId) => {
    setExpandedPanelId((current) => (current === panelId ? null : panelId));
  }, []);

  return (
    <div className="founder-hq">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Command Center™"
        title="The Executive Headquarters of Visual Spark Studios"
        question="What matters today?"
        purpose="Your chief of staff, strategist, and research department — already working before you arrive. Not a dashboard. One calm executive experience."
      />

      <ExecutiveStatusBarView status={view.status} />
      <CommandCenterEntry view={view} />
      <SixQuestionsHero questions={view.sixQuestions} />
      <ExecutivePanelGrid
        panels={view.panels}
        expandedPanelId={expandedPanelId}
        onSelectPanel={handleSelectPanel}
      />
      <ExecutiveAssistantQueue items={view.assistantQueue} />
    </div>
  );
}
