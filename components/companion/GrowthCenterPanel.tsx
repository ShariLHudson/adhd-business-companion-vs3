"use client";

import { useCallback, useEffect, useState } from "react";
import type { GrowthPanelNav, GrowthSectionId } from "@/lib/growthNavigation";
import { GrowthSectionHeader } from "@/components/companion/GrowthSectionHeader";
import { GrowthReportsPanel } from "@/components/companion/GrowthReportsPanel";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import {
  EcosystemCloseAllButton,
  EcosystemCollapsibleSection,
} from "@/components/companion/EcosystemCollapsibleSection";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

type GrowthBrowseSection = {
  id: GrowthSectionId;
  title: string;
  description: string;
  actionLabel: string;
  emoji: string;
};

const GROWTH_BROWSE_SECTIONS: GrowthBrowseSection[] = [
  {
    id: "wins-this-week",
    title: "My Wins",
    description: "Recent progress and accomplishments.",
    actionLabel: "Open My Wins",
    emoji: "🏆",
  },
  {
    id: "evidence-bank",
    title: "Evidence Bank",
    description: "Proof of impact, improvements, and problems solved.",
    actionLabel: "Open Evidence Bank",
    emoji: "📈",
  },
  {
    id: "confidence-vault",
    title: "My Highlights",
    description:
      "Accomplishments, expertise, praise, recognition, and credentials.",
    actionLabel: "Open My Highlights",
    emoji: "🌟",
  },
  {
    id: "my-journey",
    title: "My Journey",
    description: "Experiences, lessons, milestones, and personal growth.",
    actionLabel: "Open My Journey",
    emoji: "🌿",
  },
];

function GrowthBrowseRow({
  title,
  description,
  actionLabel,
  onOpen,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e7dfd4] bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="font-semibold text-[#1f1c19]">{title}</p>
        <p className="mt-0.5 text-xs text-[#6b635a]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-full bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163c3c]"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function GrowthCenterPanel({
  refreshKey = 0,
  nav,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
}) {
  const [reportsOpen, setReportsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Set<GrowthSectionId>>(
    () => new Set(),
  );

  useEffect(() => {
    void refreshKey;
  }, [refreshKey]);

  function toggleSection(id: GrowthSectionId) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const closeAll = useCallback(() => setOpenSections(new Set()), []);

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <GrowthSectionHeader
        nav={nav}
        onOpenReports={() => setReportsOpen(true)}
      />

      <div className="mt-4 flex justify-end">
        <EcosystemCloseAllButton
          onClick={closeAll}
          disabled={openSections.size === 0}
        />
      </div>

      <WorkspaceAreaWorksGuide areaId="growth" />

      <GrowthReportsPanel open={reportsOpen} onClose={() => setReportsOpen(false)} />

      <div className="mt-4 flex flex-col gap-3" data-testid="growth-hub-sections">
        {GROWTH_BROWSE_SECTIONS.map((section) => (
          <EcosystemCollapsibleSection
            key={section.id}
            title={section.title}
            description={section.description}
            emoji={section.emoji}
            open={openSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            testId={`growth-section-${section.id}`}
            accentClass="border-[#e7dfd4]"
          >
            <GrowthBrowseRow
              title={section.title}
              description={section.description}
              actionLabel={section.actionLabel}
              onOpen={() => nav.onOpenSection(section.id)}
            />
          </EcosystemCollapsibleSection>
        ))}
      </div>
    </section>
  );
}
