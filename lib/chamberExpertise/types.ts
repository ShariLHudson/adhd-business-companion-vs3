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

export type ChamberExpertConfidence = "high" | "medium" | "low";

/** Per-expert signal computation for one activation request (debug/testable). */
export type ChamberExpertSignalResult = {
  id: ChamberExpertId;
  score: number;
  signalGroupsMatched: number;
  topicMatch: boolean;
  intentMatch: boolean;
  estateCategoryMatch: boolean;
  estateExpertIdMatch: boolean;
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
};
