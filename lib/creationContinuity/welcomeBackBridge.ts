/**
 * Sprint 3 — Conversation continuity bridge.
 * Facts alone are not enough. On return, Shari names what happened and what's next.
 */

import { recommendForEventWorkspace } from "@/lib/intelligentRecommendation";
import { sectionFilled } from "@/lib/eventsIntelligence/lifecycle";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { resolveUniversalCreationStateFromEvent } from "@/lib/universalCreationStateMachine";

function lastCompletedAction(record: EventRecord): string | null {
  if (sectionFilled(record, "agenda")) return "sketching your agenda";
  if (record.audience.trim()) return "outlining your audience";
  if (record.outcomes.trim()) return "clarifying the outcome";
  if (record.purpose.trim()) return "defining the purpose";
  if (record.eventTypeLabel.trim()) {
    return `starting your ${record.eventTypeLabel.toLowerCase()}`;
  }
  return null;
}

/** "Create Agenda" → "the agenda"; "Continue where you left off" stays natural. */
export function naturalNextStepPhrase(title: string): string {
  const t = title.trim();
  if (!t) return "the next step";
  if (/^continue where you left off/i.test(t)) {
    return "picking up where we left off";
  }
  if (/^review\b/i.test(t)) {
    return t.replace(/^Review\s+/i, "reviewing ").toLowerCase();
  }
  if (/^explore\b/i.test(t)) {
    return t.toLowerCase();
  }
  const stripped = t.replace(/^Create\s+/i, "").trim();
  if (/^the\s+/i.test(stripped)) return stripped.toLowerCase();
  return `the ${stripped.toLowerCase()}`;
}

/**
 * Natural welcome-back — never "Continue?"
 */
export function buildWelcomeBackBridge(record: EventRecord): string {
  const kind =
    record.eventTypeLabel?.trim().toLowerCase() ||
    record.eventType ||
    "event";
  const completed = lastCompletedAction(record);
  const pack = recommendForEventWorkspace(record, { returningSession: true });
  const next = naturalNextStepPhrase(pack.primary.title);
  const state = resolveUniversalCreationStateFromEvent(record);
  const timeWord =
    state === "discovery" || state === "idea" ? "Last time" : "Yesterday";

  if (completed) {
    return (
      `Welcome back. ${timeWord} we finished ${completed}. ` +
      `I think ${next} is the best next step.`
    );
  }

  return (
    `Welcome back. Your ${kind} is right where we left it. ` +
    `I think ${next} is the best next step.`
  );
}

export function summarizeContinuityObjective(record: EventRecord): string {
  const pack = recommendForEventWorkspace(record, { returningSession: true });
  return pack.primary.title;
}
