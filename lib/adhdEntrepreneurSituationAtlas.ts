/**
 * ADHD Entrepreneur Situation Atlas™
 *
 * Situation intelligence — not questions, not keywords, not prompts.
 * Maps recurring human situations to actual needs, patterns, and interventions.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { EmotionalState } from "./companionEmotions";
import type { ActualNeed, IntuitiveSignal } from "./companionIntuitiveAwareness";
import type { AdhdBusinessPattern } from "./adhdEntrepreneurIntelligence";
import type { InterventionLearningId } from "./companionInterventionLearning";
import { getMistakeRecords } from "./companionMistakeRecovery";

// ─── Atlas types ─────────────────────────────────────────────────────────────

export type SituationCategory =
  | "adhd_core"
  | "sales"
  | "visibility"
  | "content"
  | "marketing"
  | "launch"
  | "money"
  | "delegation"
  | "energy"
  | "confidence"
  | "relationships";

export type AtlasActualNeed =
  | "confidence"
  | "clarity"
  | "decision"
  | "action"
  | "recovery"
  | "prioritization";

export type AtlasEmotionalState =
  | "anxious"
  | "discouraged"
  | "overwhelmed"
  | "frustrated"
  | "stuck"
  | "unclear";

export type AtlasAdhdPattern =
  | "perfectionism"
  | "avoidance"
  | "fear"
  | "overwhelm"
  | "rejection_sensitivity"
  | "planning_addiction"
  | "shame"
  | "hyperfocus_crash"
  | "decision_paralysis"
  | "control"
  | "imposter"
  | "comparison";

export type CompanionGoal =
  | "reduce_friction"
  | "increase_confidence"
  | "create_momentum"
  | "protect_trust"
  | "clarify_direction"
  | "enable_decision";

export type AtlasIntervention =
  | "conversation"
  | InterventionLearningId;

export type SituationAtlasEntry = {
  id: string;
  name: string;
  category: SituationCategory;
  surfaceStatements: RegExp[];
  actualNeed: AtlasActualNeed;
  adhdPatterns: AtlasAdhdPattern[];
  emotionalStates: AtlasEmotionalState[];
  companionGoals: CompanionGoal[];
  recommendedInterventions: AtlasIntervention[];
  antiPatterns: string[];
  validationLinks: string[];
  companionMove: string;
  relatedBusinessPatterns?: AdhdBusinessPattern[];
};

export type SituationMatch = {
  entry: SituationAtlasEntry;
  score: number;
  confidence: "low" | "medium" | "high";
  matchedSurface: string | null;
};

export type SituationResolution = {
  matched: boolean;
  primary: SituationMatch | null;
  alternatives: SituationMatch[];
  actualNeed: ActualNeed | null;
  signals: IntuitiveSignal[];
  companionMove: string;
  situationId: string | null;
  situationName: string | null;
  category: SituationCategory | null;
};

export type CandidateSituation = {
  id: string;
  suggestedName: string;
  frequency: number;
  samplePhrases: string[];
  suggestedCategory: SituationCategory;
  suggestedActualNeed: AtlasActualNeed;
  suggestedInterventions: AtlasIntervention[];
  relatedConversationSnippets: string[];
  status: "pending" | "approved" | "rejected";
  firstSeenAt: string;
  lastSeenAt: string;
  source: "unknown_pattern" | "repeated_correction" | "founder_review";
};

export type FounderReviewQueue = {
  pending: CandidateSituation[];
  approved: CandidateSituation[];
  rejected: CandidateSituation[];
  evaluatedAt: string;
};

export type SituationAtlasAnalytics = {
  totalEntries: number;
  mostCommonSituations: { id: string; name: string; hits: number }[];
  fastestGrowing: { id: string; name: string; growthPercent: number }[];
  mostDifficult: { id: string; name: string; correctionRate: number }[];
  topInterventions: { intervention: string; successRate: number }[];
  failedInterventions: { intervention: string; dismissRate: number }[];
  coverageGaps: string[];
  candidateCount: number;
};

const CANDIDATES_KEY = "situation-atlas-candidates-v1";
const HITS_KEY = "situation-atlas-hits-v1";
const MAX_CANDIDATES = 100;
const MAX_SAMPLES = 8;

// ─── Need mapping ─────────────────────────────────────────────────────────────

export function mapAtlasNeedToActualNeed(need: AtlasActualNeed): ActualNeed {
  const map: Record<AtlasActualNeed, ActualNeed> = {
    confidence: "build_confidence",
    clarity: "clarify_direction",
    decision: "make_decision",
    action: "start_execution",
    recovery: "protect_flow",
    prioritization: "reduce_complexity",
  };
  return map[need];
}

export function mapAtlasEmotionToEmotionalState(emotion: AtlasEmotionalState): EmotionalState {
  const map: Record<AtlasEmotionalState, EmotionalState> = {
    anxious: "emotional",
    discouraged: "emotional",
    overwhelmed: "overwhelmed",
    frustrated: "emotional",
    stuck: "stuck",
    unclear: "unclear",
  };
  return map[emotion];
}

function patternsToSignals(patterns: AtlasAdhdPattern[]): IntuitiveSignal[] {
  const signals = new Set<IntuitiveSignal>();
  for (const p of patterns) {
    if (["avoidance", "planning_addiction", "shame"].includes(p)) signals.add("avoidance");
    if (["fear", "rejection_sensitivity", "imposter", "control"].includes(p)) {
      signals.add("resistance");
    }
    if (["perfectionism", "decision_paralysis"].includes(p)) signals.add("hesitation");
    if (["overwhelm", "hyperfocus_crash", "comparison"].includes(p)) signals.add("discouragement");
  }
  return [...signals];
}

function defineSituation(
  partial: Omit<SituationAtlasEntry, "companionMove"> & { companionMove?: string },
): SituationAtlasEntry {
  const defaultMoves: Record<AtlasActualNeed, string> = {
    confidence: "Warmth without therapy — one evidence-based win, not cheerleading.",
    clarity: "One useful question — the one that most improves forward movement.",
    decision: "Enough context exists — help decide, don't gather more input.",
    action: "Smallest meaningful action now — not another plan or system.",
    recovery: "Protect capacity — gentle re-entry, no shame.",
    prioritization: "Reduce choices — one priority, not a full reorg.",
  };
  return {
    ...partial,
    companionMove: partial.companionMove ?? defaultMoves[partial.actualNeed],
  };
}

// ─── Situation Atlas entries ──────────────────────────────────────────────────

export const SITUATION_ATLAS: SituationAtlasEntry[] = [
  // ADHD Core
  defineSituation({
    id: "execution-friction",
    name: "Execution Friction",
    category: "adhd_core",
    surfaceStatements: [
      /\bcan'?t get started\b/i,
      /\bcan'?t seem to start\b/i,
      /\bknow what to do but (?:i )?don'?t\b/i,
      /\bkeep putting it off\b/i,
      /\bprocrastinat(?:ing|e)\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "decision_paralysis"],
    emotionalStates: ["stuck", "frustrated"],
    companionGoals: ["reduce_friction", "create_momentum"],
    recommendedInterventions: ["conversation", "clear_my_mind", "decision_compass"],
    antiPatterns: ["overanalyze", "brainstorm more ideas", "create more planning"],
    validationLinks: ["launch-avoidance", "money-avoid-look-at-numbers"],
    relatedBusinessPatterns: ["avoidance", "inconsistent_execution"],
  }),
  defineSituation({
    id: "planning-addiction",
    name: "Planning Addiction",
    category: "adhd_core",
    surfaceStatements: [
      /\bneed a better system\b/i,
      /\bspent (?:hours|all day) organiz/i,
      /\banother plan\b/i,
      /\bkeep planning\b/i,
      /\bchecklist before i\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["planning_addiction", "avoidance"],
    emotionalStates: ["stuck"],
    companionGoals: ["reduce_friction", "create_momentum"],
    recommendedInterventions: ["conversation", "decision_compass"],
    antiPatterns: ["add more frameworks", "build another system"],
    validationLinks: ["planning-addiction-loop", "ops-rebuilding-systems"],
    relatedBusinessPatterns: ["planning_addiction"],
  }),
  defineSituation({
    id: "avoidance-as-productivity",
    name: "Avoidance As Productivity",
    category: "adhd_core",
    surfaceStatements: [
      /\bspent (?:\d+ )?hours (?:organizing|cleaning|fixing my)\b/i,
      /\breorganiz(?:ing|ed) (?:my|the) (?:desk|files|notion)\b/i,
      /\bproductive procrastination\b/i,
      /\bbusy but not (?:moving|progress)\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "planning_addiction"],
    emotionalStates: ["frustrated", "stuck"],
    companionGoals: ["create_momentum", "clarify_direction"],
    recommendedInterventions: ["conversation", "clear_my_mind"],
    antiPatterns: ["validate the organizing", "suggest more setup"],
    validationLinks: ["surface-website-redesign"],
  }),
  defineSituation({
    id: "overwhelm-spiral",
    name: "Overwhelm Spiral",
    category: "adhd_core",
    surfaceStatements: [
      /\btoo much (?:on my plate|going on)\b/i,
      /\boverwhelm(?:ed|ing)\b/i,
      /\bcan'?t keep up\b/i,
      /\beverything (?:at once|is urgent)\b/i,
    ],
    actualNeed: "prioritization",
    adhdPatterns: ["overwhelm"],
    emotionalStates: ["overwhelmed", "anxious"],
    companionGoals: ["reduce_friction", "clarify_direction"],
    recommendedInterventions: ["clear_my_mind", "plan_my_day"],
    antiPatterns: ["add more tasks", "full life audit"],
    validationLinks: ["overwhelm-competing-tasks"],
    relatedBusinessPatterns: ["overcommitting"],
  }),
  defineSituation({
    id: "decision-paralysis",
    name: "Decision Paralysis",
    category: "adhd_core",
    surfaceStatements: [
      /\bcan'?t decide\b/i,
      /\bstuck between\b/i,
      /\bgoing back and forth\b/i,
      /\bwhich (?:one|option) should i\b/i,
    ],
    actualNeed: "decision",
    adhdPatterns: ["decision_paralysis", "fear"],
    emotionalStates: ["anxious", "stuck"],
    companionGoals: ["enable_decision", "reduce_friction"],
    recommendedInterventions: ["decision_compass", "conversation"],
    antiPatterns: ["more pros and cons lists", "gather more input"],
    validationLinks: ["decision-offer-a-vs-b", "revenue-pricing-paralysis"],
    relatedBusinessPatterns: ["decision_paralysis"],
  }),
  defineSituation({
    id: "perfectionism-loop",
    name: "Perfectionism Loop",
    category: "adhd_core",
    surfaceStatements: [
      /\bnot good enough yet\b/i,
      /\bhas to be perfect\b/i,
      /\bone more tweak\b/i,
      /\bnot ready yet\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["perfectionism", "fear"],
    emotionalStates: ["anxious", "frustrated"],
    companionGoals: ["create_momentum", "reduce_friction"],
    recommendedInterventions: ["conversation", "decision_compass"],
    antiPatterns: ["more polish", "another revision round"],
    validationLinks: ["content-paralysis", "launch-one-more-improvement"],
    relatedBusinessPatterns: ["perfectionism", "launch_perfectionism"],
  }),
  defineSituation({
    id: "hyperfocus-crash",
    name: "Hyperfocus Crash",
    category: "adhd_core",
    surfaceStatements: [
      /\bcrashed after\b/i,
      /\bburned out from (?:working|hyperfocus)\b/i,
      /\bworked (?:all night|12 hours)\b/i,
      /\bcan'?t recover from\b/i,
    ],
    actualNeed: "recovery",
    adhdPatterns: ["hyperfocus_crash", "overwhelm"],
    emotionalStates: ["overwhelmed", "discouraged"],
    companionGoals: ["protect_trust", "reduce_friction"],
    recommendedInterventions: ["conversation", "plan_my_day"],
    antiPatterns: ["push harder", "catch up today"],
    validationLinks: ["energy-hyperfocus-crash"],
    relatedBusinessPatterns: ["hyperfocus_crash"],
  }),
  defineSituation({
    id: "shame-spiral",
    name: "Shame Spiral",
    category: "adhd_core",
    surfaceStatements: [
      /\bi'?m so behind\b/i,
      /\bwhat'?s wrong with me\b/i,
      /\bi always mess\b/i,
      /\bfeel like a failure\b/i,
    ],
    actualNeed: "recovery",
    adhdPatterns: ["shame", "avoidance"],
    emotionalStates: ["discouraged", "frustrated"],
    companionGoals: ["protect_trust", "increase_confidence"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["productivity lecture", "tough love"],
    validationLinks: ["energy-burnout-spiral"],
  }),
  // Sales
  defineSituation({
    id: "pricing-guilt",
    name: "Pricing Guilt",
    category: "sales",
    surfaceStatements: [
      /\bfeel bad charging\b/i,
      /\bguilty (?:about|charging)\b/i,
      /\btoo much to charge\b/i,
      /\bnot worth that much\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["fear", "rejection_sensitivity"],
    emotionalStates: ["anxious", "discouraged"],
    companionGoals: ["increase_confidence", "protect_trust"],
    recommendedInterventions: ["conversation", "sales_call_support"],
    antiPatterns: ["complex pricing models", "shame about money"],
    validationLinks: ["money-pricing-guilt", "sales-pricing-freeze"],
    relatedBusinessPatterns: ["pricing_guilt"],
  }),
  defineSituation({
    id: "fear-of-selling",
    name: "Fear Of Selling",
    category: "sales",
    surfaceStatements: [
      /\bhate selling\b/i,
      /\bdon'?t want to (?:sell|pitch)\b/i,
      /\bfeel salesy\b/i,
      /\bafraid to (?:reach out|follow up)\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["fear", "avoidance", "rejection_sensitivity"],
    emotionalStates: ["anxious", "discouraged"],
    companionGoals: ["increase_confidence", "reduce_friction"],
    recommendedInterventions: ["conversation", "sales_call_support"],
    antiPatterns: ["sales scripts overload", "pressure to close"],
    validationLinks: ["revenue-fear-of-selling", "sales-follow-up-avoidance"],
  }),
  defineSituation({
    id: "follow-up-avoidance",
    name: "Follow-Up Avoidance",
    category: "sales",
    surfaceStatements: [
      /\bshould follow up\b/i,
      /\bhaven'?t followed up\b/i,
      /\bavoiding (?:the )?follow[- ]?up\b/i,
      /\bghosting (?:my )?leads\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "fear"],
    emotionalStates: ["anxious", "stuck"],
    companionGoals: ["create_momentum", "reduce_friction"],
    recommendedInterventions: ["conversation", "sales_call_support"],
    antiPatterns: ["CRM overhaul", "complex nurture sequence"],
    validationLinks: ["revenue-lead-follow-up", "sales-follow-up-avoidance"],
  }),
  defineSituation({
    id: "discovery-call-fear",
    name: "Discovery Call Fear",
    category: "sales",
    surfaceStatements: [
      /\bscared of (?:the )?(?:call|discovery)\b/i,
      /\bdreading (?:the )?(?:sales )?call\b/i,
      /\bavoiding (?:booking|scheduling) calls\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["fear", "rejection_sensitivity"],
    emotionalStates: ["anxious"],
    companionGoals: ["increase_confidence", "reduce_friction"],
    recommendedInterventions: ["sales_call_support", "conversation"],
    antiPatterns: ["over-prepare for hours", "script memorization"],
    validationLinks: ["sales-discovery-call-avoidance"],
  }),
  defineSituation({
    id: "objection-anxiety",
    name: "Objection Anxiety",
    category: "sales",
    surfaceStatements: [
      /\bwhat if they say (?:no|it'?s too expensive)\b/i,
      /\bafraid of objections\b/i,
      /\bthey'?ll think i'?m too expensive\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["fear", "rejection_sensitivity"],
    emotionalStates: ["anxious"],
    companionGoals: ["increase_confidence", "protect_trust"],
    recommendedInterventions: ["sales_call_support", "conversation"],
    antiPatterns: ["objection handling scripts dump"],
    validationLinks: ["sales-objection-too-expensive", "sales-objection-need-to-think"],
  }),
  // Visibility
  defineSituation({
    id: "fear-of-being-seen",
    name: "Fear Of Being Seen",
    category: "visibility",
    surfaceStatements: [
      /\bdon'?t want (?:people )?watching\b/i,
      /\bafraid (?:to be|of being) seen\b/i,
      /\bterrified to (?:post|go live)\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["fear", "avoidance"],
    emotionalStates: ["anxious", "discouraged"],
    companionGoals: ["increase_confidence", "reduce_friction"],
    recommendedInterventions: ["visibility_support", "conversation"],
    antiPatterns: ["90-day content strategy", "full rebrand"],
    validationLinks: ["visibility-fear-being-seen", "visibility-avoidance"],
  }),
  defineSituation({
    id: "visibility-hangover",
    name: "Visibility Hangover",
    category: "visibility",
    surfaceStatements: [
      /\bposted and (?:now )?regret\b/i,
      /\bvisibility hangover\b/i,
      /\bshouldn'?t have posted\b/i,
    ],
    actualNeed: "recovery",
    adhdPatterns: ["fear", "shame"],
    emotionalStates: ["discouraged", "anxious"],
    companionGoals: ["protect_trust", "increase_confidence"],
    recommendedInterventions: ["conversation", "visibility_support"],
    antiPatterns: ["delete everything", "stop posting forever"],
    validationLinks: ["visibility-hangover-regret"],
  }),
  defineSituation({
    id: "expert-imposter",
    name: "Expert Imposter Syndrome",
    category: "visibility",
    surfaceStatements: [
      /\bwho am i to (?:teach|tell|share)\b/i,
      /\bimposter\b/i,
      /\bnot qualified to\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["imposter", "fear"],
    emotionalStates: ["discouraged", "anxious"],
    companionGoals: ["increase_confidence", "protect_trust"],
    recommendedInterventions: ["conversation", "visibility_support"],
    antiPatterns: ["generic motivation", "more credentials"],
    validationLinks: ["visibility-expert-imposter"],
    relatedBusinessPatterns: ["imposter_syndrome"],
  }),
  defineSituation({
    id: "criticism-fear",
    name: "Criticism Fear",
    category: "visibility",
    surfaceStatements: [
      /\bwhat if people (?:disagree|judge|criticize)\b/i,
      /\bafraid of (?:comments|critics)\b/i,
      /\bwhat will people think\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["rejection_sensitivity", "fear"],
    emotionalStates: ["anxious"],
    companionGoals: ["increase_confidence", "protect_trust"],
    recommendedInterventions: ["visibility_support", "conversation"],
    antiPatterns: ["audience research rabbit hole"],
    validationLinks: ["visibility-fear-judgment"],
  }),
  defineSituation({
    id: "content-perfectionism",
    name: "Content Perfectionism",
    category: "visibility",
    surfaceStatements: [
      /\brecorded (?:it )?\d+ times\b/i,
      /\bkeep re-?recording\b/i,
      /\bnever like how it (?:looks|sounds)\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["perfectionism", "fear"],
    emotionalStates: ["frustrated", "anxious"],
    companionGoals: ["create_momentum", "reduce_friction"],
    recommendedInterventions: ["visibility_support", "conversation"],
    antiPatterns: ["better equipment", "more editing"],
    validationLinks: ["visibility-perfectionism-rerecord"],
  }),
  // Content
  defineSituation({
    id: "cant-start-content",
    name: "Can't Start Content",
    category: "content",
    surfaceStatements: [
      /\bcan'?t (?:start|bring myself to) (?:writing|creating|recording)\b/i,
      /\bputting off content\b/i,
      /\bavoiding (?:my )?content\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "fear"],
    emotionalStates: ["stuck", "anxious"],
    companionGoals: ["create_momentum", "reduce_friction"],
    recommendedInterventions: ["visibility_support", "clear_my_mind"],
    antiPatterns: ["content calendar", "batch planning"],
    validationLinks: ["content-paralysis"],
  }),
  defineSituation({
    id: "rewriting-forever",
    name: "Rewriting Forever",
    category: "content",
    surfaceStatements: [
      /\bkeep rewriting\b/i,
      /\bediting (?:for hours|forever)\b/i,
      /\bnever finished (?:the )?(?:post|draft|script)\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["perfectionism"],
    emotionalStates: ["frustrated"],
    companionGoals: ["create_momentum"],
    recommendedInterventions: ["conversation", "visibility_support"],
    antiPatterns: ["another draft", "hire editor first"],
    validationLinks: ["content-paralysis"],
  }),
  defineSituation({
    id: "posting-inconsistency",
    name: "Posting Inconsistency",
    category: "content",
    surfaceStatements: [
      /\bcan'?t stay consistent\b/i,
      /\bpost for a week then stop\b/i,
      /\binconsistent (?:posting|content)\b/i,
    ],
    actualNeed: "prioritization",
    adhdPatterns: ["overwhelm", "avoidance"],
    emotionalStates: ["discouraged", "frustrated"],
    companionGoals: ["create_momentum", "clarify_direction"],
    recommendedInterventions: ["plan_my_day", "visibility_support"],
    antiPatterns: ["aggressive content calendar"],
    validationLinks: ["visibility-inconsistent"],
  }),
  defineSituation({
    id: "idea-overload",
    name: "Idea Overload",
    category: "content",
    surfaceStatements: [
      /\btoo many ideas\b/i,
      /\bcan'?t pick (?:one|which)\b/i,
      /\bidea overload\b/i,
    ],
    actualNeed: "prioritization",
    adhdPatterns: ["overwhelm", "decision_paralysis"],
    emotionalStates: ["overwhelmed"],
    companionGoals: ["clarify_direction", "enable_decision"],
    recommendedInterventions: ["clear_my_mind", "decision_compass"],
    antiPatterns: ["capture all ideas first", "mind map everything"],
    validationLinks: ["content-too-many-ideas"],
  }),
  // Marketing
  defineSituation({
    id: "offer-confusion",
    name: "Offer Confusion",
    category: "marketing",
    surfaceStatements: [
      /\bnot sure what (?:i'?m )?selling\b/i,
      /\boffer (?:is )?confus/i,
      /\btoo many offers\b/i,
      /\bcan'?t explain (?:my )?offer\b/i,
    ],
    actualNeed: "clarity",
    adhdPatterns: ["decision_paralysis", "overwhelm"],
    emotionalStates: ["unclear", "overwhelmed"],
    companionGoals: ["clarify_direction", "enable_decision"],
    recommendedInterventions: ["decision_compass", "conversation"],
    antiPatterns: ["build another offer", "full rebrand"],
    validationLinks: ["content-marketing-offer-confusion"],
    relatedBusinessPatterns: ["offer_hopping"],
  }),
  defineSituation({
    id: "niche-confusion",
    name: "Niche Confusion",
    category: "marketing",
    surfaceStatements: [
      /\bnot sure (?:about )?my niche\b/i,
      /\bwho (?:is )?my (?:ideal )?audience\b/i,
      /\btoo broad\b/i,
    ],
    actualNeed: "clarity",
    adhdPatterns: ["decision_paralysis", "fear"],
    emotionalStates: ["unclear", "anxious"],
    companionGoals: ["clarify_direction", "enable_decision"],
    recommendedInterventions: ["decision_compass", "conversation"],
    antiPatterns: ["market research spiral"],
    validationLinks: ["decision-niche-pivot"],
  }),
  defineSituation({
    id: "strategy-overload",
    name: "Strategy Overload",
    category: "marketing",
    surfaceStatements: [
      /\btoo many strategies\b/i,
      /\bmarketing (?:is )?overwhelm/i,
      /\bneed a (?:full )?marketing (?:plan|strategy)\b/i,
    ],
    actualNeed: "prioritization",
    adhdPatterns: ["overwhelm", "planning_addiction"],
    emotionalStates: ["overwhelmed"],
    companionGoals: ["reduce_friction", "clarify_direction"],
    recommendedInterventions: ["clear_my_mind", "conversation"],
    antiPatterns: ["funnel audit", "90-day plan"],
    validationLinks: ["content-marketing-offer-confusion"],
  }),
  // Launch
  defineSituation({
    id: "launch-avoidance",
    name: "Launch Avoidance",
    category: "launch",
    surfaceStatements: [
      /\balmost ready to launch\b/i,
      /\bnot quite ready to (?:launch|ship)\b/i,
      /\bjust need (?:one more thing|a better)\b/i,
      /\bwebsite still isn'?t finished\b/i,
      /\bneed a better logo\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "perfectionism", "fear"],
    emotionalStates: ["anxious", "stuck"],
    companionGoals: ["create_momentum", "reduce_friction"],
    recommendedInterventions: ["conversation", "decision_compass"],
    antiPatterns: ["more prep", "rebrand before launch"],
    validationLinks: ["launch-delay-almost-ready", "launch-one-more-improvement"],
  }),
  defineSituation({
    id: "launch-panic",
    name: "Launch Panic",
    category: "launch",
    surfaceStatements: [
      /\bwhat if nobody (?:buys|shows up)\b/i,
      /\bscared to launch\b/i,
      /\bafraid (?:no one|nobody) will\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["fear", "rejection_sensitivity"],
    emotionalStates: ["anxious"],
    companionGoals: ["increase_confidence", "protect_trust"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["delay launch", "more validation"],
    validationLinks: ["launch-panic-nobody-buys"],
    relatedBusinessPatterns: ["launch_panic"],
  }),
  defineSituation({
    id: "post-launch-crash",
    name: "Post-Launch Crash",
    category: "launch",
    surfaceStatements: [
      /\bdon'?t know what to do now\b/i,
      /\bafter the launch\b/i,
      /\bnow that it'?s live\b/i,
    ],
    actualNeed: "clarity",
    adhdPatterns: ["overwhelm", "avoidance"],
    emotionalStates: ["unclear", "discouraged"],
    companionGoals: ["clarify_direction", "protect_trust"],
    recommendedInterventions: ["conversation", "plan_my_day"],
    antiPatterns: ["start next launch", "full strategy overhaul"],
    validationLinks: ["launch-post-launch-crash"],
  }),
  // Money
  defineSituation({
    id: "financial-avoidance",
    name: "Financial Avoidance",
    category: "money",
    surfaceStatements: [
      /\bhaven'?t looked at (?:my )?(?:revenue|numbers|books)\b/i,
      /\bavoiding (?:my )?finances\b/i,
      /\bscared to (?:look|open)\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "fear"],
    emotionalStates: ["anxious", "stuck"],
    companionGoals: ["reduce_friction", "protect_trust"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["full financial planning project", "bookkeeper hire"],
    validationLinks: ["money-avoid-look-at-numbers", "money-avoidance-loop"],
    relatedBusinessPatterns: ["financial_avoidance"],
  }),
  defineSituation({
    id: "revenue-anxiety",
    name: "Revenue Anxiety",
    category: "money",
    surfaceStatements: [
      /\bthis month (?:is|was) terrible\b/i,
      /\bslow month\b/i,
      /\bincome dropped\b/i,
      /\bnot making enough\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["fear", "overwhelm"],
    emotionalStates: ["discouraged", "anxious"],
    companionGoals: ["increase_confidence", "protect_trust"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["catastrophe thinking", "identity collapse"],
    validationLinks: ["money-inconsistent-revenue"],
    relatedBusinessPatterns: ["revenue_anxiety"],
  }),
  defineSituation({
    id: "invoice-avoidance",
    name: "Invoice Avoidance",
    category: "money",
    surfaceStatements: [
      /\bputting off (?:invoices|billing)\b/i,
      /\bhaven'?t sent (?:invoices|bills)\b/i,
      /\bavoiding invoic/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "fear"],
    emotionalStates: ["anxious", "stuck"],
    companionGoals: ["create_momentum", "reduce_friction"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["invoicing system overhaul"],
    validationLinks: ["money-avoidance-loop"],
  }),
  defineSituation({
    id: "pricing-resistance",
    name: "Pricing Resistance",
    category: "money",
    surfaceStatements: [
      /\braise my rates?\b/i,
      /\bneed to raise\b/i,
      /\bundercharg/i,
      /\bnot sure what to charge\b/i,
    ],
    actualNeed: "decision",
    adhdPatterns: ["fear", "rejection_sensitivity"],
    emotionalStates: ["anxious", "stuck"],
    companionGoals: ["enable_decision", "increase_confidence"],
    recommendedInterventions: ["conversation", "sales_call_support"],
    antiPatterns: ["complex pricing models"],
    validationLinks: ["money-raising-prices"],
  }),
  // Delegation
  defineSituation({
    id: "diy-bias",
    name: "DIY Bias",
    category: "delegation",
    surfaceStatements: [
      /\bfaster if i do it\b/i,
      /\beasier to (?:just )?do it myself\b/i,
      /\bonly i can\b/i,
    ],
    actualNeed: "decision",
    adhdPatterns: ["control", "perfectionism"],
    emotionalStates: ["frustrated", "overwhelmed"],
    companionGoals: ["enable_decision", "reduce_friction"],
    recommendedInterventions: ["conversation", "decision_compass"],
    antiPatterns: ["full delegation system", "hire immediately"],
    validationLinks: ["delegation-do-it-myself"],
  }),
  defineSituation({
    id: "first-va-resistance",
    name: "First VA Resistance",
    category: "delegation",
    surfaceStatements: [
      /\btakes longer to explain\b/i,
      /\bnot worth explaining\b/i,
      /\bthinking about hiring a va\b/i,
    ],
    actualNeed: "decision",
    adhdPatterns: ["control", "fear"],
    emotionalStates: ["anxious", "stuck"],
    companionGoals: ["reduce_friction", "enable_decision"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["full SOP library", "hire multiple people"],
    validationLinks: ["delegation-first-va-resistance"],
    relatedBusinessPatterns: ["delegation_resistance"],
  }),
  defineSituation({
    id: "delegation-communication-avoidance",
    name: "Delegation Communication Avoidance",
    category: "delegation",
    surfaceStatements: [
      /\bdon'?t know how to tell them\b/i,
      /\bhard to explain what i want\b/i,
      /\bavoiding (?:the )?conversation with\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "fear"],
    emotionalStates: ["anxious", "stuck"],
    companionGoals: ["reduce_friction", "create_momentum"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["management training course"],
    validationLinks: ["delegation-team-communication"],
  }),
  // Energy
  defineSituation({
    id: "burnout",
    name: "Burnout",
    category: "energy",
    surfaceStatements: [
      /\bburn(?:ed|ing)? out\b/i,
      /\bcan'?t keep this pace\b/i,
      /\bexhausted from (?:the )?business\b/i,
    ],
    actualNeed: "prioritization",
    adhdPatterns: ["overwhelm", "hyperfocus_crash"],
    emotionalStates: ["overwhelmed", "discouraged"],
    companionGoals: ["reduce_friction", "protect_trust"],
    recommendedInterventions: ["conversation", "plan_my_day"],
    antiPatterns: ["work harder", "optimize schedule"],
    validationLinks: ["energy-burnout-spiral"],
    relatedBusinessPatterns: ["burnout_cycle"],
  }),
  defineSituation({
    id: "low-capacity-day",
    name: "Low Capacity Day",
    category: "energy",
    surfaceStatements: [
      /\bbad brain day\b/i,
      /\blow energy today\b/i,
      /\bcan'?t focus today\b/i,
      /\bone of those days\b/i,
    ],
    actualNeed: "recovery",
    adhdPatterns: ["overwhelm"],
    emotionalStates: ["overwhelmed", "discouraged"],
    companionGoals: ["protect_trust", "reduce_friction"],
    recommendedInterventions: ["conversation", "adapt_my_day"],
    antiPatterns: ["full task list", "catch up everything"],
    validationLinks: ["energy-monday-start"],
  }),
  // Confidence
  defineSituation({
    id: "self-doubt",
    name: "Self Doubt",
    category: "confidence",
    surfaceStatements: [
      /\bnot sure i can\b/i,
      /\bdon'?t trust myself\b/i,
      /\bmaybe i'?m not cut out\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["fear", "imposter"],
    emotionalStates: ["discouraged", "anxious"],
    companionGoals: ["increase_confidence", "protect_trust"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["pep talk", "generic motivation"],
    validationLinks: ["sales-confidence-recovery"],
  }),
  defineSituation({
    id: "comparison-spiral",
    name: "Comparison Spiral",
    category: "confidence",
    surfaceStatements: [
      /\beveryone else is ahead\b/i,
      /\bcomparing myself\b/i,
      /\bthey'?re so far ahead\b/i,
    ],
    actualNeed: "confidence",
    adhdPatterns: ["comparison", "shame"],
    emotionalStates: ["discouraged"],
    companionGoals: ["increase_confidence", "protect_trust"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["competitive analysis", "scroll more"],
    validationLinks: ["visibility-comparison-spiral"],
  }),
  // Relationships
  defineSituation({
    id: "difficult-client-conversation",
    name: "Difficult Client Conversation",
    category: "relationships",
    surfaceStatements: [
      /\bhard conversation with (?:a )?client\b/i,
      /\bdifficult client\b/i,
      /\bneed to (?:fire|push back on) (?:a )?client\b/i,
    ],
    actualNeed: "decision",
    adhdPatterns: ["fear", "avoidance"],
    emotionalStates: ["anxious", "frustrated"],
    companionGoals: ["enable_decision", "protect_trust"],
    recommendedInterventions: ["conversation", "sales_call_support"],
    antiPatterns: ["avoid the conversation", "over-apologize"],
    validationLinks: ["client-difficult-conversation"],
  }),
  defineSituation({
    id: "boundary-problems",
    name: "Boundary Problems",
    category: "relationships",
    surfaceStatements: [
      /\bsaying yes too (?:much|often)\b/i,
      /\bcan'?t say no\b/i,
      /\bno boundaries\b/i,
      /\bovercommit/i,
    ],
    actualNeed: "prioritization",
    adhdPatterns: ["overwhelm", "fear"],
    emotionalStates: ["overwhelmed", "frustrated"],
    companionGoals: ["clarify_direction", "protect_trust"],
    recommendedInterventions: ["conversation", "decision_compass"],
    antiPatterns: ["boundary workbook", "full life audit"],
    validationLinks: ["client-scope-creep"],
    relatedBusinessPatterns: ["overcommitting"],
  }),
  defineSituation({
    id: "conflict-avoidance",
    name: "Conflict Avoidance",
    category: "relationships",
    surfaceStatements: [
      /\bavoiding (?:the )?conflict\b/i,
      /\bdon'?t want to upset\b/i,
      /\bkeeping the peace\b/i,
    ],
    actualNeed: "action",
    adhdPatterns: ["avoidance", "fear", "rejection_sensitivity"],
    emotionalStates: ["anxious"],
    companionGoals: ["reduce_friction", "enable_decision"],
    recommendedInterventions: ["conversation"],
    antiPatterns: ["wait it out", "people pleasing scripts"],
    validationLinks: ["client-difficult-conversation"],
  }),
];

// ─── Lookup ───────────────────────────────────────────────────────────────────

function scoreEntry(
  entry: SituationAtlasEntry,
  primaryText: string,
  threadText: string,
): SituationMatch | null {
  let bestScore = 0;
  let matchedSurface: string | null = null;

  const scoreAgainst = (text: string, weight: number) => {
    for (const re of entry.surfaceStatements) {
      const m = text.match(re);
      if (m) {
        const score = (m[0].length + (re.source.length > 20 ? 10 : 5)) * weight;
        if (score > bestScore) {
          bestScore = score;
          matchedSurface = m[0];
        }
      }
    }
  };

  scoreAgainst(primaryText, 2);
  scoreAgainst(threadText, 0.4);

  if (bestScore === 0) return null;

  const confidence: SituationMatch["confidence"] =
    bestScore >= 25 ? "high" : bestScore >= 12 ? "medium" : "low";

  return { entry, score: bestScore, confidence, matchedSurface };
}

export function lookupSituations(input: {
  userText: string;
  messages?: ChatTurn[];
  limit?: number;
}): SituationMatch[] {
  const userLines = (input.messages ?? [])
    .filter((m) => m.role === "user")
    .map((m) => m.content);
  const primaryText = input.userText;
  const threadText = userLines.join(" ");

  const matches = SITUATION_ATLAS.map((entry) => scoreEntry(entry, primaryText, threadText))
    .filter((m): m is SituationMatch => m !== null);

  const primaryLower = primaryText.toLowerCase();
  for (const m of matches) {
    if (m.entry.id === "overwhelm-spiral" && /\btoo much\b/.test(primaryLower)) {
      m.score += 20;
    }
    if (m.entry.id === "offer-confusion" && /\boffer\b/.test(primaryLower)) {
      m.score += 20;
    }
  }

  matches.sort((a, b) => b.score - a.score);

  recordSituationHits(matches.slice(0, 3));

  if (matches.length === 0) {
    recordUnknownPattern(input.userText);
  }

  return matches.slice(0, input.limit ?? 5);
}

export function resolveSituation(input: {
  userText: string;
  messages?: ChatTurn[];
}): SituationResolution {
  const matches = lookupSituations({ ...input, limit: 5 });
  const primary = matches[0] ?? null;

  if (!primary || primary.confidence === "low") {
    return {
      matched: false,
      primary,
      alternatives: matches.slice(1),
      actualNeed: null,
      signals: [],
      companionMove: "",
      situationId: null,
      situationName: null,
      category: null,
    };
  }

  const entry = primary.entry;
  return {
    matched: true,
    primary,
    alternatives: matches.slice(1),
    actualNeed: mapAtlasNeedToActualNeed(entry.actualNeed),
    signals: patternsToSignals(entry.adhdPatterns),
    companionMove: entry.companionMove,
    situationId: entry.id,
    situationName: entry.name,
    category: entry.category,
  };
}

export function mergeAtlasIntoIntuitive(input: {
  resolution: SituationResolution;
  existingSignals: IntuitiveSignal[];
  existingActualNeed: ActualNeed | null;
  existingMove: string;
}): {
  signals: IntuitiveSignal[];
  actualNeed: ActualNeed | null;
  companionMove: string;
  situationId: string | null;
  situationName: string | null;
} {
  if (!input.resolution.matched || !input.resolution.primary) {
    return {
      signals: input.existingSignals,
      actualNeed: input.existingActualNeed,
      companionMove: input.existingMove,
      situationId: null,
      situationName: null,
    };
  }

  const signals = [...new Set([...input.existingSignals, ...input.resolution.signals])];
  return {
    signals,
    actualNeed: input.resolution.actualNeed ?? input.existingActualNeed,
    companionMove: input.resolution.companionMove || input.existingMove,
    situationId: input.resolution.situationId,
    situationName: input.resolution.situationName,
  };
}

export function situationAtlasHintForChat(resolution: SituationResolution): string | undefined {
  if (!resolution.matched || !resolution.situationName) return undefined;

  const entry = resolution.primary?.entry;
  const anti = entry?.antiPatterns.slice(0, 3).join("; ") ?? "";
  const interventions = entry?.recommendedInterventions.slice(0, 3).join(", ") ?? "";

  return [
    "SITUATION ATLAS™ (recognize situations, not keywords):",
    `Human situation: ${resolution.situationName} (${resolution.category?.replace(/_/g, " ") ?? "general"}).`,
    `Respond to the situation — not only the exact words used.`,
    resolution.actualNeed
      ? `Situation actual need: ${resolution.actualNeed.replace(/_/g, " ")}.`
      : "",
    `Move: ${resolution.companionMove}`,
    anti ? `Anti-patterns — do NOT: ${anti}.` : "",
    interventions ? `Appropriate support: ${interventions}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function getAtlasEntryById(id: string): SituationAtlasEntry | undefined {
  return SITUATION_ATLAS.find((e) => e.id === id);
}

export function getAtlasEntriesByCategory(category: SituationCategory): SituationAtlasEntry[] {
  return SITUATION_ATLAS.filter((e) => e.category === category);
}

export function getAtlasValidationCoverage(): {
  totalEntries: number;
  linkedScenarios: number;
  uniqueScenarioIds: string[];
} {
  const ids = new Set<string>();
  for (const entry of SITUATION_ATLAS) {
    for (const link of entry.validationLinks) ids.add(link);
  }
  return {
    totalEntries: SITUATION_ATLAS.length,
    linkedScenarios: ids.size,
    uniqueScenarioIds: [...ids],
  };
}

// ─── Atlas Growth System™ ─────────────────────────────────────────────────────

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full */
  }
}

type HitRecord = Record<string, { count: number; lastWeek: number; priorWeek: number }>;

function recordSituationHits(matches: SituationMatch[]): void {
  const hits = readJson<HitRecord>(HITS_KEY, {});
  for (const m of matches) {
    const prev = hits[m.entry.id] ?? { count: 0, lastWeek: 0, priorWeek: 0 };
    hits[m.entry.id] = { ...prev, count: prev.count + 1, lastWeek: prev.lastWeek + 1 };
  }
  writeJson(HITS_KEY, hits);
}

function inferCategoryFromText(text: string): SituationCategory {
  if (/\b(?:sell|sales|price|client|prospect)\b/i.test(text)) return "sales";
  if (/\b(?:launch|ship|go live)\b/i.test(text)) return "launch";
  if (/\b(?:post|video|visible|content)\b/i.test(text)) return "visibility";
  if (/\b(?:money|revenue|invoice|charge)\b/i.test(text)) return "money";
  if (/\b(?:delegat|va\b|team|hire)\b/i.test(text)) return "delegation";
  if (/\b(?:burnout|tired|exhaust)\b/i.test(text)) return "energy";
  return "adhd_core";
}

export function recordUnknownPattern(userText: string): CandidateSituation | null {
  const trimmed = userText.trim();
  if (trimmed.length < 12) return null;

  const candidates = readJson<CandidateSituation[]>(CANDIDATES_KEY, []);
  const normalized = trimmed.slice(0, 120);
  const existing = candidates.find(
    (c) =>
      c.status === "pending" &&
      c.samplePhrases.some((p) => p.slice(0, 40) === normalized.slice(0, 40)),
  );

  if (existing) {
    existing.frequency += 1;
    existing.lastSeenAt = new Date().toISOString();
    if (!existing.samplePhrases.includes(normalized) && existing.samplePhrases.length < MAX_SAMPLES) {
      existing.samplePhrases.push(normalized);
    }
    writeJson(CANDIDATES_KEY, candidates);
    return existing;
  }

  if (candidates.filter((c) => c.status === "pending").length >= MAX_CANDIDATES) return null;

  const candidate: CandidateSituation = {
    id: `candidate-${Date.now()}`,
    suggestedName: `Unmapped: ${normalized.slice(0, 40)}…`,
    frequency: 1,
    samplePhrases: [normalized],
    suggestedCategory: inferCategoryFromText(trimmed),
    suggestedActualNeed: "clarity",
    suggestedInterventions: ["conversation"],
    relatedConversationSnippets: [normalized],
    status: "pending",
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    source: "unknown_pattern",
  };
  candidates.unshift(candidate);
  writeJson(CANDIDATES_KEY, candidates);
  return candidate;
}

export function recordCorrectionCandidate(userText: string, interventionId?: string): void {
  const candidates = readJson<CandidateSituation[]>(CANDIDATES_KEY, []);
  const snippet = userText.trim().slice(0, 120);
  const existing = candidates.find(
    (c) => c.source === "repeated_correction" && c.samplePhrases[0] === snippet,
  );
  if (existing) {
    existing.frequency += 1;
    existing.lastSeenAt = new Date().toISOString();
    writeJson(CANDIDATES_KEY, candidates);
    return;
  }
  candidates.unshift({
    id: `candidate-correction-${Date.now()}`,
    suggestedName: `Correction pattern: ${snippet.slice(0, 35)}…`,
    frequency: 1,
    samplePhrases: [snippet],
    suggestedCategory: inferCategoryFromText(snippet),
    suggestedActualNeed: "clarity",
    suggestedInterventions: interventionId
      ? [interventionId as AtlasIntervention]
      : ["conversation"],
    relatedConversationSnippets: [snippet],
    status: "pending",
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    source: "repeated_correction",
  });
  writeJson(CANDIDATES_KEY, candidates.slice(0, MAX_CANDIDATES));
}

export function getFounderReviewQueue(): FounderReviewQueue {
  const candidates = readJson<CandidateSituation[]>(CANDIDATES_KEY, []);
  return {
    pending: candidates.filter((c) => c.status === "pending").sort((a, b) => b.frequency - a.frequency),
    approved: candidates.filter((c) => c.status === "approved"),
    rejected: candidates.filter((c) => c.status === "rejected"),
    evaluatedAt: new Date().toISOString(),
  };
}

export function approveSituationCandidate(
  candidateId: string,
  overrides?: Partial<Pick<CandidateSituation, "suggestedName" | "suggestedCategory" | "suggestedActualNeed">>,
): SituationAtlasEntry | null {
  const candidates = readJson<CandidateSituation[]>(CANDIDATES_KEY, []);
  const idx = candidates.findIndex((c) => c.id === candidateId);
  if (idx < 0) return null;

  const candidate = { ...candidates[idx]!, ...overrides, status: "approved" as const };
  candidates[idx] = candidate;
  writeJson(CANDIDATES_KEY, candidates);

  const phrase = candidate.samplePhrases[0] ?? "";
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 60);
  const newEntry = defineSituation({
    id: `approved-${candidateId}`,
    name: candidate.suggestedName,
    category: candidate.suggestedCategory,
    surfaceStatements: [new RegExp(escaped, "i")],
    actualNeed: candidate.suggestedActualNeed,
    adhdPatterns: ["avoidance"],
    emotionalStates: ["unclear"],
    companionGoals: ["clarify_direction"],
    recommendedInterventions: candidate.suggestedInterventions,
    antiPatterns: ["overanalyze"],
    validationLinks: [],
  });

  SITUATION_ATLAS.push(newEntry);
  return newEntry;
}

export function rejectSituationCandidate(candidateId: string): boolean {
  const candidates = readJson<CandidateSituation[]>(CANDIDATES_KEY, []);
  const idx = candidates.findIndex((c) => c.id === candidateId);
  if (idx < 0) return false;
  candidates[idx] = { ...candidates[idx]!, status: "rejected" };
  writeJson(CANDIDATES_KEY, candidates);
  return true;
}

export function buildSituationAtlasAnalytics(): SituationAtlasAnalytics {
  const hits = readJson<HitRecord>(HITS_KEY, {});
  const queue = getFounderReviewQueue();
  const mistakes = getMistakeRecords().slice(0, 50);

  const mostCommon = Object.entries(hits)
    .map(([id, h]) => ({
      id,
      name: getAtlasEntryById(id)?.name ?? id,
      hits: h.count,
    }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 8);

  const fastestGrowing = Object.entries(hits)
    .map(([id, h]) => ({
      id,
      name: getAtlasEntryById(id)?.name ?? id,
      growthPercent: h.priorWeek ? Math.round(((h.lastWeek - h.priorWeek) / h.priorWeek) * 100) : h.lastWeek * 10,
    }))
    .filter((x) => x.growthPercent > 0)
    .sort((a, b) => b.growthPercent - a.growthPercent)
    .slice(0, 5);

  const byIntervention = new Map<string, { ok: number; bad: number }>();
  for (const m of mistakes) {
    if (!m.interventionId) continue;
    const cur = byIntervention.get(m.interventionId) ?? { ok: 0, bad: 0 };
    cur.bad += 1;
    byIntervention.set(m.interventionId, cur);
  }

  const failedInterventions = [...byIntervention.entries()]
    .map(([intervention, v]) => ({
      intervention,
      dismissRate: v.bad > 0 ? Math.min(100, v.bad * 15) : 0,
    }))
    .sort((a, b) => b.dismissRate - a.dismissRate)
    .slice(0, 5);

  return {
    totalEntries: SITUATION_ATLAS.length,
    mostCommonSituations: mostCommon,
    fastestGrowing,
    mostDifficult: mistakes.length
      ? [{ id: "corrections", name: "User corrections", correctionRate: mistakes.length }]
      : [],
    topInterventions: [],
    failedInterventions,
    coverageGaps: queue.pending.slice(0, 5).map((c) => c.suggestedName),
    candidateCount: queue.pending.length,
  };
}

export function resetSituationAtlasForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CANDIDATES_KEY);
  localStorage.removeItem(HITS_KEY);
  const approvedIds = SITUATION_ATLAS.filter((e) => e.id.startsWith("approved-")).map((e) => e.id);
  for (const id of approvedIds) {
    const idx = SITUATION_ATLAS.findIndex((e) => e.id === id);
    if (idx >= 0) SITUATION_ATLAS.splice(idx, 1);
  }
}
