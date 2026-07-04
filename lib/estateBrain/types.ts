/**
 * Estate Brain™ — internal knowledge schema for Spark (not member-facing copy).
 *
 * One authoritative object per experience and space. Chat, routing, menus,
 * suggestions, and onboarding all read from here.
 *
 * @see docs/estate/ESTATE_BRAIN.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateExperienceId } from "@/lib/estateExperiences/types";

export type EstateKnowledgeKind = "experience" | "space";

/** Member emotional / situational signals for discovery search */
export type EstateKnowledgeUserNeed =
  | "overwhelmed"
  | "anxious"
  | "stressed"
  | "calm"
  | "focus"
  | "business"
  | "creative"
  | "reflective"
  | "celebrate"
  | "learn"
  | "decide"
  | "rest"
  | "play"
  | "orient";

export type EstateKnowledgeEntry = {
  /** Stable id — experience id or canonical place id */
  id: string;
  kind: EstateKnowledgeKind;
  /** Member-facing name */
  name: string;
  /** One-line why this exists */
  purpose: string;
  /** Internal description for Spark reasoning */
  description: string;
  /** Parent experience when kind is space */
  experienceId: EstateExperienceId;
  /** Canonical place id for navigation */
  spaceId: string;
  /** Primary AppSection when opening a tool */
  primarySection?: AppSection;
  /** What members can accomplish here */
  capabilities: readonly string[];
  /** Gentle activity labels — not a menu */
  suggestedActivities: readonly string[];
  /** Named tools inside this space */
  tools: readonly string[];
  /** Related canonical place ids */
  relatedSpaceIds: readonly string[];
  /** Natural-language triggers for search and routing */
  triggers: readonly string[];
  /** Alternate names members might say */
  aliases: readonly string[];
  /** Default arrival greeting */
  defaultGreeting: string;
  /** Cross-place or completion suggestions */
  nextSuggestions: readonly string[];
  /** Situational discovery buckets */
  userNeeds?: readonly EstateKnowledgeUserNeed[];
};

export type EstateBrainSearchMatch = {
  entry: EstateKnowledgeEntry;
  score: number;
  reasons: string[];
};

export type EstateBrainSearchResult = {
  query: string;
  matches: EstateBrainSearchMatch[];
  best: EstateBrainSearchMatch | null;
};
