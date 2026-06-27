"use client";

import type { MorningPresenceResult } from "@/lib/companionBrain";

type Props = {
  presence: MorningPresenceResult;
};

/**
 * Morning presence — text only; the room holds the warmth, not a portrait.
 */
export function PlanDayMorningPresence({ presence }: Props) {
  const lines = [
    ...(presence.lead ? [presence.lead] : []),
    ...presence.lines,
  ].filter(Boolean);

  if (!lines.length) return null;

  return (
    <div
      className="plan-day-morning-presence plan-day-morning-presence--text-only"
      data-testid="plan-day-morning-presence-legacy"
      aria-hidden
    >
      {lines.map((line) => (
        <p key={line} className="plan-day-morning-presence__line">
          {line}
        </p>
      ))}
    </div>
  );
}
