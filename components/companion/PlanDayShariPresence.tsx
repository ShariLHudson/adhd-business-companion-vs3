"use client";

import { useCompanionPresence } from "@/lib/useCompanionPresence";
import { ShariPortrait } from "@/components/companion/ShariPortrait";
import { ClearMyMindPresenceBubble } from "@/components/companion/ClearMyMindPresenceBubble";

type Props = {
  message: string | null;
};

/** Shari presence for Plan My Day™ morning orientation. */
export function PlanDayShariPresence({ message }: Props) {
  const presence = useCompanionPresence({
    workspacePanel: "plan-my-day",
    calmHome: true,
    presenceSurface: "morning-presence",
  });

  return (
    <div
      className="plan-day-shari-presence flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6"
      aria-label="Shari"
      data-testid="plan-day-shari-presence"
    >
      <ShariPortrait presence={presence} size="in-room" alt="Shari" />
      {message ? (
        <ClearMyMindPresenceBubble
          presence={presence}
          message={message}
          className="max-w-md text-base not-italic text-[#4b463f] sm:pt-2"
        />
      ) : null}
    </div>
  );
}
