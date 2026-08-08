/**
 * Chamber Expert Activation — shared types.
 *
 * Types shared by the registry, composition function, and hint builders.
 * Live in the companion chat runtime since Phase C — see
 * docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md for the
 * architecture this implements, and docs/visual-spark-studios/
 * Chamber-Member-Intelligence/Expert-Intelligence-Profiles/ for the
 * 24 source Expert Intelligence Profiles this registry digests.
 */

import type { IntentCategory } from "@/lib/intentRoutingIntelligence";
import type { EstateCapabilityCategory } from "@/lib/estateBrain/intelligenceTypes";

/** Canonical Chamber Member prefixes — the 24 Expert Intelligence Profiles. */
export type ChamberExpertId =
  | "AI"
  | "CR"
  | "CNT"
  | "CRE"
  | "DATA"
  | "EVT"
  | "FIN"
  | "HOR"
  | "INN"
  | "KMG"
  | "LEAD"
  | "LEARN"
  | "MKT"
  | "MOM"
  | "NET"
  | "PART"
  | "PC"
  | "PRES"
  | "PM"
  | "RES"
  | "SALES"
  | "STR"
  | "SYS"
  | "WELL";

export const CHAMBER_EXPERT_IDS: readonly ChamberExpertId[] = [
  "AI",
  "CR",
  "CNT",
  "CRE",
  "DATA",
  "EVT",
  "FIN",
  "HOR",
  "INN",
  "KMG",
  "LEAD",
  "LEARN",
  "MKT",
  "MOM",
  "NET",
  "PART",
  "PC",
  "PRES",
  "PM",
  "RES",
  "SALES",
  "STR",
  "SYS",
  "WELL",
];

/** One canonical Chamber Expert entry — the compiled digest of its profile. */
export type ChamberExpertRegistryEntry = {
  id: ChamberExpertId;
  /** Canonical name, matches docs/visual-spark-studios/MEMBER_INDEX.md */
  name: string;
  /**
   * "When this expert helps, what do they notice that others miss?" —
   * from the profile's §2 Expert Thinking Pattern. A signature move, not
   * a restated job description. This is what makes a hint *change how
   * Spark thinks* rather than just naming an expert — see
   * docs/estate/CHAMBER_EXPERTISE_CONTRIBUTION_TESTS.md.
   */
  expertThinkingPattern: string;
  /**
   * Situational phrases from the profile's "Invite when" signals (§0),
   * compiled into short trigger-style phrases. Multi-word entries require
   * their significant words to co-occur in the user's text; single-word
   * entries require an exact word match. Neither type alone is sufficient
   * to activate an expert — see resolveChamberExpertActivation.ts.
   */
  activationSignals: readonly string[];
  /** Core expertise terms from the profile's §3 "Core expertise" line. */
  expertiseAreas: readonly string[];
  /**
   * V2-2: deliverable/outcome-shaped phrases — "what the founder wants to
   * walk away with" (a price, a documented process, a hiring plan), as
   * distinct from activationSignals' mix of situational framing and topic
   * nouns. Scored identically to activationSignals (same phraseMatches
   * mechanism, same Tier-1/2 weight by word count) — this is a second
   * curated vocabulary, not a new scoring tier or engine. See
   * docs/estate/CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md §2/§3.
   * Optional — most of the 24 experts have an empty list until their
   * deeper migration (I-4); only experts where a real gap was found have
   * this authored so far.
   */
  outcomeSignals?: readonly string[];
  /**
   * V2-2: "specialist" (a bounded domain) or "generalist" (meta/
   * direction-setting — Strategy, Momentum, Horizons). Used ONLY as a
   * tiebreak criterion when two experts' scores are otherwise equal —
   * never a scoring multiplier, never applied to a clear win. See
   * docs/estate/CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md §5.2.
   */
  expertCategory?: "specialist" | "generalist";
  /**
   * V2-2: a short (3-8 word), plain-language phrase naming what working
   * with this expert helps a founder DO — "getting customers," "creating
   * the system" — never the expert's internal name. Used ONLY when
   * building an "insufficient evidence" clarifying question (never in a
   * normal hint). See docs/estate/CHAMBER_ACTIVATION_DECISION_TABLE.md.
   */
  founderPlainLanguagePhrase?: string;
  /**
   * Curated "typically pairs with first" experts from the profile's §11
   * Cross-Chamber Collaboration section — the core collaboration cast for
   * this expert's kind of work. Surfaced as `supporting` when this expert
   * is primary (subject to a light per-request relevance filter).
   */
  supportingRelationships: readonly ChamberExpertId[];
  /**
   * Secondary collaboration cast — still domain-relevant, less central.
   * Surfaced as `possible` when this expert is primary.
   */
  possibleRelationships: readonly ChamberExpertId[];
  /**
   * Work-type signals (Universal Reasoning Journey "Work Recognition")
   * this expert is commonly relevant for. One of several independent
   * signals the composition function requires — never sufficient alone.
   */
  intentAffinities: readonly IntentCategory[];
  /** Estate Intelligence capability categories this expert supports. */
  estateCategories: readonly EstateCapabilityCategory[];
  /** Path to the full Expert Intelligence Profile (source of truth). */
  profilePath: string;
};

/**
 * V2-2 adds "contested" (genuine ambiguity — neither top candidate has
 * strong evidence) and "co-primary" (genuine dual relevance — both top
 * candidates independently have strong evidence). Both are additive; V1's
 * resolveChamberExpertActivation never produces them. See
 * docs/estate/CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md §6.
 */
export type ChamberExpertConfidence = "high" | "medium" | "low" | "contested" | "co-primary";

/** Per-expert signal computation for one activation request (debug/testable). */
export type ChamberExpertSignalResult = {
  id: ChamberExpertId;
  score: number;
  signalGroupsMatched: number;
  topicMatch: boolean;
  intentMatch: boolean;
  estateCategoryMatch: boolean;
  estateExpertIdMatch: boolean;
  /**
   * V2-2: exposes phrase-vs-keyword topic strength separately, needed for
   * the corrected Tier-1/Tier-2 eligibility rule (a keyword-only match is
   * Tier 2, not Tier 1). V1 (resolveChamberExpertActivation) does not set
   * this field; V2 always does.
   */
  topicPhraseMatch?: boolean;
  /** V2-2: true if an outcomeSignals phrase matched (Tier 1, same as a topic phrase match). */
  outcomeMatch?: boolean;
};

/** Input to the Chamber Expert Activation composition function. */
export type ChamberExpertActivationInput = {
  /** Raw member text — used only for topic/vocabulary matching, never alone. */
  userText: string;
  /**
   * Work Recognition signal — already computed upstream by
   * lib/intentRoutingIntelligence.ts (resolveIntentRouting). Optional here
   * so this function can be unit-tested and, later, called before that
   * pipeline finishes; production callers should pass it when available.
   */
  intentCategory?: IntentCategory | null;
  /** Estate Intelligence Route category, already computed upstream. */
  estateCategory?: EstateCapabilityCategory | null;
  /**
   * Legacy expert IDs already resolved upstream (Estate Brain `expertIds`,
   * Phase 33 team IDs). Resolved to canonical prefixes via
   * legacyExpertAliasMap.ts and treated as a strong corroborating signal.
   */
  legacyExpertIds?: readonly string[] | null;
  /** Optional journey stage (ConversationSession.currentStage / UC step) — informational only in Phase B. */
  journeyStage?: string | null;
};

/** Output of the Chamber Expert Activation composition function. */
export type ChamberExpertActivation = {
  primary: ChamberExpertId | null;
  supporting: readonly ChamberExpertId[];
  possible: readonly ChamberExpertId[];
  confidence: ChamberExpertConfidence;
  /** Full per-expert scoring, for tests/debugging — never shown to members. */
  signals: readonly ChamberExpertSignalResult[];
  /**
   * V2-2, `confidence: "co-primary"` only: the two experts that are both
   * genuinely central to this request. When set, `primary` still holds
   * one of the two (for callers that only read `primary`), but composers
   * MUST check `coPrimary` first and, if set, treat both as equally
   * central rather than reading `primary` alone. Always null under V1.
   */
  coPrimary?: readonly [ChamberExpertId, ChamberExpertId] | null;
  /**
   * V2-2, `confidence: "contested"` only: the second-place candidate that
   * came close enough to `primary` that the choice is genuinely close —
   * used only to decide whether to hold the answer more loosely, never
   * shown to the member. Always null under V1.
   */
  runnerUp?: ChamberExpertId | null;
  /**
   * V2-2, insufficient-evidence only (`primary: null`, `confidence:
   * "low"`, built from weak `possible` candidates): a single, plain-
   * language clarifying question using each candidate's
   * founderPlainLanguagePhrase — never expert names. Composer surfaces
   * this in place of a normal hint. Always null under V1.
   */
  clarifyingQuestion?: string | null;
};
