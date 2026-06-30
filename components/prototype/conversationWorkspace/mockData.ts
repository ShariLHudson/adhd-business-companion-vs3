import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";

export const CONSERVATORY_BG = CLEAR_MY_MIND_CONSERVATORY_BG;

export type Line = {
  id: string;
  role: "shari" | "user";
  text: string;
};

export const GREETING = "Good morning, Shari.\nI'm glad you're here.";

export const WORK_PROMPT = "What would you like to work on today?";

export const OPENING_USER_HINT =
  "I want to create a marketing plan for my workshop.";

export const SHARI_AFTER_OPENING =
  "Wonderful.\nLet's build it together.\n\nFirst… who is this workshop for?";

export const SHARI_SECOND_QUESTION =
  "When they leave your workshop, what should feel different for them — in plain language?";

export const SHARI_THIRD_QUESTION =
  "What would make the right person feel relief in the first sentence of your invitation?";

export const ORGANIZING_LINE = "I've started organizing our ideas.";

export const SHARI_FOURTH_QUESTION =
  "If someone only read one line about this workshop, what promise would make them lean in?";

export const STUCK_RESPONSE =
  "That's perfectly okay.\n\nWould one of these help?";

export const STUCK_OPTIONS = [
  { id: "easier", label: "Ask an easier question" },
  { id: "research", label: "Research this for me" },
  { id: "examples", label: "Show examples" },
  { id: "skip", label: "Skip it and come back later" },
] as const;

export const PROACTIVE_OBSERVATION =
  "I've noticed something.\n\nYou seem very clear about who you want to help.\nBut less certain about how to describe the transformation.\n\nWould it help if I researched how similar workshops position themselves?";

export const RESEARCH_STATES = [
  "Researching current workshop positioning…",
  "Reviewing messaging…",
  "Looking for opportunities…",
] as const;

export const RESEARCH_SUMMARY =
  "What keeps showing up: people respond when the promise names relief — one clear next move — not another system to learn.\n\nThat might be worth leading with.";

export const SHARI_AFTER_RESEARCH =
  "Given that… how would you describe the transformation in one calm sentence?";

export const COMPLETION_LEAD =
  "I think we've created something really solid.";

export const NOTEBOOK_TITLE = "Workshop Marketing Plan";

export type NotebookSection = {
  id: string;
  label: string;
  text: string;
  complete?: boolean;
};

export const NOTEBOOK_GROWTH: Record<number, NotebookSection[]> = {
  0: [],
  1: [],
  2: [
    {
      id: "audience",
      label: "Audience",
      text: "ADHD entrepreneurs who feel overwhelmed organizing and growing their business.",
    },
  ],
  3: [
    {
      id: "audience",
      label: "Audience",
      text: "ADHD entrepreneurs who feel overwhelmed organizing and growing their business.",
    },
    {
      id: "summary",
      label: "Summary",
      text: "A focused workshop for clarity — not another pile of tactics.",
    },
  ],
  4: [
    {
      id: "audience",
      label: "Audience",
      text: "ADHD entrepreneurs who feel overwhelmed organizing and growing their business.",
    },
    {
      id: "summary",
      label: "Summary",
      text: "A focused workshop for clarity — not another pile of tactics.",
    },
    {
      id: "transformation",
      label: "Transformation",
      text: "Leave with one clear next business move and calm momentum.",
    },
  ],
};

export const NOTEBOOK_COMPLETE: NotebookSection[] = [
  {
    id: "audience",
    label: "Audience",
    text: "ADHD entrepreneurs who feel overwhelmed organizing and growing their business.",
    complete: true,
  },
  {
    id: "transformation",
    label: "Transformation",
    text: "Choose their next best move and leave with one action plan they can follow.",
    complete: true,
  },
  {
    id: "message",
    label: "Core Message",
    text: "One clear next move — without the shame spiral.",
    complete: true,
  },
  {
    id: "positioning",
    label: "Positioning",
    text: "Relief first. Logistics second. Trust through specificity.",
    complete: true,
  },
];

export const COMPLETION_OPTIONS = [
  { id: "refine", label: "Continue refining" },
  { id: "review", label: "Review together" },
  { id: "generate", label: "Generate finished marketing plan" },
  { id: "save", label: "Save for today" },
  { id: "export", label: "Print or Export" },
] as const;

export const COMPLETION_REPLIES: Record<string, string> = {
  refine: "Of course. What part still feels fuzzy?",
  review: "Let's read it aloud together — I'll start with the promise.",
  generate: "I'll shape a finished plan from what we've built. One moment.",
  save: "Saved for today. The room will be here when you return.",
  export: "I'll prepare something you can print or share — gently, no rush.",
};
