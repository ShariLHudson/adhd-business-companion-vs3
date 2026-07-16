/**
 * Support Style — how Spark helps when the member needs support.
 * Separate from Conversation Style (wording/tone) and Planning Preferences.
 */

export type SupportStyleId =
  | "gentle-first"
  | "practical-first"
  | "talk-it-through"
  | "step-by-step"
  | "give-me-choices"
  | "adaptive"
  | "custom";

export type OverwhelmedStart =
  | "reassurance"
  | "one-next-step"
  | "few-choices"
  | "a-question"
  | "calming-reset";

export type StuckHelp =
  | "break-down"
  | "help-choose"
  | "show-example"
  | "work-alongside"
  | "remind-why";

export type DiscouragedHelp =
  | "acknowledge"
  | "show-progress"
  | "smaller-goal"
  | "let-me-talk"
  | "practical-restart";

export type ChoiceCountPref = "one" | "two" | "three" | "ask";

export type EncouragementLevel = "minimal" | "natural" | "extra-when-struggling";

export type SupportStyleCustomSettings = {
  overwhelmedStart?: OverwhelmedStart;
  stuckHelp?: StuckHelp[];
  discouragedHelp?: DiscouragedHelp[];
  choiceCount?: ChoiceCountPref;
  encouragementLevel?: EncouragementLevel;
};

export type SupportStylePreference = {
  styleId: SupportStyleId;
  customSettings?: SupportStyleCustomSettings;
  /** Quiet default: use this most of the time; temporary asks may override. */
  useMostOfTheTime: boolean;
  savedAt: string;
  version: number;
};

/** Session-only override — never written to saved preference unless asked. */
export type SupportStyleTemporaryOverride = {
  styleId: SupportStyleId;
  reason: string;
};

export const SUPPORT_STYLE_PREFS_KEY = "spark:support-style-prefs:v1" as const;
export const SUPPORT_STYLE_CHANGE_EVENT = "spark:support-style-change" as const;

export const SUPPORT_STYLE_SAMPLE_STATEMENT =
  "I have too much to do and do not know where to start." as const;

export type SupportStyleCatalogEntry = {
  id: SupportStyleId;
  label: string;
  summary: string;
  bestFor: string;
  example: string;
  preview: string;
};

export const SUPPORT_STYLE_CATALOG: SupportStyleCatalogEntry[] = [
  {
    id: "gentle-first",
    label: "Gentle First",
    summary:
      "Begin by acknowledging how I feel and reducing pressure before suggesting what to do.",
    bestFor: "Best when you need emotional safety before action.",
    example:
      "That sounds like a lot to carry. We do not need to solve everything right now. Let’s choose one small thing that may make this easier.",
    preview:
      "That sounds like a lot to hold at once. We do not need to sort everything right now. Let’s make the next few minutes easier by getting the tasks out of your head first.",
  },
  {
    id: "practical-first",
    label: "Practical First",
    summary:
      "Give me a clear, useful next step quickly, with only a little reassurance.",
    bestFor: "Best when you feel better once you know what to do.",
    example:
      "Let’s get the tasks out of your head first. Open Clear My Mind, or we can list them here.",
    preview:
      "Start by listing everything you need to remember. We can do that in Clear My Mind or right here.",
  },
  {
    id: "talk-it-through",
    label: "Talk It Through",
    summary: "Help me understand what is happening before moving into solutions.",
    bestFor: "Best when you need to process before deciding.",
    example:
      "It sounds like several things may be competing for your attention. Which part feels hardest right now: remembering everything, choosing what matters, or getting started?",
    preview:
      "It sounds like the problem may be either too many tasks, unclear priorities, or not knowing the first step. Which one feels closest?",
  },
  {
    id: "step-by-step",
    label: "Guide Me Step by Step",
    summary:
      "Ask one question at a time and lead me through the next small action.",
    bestFor: "Best when full plans or several questions overwhelm you.",
    example:
      "We will take this one step at a time. First, what is the one task creating the most pressure?",
    preview:
      "We’ll take this one step at a time. First, type the task that feels most urgent.",
  },
  {
    id: "give-me-choices",
    label: "Give Me Choices",
    summary:
      "Offer a few clear options so I can choose the kind of help I want.",
    bestFor:
      "Best when you want control but do not want to invent the next step yourself.",
    example:
      "What would help most right now?\n1. Clear my head\n2. Lighten today’s plan\n3. Break down one task\n4. Stay here and talk",
    preview:
      "Which would help most?\n1. Clear everything out of my head\n2. Choose one priority\n3. Make today’s plan smaller",
  },
  {
    id: "adaptive",
    label: "Adapt to the Situation",
    summary:
      "Use the kind of support that appears most helpful based on what I say, while keeping the response simple.",
    bestFor: "Best when you want Spark to match the moment — still simply.",
    example:
      "You sound mentally overloaded, so I’m suggesting we get everything out of your head before planning.",
    preview:
      "You sound mentally overloaded, so I’d start by getting everything out of your head before deciding what comes first. Would you like to do that here or in Clear My Mind?",
  },
  {
    id: "custom",
    label: "Create My Own Support Style",
    summary: "Choose how Spark should start when you’re overwhelmed, stuck, or discouraged.",
    bestFor: "Best when the presets don’t quite fit.",
    example: "Built from the choices you save below.",
    preview:
      "I’ll follow the custom support choices you saved — starting with what you asked for when things feel heavy.",
  },
];

export function catalogEntryForStyle(
  id: SupportStyleId,
): SupportStyleCatalogEntry {
  return (
    SUPPORT_STYLE_CATALOG.find((entry) => entry.id === id) ??
    SUPPORT_STYLE_CATALOG.find((entry) => entry.id === "adaptive")!
  );
}
