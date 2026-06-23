/**
 * ADHD entrepreneur focus tools — one job each. Shari and UI copy pull from here
 * so Clear My Mind, Brain Parking Lot, and Safe For Today never blur together.
 */

import type { AppSection } from "./companionUi";

export type FocusClarityToolId =
  | "clear-my-mind"
  | "brain-parking-lot"
  | "safe-for-today"
  | "adjust-my-day"
  | "spin-the-wheel";

export type FocusClarityTool = {
  id: FocusClarityToolId;
  title: string;
  tagline: string;
  problem: string;
  useWhen: string[];
  whatItDoes: string[];
  question: string;
  result: string;
};

export const FOCUS_CLARITY_TOOLS: Record<FocusClarityToolId, FocusClarityTool> = {
  "clear-my-mind": {
    id: "clear-my-mind",
    title: "Clear My Mind",
    tagline: "Get this out of my head.",
    problem: "My brain is crowded.",
    useWhen: [
      "Too many thoughts",
      "Overwhelmed",
      "Mental clutter",
      "Can't think straight",
      "Everything feels important",
    ],
    whatItDoes: [
      "Brain dump",
      "Organizes thoughts",
      "Groups similar ideas",
      "Finds priorities",
      "Creates next steps",
    ],
    question: "What's taking up space in your head right now?",
    result: "Clarity",
  },
  "brain-parking-lot": {
    id: "brain-parking-lot",
    title: "Brain Parking Lot",
    tagline: "Save this for later.",
    problem: "I need to focus, but new ideas keep showing up.",
    useWhen: [
      "Working on something",
      "New idea pops up",
      "Don't want to lose it",
      "Need to stay on task",
    ],
    whatItDoes: [
      "Stores ideas quickly",
      "Tags them",
      "Saves them for later review",
      "Doesn't organize them now",
    ],
    question: "What do you want to save for later?",
    result: "Focus",
  },
  "safe-for-today": {
    id: "safe-for-today",
    title: "Safe For Today",
    tagline: "I'm intentionally not doing this today.",
    problem: "I can't deal with this today.",
    useWhen: [
      "Emotional overwhelm",
      "Guilt",
      "Shame",
      "Pressure",
      "Too many responsibilities",
    ],
    whatItDoes: [
      "Gives permission to postpone",
      "Moves item to a future date",
      "Removes pressure",
      "Creates a reminder",
    ],
    question:
      "What are you giving yourself permission not to solve today?",
    result: "Relief",
  },
  "adjust-my-day": {
    id: "adjust-my-day",
    title: "Adapt My Day",
    tagline: "Rebuild today's plan.",
    problem: "My plan isn't working.",
    useWhen: [
      "Behind schedule",
      "Energy crashed",
      "Unexpected interruption",
      "Day went sideways",
    ],
    whatItDoes: [
      "Tunes plan to real energy",
      "Shrinks today's scope",
      "Re-prioritizes one realistic win",
    ],
    question: "What actually fits your energy right now?",
    result: "A new realistic plan",
  },
  "spin-the-wheel": {
    id: "spin-the-wheel",
    title: "Spin The Wheel",
    tagline: "Pick a starting point.",
    problem: "I can't decide where to start.",
    useWhen: [
      "Everything feels equally important",
      "Paralysis between options",
      "Need momentum without deciding",
    ],
    whatItDoes: [
      "Picks one real item from your lists",
      "Removes the decision burden",
      "Offers a gentle next step",
    ],
    question: "Ready to let the wheel choose one thing?",
    result: "Momentum",
  },
};

export type HelpMeRightNowMenuId =
  | "adjust-my-day"
  | "clear-my-mind"
  | "brain-parking-lot"
  | "safe-for-today"
  | "decision-compass"
  | "focus-session";

export type HelpMeRightNowMenuItem = {
  id: HelpMeRightNowMenuId;
  title: string;
  purpose: string;
  emoji: string;
  kind: "section" | "activity";
  section?: AppSection;
  activityId?: string;
};

/** Immediate relief — not games, spin, or deep guided exercises. */
export const HELP_ME_RIGHT_NOW_MENU: HelpMeRightNowMenuItem[] = [
  {
    id: "adjust-my-day",
    title: "Adapt My Day",
    purpose: "Rebuild today's plan",
    emoji: "⚡",
    kind: "section",
    section: "plan-my-day",
  },
  {
    id: "brain-parking-lot",
    title: "Brain Parking Lot",
    purpose: "Save ideas while staying focused",
    emoji: "📌",
    kind: "activity",
    activityId: "brain-parking-lot",
  },
  {
    id: "clear-my-mind",
    title: "Clear My Mind",
    purpose: "Reduce mental clutter",
    emoji: "🧠",
    kind: "section",
    section: "brain-dump",
  },
  {
    id: "safe-for-today",
    title: "Safe For Today",
    purpose: "Release pressure",
    emoji: "🛡",
    kind: "activity",
    activityId: "safe-for-today",
  },
  {
    id: "focus-session",
    title: "Focus Session",
    purpose: "Stay engaged",
    emoji: "🎯",
    kind: "section",
    section: "focus-timer",
  },
  {
    id: "decision-compass",
    title: "ADHD Decision Compass",
    purpose: "Work through a decision with visual thinking beside chat",
    emoji: "🧭",
    kind: "activity",
    activityId: "decision-compass",
  },
];

export function focusToolById(id: FocusClarityToolId): FocusClarityTool {
  return FOCUS_CLARITY_TOOLS[id];
}

/** Shari must route to the right tool — never conflate parking lot with Clear My Mind. */
export function focusToolDifferentiationHintForChat(): string {
  const cm = FOCUS_CLARITY_TOOLS["clear-my-mind"];
  const pl = FOCUS_CLARITY_TOOLS["brain-parking-lot"];
  const sf = FOCUS_CLARITY_TOOLS["safe-for-today"];
  const adj = FOCUS_CLARITY_TOOLS["adjust-my-day"];
  const spin = FOCUS_CLARITY_TOOLS["spin-the-wheel"];

  return [
    "FOCUS TOOL ROUTING (mandatory — each tool solves a different problem):",
    `- **${cm.title}** (${cm.tagline}): crowded head, mental clutter, too many thoughts → organize, group, prioritize, next steps. Question: "${cm.question}"`,
    `- **${pl.title}** (${pl.tagline}): mid-focus idea interruption → quick save/tag for later — NO sorting or solving now. Question: "${pl.question}"`,
    `- **${sf.title}** (${sf.tagline}): guilt/shame/pressure — permission to postpone, not a brain dump. Question: "${sf.question}"`,
    `- **${adj.title}**: plan broke, energy crashed, day sideways → rebuild today's plan.`,
    `- **${spin.title}**: can't pick where to start → wheel chooses one item.`,
    "Never tell someone to use Clear My Mind when they only need to park one idea while working.",
    "Never use Safe For Today as a worry list or brain dump.",
  ].join("\n");
}
