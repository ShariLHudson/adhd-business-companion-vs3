/**
 * Estate Experiences™ — intent layer above spaces and tools.
 *
 * Estate Space = visual environment (canonical place id)
 * Experience = what the member is trying to accomplish
 * Tool = workspace panel / object that opens inside the experience
 */

import type { AppSection } from "@/lib/companionUi";

export type EstateExperienceId =
  | "create"
  | "momentum"
  | "focus"
  | "restore"
  | "think"
  | "journal"
  | "grow"
  | "play"
  | "business"
  | "explore";

/** Canonical estate place id — the photographed environment */
export type EstateSpaceId = string;

export type EstateExperienceDefinition = {
  id: EstateExperienceId;
  /** Member-facing name */
  name: string;
  emoji: string;
  /** Asked on arrival when intent is clear but tool is not */
  arrivalPrompt: string;
  purpose: string;
  /** Default space when routing this experience */
  defaultSpaceId: EstateSpaceId;
  /** Short suggestions shown on arrival — not a menu */
  arrivalSuggestions: readonly string[];
  /**
   * Tools that can open inside this experience (labels for routing/catalog).
   * Not every tool is built yet — registry is the north star.
   */
  tools: readonly string[];
};

export type EstateNavigationConfidence = "high" | "medium" | "low";

/** One option when more than one experience fits (max 3 — T-003). */
export type EstateNavigationChoice = {
  experienceId: EstateExperienceId;
  headline: string;
  detail: string;
  spaceId: EstateSpaceId;
};

export type EstateNavigationDisambiguation = {
  confidence: "medium";
  intro: string;
  choices: readonly [EstateNavigationChoice, EstateNavigationChoice, EstateNavigationChoice];
};

export type EstateNavigationDiscovery = {
  confidence: "low";
  intro: string;
  question: string;
};

/** Gentle cross-place invite — "You might also enjoy…" / "While you're here…" */
export type EstateCrossSuggestion = {
  tone: "you_might_also_enjoy" | "while_youre_here";
  label: string;
  targetSpaceId: EstateSpaceId;
  experienceId?: EstateExperienceId;
};

export type EstateSpacePersonality = {
  spaceId: EstateSpaceId;
  experienceId: EstateExperienceId;
  arrivalPrompt: string;
  arrivalSuggestions: readonly string[];
};

/** Resolved route: experience → space → optional tool */
export type EstateExperienceRoute = {
  experienceId: EstateExperienceId;
  spaceId: EstateSpaceId;
  toolSection?: AppSection;
};
