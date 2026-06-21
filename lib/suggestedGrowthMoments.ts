/**
 * Suggested growth moments — classify activity before it becomes a Win.
 */

import { getMomentumEvents, type MomentumEvent } from "./companionStore";
import { loadDecisionCompassSession } from "./decisionCompassSessionStore";
import { isInWeek, weekKeyForDate } from "./weeklyWins";

export type GrowthMomentClassification =
  | "reminder"
  | "task"
  | "thought"
  | "decision"
  | "potential-win"
  | "potential-evidence"
  | "potential-proof-of-value"
  | "potential-journey-item";

export type SuggestedGrowthMoment = {
  id: string;
  sourceId: string;
  whatHappened: string;
  ts: string;
  icon: string;
  classification: GrowthMomentClassification;
};

export const CLASSIFICATION_LABELS: Record<GrowthMomentClassification, string> =
  {
    reminder: "Reminder",
    task: "Task",
    thought: "Thought",
    decision: "Decision",
    "potential-win": "Potential Win",
    "potential-evidence": "Potential Evidence",
    "potential-proof-of-value": "Potential Highlight",
    "potential-journey-item": "Potential Journey Item",
  };

export const SUGGESTED_CLASSIFICATIONS: GrowthMomentClassification[] = [
  "potential-win",
  "potential-evidence",
  "potential-proof-of-value",
  "potential-journey-item",
  "decision",
];

const STATE_KEY = "companion-suggested-growth-state-v1";

type SuggestedGrowthState = {
  ignoredSourceIds: string[];
  processedSourceIds: string[];
};

function readState(): SuggestedGrowthState {
  if (typeof window === "undefined") {
    return { ignoredSourceIds: [], processedSourceIds: [] };
  }
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return { ignoredSourceIds: [], processedSourceIds: [] };
    const parsed = JSON.parse(raw) as SuggestedGrowthState;
    return {
      ignoredSourceIds: Array.isArray(parsed.ignoredSourceIds)
        ? parsed.ignoredSourceIds
        : [],
      processedSourceIds: Array.isArray(parsed.processedSourceIds)
        ? parsed.processedSourceIds
        : [],
    };
  } catch {
    return { ignoredSourceIds: [], processedSourceIds: [] };
  }
}

function writeState(state: SuggestedGrowthState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("companion-suggested-growth-updated"));
  } catch {
    /* noop */
  }
}

export const SUGGESTED_GROWTH_UPDATED_EVENT = "companion-suggested-growth-updated";

export function ignoreSuggestedMoment(sourceId: string): void {
  const state = readState();
  if (state.ignoredSourceIds.includes(sourceId)) return;
  writeState({
    ...state,
    ignoredSourceIds: [...state.ignoredSourceIds, sourceId],
  });
}

export function markSuggestedMomentProcessed(sourceId: string): void {
  const state = readState();
  if (state.processedSourceIds.includes(sourceId)) return;
  writeState({
    ...state,
    processedSourceIds: [...state.processedSourceIds, sourceId],
  });
}

export function isSuggestedMomentHidden(sourceId: string): boolean {
  const state = readState();
  return (
    state.ignoredSourceIds.includes(sourceId) ||
    state.processedSourceIds.includes(sourceId)
  );
}

export function classifyMomentumEvent(
  event: MomentumEvent,
): GrowthMomentClassification {
  const label = event.label.toLowerCase();

  if (/remind|follow up|follow-up|due\b|deadline|schedule|calendar/i.test(label)) {
    return "reminder";
  }
  if (
    (/task|todo|to-do|checklist/i.test(label) || event.type === "start") &&
    event.type !== "complete" &&
    !/focus|pomodoro|timer/i.test(label)
  ) {
    return "task";
  }
  if (event.type === "capture") return "thought";
  if (/decision|decided|chose|choose/i.test(label)) return "decision";
  if (
    /testimonial|praise|compliment|review|5 star|thank you for|said nice|kind words/i.test(
      label,
    )
  ) {
    return "potential-proof-of-value";
  }
  if (
    /diagnos|milestone|journey|life event|adhd|born|married|lost |legacy|chapter/i.test(
      label,
    )
  ) {
    return "potential-journey-item";
  }
  if (
    /solved|fixed|resolved|issue|problem|registration|onboarding|before\/after|client result/i.test(
      label,
    )
  ) {
    return "potential-evidence";
  }
  if (
    event.type === "complete" ||
    event.type === "resilience" ||
    event.type === "move"
  ) {
    return "potential-win";
  }
  if (/focus|pomodoro|timer/i.test(label) && event.type === "start") {
    return "potential-win";
  }
  return "thought";
}

function eventIcon(event: MomentumEvent): string {
  switch (event.type) {
    case "complete":
      return "✅";
    case "move":
      return "📁";
    case "capture":
      return "💡";
    case "resilience":
      return "💪";
    case "start":
      return "🎯";
    default:
      return "🌟";
  }
}

function eventLabel(event: MomentumEvent): string | null {
  const trimmed = event.label.replace(/^Win:\s*/i, "").trim();
  if (!trimmed) return null;
  return trimmed;
}

export function buildSuggestedGrowthMoments(
  now = new Date(),
): SuggestedGrowthMoment[] {
  const weekKey = weekKeyForDate(now);
  const events = getMomentumEvents(600).filter((e) => isInWeek(e.ts, weekKey));
  const moments: SuggestedGrowthMoment[] = [];

  for (const event of events) {
    if (isSuggestedMomentHidden(event.id)) continue;
    const label = eventLabel(event);
    if (!label) continue;
    const classification = classifyMomentumEvent(event);
    if (!SUGGESTED_CLASSIFICATIONS.includes(classification)) continue;
    moments.push({
      id: `suggested-${event.id}`,
      sourceId: event.id,
      whatHappened: label,
      ts: event.ts,
      icon: eventIcon(event),
      classification,
    });
  }

  const session = loadDecisionCompassSession();
  if (
    session?.complete &&
    session.decision?.trim() &&
    isInWeek(session.lastTouchedAt, weekKey)
  ) {
    const sourceId = `decision-${session.lastTouchedAt}`;
    if (!isSuggestedMomentHidden(sourceId)) {
      moments.push({
        id: `suggested-${sourceId}`,
        sourceId,
        whatHappened: `Made a decision: ${session.decision}`,
        ts: session.lastTouchedAt,
        icon: "🧭",
        classification: "decision",
      });
    }
  }

  return moments.sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
  );
}

export function defaultDestinationsForClassification(
  classification: GrowthMomentClassification,
): {
  wins: boolean;
  evidence: boolean;
  confidence: boolean;
  journey: boolean;
} {
  switch (classification) {
    case "potential-evidence":
      return { wins: false, evidence: true, confidence: false, journey: false };
    case "potential-proof-of-value":
      return { wins: false, evidence: false, confidence: true, journey: false };
    case "potential-journey-item":
      return { wins: false, evidence: false, confidence: false, journey: true };
    case "decision":
      return { wins: true, evidence: false, confidence: false, journey: false };
    default:
      return { wins: true, evidence: false, confidence: false, journey: false };
  }
}
