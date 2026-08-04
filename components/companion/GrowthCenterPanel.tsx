"use client";

/** @deprecated P0.56 — Not mounted. Superseded by sidebar Growth flyout + GrowthVaultHubPanel. */

import { useEffect, useState } from "react";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import { GrowthSectionHeader } from "@/components/companion/GrowthSectionHeader";
import { GrowthHubBox } from "@/components/companion/GrowthHubBox";
import { GrowthQuickSave } from "@/components/companion/GrowthQuickSave";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import {
  GROWTH_HUB_PRIMARY_META,
  GROWTH_HUB_PRIMARY_ORDER,
  GROWTH_VAULT_SECTION_ORDER,
  growthVaultSectionCount,
  type GrowthHubPrimaryId,
  type GrowthVaultSectionId,
} from "@/lib/growthCenterHub";
import { OUTCOME_GOALS_UPDATED } from "@/lib/goals/outcomeGoals";

const PRIMARY_WORKSPACE: Record<GrowthHubPrimaryId, GrowthPanelNav["current"]> = {
  "growth-vault": "growth-vault",
  "outcome-goals": "outcome-goals",
};

export function GrowthCenterPanel({
  refreshKey = 0,
  nav,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
}) {
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

  void dataTick;

  const vaultTotalCount = GROWTH_VAULT_SECTION_ORDER.reduce(
    (sum, id) => sum + growthVaultSectionCount(id),
    0,
  );

  function openPrimary(id: GrowthHubPrimaryId) {
    nav.onOpenSection(PRIMARY_WORKSPACE[id]);
  }

  function openVaultLeaf(id: GrowthVaultSectionId) {
    nav.onOpenSection(id);
  }

  return (
    <section
      className={workspacePanelShellClass({ width: "standard" })}
      data-testid="growth-center-hub"
    >
      <GrowthSectionHeader nav={nav} />

      <WorkspaceAreaWorksGuide areaId="growth" />

      <div className="mt-4">
        <GrowthQuickSave
          onSaved={() => setDataTick((t) => t + 1)}
          onOpenHubSection={openVaultLeaf}
          onOpenOutcomeTab={() => openPrimary("outcome-goals")}
        />
      </div>

      <ul className="mt-5 flex flex-col gap-3" data-testid="growth-hub-boxes">
        {GROWTH_HUB_PRIMARY_ORDER.map((primaryId) => {
          const meta = GROWTH_HUB_PRIMARY_META[primaryId];
          const count =
            primaryId === "growth-vault" && vaultTotalCount > 0
              ? vaultTotalCount
              : undefined;
          return (
            <li key={primaryId}>
              <GrowthHubBox
                emoji={meta.emoji}
                title={meta.title}
                description={meta.description}
                count={count}
                onOpen={() => openPrimary(primaryId)}
                testId={`growth-hub-box-${primaryId}`}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
