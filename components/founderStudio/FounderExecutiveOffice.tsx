"use client";

import { useCallback, useState } from "react";

import type { PreparedOffice } from "@/lib/founder/concierge/types";
import type { FireExecutivePortfolio } from "@/lib/founder/types/fireBrief";

import { ConciergeAgenda } from "./concierge/ConciergeAgenda";
import { ConciergeReminders } from "./concierge/ConciergeReminders";
import { ConciergeThinkingSpace } from "./concierge/ConciergeThinkingSpace";
import { ConciergeWorkspaceSuggestion } from "./concierge/ConciergeWorkspaceSuggestion";
import { FlameMentorPresence } from "./flame/FlameMentorPresence";
import { MissionWorkspaceShell } from "./missions/MissionWorkspaceShell";
import { FireExecutiveBriefReadingExperience } from "./fire/FireExecutiveBriefReadingExperience";
import { FounderWorkspaceCards } from "./FounderWorkspaceCards";

type Props = {
  greeting: string;
  portfolio: FireExecutivePortfolio;
  office: PreparedOffice;
};

/**
 * Private Executive Office layout: daily brief dominant on top;
 * operational concierge / mission / workspace tools remain below.
 * Reading Mode minimizes secondary dashboards without leaving the route.
 */
export function FounderExecutiveOffice({ greeting, portfolio, office }: Props) {
  const [readingMode, setReadingMode] = useState(false);

  const onReadingModeChange = useCallback((next: boolean) => {
    setReadingMode(next);
  }, []);

  return (
    <div
      className={`founder-home founder-home--brief-wide${
        readingMode ? " founder-home--reading-mode" : ""
      }`}
      data-testid="founder-executive-office"
      data-reading-mode={readingMode ? "true" : "false"}
    >
      <p className="founder-home__eyebrow">Executive Office</p>

      <FireExecutiveBriefReadingExperience
        portfolio={portfolio}
        variant="today"
        greeting={greeting}
        readingMode={readingMode}
        onReadingModeChange={onReadingModeChange}
      />

      <div
        className="founder-home__secondary"
        data-testid="founder-home-secondary"
        hidden={readingMode}
        aria-hidden={readingMode}
      >
        <p className="founder-home__secondary-label">
          Mission &amp; office tools
        </p>
        <MissionWorkspaceShell />
        <FlameMentorPresence />
        <div className="founder-concierge-office__row">
          <ConciergeWorkspaceSuggestion suggestion={office.workspaceSuggestion} />
          <ConciergeThinkingSpace suggestion={office.thinkingSpace} />
        </div>
        <ConciergeAgenda agenda={office.agenda} />
        <ConciergeReminders reminders={office.reminders} />
        <FounderWorkspaceCards />
      </div>
    </div>
  );
}
