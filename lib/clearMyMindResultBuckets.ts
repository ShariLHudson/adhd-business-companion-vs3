import type { BrainDumpEntry } from "./companionStore";

export type ClearMyMindResultBucketId =
  | "priorities"
  | "worries"
  | "ideas"
  | "decisions"
  | "tasks"
  | "people"
  | "questions"
  | "later";

export const CLEAR_MY_MIND_RESULT_BUCKETS: readonly {
  id: ClearMyMindResultBucketId;
  label: string;
}[] = [
  { id: "priorities", label: "Current Priorities" },
  { id: "worries", label: "Worries" },
  { id: "ideas", label: "Ideas" },
  { id: "decisions", label: "Decisions" },
  { id: "tasks", label: "Tasks" },
  { id: "people", label: "People" },
  { id: "questions", label: "Questions" },
  { id: "later", label: "Later" },
] as const;

const WORRY_RE =
  /\b(worr(?:y|ied|ies)|anxious|anxiety|scared|afraid|stress(?:ed)?|overwhelm(?:ed)?|panic|can't|cannot|stuck|behind|exhausted|tired|heavy)\b/i;
const DECISION_RE =
  /\b(should i|decide|decision|choice|whether|or not|vs\.?|versus|pick between)\b/i;
const QUESTION_RE = /\?|^(how|what|why|when|where|who|which)\b/i;
const PEOPLE_RE =
  /\b(call|text|email|meet|talk to|message|mom|dad|wife|husband|partner|client|team|izna)\b/i;
const IDEA_RE =
  /\b(idea|maybe|could|what if|brainstorm|someday|might|wish|dream)\b/i;
const PRIORITY_RE =
  /\b(today|urgent|asap|deadline|due|first|priority|important|must|need to)\b/i;
const LATER_RE =
  /\b(later|someday|eventually|not now|when i have time|maybe next week)\b/i;

function bucketForText(text: string, category?: string | null): ClearMyMindResultBucketId {
  const t = text.trim();
  const cat = (category ?? "").toLowerCase();

  if (WORRY_RE.test(t)) return "worries";
  if (DECISION_RE.test(t)) return "decisions";
  if (QUESTION_RE.test(t)) return "questions";
  if (PEOPLE_RE.test(t)) return "people";
  if (LATER_RE.test(t)) return "later";
  if (IDEA_RE.test(t) || cat.includes("idea") || cat.includes("brainstorm")) return "ideas";
  if (PRIORITY_RE.test(t)) return "priorities";

  if (cat.includes("follow")) return "later";
  if (cat.includes("admin") || cat.includes("client")) return "tasks";

  return "tasks";
}

export type ClearMyMindResultBucket = {
  id: ClearMyMindResultBucketId;
  label: string;
  entries: BrainDumpEntry[];
};

export function groupEntriesIntoResultBuckets(
  entries: BrainDumpEntry[],
): ClearMyMindResultBucket[] {
  const map = new Map<ClearMyMindResultBucketId, BrainDumpEntry[]>();
  for (const def of CLEAR_MY_MIND_RESULT_BUCKETS) {
    map.set(def.id, []);
  }

  for (const entry of entries) {
    const bucket = bucketForText(entry.text, entry.category);
    map.get(bucket)!.push(entry);
  }

  return CLEAR_MY_MIND_RESULT_BUCKETS.map((def) => ({
    id: def.id,
    label: def.label,
    entries: map.get(def.id) ?? [],
  })).filter((b) => b.entries.length > 0);
}
