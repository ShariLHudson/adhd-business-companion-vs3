/**
 * Conversation Drives Navigation™ — types.
 *
 * Member expresses a need → Spark understands → gentle Estate environment offer.
 * Not click-navigation. Spec 108: invitation only; member stays or moves.
 */

import type { EstateDirectoryEntry } from "../directory/types";

/** Member-expressed environmental need — maps to canonical place ids via lexicon. */
export type EnvironmentNeedId =
  | "quieter"
  | "think"
  | "fresh-air"
  | "focus"
  | "relax"
  | "inspiration"
  | "journal";

export type EnvironmentNeedDefinition = {
  id: EnvironmentNeedId;
  /** Internal label — not member-facing */
  label: string;
  /** Detection patterns — first match wins among needs */
  patterns: readonly RegExp[];
  /**
   * Canonical place ids in display order (max 3 shown).
   * Must exist in Estate Directory.
   */
  placeIds: readonly string[];
  /** Warm intro when offering places — Shari test */
  offerIntro: string;
};

export type ConversationEnvironmentEvaluation = {
  detected: boolean;
  needId: EnvironmentNeedId | null;
  /** Up to 3 canonical place ids from Estate Directory */
  suggestedPlaceIds: readonly string[];
  /** Resolved directory entries — for UI / room profiles */
  suggestedPlaces: readonly EstateDirectoryEntry[];
  confidence: number;
  reasoning: string;
  /** Member-facing menu line (numbered places) when detected */
  offerLine: string | null;
};

/** Below this — offer only; at or above — may suggest primary with higher confidence */
export const ENVIRONMENT_NEED_OFFER_CONFIDENCE = 0.55;

export const ENVIRONMENT_NEED_MAX_SUGGESTIONS = 3;
