/**
 * Project Homes Next-Step Intelligence Engine (Prompt: Projects Next-Step
 * Intelligence and Connected Places Completion).
 *
 * Separates what the member has already told Spark (facts, constraints,
 * completed work, open questions) from what they should do next (one
 * concrete, generated action). Never restates setup text as a next step.
 *
 * Current Focus = area of attention (a short label).
 * Your Next Step = one concrete action inside that area.
 * These must never be the same raw string.
 */

import { getProjectItems, type ProjectItem } from "@/lib/companionProjectsStore";

export type ProjectTypeCategory = "event" | "marketing" | "sop" | "general";

/** Suggested structure from the authoritative prompt — kept intentionally close. */
export type ProjectContext = {
  projectId: string;
  projectType: ProjectTypeCategory;
  title: string;
  purpose?: string;
  desiredOutcome?: string;
  knownFacts: string[];
  constraints: string[];
  completedTasks: string[];
  openTasks: string[];
  milestones: string[];
  unresolvedQuestions: string[];
  currentFocus?: string;
};

export type NextStepSuggestionSource = "generated" | "user" | "task" | "milestone";

export type NextStepSuggestion = {
  title: string;
  reason: string;
  source: NextStepSuggestionSource;
  confidence: number;
};

type StepState = "unaddressed" | "partial" | "done";

type StepDetection = { state: StepState; hit?: string };

type StepBlueprint = {
  id: string;
  /** Short, human label for "what area am I working on" (Current Focus). */
  areaLabel: string;
  /** Only evaluate this category when true (e.g. venue only matters in person). */
  relevant?: (ctx: ProjectContext) => boolean;
  detect: (ctx: ProjectContext) => StepDetection;
  buildTitle: (ctx: ProjectContext, detection: StepDetection) => string;
  buildReason: (ctx: ProjectContext, detection: StepDetection) => string;
};

// ---------------------------------------------------------------------------
// Project type classification — not hardcoded to a single list.
// ---------------------------------------------------------------------------

const SOP_RE =
  /\b(sop|standard operating procedure|process doc(ument)?|procedure|workflow|checklist|playbook)\b/i;
const EVENT_RE =
  /\b(event|workshop|retreat|summit|conference|gathering|webinar|launch party|meetup|masterclass|class|training session)\b/i;
const MARKETING_RE =
  /\b(campaign|marketing|promo(tion)?|advertis(e|ing)|funnel|email sequence|newsletter series|content calendar|social (media )?push)\b/i;

export function classifyProjectType(text: string): ProjectTypeCategory {
  const value = text.trim();
  if (!value) return "general";
  if (SOP_RE.test(value)) return "sop";
  if (EVENT_RE.test(value)) return "event";
  if (MARKETING_RE.test(value)) return "marketing";
  return "general";
}

// ---------------------------------------------------------------------------
// Fact / constraint / question classification for free text entries
// (setup pieces and Project Plan sections are the same shape — short
// member-entered phrases describing what is already known).
// ---------------------------------------------------------------------------

const CONSTRAINT_RE =
  /\b(budget|must|only|cannot|can't|no more than|limited to|deadline|max(imum)?|min(imum)?|not more than|restricted|required by)\b/i;

export function classifyFreeTextEntries(entries: readonly string[]): {
  facts: string[];
  constraints: string[];
  questions: string[];
} {
  const facts: string[] = [];
  const constraints: string[] = [];
  const questions: string[] = [];
  for (const raw of entries) {
    const text = raw.trim();
    if (!text) continue;
    if (text.endsWith("?")) {
      questions.push(text);
    } else if (CONSTRAINT_RE.test(text)) {
      constraints.push(text);
    } else {
      facts.push(text);
    }
  }
  return { facts, constraints, questions };
}

// ---------------------------------------------------------------------------
// Shared detection helpers
// ---------------------------------------------------------------------------

const VAGUE_RE =
  /\b(mid|early|late|approx|around|maybe|sometime|ish|tbd|to be (confirmed|decided)|not (sure|certain)|roughly|one (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|somewhere)\b/i;

const WEEKDAY_RE =
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;

function detectFromFacts(
  ctx: ProjectContext,
  keywordRe: RegExp,
): StepDetection {
  if (ctx.completedTasks.some((t) => keywordRe.test(t))) {
    return { state: "done" };
  }
  const hit =
    ctx.knownFacts.find((f) => keywordRe.test(f)) ??
    ctx.constraints.find((f) => keywordRe.test(f));
  if (!hit) return { state: "unaddressed" };
  if (VAGUE_RE.test(hit)) return { state: "partial", hit };
  return { state: "done", hit };
}

// ---------------------------------------------------------------------------
// Event / Workshop blueprints
// ---------------------------------------------------------------------------

const isOnlineFormat = (ctx: ProjectContext) =>
  ctx.knownFacts.some((f) => /\b(online|virtual|zoom|remote)\b/i.test(f));

const EVENT_STEPS: StepBlueprint[] = [
  {
    id: "audience",
    areaLabel: "Audience clarity",
    detect: (ctx) => detectFromFacts(ctx, /\b(audience|attendee|who.?s (coming|attending)|target (client|market))\b/i),
    buildTitle: (_ctx, d) =>
      d.state === "partial"
        ? "Narrow the audience description down to one clear sentence."
        : "Clarify who this workshop is for — the specific audience you want to reach.",
    buildReason: () =>
      "Knowing exactly who this is for shapes the agenda, price, and promotion.",
  },
  {
    id: "date",
    areaLabel: "Date and format decisions",
    detect: (ctx) => detectFromFacts(ctx, /\b(date|day|when|saturday|sunday|monday|tuesday|wednesday|thursday|friday)\b/i),
    buildTitle: (_ctx, d) => {
      if (d.state === "partial" && d.hit) {
        const weekday = d.hit.match(WEEKDAY_RE)?.[0];
        return weekday
          ? `Choose the exact ${weekday.toLowerCase()} for the workshop.`
          : "Pick the specific date instead of a date range.";
      }
      return "Choose the date for the workshop.";
    },
    buildReason: (_ctx, d) =>
      d.state === "partial"
        ? "You have a window in mind — picking the exact day unlocks venue booking and invitations."
        : "A firm date lets you move on venue, promotion, and registration.",
  },
  {
    id: "format",
    areaLabel: "Date and format decisions",
    detect: (ctx) => detectFromFacts(ctx, /\b(in.?person|online|virtual|hybrid|zoom|format)\b/i),
    buildTitle: () =>
      "Decide whether the workshop will be in person, online, or hybrid.",
    buildReason: () =>
      "Format affects venue, technology, and how you promote it.",
  },
  {
    id: "agenda",
    areaLabel: "Agenda development",
    detect: (ctx) => detectFromFacts(ctx, /\b(agenda|outline|run.?of.?show|session plan|curriculum)\b/i),
    buildTitle: () => "Draft a simple three-part agenda for the workshop.",
    buildReason: () =>
      "A rough shape for the morning makes everything after this easier to plan.",
  },
  {
    id: "venue",
    areaLabel: "Venue selection",
    relevant: (ctx) => !isOnlineFormat(ctx),
    detect: (ctx) => detectFromFacts(ctx, /\b(venue|location|room|space|address)\b/i),
    buildTitle: () => "Identify three possible venues for the workshop.",
    buildReason: () =>
      "A short list turns booking into a quick decision instead of an open search.",
  },
  {
    id: "price",
    areaLabel: "Pricing",
    detect: (ctx) => detectFromFacts(ctx, /\b(price|cost|fee|free|paid|ticket)\b/i),
    buildTitle: () =>
      "Decide whether registration will be free or paid, and set the price if paid.",
    buildReason: () =>
      "Pricing shapes your registration page and promotion message.",
  },
  {
    id: "registration",
    areaLabel: "Registration copy",
    detect: (ctx) => detectFromFacts(ctx, /\b(registration|sign.?up|landing page|description|headline)\b/i),
    buildTitle: () =>
      "Write the one-sentence promise for attendees on the registration page.",
    buildReason: () => "One clear sentence gives people a reason to say yes.",
  },
  {
    id: "promotion",
    areaLabel: "Promotion",
    detect: (ctx) => detectFromFacts(ctx, /\b(promot|announce|social post|email invite|marketing)\b/i),
    buildTitle: () =>
      "Draft the first announcement post inviting people to register.",
    buildReason: () =>
      "An early announcement gives people time to save the date.",
  },
  {
    id: "technology",
    areaLabel: "Event technology",
    detect: (ctx) => detectFromFacts(ctx, /\b(zoom|tech|equipment|projector|microphone|streaming|platform)\b/i),
    buildTitle: () => "List the equipment or tech you'll need on the day.",
    buildReason: () =>
      "Knowing what you need ahead of time avoids a last-minute scramble.",
  },
  {
    id: "followup",
    areaLabel: "Follow-up planning",
    detect: (ctx) => detectFromFacts(ctx, /\b(follow.?up|thank you|survey|recording|next steps for attendees)\b/i),
    buildTitle: () =>
      "Plan a simple follow-up message to send attendees afterward.",
    buildReason: () =>
      "A quick follow-up extends the value of the workshop and keeps the relationship warm.",
  },
];

// ---------------------------------------------------------------------------
// Marketing Campaign blueprints
// ---------------------------------------------------------------------------

const MARKETING_STEPS: StepBlueprint[] = [
  {
    id: "goal",
    areaLabel: "Campaign goal",
    detect: (ctx) => detectFromFacts(ctx, /\b(goal|objective|purpose of this campaign)\b/i),
    buildTitle: () =>
      "Write one sentence describing exactly what this campaign should achieve.",
    buildReason: () =>
      "A clear goal makes every later choice — offer, channel, message — easier.",
  },
  {
    id: "audience",
    areaLabel: "Audience selection",
    detect: (ctx) => detectFromFacts(ctx, /\b(audience|segment|who.?s this for|ideal client)\b/i),
    buildTitle: () => "Name the specific audience segment this campaign speaks to.",
    buildReason: () => "A named audience sharpens the message and the offer.",
  },
  {
    id: "offer",
    areaLabel: "Offer definition",
    detect: (ctx) => detectFromFacts(ctx, /\b(offer|deal|discount|bonus|promotion)\b/i),
    buildTitle: () => "Decide the specific offer this campaign will promote.",
    buildReason: () => "People act on offers, not on general announcements.",
  },
  {
    id: "message",
    areaLabel: "Message drafting",
    detect: (ctx) => detectFromFacts(ctx, /\b(message|copy|headline|hook|tagline)\b/i),
    buildTitle: () => "Draft the one core message this campaign will repeat everywhere.",
    buildReason: () => "One repeated message is easier to recognize than five different ones.",
  },
  {
    id: "channels",
    areaLabel: "Channel selection",
    detect: (ctx) => detectFromFacts(ctx, /\b(channel|email|social|ads?|instagram|facebook|newsletter)\b/i),
    buildTitle: () => "Choose the two channels this campaign will actually use.",
    buildReason: () => "Two channels done well beat five channels done thin.",
  },
  {
    id: "timeline",
    areaLabel: "Timeline building",
    detect: (ctx) => detectFromFacts(ctx, /\b(timeline|schedule|launch date|send date)\b/i),
    buildTitle: () => "Sketch the send/publish dates for this campaign on a simple timeline.",
    buildReason: () => "A short timeline turns a vague plan into a schedule you can follow.",
  },
  {
    id: "measure",
    areaLabel: "Success measurement",
    detect: (ctx) => detectFromFacts(ctx, /\b(measure|metric|success looks like|kpi|track)\b/i),
    buildTitle: () => "Decide the one number that will tell you this campaign worked.",
    buildReason: () => "One clear measure keeps you from guessing whether it worked.",
  },
];

// ---------------------------------------------------------------------------
// SOP blueprints
// ---------------------------------------------------------------------------

const SOP_STEPS: StepBlueprint[] = [
  {
    id: "scope",
    areaLabel: "Process scope",
    detect: (ctx) => detectFromFacts(ctx, /\b(starts when|ends when|scope|start\/end|start and end)\b/i),
    buildTitle: () => "Write the sentence that defines where this process starts and ends.",
    buildReason: () => "A clear start and end keeps the SOP from sprawling.",
  },
  {
    id: "owner",
    areaLabel: "Ownership",
    detect: (ctx) => detectFromFacts(ctx, /\b(owner|responsible|who runs this|assigned to)\b/i),
    buildTitle: () => "Name the person who owns this process.",
    buildReason: () => "One owner means the SOP actually gets kept up to date.",
  },
  {
    id: "steps",
    areaLabel: "Step capture",
    detect: (ctx) => detectFromFacts(ctx, /\b(step \d|numbered steps|procedure steps)\b/i),
    buildTitle: () => "List the first five steps in the order they actually happen.",
    buildReason: () => "Capturing the real order first is easier than perfecting it upfront.",
  },
  {
    id: "exceptions",
    areaLabel: "Exception handling",
    detect: (ctx) => detectFromFacts(ctx, /\b(exception|edge case|what if|when it goes wrong)\b/i),
    buildTitle: () => "Note the one exception that comes up most often.",
    buildReason: () => "The most common exception is usually the one worth documenting first.",
  },
  {
    id: "test",
    areaLabel: "Procedure testing",
    detect: (ctx) => detectFromFacts(ctx, /\b(test(ed)? (this|the) procedure|dry run|walkthrough)\b/i),
    buildTitle: () => "Walk through the SOP once, step by step, as if you'd never seen it.",
    buildReason: () => "Testing it once catches gaps before someone else relies on it.",
  },
  {
    id: "review",
    areaLabel: "Review scheduling",
    detect: (ctx) => detectFromFacts(ctx, /\b(review date|revisit|next review)\b/i),
    buildTitle: () => "Set a date to review this SOP again.",
    buildReason: () => "A review date keeps the process from going stale.",
  },
];

// ---------------------------------------------------------------------------
// General fallback blueprints — used when no project-type-specific list fits.
// ---------------------------------------------------------------------------

const GENERAL_STEPS: StepBlueprint[] = [
  {
    id: "outcome",
    areaLabel: "Outcome clarity",
    detect: (ctx) =>
      ctx.purpose?.trim() ? { state: "done" } : { state: "unaddressed" },
    buildTitle: (ctx) =>
      `Write one sentence describing what success looks like for "${ctx.title || "this project"}".`,
    buildReason: () =>
      "A single clear sentence makes every later decision easier.",
  },
  {
    id: "structure",
    areaLabel: "Project structure",
    detect: (ctx) =>
      ctx.knownFacts.length > 0 ? { state: "done" } : { state: "unaddressed" },
    buildTitle: () => "List the first three pieces of this project you can already see.",
    buildReason: () =>
      "Naming even a few pieces turns an open-ended project into a short list.",
  },
];

const STEP_BLUEPRINTS: Record<ProjectTypeCategory, StepBlueprint[]> = {
  event: EVENT_STEPS,
  marketing: MARKETING_STEPS,
  sop: SOP_STEPS,
  general: GENERAL_STEPS,
};

const FOCUS_AREA_INITIAL: Record<ProjectTypeCategory, string> = {
  event: "Workshop foundation",
  marketing: "Campaign foundation",
  sop: "Process foundation",
  general: "Getting started",
};

const FOCUS_AREA_COMPLETE: Record<ProjectTypeCategory, string> = {
  event: "Final review",
  marketing: "Campaign review",
  sop: "Process review",
  general: "Wrapping up",
};

function relevantBlueprints(ctx: ProjectContext): StepBlueprint[] {
  return STEP_BLUEPRINTS[ctx.projectType].filter(
    (b) => !b.relevant || b.relevant(ctx),
  );
}

/**
 * Current Focus = the area of attention (a short label), never a copy of
 * the concrete next step and never raw setup-field text.
 */
export function deriveCurrentFocusArea(ctx: ProjectContext): string {
  const blueprints = relevantBlueprints(ctx);
  if (blueprints.length === 0) return FOCUS_AREA_INITIAL[ctx.projectType];
  const states = blueprints.map((b) => b.detect(ctx).state);
  const allDone = states.every((s) => s === "done");
  if (allDone) return FOCUS_AREA_COMPLETE[ctx.projectType];
  const noneAddressed = states.every((s) => s === "unaddressed");
  if (noneAddressed) return FOCUS_AREA_INITIAL[ctx.projectType];
  const firstOpenIndex = states.findIndex((s) => s !== "done");
  return blueprints[firstOpenIndex]?.areaLabel ?? FOCUS_AREA_INITIAL[ctx.projectType];
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function isRestatement(ctx: ProjectContext, title: string): boolean {
  const normalized = normalize(title);
  if (!normalized) return true;
  return (
    ctx.knownFacts.some((f) => normalize(f) === normalized) ||
    ctx.constraints.some((f) => normalize(f) === normalized) ||
    ctx.completedTasks.some((f) => normalize(f) === normalized)
  );
}

function finalFallback(ctx: ProjectContext): NextStepSuggestion {
  if (ctx.projectType === "event") {
    return {
      title:
        "Review everything you've decided so far and write down the one piece still missing.",
      reason:
        "A quick review surfaces the next real gap instead of guessing.",
      source: "generated",
      confidence: 0.4,
    };
  }
  return {
    title:
      "Choose one small, finishable piece of this project and complete just that piece next.",
    reason:
      "A small, finishable piece keeps momentum without requiring the whole plan to be clear.",
    source: "generated",
    confidence: 0.4,
  };
}

/**
 * Generates one actionable, specific, forward-moving next step for this
 * project. Never returns a restatement of a known fact, constraint, or
 * completed task, and never a vague category.
 */
export function generateNextStepSuggestion(
  ctx: ProjectContext,
  options?: { exclude?: readonly string[] },
): NextStepSuggestion {
  const exclude = new Set((options?.exclude ?? []).map(normalize).filter(Boolean));
  if (ctx.currentFocus) exclude.add(normalize(ctx.currentFocus));

  for (const blueprint of relevantBlueprints(ctx)) {
    const detection = blueprint.detect(ctx);
    if (detection.state === "done") continue;
    const title = blueprint.buildTitle(ctx, detection);
    if (exclude.has(normalize(title))) continue;
    if (isRestatement(ctx, title)) continue;
    return {
      title,
      reason: blueprint.buildReason(ctx, detection),
      source: "generated",
      confidence: detection.state === "partial" ? 0.75 : 0.6,
    };
  }

  const openTask = ctx.openTasks.find((t) => !exclude.has(normalize(t)));
  if (openTask) {
    return {
      title: `Continue with: ${openTask}`,
      reason: "This is already on your list and ready to pick back up.",
      source: "task",
      confidence: 0.5,
    };
  }

  const milestone = ctx.milestones.find((m) => !exclude.has(normalize(m)));
  if (milestone) {
    return {
      title: `Take one step toward: ${milestone}`,
      reason: "This keeps you moving toward your next milestone.",
      source: "milestone",
      confidence: 0.45,
    };
  }

  return finalFallback(ctx);
}

/**
 * Returns a primary suggestion plus up to `count - 1` distinct alternatives.
 * Alternatives are only included when genuinely different (Show Another).
 */
export function generateNextStepSuggestions(
  ctx: ProjectContext,
  options?: { count?: number; exclude?: readonly string[] },
): NextStepSuggestion[] {
  const count = Math.max(1, options?.count ?? 3);
  const excluded: string[] = [...(options?.exclude ?? [])];
  const results: NextStepSuggestion[] = [];
  for (let i = 0; i < count; i += 1) {
    const suggestion = generateNextStepSuggestion(ctx, { exclude: excluded });
    if (results.some((r) => normalize(r.title) === normalize(suggestion.title))) {
      break;
    }
    results.push(suggestion);
    excluded.push(suggestion.title);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Context builders — turn Project Homes data into a ProjectContext.
// ---------------------------------------------------------------------------

export function buildProjectContext(
  input: {
    projectId: string;
    title: string;
    purpose?: string;
    desiredOutcome?: string;
    currentFocus?: string;
    atmosphereNote?: string;
    /** Extra free-text entries not yet persisted as items (e.g. setup pieces). */
    extraEntries?: readonly string[];
  },
  items: readonly ProjectItem[] = [],
): ProjectContext {
  const sections = items.filter((i) => i.kind === "section").map((i) => i.title);
  const tasks = items.filter((i) => i.kind === "task" || i.kind === "subtask");
  const { facts, constraints, questions } = classifyFreeTextEntries([
    ...sections,
    ...(input.extraEntries ?? []),
  ]);
  const classifyText = [
    input.title,
    input.purpose ?? "",
    input.desiredOutcome ?? "",
    input.atmosphereNote ?? "",
    ...facts,
  ].join(" ");
  return {
    projectId: input.projectId,
    projectType: classifyProjectType(classifyText),
    title: input.title,
    purpose: input.purpose,
    desiredOutcome: input.desiredOutcome,
    knownFacts: facts,
    constraints,
    completedTasks: tasks.filter((t) => t.done).map((t) => t.title),
    openTasks: tasks.filter((t) => !t.done).map((t) => t.title),
    // Milestones are not yet a durable, member-entered concept in Project
    // Homes — leave empty rather than fabricate certainty (Trust Experience).
    milestones: [],
    unresolvedQuestions: questions,
    currentFocus: input.currentFocus,
  };
}

/** Convenience overload for a saved Project Home (reads its live items). */
export function buildProjectContextFromHome(home: {
  id: string;
  companionProjectId?: string;
  name: string;
  purpose: string;
  currentFocus?: string;
  atmosphereNote?: string;
}): ProjectContext {
  const projectId = home.companionProjectId ?? home.id;
  const items = home.companionProjectId ? getProjectItems(home.companionProjectId) : [];
  return buildProjectContext(
    {
      projectId,
      title: home.name,
      purpose: home.purpose,
      currentFocus: home.currentFocus,
      atmosphereNote: home.atmosphereNote,
    },
    items,
  );
}
