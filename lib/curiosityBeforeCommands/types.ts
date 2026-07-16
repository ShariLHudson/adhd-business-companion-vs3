/**
 * Curiosity Before Commands — optional communication strategy.
 * Connect non-urgent actions to a meaningful benefit via a question,
 * never pressure-based commands. Not a universal ADHD rule.
 */

export type CuriosityBeforeCommandsMode =
  | "curiosity-usually"
  | "mix"
  | "direct"
  | "situational"
  | "unsure";

export type CuriosityBeforeCommandsPreference = {
  mode: CuriosityBeforeCommandsMode;
  savedAt: string;
  version: number;
};

export const CURIOSITY_BEFORE_COMMANDS_PREFS_KEY =
  "spark:curiosity-before-commands-prefs:v1" as const;

export const CURIOSITY_BEFORE_COMMANDS_CHANGE_EVENT =
  "spark:curiosity-before-commands-change" as const;

export type CuriosityPromptContext = {
  /** Short task or action name — never a command. */
  actionLabel: string;
  /** Member-stated or already-known benefit. Omit rather than invent. */
  knownBenefit?: string | null;
  /** Prefer a smaller slice of the work when true. */
  preferSmallStep?: boolean;
  /** Rotation seed so wording does not repeat mechanically. */
  variationSeed?: number | string;
  /** Urgent / safety / fixed calendar / member asked for direct. */
  forceDirect?: boolean;
  /** Another question would add decision fatigue. */
  avoidExtraQuestion?: boolean;
};

export type CuriosityModeOption = {
  id: CuriosityBeforeCommandsMode;
  label: string;
  description: string;
};

export const CURIOSITY_MODE_OPTIONS: CuriosityModeOption[] = [
  {
    id: "curiosity-usually",
    label: "Curiosity questions usually help",
    description:
      "When an action is optional, Shari often connects it to how it might help you feel or move forward.",
  },
  {
    id: "mix",
    label: "Mix questions and direct prompts",
    description:
      "Sometimes a curiosity question, sometimes a clear direct invitation — not every turn the same.",
  },
  {
    id: "direct",
    label: "Be direct with me",
    description:
      "Skip curiosity framing. Clear, kind prompts without feeling questions.",
  },
  {
    id: "situational",
    label: "Ask based on the situation",
    description:
      "Use curiosity when it fits; stay direct for time-sensitive or simple notices.",
  },
  {
    id: "unsure",
    label: "I’m not sure",
    description:
      "Spark will lean situational until you choose a clearer preference.",
  },
];
