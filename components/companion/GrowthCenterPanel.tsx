"use client";

import { useCallback, useEffect, useState } from "react";
import type { GrowthPanelNav, GrowthSectionId } from "@/lib/growthNavigation";
import { GROWTH_DESTINATION_STYLES } from "@/lib/growthNavigation";
import { GrowthSectionHeader } from "@/components/companion/GrowthSectionHeader";
import { GrowthReportsPanel } from "@/components/companion/GrowthReportsPanel";
import { OutcomeGoalsPanel } from "@/components/companion/OutcomeGoalsPanel";
import { GrowthHubInboxStrip } from "@/components/companion/GrowthHubInboxStrip";
import { GrowthSaveSuggestionBanner } from "@/components/companion/GrowthSaveSuggestionBanner";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import {
  EcosystemCloseAllButton,
  EcosystemCollapsibleSection,
} from "@/components/companion/EcosystemCollapsibleSection";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import { setEvidencePrefill } from "@/lib/evidenceBankStore";
import { setJourneyPrefill } from "@/lib/myJourneyStore";
import { setConfidencePrefill } from "@/lib/confidenceVaultStore";

type GrowthReflectionCard = {
  id: Exclude<GrowthSectionId, "growth">;
  title: string;
  routingLine: string;
  description: string;
  actionLabel: string;
  emoji: string;
};

/** Narrative order: Wins → Evidence → Highlights → Journey */
const GROWTH_REFLECTION_CARDS: GrowthReflectionCard[] = [
  {
    id: "wins-this-week",
    title: "My Wins",
    routingLine: "Something went well — forward motion, done, or showed up.",
    description: "Recent successes, progress, and accomplishments.",
    actionLabel: "Open My Wins",
    emoji: "🏆",
  },
  {
    id: "evidence-bank",
    title: "Evidence Bank",
    routingLine: "Proof it mattered — impact, results, problems solved.",
    description: "Proof, testimonials, impact, results, and feedback.",
    actionLabel: "Open Evidence Bank",
    emoji: "📈",
  },
  {
    id: "confidence-vault",
    title: "My Highlights",
    routingLine: "Praise, recognition, credentials, accomplishments.",
    description: "Recognition, expertise, credentials, and achievements.",
    actionLabel: "Open My Highlights",
    emoji: "✨",
  },
  {
    id: "my-journey",
    title: "My Journey",
    routingLine: "Milestones, lessons, story — who you are becoming.",
    description: "Lessons learned, milestones, and growth moments.",
    actionLabel: "Open My Journey",
    emoji: "🌱",
  },
];

function GrowthCardAction({
  routingLine,
  actionLabel,
  onOpen,
  style,
}: {
  routingLine: string;
  actionLabel: string;
  onOpen: () => void;
  style: (typeof GROWTH_DESTINATION_STYLES)[keyof typeof GROWTH_DESTINATION_STYLES];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#6b635a]">{routingLine}</p>
      <button
        type="button"
        onClick={onOpen}
        className={`shrink-0 rounded-full border bg-white px-4 py-2 text-sm font-semibold ${style.actionBorder} ${style.actionFg} ${style.actionHover}`}
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

  function openSection(id: GrowthSectionId) {
    nav.onOpenSection(id);
  }

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <GrowthSectionHeader nav={nav} />

      <div className="mt-4 flex justify-end">
        <EcosystemCloseAllButton
          onClick={closeAll}
          disabled={openSections.size === 0}
        />
      </div>

      <WorkspaceAreaWorksGuide areaId="growth" />

      <GrowthSaveSuggestionBanner
        onSaveToWins={(text) => {
          createSavedGrowthWin({
            whatHappened: text,
            ts: new Date().toISOString(),
            icon: "🎯",
            attachments: [],
          });
        }}
        onSaveToEvidence={(text) => {
          setEvidencePrefill({ whatHappened: text });
          openSection("evidence-bank");
        }}
        onSaveToJourney={(text) => {
          setJourneyPrefill({
            title: text.slice(0, 80),
            whatHappened: text,
          });
          openSection("my-journey");
        }}
        onSaveToHighlights={(text) => {
          setConfidencePrefill({
            title: text.slice(0, 80),
            description: text,
            category: "Accomplishments",
          });
          openSection("confidence-vault");
        }}
      />

      <div
        className="mt-4 rounded-2xl border border-[#1e4f4f]/20 bg-white p-4"
        data-testid="growth-outcome-goals"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Outcome Goals™
        </p>
        <div className="mt-2">
          <OutcomeGoalsPanel hubMode />
        </div>
      </div>

      <div className="mt-4">
        <GrowthHubInboxStrip onOpenWins={() => openSection("wins-this-week")} />
      </div>

      <div className="mt-4 flex flex-col gap-3" data-testid="growth-hub-sections">
        {GROWTH_REFLECTION_CARDS.map((section) => {
          const style = GROWTH_DESTINATION_STYLES[section.id];
          return (
            <EcosystemCollapsibleSection
              key={section.id}
              title={section.title}
              description={section.description}
              emoji={section.emoji}
              open={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              testId={`growth-section-${section.id}`}
              accentClass={`border-[#e7dfd4] border-t-4 ${style.accentBorder}`}
              headerClassName={`${style.headerBg} hover:brightness-[0.99]`}
              emojiClassName={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${style.iconRing}`}
            >
              <GrowthCardAction
                routingLine={section.routingLine}
                actionLabel={section.actionLabel}
                onOpen={() => openSection(section.id)}
                style={style}
              />
            </EcosystemCollapsibleSection>
          );
        })}
      </div>

      <div
        className="mt-4 rounded-2xl border border-[#e7dfd4] bg-white p-4"
        data-testid="growth-reports-entry"
      >
        <p className="text-sm font-semibold text-[#1f1c19]">Growth Reports™</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Periodic reflection — a printable story of wins, evidence, highlights,
          and journey. Not a live dashboard.
        </p>
        <button
          type="button"
          onClick={() => setReportsOpen(true)}
          className="mt-3 rounded-xl border border-[#1e4f4f]/35 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          Build a Growth Report →
        </button>
      </div>

      <GrowthReportsPanel open={reportsOpen} onClose={() => setReportsOpen(false)} />
    </section>
  );
}
