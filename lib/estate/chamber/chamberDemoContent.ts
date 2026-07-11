/**
 * Chamber of Momentum — demo member scenario and copy (Phase 8).
 */

export const CHAMBER_DEMO_MEMBER = {
  name: "Alex",
  profile:
    "Entrepreneur building a growing business — many ideas, several unfinished projects, needs clarity.",
} as const;

export const CHAMBER_DEMO_WELCOME = {
  title: `Welcome back, ${CHAMBER_DEMO_MEMBER.name}.`,
  subtitle:
    "You have a lot moving right now. Let's find the next thing that would help.",
} as const;

export const CHAMBER_DEMO_STUCK_OPENING =
  "I understand. Let's figure out what is slowing things down.";

export const CHAMBER_DEMO_STUCK_QUESTION = "What feels hardest right now?";

export const CHAMBER_DEMO_STUCK_OPTIONS = [
  "I don't know where to start",
  "There are too many things",
  "I need information",
  "I don't have enough time",
] as const;

export const CHAMBER_DEMO_WEBSITE_PROJECT = {
  name: "Launch New Website",
  goal: "Create a website that clearly explains my services.",
  nextAction: "Write the homepage headline",
  milestones: [
    "Define website message",
    "Create page structure",
    "Write first draft",
    "Review and improve",
    "Publish",
  ],
} as const;

export const CHAMBER_DEMO_WORKSHOP_IDEA =
  "Create a workshop for ADHD entrepreneurs.";

export const CHAMBER_DEMO_PROGRESS_WINS = [
  "Created first customer profile.",
  "Finished website outline.",
  "Reached out to first three prospects.",
] as const;

export const CHAMBER_DEMO_EVIDENCE = [
  {
    whatHappened: "I completed projects even when they felt overwhelming.",
    whatThisProves: "I can finish meaningful work.",
  },
  {
    whatHappened: "Customers responded positively to my work.",
    whatThisProves: "My offer resonates with real people.",
  },
  {
    whatHappened: "I learned new skills while building my business.",
    whatThisProves: "I am growing capability, not just checking boxes.",
  },
] as const;

export const CHAMBER_DEMO_MOMENTUM_PATH = {
  firstStep: "Write three sentences describing my offer.",
  easyWin: "Review one competitor website.",
  focusSession: "45 minutes creating homepage draft.",
  roadblock: "Perfectionism slowing progress.",
} as const;

export const CHAMBER_DEMO_LEARN_CARD = {
  title: "Creating Clear Offers",
  purpose: "Help entrepreneurs explain what they do.",
} as const;

export const CHAMBER_CELEBRATION_LINES = [
  "You moved this forward.",
  "That is momentum.",
] as const;

export function pickChamberCelebrationLine(seed = 0): string {
  const lines = CHAMBER_CELEBRATION_LINES;
  return lines[Math.abs(seed) % lines.length] ?? lines[0]!;
}
