"use client";

import { useEffect, useMemo, useState } from "react";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import { GrowthQuickSave } from "@/components/companion/GrowthQuickSave";
import { GrowthSectionHeader } from "@/components/companion/GrowthSectionHeader";
import { GrowthHubBox } from "@/components/companion/GrowthHubBox";
import { OUTCOME_GOALS_UPDATED } from "@/lib/goals/outcomeGoals";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import {
  GROWTH_VAULT_SECTION_META,
  GROWTH_VAULT_SECTION_ORDER,
  growthVaultSectionCount,
  growthVaultWorkspaceSection,
  type GrowthVaultSectionId,
} from "@/lib/growthCenterHub";

export function GrowthVaultHubPanel({
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

  const counts = useMemo(
    () =>
      Object.fromEntries(
        GROWTH_VAULT_SECTION_ORDER.map((id) => [id, growthVaultSectionCount(id)]),
      ) as Record<GrowthVaultSectionId, number>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey],
  );

  function openSection(id: GrowthVaultSectionId) {
    nav.onOpenSection(growthVaultWorkspaceSection(id));
  }

  return (
    <section
      className={workspacePanelShellClass({ width: "standard" })}
      data-testid="growth-vault-hub"
    >
      <GrowthSectionHeader nav={nav} />
      <div className="mt-4">
        <GrowthQuickSave
          onSaved={() => setDataTick((t) => t + 1)}
          onOpenHubSection={openSection}
          onOpenOutcomeTab={() => nav.onOpenSection("outcome-goals")}
        />
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GROWTH_VAULT_SECTION_ORDER.map((id) => {
          const meta = GROWTH_VAULT_SECTION_META[id];
          return (
            <li key={id} className="min-h-0">
              <GrowthHubBox
                vaultVariant
                vaultId={id}
                emoji={meta.emoji}
                title={meta.title}
                description={meta.description}
                count={counts[id]}
                onOpen={() => openSection(id)}
                testId={`growth-vault-box-${id}`}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
