"use client";

import { ShariPortrait } from "@/components/companion/ShariPortrait";
import type { MorningPresenceResult } from "@/lib/companionBrain";
import { useCompanionPresence } from "@/lib/useCompanionPresence";

type Props = {
  presence: MorningPresenceResult;
};

function morningLineClass(tone: "primary" | "secondary"): string {
  return tone === "secondary"
    ? "plan-day-morning-presence__line plan-day-morning-presence__line--secondary"
    : "plan-day-morning-presence__line plan-day-morning-presence__line--primary";
}

/**
 * Morning Presence™ — unmistakably Shari noticing the day before any plan.
 */
export function PlanDayMorningPresence({ presence }: Props) {
  const photoPresence = useCompanionPresence({
    workspacePanel: "plan-my-day",
    calmHome: true,
    presenceSurface: "morning-presence",
  });

  const lines = [
    ...(presence.lead
      ? [{ text: presence.lead, tone: "secondary" as const }]
      : []),
    ...presence.lines.map((text) => ({
      text,
      tone: "primary" as const,
    })),
  ].filter((line) => line.text);

  const ariaLabel = [presence.lead, ...presence.lines]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className="plan-day-morning-presence plan-day-morning-presence-enter"
      aria-label={ariaLabel}
      data-testid="plan-day-morning-presence"
    >
      <div className="plan-day-morning-presence__moment">
        <div className="plan-day-morning-presence__portrait">
          <ShariPortrait presence={photoPresence} size="companion" alt="" />
        </div>
        <div className="plan-day-morning-presence__copy">
          {lines.map((line, index) => (
            <p key={`${line.text}-${index}`} className={morningLineClass(line.tone)}>
              {line.text}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
