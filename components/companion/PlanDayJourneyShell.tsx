"use client";

import { useMemo } from "react";
import {
  PLAN_MY_DAY_TITLE,
  planDayChapterSubtitle,
  type PlanDayJourneyChapter,
} from "@/lib/planMyDay/companionBrainClient/planDayJourney";
import { evaluatePlanningTableRoom } from "@/lib/planningTableRoom";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import { EcosystemNavigationBar } from "@/components/companion/EcosystemNavigationBar";
import { PlanDayHelpIcon } from "@/components/companion/PlanDayHelpIcon";
import { PlanDayHowDoI } from "@/components/companion/PlanDayHowDoI";
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
  /** Morning Room — no portrait, no external title chrome */
  morningRoom?: boolean;
  /**
   * Today's Plan member order:
   * How Do I? → Previous Screen → Plan My Day → (children)
   */
  memberOrderLayout?: boolean;
};

function PreviousScreenButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      className="plan-day-morning-note__previous"
      onClick={onBack}
      data-testid="app-back-button"
      aria-label="Previous Screen"
    >
      <span aria-hidden="true">←</span>
      <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
    </button>
  );
}

function MemberOrderHeader({
  onBack,
  headerActions,
  morningRoom,
}: {
  onBack: () => void;
  headerActions?: React.ReactNode;
  morningRoom: boolean;
}) {
  return (
    <header
      className={
        morningRoom
          ? "plan-day-member-order-header"
          : "plan-day-member-order-header mx-auto w-full max-w-3xl"
      }
      data-testid="plan-day-member-order-header"
    >
      <PlanDayHowDoI />
      <div className="mt-3">
        <PreviousScreenButton onBack={onBack} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <h1
          className={
            morningRoom
              ? "plan-day-morning-note__title"
              : "text-2xl font-semibold text-[#1f1c19] lg:text-3xl"
          }
        >
          {PLAN_MY_DAY_TITLE}
        </h1>
        {headerActions ? (
          <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
        ) : null}
      </div>
    </header>
  );
}

/**
 * One continuous Plan My Day journey — consistent title, shifting subtitle.
 */
export function PlanDayJourneyShell({
  chapter,
  onBack,
  onBackToChat,
  shariWhisper,
  children,
  headerActions,
  hideHelp = false,
  morningRoom = false,
  memberOrderLayout = false,
}: Props) {
  const subtitle = planDayChapterSubtitle(chapter);
  const room = useMemo(
    () => evaluatePlanningTableRoom({ chapter }),
    [chapter],
  );

  if (memberOrderLayout) {
    if (morningRoom) {
      return (
        <div
          className="plan-day-morning-room-content"
          data-chapter={chapter}
          data-room-whisper={room.roomWhisper}
          data-member-order="true"
        >
          <MemberOrderHeader
            onBack={onBack}
            headerActions={headerActions}
            morningRoom
          />
          {children}
        </div>
      );
    }

    return (
      <div
        className="plan-day-journey flex min-h-0 flex-1 flex-col"
        data-chapter={chapter}
        data-room-whisper={room.roomWhisper}
        data-member-order="true"
      >
        <MemberOrderHeader
          onBack={onBack}
          headerActions={headerActions}
          morningRoom={false}
        />
        <div className="plan-day-journey-body mx-auto flex w-full max-w-3xl flex-1 flex-col">
          {children}
        </div>
      </div>
    );
  }

  if (morningRoom) {
    return (
      <div
        className="plan-day-morning-room-content"
        data-chapter={chapter}
        data-room-whisper={room.roomWhisper}
      >
        <PreviousScreenButton onBack={onBack} />
        {children}
      </div>
    );
  }

  return (
    <div
      className="plan-day-journey flex min-h-0 flex-1 flex-col"
      data-chapter={chapter}
      data-room-whisper={room.roomWhisper}
    >
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
