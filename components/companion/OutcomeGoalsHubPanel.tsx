"use client";

import { useCallback, useEffect, useState } from "react";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import type { WorkspaceBackRegistrar } from "@/lib/workspaceDrillBack";
import { GrowthSectionHeader } from "@/components/companion/GrowthSectionHeader";
import { OutcomeGoalsPanel } from "@/components/companion/OutcomeGoalsPanel";
import { OutcomeGoalActivityTab } from "@/components/companion/OutcomeGoalActivityTab";
import { OutcomeGoalInsightsTab } from "@/components/companion/OutcomeGoalInsightsTab";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import {
  loadGrowthHubOpenOutcomeTab,
  OUTCOME_GOALS_TAB_META,
  OUTCOME_GOALS_TAB_ORDER,
  saveGrowthHubOpenOutcomeTab,
  type OutcomeGoalsTabId,
} from "@/lib/growthCenterHub";
import { OUTCOME_GOALS_UPDATED } from "@/lib/goals/outcomeGoals";

function OutcomeGoalsTabBar({
  activeTab,
  onSelect,
}: {
  activeTab: OutcomeGoalsTabId;
  onSelect: (tab: OutcomeGoalsTabId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="outcome-goals-tabs">
      {OUTCOME_GOALS_TAB_ORDER.map((tab) => {
        const meta = OUTCOME_GOALS_TAB_META[tab];
        const selected = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              selected
                ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                : "border-[#e7dfd4] bg-white text-[#6b635a] hover:bg-[#faf7f2]"
            }`}
            data-testid={`outcome-tab-${tab}`}
          >
            {meta.title}
          </button>
        );
      })}
    </div>
  );
}

export function OutcomeGoalsHubPanel({
  refreshKey = 0,
  nav,
  registerBack,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
  registerBack?: WorkspaceBackRegistrar;
}) {
  const [activeTab, setActiveTab] = useState<OutcomeGoalsTabId>(
    () => loadGrowthHubOpenOutcomeTab() ?? "goals",
  );
  const [dataTick, setDataTick] = useState(0);

  useEffect(() => {
    void refreshKey;
    setDataTick((t) => t + 1);
  }, [refreshKey]);

  useEffect(() => {
    const bump = () => setDataTick((t) => t + 1);
    window.addEventListener(OUTCOME_GOALS_UPDATED, bump);
    return () => window.removeEventListener(OUTCOME_GOALS_UPDATED, bump);
  }, []);

  function selectTab(tab: OutcomeGoalsTabId) {
    setActiveTab(tab);
    saveGrowthHubOpenOutcomeTab(tab);
  }

  const retreatTab = useCallback(() => {
    if (activeTab === "goals") return;
    selectTab("goals");
  }, [activeTab]);

  useEffect(() => {
    if (!registerBack) return;
    if (activeTab === "goals") {
      registerBack(null);
      return;
    }
    registerBack(() => {
      retreatTab();
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, activeTab, retreatTab]);

  void dataTick;
  void nav;

  return (
    <section
      className={workspacePanelShellClass({ width: "standard" })}
      data-testid="outcome-goals-hub"
    >
      <GrowthSectionHeader nav={nav} />
      <WorkspaceAreaWorksGuide areaId="outcome-goals" />
      <div className="mt-4 space-y-4">
        <OutcomeGoalsTabBar activeTab={activeTab} onSelect={selectTab} />
        <p className="text-sm text-[#6b635a]">
          {OUTCOME_GOALS_TAB_META[activeTab].description}
        </p>
        {activeTab === "goals" ? (
          <OutcomeGoalsPanel hubMode />
        ) : null}
        {activeTab === "activity" ? <OutcomeGoalActivityTab /> : null}
        {activeTab === "insights" ? <OutcomeGoalInsightsTab /> : null}
      </div>
    </section>
  );
}
