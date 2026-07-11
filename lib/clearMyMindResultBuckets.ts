import type { BrainDumpEntry } from "./companionStore";

/**
 * Organize Mode clusters — Clear My Mind complete experience.
 * Required categories + a few helpful extras. Member may rename.
 */
export type ClearMyMindResultBucketId =
  | "do-now"
  | "today"
  | "this-week"
  | "projects"
  | "ideas"
  | "waiting"
  | "someday"
  | "research"
  | "questions"
  | "personal"
  | "business"
  | "appointments"
  | "people"
  | "follow-up"
  | "shopping"
  | "health"
  | "learning"
  | "tasks";

export const CLEAR_MY_MIND_RESULT_BUCKETS: readonly {
  id: ClearMyMindResultBucketId;
  label: string;
}[] = [
  { id: "do-now", label: "Do Now" },
  { id: "today", label: "Today" },
  { id: "this-week", label: "This Week" },
  { id: "projects", label: "Projects" },
  { id: "ideas", label: "Ideas" },
  { id: "waiting", label: "Waiting" },
  { id: "someday", label: "Someday" },
  { id: "research", label: "Research" },
  { id: "questions", label: "Questions" },
  { id: "personal", label: "Personal" },
  { id: "business", label: "Business" },
  { id: "appointments", label: "Appointments" },
  { id: "people", label: "People" },
  { id: "follow-up", label: "Follow-up" },
  { id: "shopping", label: "Shopping" },
  { id: "health", label: "Health" },
  { id: "learning", label: "Learning" },
  { id: "tasks", label: "Tasks" },
] as const;

const BUSINESS_RE =
  /\b(client|invoice|revenue|business|launch|marketing|sales|brand|offer|proposal)\b/i;
const PERSONAL_RE =
  /\b(family|home|kids?|spouse|partner|personal|house|errand)\b/i;
const HEALTH_RE =
  /\b(doctor|health|sleep|meds?|therapy|dentist|exercise|workout|anxious|anxiety|stress)\b/i;
const SHOPPING_RE =
  /\b(buy|shop|grocery|groceries|order|amazon|pick up)\b/i;
const LEARNING_RE =
  /\b(learn|course|study|read|book|class|training|skill)\b/i;
const RESEARCH_RE =
  /\b(research|look up|investigate|compare|find out)\b/i;
const APPOINTMENT_RE =
  /\b(appointment|meeting|call at|schedule|calendar|tomorrow at|monday|tuesday|wednesday|thursday|friday)\b/i;
const PROJECT_RE =
  /\b(project|build|launch|ship|milestone|roadmap)\b/i;
const WAITING_RE =
  /\b(waiting (?:on|for)|waiting|pending|follow.?up|check back)\b/i;
const SOMEDAY_RE =
  /\b(someday|eventually|not now|when i have time|maybe next|parking lot)\b/i;
const IDEA_RE =
  /\b(idea|maybe|could|what if|brainstorm|might|wish|dream)\b/i;
const QUESTION_RE = /\?|^(how|what|why|when|where|who|which)\b/i;
const PEOPLE_RE =
  /\b(call|text|email|meet|talk to|message|mom|dad|wife|husband|partner|client|team)\b/i;
const FOLLOW_RE = /\b(follow.?up|remind|check in|circle back)\b/i;
const DO_NOW_RE =
  /\b(asap|urgent|right now|immediately|do now|critical|emergency)\b/i;
const TODAY_RE =
  /\b(today|this morning|this afternoon|tonight|by end of day|eod)\b/i;
const THIS_WEEK_RE =
  /\b(this week|by friday|next few days|later this week)\b/i;

function bucketForText(
  text: string,
  category?: string | null,
  schedulingIntent?: string | null,
): ClearMyMindResultBucketId {
  const t = text.trim();
  const cat = (category ?? "").toLowerCase();
  const intent = (schedulingIntent ?? "").toLowerCase();

  for (const def of CLEAR_MY_MIND_RESULT_BUCKETS) {
    if (cat === def.label.toLowerCase() || cat === def.id) return def.id;
  }

  if (intent === "do-now" || DO_NOW_RE.test(t)) return "do-now";
  if (intent === "today" || TODAY_RE.test(t)) return "today";
  if (intent === "this-week" || THIS_WEEK_RE.test(t)) return "this-week";
  if (SOMEDAY_RE.test(t)) return "someday";
  if (WAITING_RE.test(t) || cat.includes("wait")) return "waiting";
  if (FOLLOW_RE.test(t) || cat.includes("follow")) return "follow-up";
  if (HEALTH_RE.test(t)) return "health";
  if (SHOPPING_RE.test(t)) return "shopping";
  if (RESEARCH_RE.test(t)) return "research";
  if (APPOINTMENT_RE.test(t)) return "appointments";
  if (LEARNING_RE.test(t)) return "learning";
  if (QUESTION_RE.test(t)) return "questions";
  if (PEOPLE_RE.test(t)) return "people";
  if (IDEA_RE.test(t) || cat.includes("idea")) return "ideas";
  if (PROJECT_RE.test(t) || cat.includes("project")) return "projects";
  if (BUSINESS_RE.test(t) || cat.includes("business") || cat.includes("client")) {
    return "business";
  }
  if (PERSONAL_RE.test(t) || cat.includes("personal")) return "personal";

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
    const bucket = bucketForText(
      entry.text,
      entry.category,
      entry.schedulingIntent,
    );
    map.get(bucket)!.push(entry);
  }

  return CLEAR_MY_MIND_RESULT_BUCKETS.map((def) => ({
    id: def.id,
    label: def.label,
    entries: map.get(def.id) ?? [],
  })).filter((b) => b.entries.length > 0);
}

/** Allow member rename of a cluster label for display. */
export function renameResultBucketLabel(
  id: ClearMyMindResultBucketId,
  customLabel: string,
): { id: ClearMyMindResultBucketId; label: string } {
  const fallback =
    CLEAR_MY_MIND_RESULT_BUCKETS.find((b) => b.id === id)?.label ?? id;
  const label = customLabel.trim() || fallback;
  return { id, label };
}

export function buildClearMyMindSessionSummary(entries: BrainDumpEntry[]) {
  const buckets = groupEntriesIntoResultBuckets(entries);
  const byId = (id: ClearMyMindResultBucketId) =>
    buckets.find((b) => b.id === id)?.entries.length ?? 0;
  return {
    itemsCaptured: entries.length,
    itemsOrganized: entries.filter((e) => Boolean(e.category) || e.sorted)
      .length,
    projectsCreated: entries.filter(
      (e) => Boolean(e.projectId) || e.routedAction === "project",
    ).length,
    calendarItems: entries.filter(
      (e) =>
        e.routedAction === "time-block" ||
        e.schedulingIntent === "schedule" ||
        Boolean(e.reminderAt),
    ).length,
    waitingItems: byId("waiting"),
    parkingLotItems: byId("someday"),
    referenceItems: byId("research"),
    savedForLater: entries.filter((e) => e.archived).length,
  };
}
