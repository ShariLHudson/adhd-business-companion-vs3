/**
 * Authentic Shared Experience — Shari may briefly relate genuine struggle,
 * never assume the member's experience matches hers.
 *
 * Shared experience, not shared identity.
 */

export const SHARED_EXPERIENCE_GOVERNING_PRINCIPLE =
  "Shared experience, not shared identity." as const;

export const SHARED_EXPERIENCE_HUMILITY_LINE =
  "This has helped me. It may or may not fit you — but if you'd like, we can try it together." as const;

export type SharedExperienceTheme =
  | "focus"
  | "perfectionism"
  | "overwhelm"
  | "research_confidence"
  | "creativity_stuck"
  | "finishing"
  | "scattered_thoughts"
  | "decision_fatigue"
  | "starting_tasks";

export type SharedExperienceBridge = {
  id: string;
  theme: SharedExperienceTheme;
  /** Member struggle signals — not information requests */
  triggers: readonly RegExp[];
  /** 1–2 sentences, first person, founder-authored */
  relate: string;
  /** Required — offer as possibility, not prescription */
  humilityFrame: string;
  /** Practical options Shari has used — member chooses */
  helpfulOffers: readonly string[];
  /** One warm question; member remains focus */
  inviteQuestion: string;
  mentionsAdhd?: boolean;
};

export type SharedExperienceDecision = {
  allowed: boolean;
  bridge: SharedExperienceBridge | null;
  reason: string;
};

export type EvaluateSharedExperienceInput = {
  userText: string;
  /** Bridge ids used recently — caller may persist; skip repeat when provided */
  recentBridgeIds?: readonly string[];
  /** When true, suppress even if struggle signals match (e.g. mid-creation) */
  momentumLocked?: boolean;
};
