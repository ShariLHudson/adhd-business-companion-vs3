import type {
  FlameChallenge,
  FlameEncouragement,
  FlameExecutiveObservation,
  FlameMorningMessage,
  FlameMentorPanel,
  FlameSuggestedQuestion,
  FlameWeeklyReflection,
} from "../types";

export const FLAME_MORNING_MESSAGES: FlameMorningMessage[] = [
  {
    id: "flame-am-1",
    text: "Yesterday you completed several important foundations. Today I recommend building on that momentum — one deliberate move at a time.",
    recordedAt: "2026-07-06T06:00:00.000Z",
  },
  {
    id: "flame-am-2",
    text: "I noticed you've been spending considerable time building. Before continuing, it may be worth reviewing your strategy in the Executive Strategy Center.",
    recordedAt: "2026-07-05T06:00:00.000Z",
  },
  {
    id: "flame-am-3",
    text: "The office is prepared. You do not need to decide everything at once — begin where the work feels most honest.",
    recordedAt: "2026-07-04T06:00:00.000Z",
  },
];

export const FLAME_OBSERVATIONS: FlameExecutiveObservation[] = [
  {
    id: "flame-obs-1",
    category: "progress",
    observation:
      "Founder Studio now has memory, strategy, and concierge layers — the company story has a home.",
    notedAt: "2026-07-06T08:00:00.000Z",
  },
  {
    id: "flame-obs-2",
    category: "focus",
    observation:
      "Your attention has stayed on relationship quality over feature volume — that discipline is rare and worth protecting.",
    notedAt: "2026-07-05T08:00:00.000Z",
  },
  {
    id: "flame-obs-3",
    category: "momentum",
    observation:
      "Phases are shipping in sequence rather than in parallel chaos — momentum is quiet, not frantic.",
    notedAt: "2026-07-04T08:00:00.000Z",
  },
  {
    id: "flame-obs-4",
    category: "decision-making",
    observation:
      "You are recording why decisions happen, not only what was decided — that is institutional wisdom.",
    notedAt: "2026-07-03T08:00:00.000Z",
  },
];

export const FLAME_ENCOURAGEMENTS: FlameEncouragement[] = [
  {
    id: "flame-enc-1",
    text: "You are building something that will outlast any single feature. Stay with the long view.",
  },
  {
    id: "flame-enc-2",
    text: "The relationship product is real — members feel presence. Trust that direction.",
  },
  {
    id: "flame-enc-3",
    text: "Calm execution is not slow execution. You are choosing well.",
  },
];

export const FLAME_CHALLENGES: FlameChallenge[] = [
  {
    id: "flame-ch-1",
    text: "Before adding anything new, ask whether it strengthens how members feel — not only what they can do.",
  },
  {
    id: "flame-ch-2",
    text: "One decision on the vault today — written with full reasoning — matters more than five half-captured notes.",
  },
];

export const FLAME_QUESTIONS: FlameSuggestedQuestion[] = [
  { id: "flame-q-1", question: "What problem are we really trying to solve?" },
  { id: "flame-q-2", question: "If this succeeds, what changes for the member?" },
  { id: "flame-q-3", question: "What would delight members without adding complexity?" },
  { id: "flame-q-4", question: "What could we simplify without losing the soul of Spark?" },
  { id: "flame-q-5", question: "What would future Shari thank you for deciding today?" },
];

export const FLAME_WEEKLY_REFLECTIONS: FlameWeeklyReflection[] = [
  {
    id: "flame-wk-1",
    weekLabel: "Week of July 6, 2026",
    wins: [
      "Executive Strategy Center and Decision Vault shipped",
      "Concierge prepares the office without asking what to do",
      "Conversation architecture protected in Observation Mode",
    ],
    lessons: [
      "Environment before intelligence — again",
      "One primary message reduces executive fatigue",
    ],
    patterns: [
      "You build institutional layers before automation",
      "Relationship quality gates every release",
    ],
    ideasWorthRevisiting: [
      "Workshop transformation narrative",
      "Founder access on production",
    ],
    futureOpportunities: [
      "Live FLAME perspectives in Strategy Center",
      "Decision Vault connected to real session history",
    ],
  },
];

export const FLAME_PANEL_POOL: FlameMentorPanel[] = [
  {
    id: "panel-perspective-1",
    kind: "perspective",
    title: "Today's Perspective",
    body: "Spark wins when members leave more capable — not more busy. Hold that standard in every build decision today.",
  },
  {
    id: "panel-perspective-2",
    kind: "perspective",
    title: "Today's Perspective",
    body: "The estate is not decoration — it is part of cognition. Places should earn their place in how you think.",
  },
  {
    id: "panel-question-1",
    kind: "question",
    title: "Question Worth Considering",
    body: "If this succeeds, what changes for the member — not for the product roadmap slide?",
  },
  {
    id: "panel-question-2",
    kind: "question",
    title: "Question Worth Considering",
    body: "What could we simplify without losing what makes Spark feel like home?",
  },
  {
    id: "panel-encourage-1",
    kind: "encouragement",
    title: "Encouragement",
    body: "You have already done the hard work of choosing relationship over novelty. That choice compounds.",
  },
  {
    id: "panel-encourage-2",
    kind: "encouragement",
    title: "Encouragement",
    body: "Quiet progress is still progress. The office you are building will matter for years.",
  },
  {
    id: "panel-long-1",
    kind: "long-term",
    title: "Long-Term Thinking",
    body: "Visual Spark Studios is assembling institutional memory — decisions, lessons, and story. That archive becomes irreplaceable.",
  },
  {
    id: "panel-long-2",
    kind: "long-term",
    title: "Long-Term Thinking",
    body: "FLAME will eventually reason here. For now, the mentor voice you are shaping is the standard the intelligence must meet.",
  },
];

/** Deterministic daily rotation — sample only, no analytics. */
export function flameDayIndex(length: number, date = new Date()): number {
  if (length <= 0) return 0;
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return dayOfYear % length;
}

export function pickFlame<T>(items: readonly T[], date = new Date()): T {
  return items[flameDayIndex(items.length, date)]!;
}

export function pickFlamePanels(date = new Date()): FlameMentorPanel[] {
  const kinds: FlameMentorPanel["kind"][] = [
    "perspective",
    "question",
    "encouragement",
    "long-term",
  ];
  return kinds.map((kind) => {
    const pool = FLAME_PANEL_POOL.filter((panel) => panel.kind === kind);
    const index = flameDayIndex(pool.length, date);
    return pool[index] ?? pool[0]!;
  });
}
