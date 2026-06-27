/**
 * Morning Presence — help the user feel seen before the day begins.
 * Not advice, coaching, or productivity — Shari noticing today's reality.
 * @see constitution.ts — generateMorningPresence
 */

import type { AssembledContext, MorningPresenceResult } from "./types";

const CATCH_UP = /\b(catch up|make up for|yesterday's incomplete)\b/i;
const PUSH_THROUGH = /\b(push through|power through)\b/i;
const GENERIC_HYPE = /\b(you've got this|crush it)\b/i;

function assertCleanCopy(text: string): void {
  if (CATCH_UP.test(text) || PUSH_THROUGH.test(text) || GENERIC_HYPE.test(text)) {
    throw new Error(`Morning Presence copy failed constitutional audit: ${text}`);
  }
}

function auditPresence(result: MorningPresenceResult): MorningPresenceResult {
  if (result.lead) assertCleanCopy(result.lead);
  result.lines.forEach(assertCleanCopy);
  return result;
}

function hasVacationSignal(ctx: AssembledContext): boolean {
  const highlights = ctx.calendarHighlights ?? [];
  return highlights.some((h) =>
    /\b(trip|vacation|travel|flight|getaway|holiday away)\b/i.test(h),
  );
}

function hasDifficultCarry(ctx: AssembledContext): boolean {
  const y = ctx.yesterdaySummary?.toLowerCase() ?? "";
  if (!y) return false;
  return /\b(hard|difficult|rough|loss|grief|bad news|didn't go)\b/.test(y);
}

function fromCapacity(ctx: AssembledContext): MorningPresenceResult | null {
  const { energy, motivation } = ctx.capacity;

  if (
    (energy === "high" || energy === "medium-high") &&
    (motivation === "excited" || motivation === "focused")
  ) {
    return {
      lead: null,
      lines: ["You've got real energy today.", "Let's use it well."],
    };
  }
  if (energy === "high") {
    return {
      lead: "Before we think about work...",
      lines: [
        "You're coming in with strong energy today.",
        "Let's use it well — without overloading it.",
      ],
    };
  }
  if (energy === "low" || motivation === "low") {
    return {
      lead: null,
      lines: [
        "Today doesn't need to be impressive.",
        "It just needs to be honest.",
      ],
    };
  }
  if (motivation === "overwhelmed") {
    return {
      lead: "I noticed something before we started...",
      lines: [
        "A lot is pulling at you today.",
        "We'll keep the shape small.",
      ],
    };
  }
  if (motivation === "scattered") {
    return {
      lead: null,
      lines: [
        "There's real energy here — and it wants somewhere to land.",
        "Let's give today a shape that holds it.",
      ],
    };
  }
  return null;
}

export function generateMorningPresence(
  ctx: AssembledContext,
): MorningPresenceResult {
  if (ctx.cycleState === "protected" || ctx.dayMode === "hyperfocus") {
    return auditPresence({
      lead: null,
      lines: [
        "I can already feel your momentum.",
        "Let's protect it instead of interrupting it.",
      ],
    });
  }

  if (hasVacationSignal(ctx)) {
    return auditPresence({
      lead: null,
      lines: [
        "You're getting closer to your trip.",
        "Let's make today count so tomorrow can feel lighter.",
      ],
    });
  }

  if (hasDifficultCarry(ctx)) {
    return auditPresence({
      lead: null,
      lines: [
        "You've been carrying a lot lately.",
        "We'll take one step at a time.",
      ],
    });
  }

  switch (ctx.dayMode) {
    case "celebration":
      return auditPresence({
        lead: "Before anything else...",
        lines: [
          "I'm really happy for you.",
          "Let's enjoy this win before we move on.",
        ],
      });
    case "recovery":
      return auditPresence({
        lead: null,
        lines: ["I'm glad you came back today.", "We'll keep this gentle."],
      });
    case "survival":
      return auditPresence({
        lead: "I noticed something before we started...",
        lines: [
          "Today doesn't need to be impressive.",
          "It just needs to be honest.",
        ],
      });
    case "health":
      return auditPresence({
        lead: null,
        lines: [
          ctx.capacity.healthNote
            ? `Your body is asking for care today — ${ctx.capacity.healthNote}.`
            : "Your body is asking for care today.",
          "We'll honor that before anything else.",
        ],
      });
    case "family":
      return auditPresence({
        lead: null,
        lines: [
          "Your life is asking for more than work today.",
          "That's okay.",
          "We'll build around what matters.",
        ],
      });
    case "creative":
      return auditPresence({
        lead: null,
        lines: [
          "There's creative spark in the air today.",
          "Let's protect it before we commit it all away.",
        ],
      });
    default:
      break;
  }

  const capacityPresence = fromCapacity(ctx);
  if (capacityPresence) return auditPresence(capacityPresence);

  return auditPresence({
    lead: null,
    lines: ["Let's start from what's actually true right now."],
  });
}

/** Plain text for accessibility and legacy consumers */
export function formatMorningPresencePlain(
  presence: MorningPresenceResult | null | undefined,
): string {
  if (!presence) return "";
  return [presence.lead, ...presence.lines].filter(Boolean).join(" ");
}
