/**
 * Spec 133 — Idea preview fields (Who for · Time · Difficulty · Outcome · Best when).
 * Member language only.
 */

import type { ExploreIdeaPreview, ExploreIdeaResult } from "./types";

type PreviewSeed = Omit<ExploreIdeaPreview, "label" | "emoji">;

const DEFAULT_PREVIEW: PreviewSeed = {
  whoFor: "Entrepreneurs who want a clear starting shape",
  time: "About 20–40 minutes to get a solid first draft",
  difficulty: "Gentle — Spark carries the structure",
  expectedOutcome: "A usable draft you can refine and own",
  bestWhen: "You know the kind of thing you want, but not every detail yet",
};

const BY_LABEL: Record<string, Partial<PreviewSeed>> = {
  flyer: {
    whoFor: "Anyone promoting an offer, workshop, or gathering",
    time: "About 15–25 minutes",
    difficulty: "Easy",
    expectedOutcome: "A clear promotional piece ready to polish",
    bestWhen: "You need something people can glance at and understand",
  },
  "marketing plan": {
    whoFor: "Owners clarifying how they will reach the right people",
    time: "About 30–60 minutes for a first pass",
    difficulty: "Steady — one section at a time",
    expectedOutcome: "A practical marketing plan you can act on",
    bestWhen: "You want direction without drowning in options",
  },
  "event plan": {
    whoFor: "Hosts planning workshops, retreats, or gatherings",
    time: "About 30–60 minutes for a first pass",
    difficulty: "Steady — Spark holds the checklist",
    expectedOutcome: "An event plan with the important pieces named",
    bestWhen: "The date or idea is real, and you need structure",
  },
  workshop: {
    whoFor: "Teachers and facilitators designing a session",
    time: "About 25–45 minutes",
    difficulty: "Gentle to steady",
    expectedOutcome: "A workshop outline you can teach from",
    bestWhen: "You have a topic and need a clear flow",
  },
  email: {
    whoFor: "Anyone writing to clients, leads, or partners",
    time: "About 10–20 minutes",
    difficulty: "Easy",
    expectedOutcome: "A clear email draft in your voice",
    bestWhen: "You know the purpose but the words feel stuck",
  },
  "blog post": {
    whoFor: "Creators sharing ideas with their audience",
    time: "About 20–40 minutes",
    difficulty: "Gentle",
    expectedOutcome: "A blog draft with a clear point",
    bestWhen: "You have something to say and want help shaping it",
  },
  sop: {
    whoFor: "Owners documenting how work gets done",
    time: "About 25–45 minutes",
    difficulty: "Steady",
    expectedOutcome: "A procedure others (or future you) can follow",
    bestWhen: "A process lives only in your head",
  },
  "client check-in": {
    whoFor: "Service providers nurturing client relationships",
    time: "About 10–20 minutes",
    difficulty: "Easy",
    expectedOutcome: "A warm check-in you can send with confidence",
    bestWhen: "You care, and you want the words to land gently",
  },
};

function seedForLabel(label: string): PreviewSeed {
  const key = label.trim().toLowerCase();
  const partial = BY_LABEL[key] ?? {};
  return { ...DEFAULT_PREVIEW, ...partial };
}

/** Build member-facing preview for a discovery result. */
export function buildExploreIdeaPreview(
  result: ExploreIdeaResult,
): ExploreIdeaPreview {
  const seed = seedForLabel(result.label);
  return {
    label: result.label,
    emoji: result.emoji,
    ...seed,
  };
}
