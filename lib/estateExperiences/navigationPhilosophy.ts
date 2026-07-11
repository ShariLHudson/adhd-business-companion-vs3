/**
 * Spark Estate Navigation Philosophy — operating system for routing.
 *
 * The user should never need to know where a feature lives. Spark knows the Estate.
 * The member shares what they want to accomplish. Spark guides them to the most
 * appropriate space, offers alternatives when more than one fits, and naturally
 * suggests the next best place when it adds value.
 */

export const ESTATE_NAVIGATION_GOLDEN_RULE =
  "The user should never need to know where a feature lives. Spark knows the Estate. The user simply shares what they want to accomplish. Spark guides them to the most appropriate space, offers alternatives when more than one space fits, and naturally suggests the next best place when it adds value.";

/**
 * When adding capability, ask:
 * "What is the user trying to accomplish, and where in the Estate would that feel most natural?"
 * — not "Which menu should this go under?"
 */
import { ESTATE_LEGACY_MIGRATION_FREEZE } from "./legacyWorkspaceMap";

export const ESTATE_NAVIGATION_FEATURE_GATE_QUESTION =
  "What is the user trying to accomplish, and where in the Estate would that feel most natural?";

/** @see docs/estate/ESTATE_REGISTRY.md */
export { ESTATE_LEGACY_MIGRATION_FREEZE };

/** Three-level confidence decision tree */
export const ESTATE_NAVIGATION_CONFIDENCE_LEVELS = {
  high: {
    label: "High confidence",
    behavior:
      "Navigate immediately — open the right experience, space, and tool. No confirmation.",
    example: '"Help me write an email." → Create + Email Builder',
  },
  medium: {
    label: "Medium confidence",
    behavior:
      "Offer two or three good possibilities — member chooses. Never more than three.",
    example:
      '"I need to work on my business." → Momentum · Create · Boardroom',
  },
  low: {
    label: "Low confidence",
    behavior:
      "Figure it out together — one thoughtful question before suggesting a space.",
    example:
      '"I don\'t know where to start." → collaborative discovery',
  },
} as const;

export const ESTATE_CROSS_SUGGESTION_TONES = {
  you_might_also_enjoy: "You might also enjoy…",
  while_youre_here: "While you're here…",
} as const;
