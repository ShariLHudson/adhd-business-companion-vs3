"use client";

import {
  PLAN_MY_DAY_TITLE,
  planDayChapterSubtitle,
  type PlanDayJourneyChapter,
} from "@/lib/planMyDay/companionBrainClient/planDayJourney";
import { EcosystemNavigationBar } from "@/components/companion/EcosystemNavigationBar";
import { PlanDayHelpIcon } from "@/components/companion/PlanDayHelpIcon";
import { PlanDayShariPresence } from "@/components/companion/PlanDayShariPresence";

type Props = {
  chapter: PlanDayJourneyChapter;
  onBack: () => void;
  onBackToChat: () => void;
  /** Optional quiet Shari line for continuity between chapters */
  shariWhisper?: string | null;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  /** Gateway — no help icon competing with Shari */
  hideHelp?: boolean;
};

/**
 * One continuous Plan My Day™ journey — consistent title, shifting subtitle.
 */
export function PlanDayJourneyShell({
  chapter,
  onBack,
  onBackToChat,
  shariWhisper,
  children,
  headerActions,
  hideHelp = false,
}: Props) {
  const subtitle = planDayChapterSubtitle(chapter);

  return (
    <div className="plan-day-journey flex min-h-0 flex-1 flex-col" data-chapter={chapter}>
      <header
        className={`mx-auto w-full max-w-3xl plan-day-journey-header ${chapter === "gateway" ? "" : "plan-day-living-enter"}`}
      >
        <EcosystemNavigationBar onBack={onBack} onBackToChat={onBackToChat} />
        <div className="mt-4 flex items-start justify-between gap-3 border-b border-[#e7dfd4] pb-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-[#1f1c19] lg:text-3xl">
              {PLAN_MY_DAY_TITLE}
            </h1>
            <p
              className="mt-1 text-base font-medium text-[#1e4f4f] lg:text-lg"
              data-testid="plan-day-chapter-subtitle"
            >
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            {!hideHelp ? <PlanDayHelpIcon /> : null}
          </div>
        </div>
        {shariWhisper && chapter !== "gateway" && chapter !== "todays-reality" ? (
          <div className="mt-4 plan-day-journey-shari">
            <PlanDayShariPresence message={shariWhisper} />
          </div>
        ) : null}
      </header>
      <div className="plan-day-journey-body mx-auto flex w-full max-w-3xl flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
