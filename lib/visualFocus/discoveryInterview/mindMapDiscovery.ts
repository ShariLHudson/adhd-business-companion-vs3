/**
 * Mind Map Discovery Interview™ (197 / 199).
 * Questions + parsing; draft builder lives in mindMapDraft.ts.
 */

export type MindMapDiscoveryQuestionId =
  | "main-topic"
  | "everything"
  | "anything-else";

export type MindMapDiscoveryQuestion = {
  id: MindMapDiscoveryQuestionId;
  prompt: string;
  placeholder: string;
  hint?: string;
  allowSkip: boolean;
};

export const MIND_MAP_DISCOVERY_QUESTIONS: readonly MindMapDiscoveryQuestion[] = [
  {
    id: "main-topic",
    prompt: "What is the main topic?",
    placeholder: "The center of this map…",
    hint: "One clear focus — Spark will build outward from here.",
    allowSkip: false,
  },
  {
    id: "everything",
    prompt: "Tell me everything that comes to mind.",
    placeholder: "Ideas, worries, pieces, people, next steps — dump it all…",
    hint: "Lists, bullets, or rough thoughts are perfect. Paste freely. Voice works too.",
    allowSkip: false,
  },
  {
    id: "anything-else",
    prompt: "Anything else?",
    placeholder: "Optional — anything you almost forgot…",
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

export {
  buildMindMapDraftFromDiscovery,
  buildMindMapDiscoveryInterview,
  dedupeIdeas,
  type MindMapDraftResult,
} from "./mindMapDraft";
