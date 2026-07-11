/**
 * Mind Map Discovery Interview (197 / 199 / 242).
 * Questions + parsing; draft builder lives in mindMapDraft.ts.
 *
 * Patterns (243): map already chosen · use memory first · one question at a time · stop early.
 */

import { getVisualDiscoveryInterviewSpec } from "./visualDiscoveryLibrary";

export type MindMapDiscoveryQuestionId =
  | "main-topic"
  | "everything"
  | "desired-outcome";

export type MindMapDiscoveryQuestion = {
  id: MindMapDiscoveryQuestionId;
  prompt: string;
  placeholder: string;
  hint?: string;
  allowSkip: boolean;
  /** When true, skip if estate memory already answered this. */
  skipWhenKnown?: boolean;
};

const mindMapSpec = getVisualDiscoveryInterviewSpec("mind-map");

/**
 * Mind Map interview (242) — discover topic, major ideas, desired outcome.
 * Natural groups / relationships are inferred in First Draft Intelligence (244).
 */
export const MIND_MAP_DISCOVERY_QUESTIONS: readonly MindMapDiscoveryQuestion[] = [
  {
    id: "main-topic",
    prompt: "What would you like to create a mind map about?",
    placeholder: "The center of this map…",
    hint: mindMapSpec.exampleQuestions[0],
    allowSkip: false,
    skipWhenKnown: true,
  },
  {
    id: "everything",
    prompt: "What ideas immediately come to mind?",
    placeholder: "Ideas, worries, pieces, people, next steps — dump it all…",
    hint: "Lists, bullets, or rough thoughts are perfect. Paste freely. Voice works too.",
    allowSkip: false,
    skipWhenKnown: true,
  },
  {
    id: "desired-outcome",
    prompt: "Is there an end goal?",
    placeholder: "Optional — what success looks like for this map…",
    hint: "Skip if you are still exploring.",
    allowSkip: true,
  },
] as const;

/** Split freeform dump into idea lines. */
export function parseIdeaLines(raw: string): string[] {
  const chunks = raw
    .split(/[\n;•·]+|(?:,\s+(?=[A-Z]))/)
    .flatMap((part) => part.split(/(?:^|\s)[-*]\s+/))
    .map((s) => s.replace(/^[\d]+[.)]\s*/, "").trim())
    .filter((s) => s.length > 1);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of chunks) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

/**
 * Pattern 5 (243): stop as soon as we can build an excellent first draft.
 * Topic + enough idea material → skip optional outcome question.
 */
export function hasEnoughForMindMapFirstDraft(input: {
  topic: string;
  everything: string;
}): boolean {
  const topic = input.topic.trim();
  const ideas = parseIdeaLines(input.everything);
  if (topic.length < 2) return false;
  return ideas.length >= 2 || input.everything.trim().length >= 40;
}

export {
  buildMindMapDraftFromDiscovery,
  buildMindMapDiscoveryInterview,
  dedupeIdeas,
  type MindMapDraftResult,
} from "./mindMapDraft";
