/**
 * Meaningful Start — lightweight one-action recommendation for Welcome Choice 1.
 * Not Plan My Day. Not Help Me Choose. Does not resume prior work.
 */

import { getProjects } from "@/lib/companionStore";
import { loadTodayPlanItems } from "@/lib/planMyDay/planDayItems";

export type MeaningfulStartRecommendation = {
  id: string;
  title: string;
  reason: string;
  /** When true, show the clarifying question instead of a concrete action. */
  clarifying?: boolean;
};

export const MEANINGFUL_START_CLARIFYING_PROMPT =
  "What feels most important today: finishing something, handling something urgent, or making progress on something meaningful?";

export const MEANINGFUL_START_ACTIONS = [
  { id: "start-this", label: "Start This" },
  { id: "show-another", label: "Show Me Another" },
  { id: "plan-more", label: "Plan More of My Day" },
  { id: "help-me-choose", label: "Help Me Choose" },
] as const;

export type MeaningfulStartActionId =
  (typeof MEANINGFUL_START_ACTIONS)[number]["id"];

const CLARIFYING_PATHS: MeaningfulStartRecommendation[] = [
  {
    id: "clarify-finish",
    title: "Finish one small open loop",
    reason:
      "Closing something unfinished often frees more energy than starting something new.",
  },
  {
    id: "clarify-urgent",
    title: "Handle the most time-sensitive thing",
    reason:
      "When something is pressing, a short focused step protects the rest of the day.",
  },
  {
    id: "clarify-meaningful",
    title: "Make progress on something meaningful",
    reason:
      "Even a small step on what matters can restore a sense of forward motion.",
  },
];

function candidatesFromContext(): MeaningfulStartRecommendation[] {
  const out: MeaningfulStartRecommendation[] = [];
  try {
    const planItems = loadTodayPlanItems().filter(
      (item) => !item.done && item.title.trim(),
    );
    for (const item of planItems.slice(0, 6)) {
      out.push({
        id: `plan:${item.id}`,
        title: item.title.trim(),
        reason:
          "This is already on today’s list — a clear place to begin without planning the whole day.",
      });
    }
  } catch {
    /* storage unavailable */
  }

  try {
    const projects = getProjects()
      .filter(
        (p) =>
          p.name?.trim() &&
          p.status !== "completed" &&
          p.status !== "paused",
      )
      .slice(0, 4);
    for (const project of projects) {
      out.push({
        id: `project:${project.id}`,
        title: `Take one small step on ${project.name.trim()}`,
        reason:
          "An active project is waiting — we can keep the next move small and concrete.",
      });
    }
  } catch {
    /* storage unavailable */
  }

  return out;
}

/** Build the ordered recommendation pool (context first, then clarifying paths). */
export function listMeaningfulStartCandidates(): MeaningfulStartRecommendation[] {
  const fromContext = candidatesFromContext();
  if (fromContext.length > 0) return fromContext;
  return [
    {
      id: "clarify",
      title: MEANINGFUL_START_CLARIFYING_PROMPT,
      reason:
        "I don’t have enough context yet — pick the kind of progress that would help most.",
      clarifying: true,
    },
    ...CLARIFYING_PATHS,
  ];
}

export function recommendMeaningfulStart(
  excludeIds: string[] = [],
): MeaningfulStartRecommendation {
  const pool = listMeaningfulStartCandidates().filter(
    (r) => !excludeIds.includes(r.id),
  );
  if (pool[0]) return pool[0];
  const fallback = listMeaningfulStartCandidates();
  return (
    fallback[0] ?? {
      id: "clarify-meaningful",
      title: "Make progress on something meaningful",
      reason:
        "We can keep this small and work through one clear next step together.",
    }
  );
}

export function nextMeaningfulStartRecommendation(
  currentId: string,
  seenIds: string[],
): MeaningfulStartRecommendation {
  const exclude = Array.from(new Set([...seenIds, currentId]));
  const next = recommendMeaningfulStart(exclude);
  if (next.id !== currentId) return next;
  // Wrap: drop exclusions except current, then take second if possible.
  const pool = listMeaningfulStartCandidates();
  const alt = pool.find((r) => r.id !== currentId);
  return alt ?? next;
}

export function shariCueForMeaningfulStart(
  recommendation: MeaningfulStartRecommendation,
): string {
  if (recommendation.clarifying) {
    return `${MEANINGFUL_START_CLARIFYING_PROMPT}`;
  }
  return `Based on what is active right now, I think the most meaningful next step is: ${recommendation.title}. ${recommendation.reason} We can keep this small and work through it together.`;
}
