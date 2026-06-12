// Founder Ecosystem — Phase 13 Companion Profile.
//
// Learns how the founder works: preferences, work styles, support style,
// communication / planning / motivation / focus / decision styles, relationship
// memory, and optional slots for momentum + overwhelm + check-in behavior.
//
// INTEGRATION (modular — other engines consume via stable helpers):
//   • adaptiveResponseEngine  → adaptResponse(profileContext(profile))
//   • celebrationEngine       → uses preferences.celebrationLevel + momentum
//   • checkInEngine           → uses checkInBehavior + preferences.proactiveCheckIns
//   • founderSupportScore     → reads profileContext + events (internal only)
//
// Derived from the event stream. Observational only — never clinical.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { eventText } from "../intelligence/signals";
import { detectMomentumPatterns } from "./momentumPatternEngine";
import { detectOverwhelmPatterns } from "./overwhelmPatternEngine";
import type {
  CheckInBehavior,
  CommunicationStyle,
  CompanionProfile,
  CompanionProfileContext,
  DecisionStyle,
  FocusStyle,
  FounderPreferences,
  MentionLite,
  MotivationStyle,
  MomentumPatterns,
  OverwhelmPatterns,
  PlanningStyle,
  RelationshipMemory,
  ScoredTrait,
  SupportStyle,
  WorkStyle,
} from "./companionTypes";
import { EMPTY_MOMENTUM_PATTERNS, EMPTY_OVERWHELM_PATTERNS } from "./companionTypes";
import { allTraits, hourOf, scoreTexts, topTrait } from "./companionUtil";

const WORK_STYLE_RE: Record<WorkStyle, RegExp> = {
  visionary: /\b(vision|big picture|future|long.?term|mission|imagine|dream|where this is going)\b/i,
  builder: /\b(build|building|product|website|set up|develop|ship|prototype|mvp)\b/i,
  implementer: /\b(finish|complete|get it done|execute|knock out|do the work|check off)\b/i,
  creator: /\b(content|write|post|design|video|caption|story|creative|brand|reel)\b/i,
  strategist: /\b(strateg|analy|prioriti|positioning|roadmap|market|decide between)\b/i,
  teacher: /\b(teach|explain|course|workshop|educate|lesson|guide|share what i)\b/i,
  operator: /\b(operation|process|workflow|admin|logistics|systemi|automat|bookkeep|fulfil)\b/i,
};

const SUPPORT_STYLE_RE: Record<SupportStyle, RegExp> = {
  "direct-action": /\b(what should i do|just tell me|next step|give me the|what'?s next|the move)\b/i,
  brainstorming: /\b(brainstorm|help me think|what if|ideas?|explore options|think through|bounce)\b/i,
  accountability: /\b(keep me accountable|check in|hold me|follow ?up|remind me|stay on track)\b/i,
  planning: /\b(plan|organi[sz]e|structure|schedule|roadmap|map it out|break it down)\b/i,
  reflection: /\b(reflect|journal|process this|sit with|look back|how i feel)\b/i,
  education: /\b(teach me|how do i|explain|help me understand|what is|learn)\b/i,
  encouragement: /\b(can'?t|struggling|stuck|discouraged|overwhelmed|need a boost|frustrat|hard time)\b/i,
};

export type BuildCompanionProfileOptions = {
  intelOverride?: FounderIntelligence;
  /** When true, runs momentum + overwhelm engines and fills pattern slots. */
  includePatterns?: boolean;
};

function chatTexts(events: FounderEvent[]): string[] {
  return events
    .filter((e) => e.type === "chat.coaching" || e.type === "note.captured")
    .map(eventText)
    .filter(Boolean);
}

function detectWorkStyles(
  events: FounderEvent[],
  texts: string[],
): ScoredTrait<WorkStyle>[] {
  const scores = scoreTexts(texts, WORK_STYLE_RE) as Record<WorkStyle, number>;
  scores.implementer += events.filter((e) => e.type === "task.completed").length;
  scores.builder += events.filter(
    (e) => e.type === "project.created" || e.type === "document.created",
  ).length;
  scores.strategist += events.filter((e) => e.type === "decision.created").length;
  scores.visionary += events.filter((e) => e.type === "opportunity.created").length;
  const styles = allTraits<WorkStyle>(scores, 1);
  return styles.length ? styles : [{ value: "builder", score: 0, confidence: "low" }];
}

function detectCommunication(texts: string[]): ScoredTrait<CommunicationStyle> {
  const avgLen = texts.length ? texts.join(" ").length / texts.length : 0;
  const warm = texts.filter((t) => /\b(feel|excited|love|worried|grateful|proud)\b/i.test(t)).length;
  const analytical = texts.filter((t) => /\b(why|data|number|metric|because|analy)\b/i.test(t)).length;
  const scores: Record<CommunicationStyle, number> = {
    concise: avgLen > 0 && avgLen < 60 ? 3 : 0,
    detailed: avgLen >= 90 ? 3 : 0,
    warm,
    analytical,
  };
  return topTrait<CommunicationStyle>(scores, "warm");
}

function detectPlanning(
  events: FounderEvent[],
  texts: string[],
): ScoredTrait<PlanningStyle> {
  const planningSignals =
    events.filter((e) => e.type === "timeblock.created").length +
    texts.filter((t) => /\b(plan|schedule|organi[sz]e|roadmap|structure)\b/i.test(t)).length;
  const brainstormSignals = texts.filter((t) =>
    /\b(brainstorm|ideas?|what if|explore|dump|clear my mind)\b/i.test(t),
  ).length;
  const scores: Record<PlanningStyle, number> = {
    planner: planningSignals,
    "brainstorm-first": brainstormSignals,
    spontaneous: planningSignals === 0 && brainstormSignals === 0 ? 1 : 0,
  };
  return topTrait<PlanningStyle>(scores, "planner");
}

function detectMotivation(
  events: FounderEvent[],
  intel: FounderIntelligence,
  texts: string[],
): ScoredTrait<MotivationStyle> {
  const scores: Record<MotivationStyle, number> = {
    progress: events.filter((e) => e.type === "task.completed").length + intel.wins.length,
    vision: texts.filter((t) => /\b(vision|mission|impact|why|dream|future)\b/i.test(t)).length,
    accountability: texts.filter((t) => /\b(accountable|check in|follow ?up|remind)\b/i.test(t)).length,
    novelty:
      intel.patterns.filter((p) => p.type === "project-switching").length * 2 +
      events.filter((e) => e.type === "opportunity.created").length,
  };
  return topTrait<MotivationStyle>(scores, "progress");
}

/** Focus habits — time-of-day and block length preferences. */
function detectFocusHabits(events: FounderEvent[]): ScoredTrait<FocusStyle> {
  const completions = events.filter(
    (e) => e.type === "task.completed" || e.type === "focus.completed",
  );
  const buckets: Record<FocusStyle, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    "deep-blocks": 0,
    "short-bursts": 0,
  };
  for (const e of completions) {
    const h = hourOf(e.ts);
    if (h < 12) buckets.morning += 1;
    else if (h < 17) buckets.afternoon += 1;
    else buckets.evening += 1;
  }
  const durations = events
    .filter((e) => e.type === "timeblock.created")
    .map((e) => (typeof e.data?.durationMin === "number" ? e.data.durationMin : 0));
  const avgDur = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  if (avgDur >= 75) buckets["deep-blocks"] += 2;
  else if (avgDur > 0 && avgDur <= 30) buckets["short-bursts"] += 2;
  return topTrait<FocusStyle>(buckets, "morning");
}

function detectDecision(
  events: FounderEvent[],
  intel: FounderIntelligence,
  texts: string[],
): ScoredTrait<DecisionStyle> {
  const made = events.filter((e) => e.type === "decision.updated").length;
  const open = events.filter((e) => e.type === "decision.created").length - made;
  const procrastination = intel.patterns.some((p) => p.type === "procrastination-language");
  const asks = texts.filter((t) => /\b(should i|what do you think|help me decide|which one)\b/i.test(t)).length;
  const scores: Record<DecisionStyle, number> = {
    decisive: made,
    avoidant: (procrastination ? 2 : 0) + (open > 1 ? open : 0),
    collaborative: asks,
    deliberate: made === 0 && open <= 1 ? 1 : 0,
  };
  return topTrait<DecisionStyle>(scores, "deliberate");
}

function buildRelationshipMemory(
  events: FounderEvent[],
  intel: FounderIntelligence,
): RelationshipMemory {
  const map = (m: { label: string; mentions: number }[]): MentionLite[] =>
    m.map((x) => ({ label: x.label, count: x.mentions }));

  const wsCounts = new Map<string, number>();
  for (const e of events.filter((e) => e.type === "workspace.opened")) {
    const k = (e.refs?.workspace as string) ?? (e.data?.kind as string) ?? "workspace";
    wsCounts.set(k, (wsCounts.get(k) ?? 0) + 1);
  }
  const successCounts = new Map<string, number>();
  for (const e of events.filter((e) => e.type === "task.completed")) {
    const t =
      (e.data?.title as string) ??
      events.find((x) => x.type === "task.created" && x.refs?.taskId === e.refs?.taskId)?.data
        ?.title;
    if (typeof t === "string") successCounts.set(t, (successCounts.get(t) ?? 0) + 1);
  }
  const toMentions = (m: Map<string, number>): MentionLite[] =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, count]) => ({ label, count }));

  return {
    frequentProjects: map(intel.memory.frequentProjects),
    frequentGoals: map(intel.memory.frequentGoals),
    frequentChallenges: map(intel.memory.frequentStruggles),
    frequentWorkspaces: toMentions(wsCounts),
    mostSuccessfulActions: toMentions(successCounts),
  };
}

function detectPreferences(
  supportStyle: ScoredTrait<SupportStyle>,
  focusStyle: ScoredTrait<FocusStyle>,
  planningStyle: ScoredTrait<PlanningStyle>,
  relationship: RelationshipMemory,
  intel: FounderIntelligence,
): FounderPreferences {
  const overwhelmed =
    intel.risks.some((r) => r.type === "repeated-overwhelm") ||
    intel.patterns.some((p) => p.type === "low-energy-checkins");
  const topWorkspace = relationship.frequentWorkspaces[0]?.label ?? null;

  return {
    proactiveCheckIns: !overwhelmed,
    celebrationLevel: supportStyle.value === "encouragement" ? "enthusiastic" : "normal",
    recommendationDensity: overwhelmed ? "minimal" : "balanced",
    defaultWorkspaceBias: topWorkspace,
    prefersSplitView: topWorkspace === "create" || topWorkspace === "projects",
    wantsAccountability:
      supportStyle.value === "accountability" || supportStyle.value === "planning",
  };
}

/** Placeholder until check-in engagement events are tracked (Phase 13+). */
export function defaultCheckInBehavior(
  focusStyle: ScoredTrait<FocusStyle>,
  preferences: FounderPreferences,
): CheckInBehavior {
  const timeMap: Record<FocusStyle, string> = {
    morning: "morning",
    afternoon: "midday",
    evening: "evening",
    "deep-blocks": "morning",
    "short-bursts": "afternoon",
  };
  return {
    preferredTimes: [timeMap[focusStyle.value]],
    responsiveKinds: [],
    pausedKinds: preferences.proactiveCheckIns ? [] : ["dormant-project"],
    maxPerDay: preferences.recommendationDensity === "minimal" ? 1 : 2,
    lastEngagedAt: null,
    notes: [
      "Check-in responsiveness not yet learned — using supportive defaults.",
      "Never nag, guilt, or pressure; invitations only.",
    ],
  };
}

function buildObservations(
  workStyles: ScoredTrait<WorkStyle>[],
  focus: ScoredTrait<FocusStyle>,
  planning: ScoredTrait<PlanningStyle>,
  decision: ScoredTrait<DecisionStyle>,
  intel: FounderIntelligence,
): string[] {
  const out: string[] = [];
  if (focus.value === "morning" && focus.score > 0) out.push("Tends to do their best work in the morning.");
  if (focus.value === "evening" && focus.score > 0) out.push("Often gets going later in the day.");
  if (planning.value === "brainstorm-first")
    out.push("Prefers brainstorming before locking in a plan.");
  if (intel.patterns.some((p) => p.type === "project-switching"))
    out.push("Momentum dips when several projects are active at once.");
  if (intel.patterns.some((p) => p.type === "procrastination-language"))
    out.push("Some tasks get put off — breaking them down helps.");
  if (workStyles[0]) out.push(`Leans ${workStyles[0].value} in how they approach work.`);
  if (decision.value === "avoidant")
    out.push("Open decisions tend to linger — a clear next step unblocks them.");
  return out;
}

/** Safe accessors — other engines never read null slots directly. */
export function getMomentumPatterns(profile: CompanionProfile): MomentumPatterns {
  return profile.momentumPatterns ?? EMPTY_MOMENTUM_PATTERNS;
}

export function getOverwhelmPatterns(profile: CompanionProfile): OverwhelmPatterns {
  return profile.overwhelmPatterns ?? EMPTY_OVERWHELM_PATTERNS;
}

/** Stable slice for Celebration / Response / Support Score engines. */
export function profileContext(profile: CompanionProfile): CompanionProfileContext {
  return {
    founderId: profile.founderId,
    supportStyle: profile.supportStyle,
    focusStyle: profile.focusStyle,
    decisionStyle: profile.decisionStyle,
    preferences: profile.preferences,
    momentumPatterns: profile.momentumPatterns,
    overwhelmPatterns: profile.overwhelmPatterns,
    checkInBehavior: profile.checkInBehavior,
    observations: profile.observations,
  };
}

export function buildCompanionProfile(
  events: FounderEvent[],
  founderId: ID,
  opts: BuildCompanionProfileOptions = {},
): CompanionProfile {
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = opts.intelOverride ?? getFounderIntelligence(mine, founderId);
  const texts = chatTexts(mine);

  const supportScores = scoreTexts(texts, SUPPORT_STYLE_RE) as Record<SupportStyle, number>;
  const supportStyles = allTraits<SupportStyle>(supportScores, 1);
  const supportStyle =
    supportStyles[0] ?? topTrait<SupportStyle>(supportScores, "encouragement");

  const workStyles = detectWorkStyles(mine, texts);
  const focusStyle = detectFocusHabits(mine);
  const planningStyle = detectPlanning(mine, texts);
  const decisionStyle = detectDecision(mine, intel, texts);
  const relationshipMemory = buildRelationshipMemory(mine, intel);
  const preferences = detectPreferences(
    supportStyle,
    focusStyle,
    planningStyle,
    relationshipMemory,
    intel,
  );

  let momentumPatterns: MomentumPatterns | null = null;
  let overwhelmPatterns: OverwhelmPatterns | null = null;
  if (opts.includePatterns) {
    momentumPatterns = detectMomentumPatterns(mine, founderId, intel);
    overwhelmPatterns = detectOverwhelmPatterns(mine, founderId, intel);
  }

  return {
    founderId,
    generatedAt: new Date().toISOString(),
    workStyles,
    supportStyle,
    supportStyles,
    communicationStyle: detectCommunication(texts),
    planningStyle,
    motivationStyle: detectMotivation(mine, intel, texts),
    focusStyle,
    decisionStyle,
    preferences,
    relationshipMemory,
    observations: buildObservations(
      workStyles,
      focusStyle,
      planningStyle,
      decisionStyle,
      intel,
    ),
    momentumPatterns,
    overwhelmPatterns,
    checkInBehavior: defaultCheckInBehavior(focusStyle, preferences),
  };
}
