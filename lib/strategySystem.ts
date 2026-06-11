// The Strategy system — the front half of the 4-layer model.
//   Category (navigation only) → Strategy (actionable) → Execution (tools).
// Categories are NOT advice; they only help the user say "this is my problem
// area." Strategies are short and action-first: a problem, when to use it, and
// 1–3 concrete steps. No theory, no filler.

export type StrategyCategory = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  blurb: string; // one line — what this area is, navigation only
};

export type Strategy = {
  id: string;
  categoryId: string;
  title: string;
  problem: string; // the problem it solves
  whenToUse: string; // when to reach for it
  steps: string[]; // 1–3 steps, max
  recommended?: boolean; // surfaced first on the category page
};

export const STRATEGY_CATEGORIES: StrategyCategory[] = [
  {
    id: "mindset",
    label: "Mindset & Growth",
    emoji: "🌱",
    color: "#6b8e23",
    blurb: "Motivation, focus, and how you relate to your goals.",
  },
  {
    id: "procrastination",
    label: "Procrastination",
    emoji: "🐢",
    color: "#a85c4a",
    blurb: "When starting feels impossible.",
  },
  {
    id: "perfectionism",
    label: "Perfectionism",
    emoji: "💎",
    color: "#9a6fb0",
    blurb: "When nothing ever feels finished.",
  },
  {
    id: "marketing",
    label: "Marketing",
    emoji: "📣",
    color: "#c08a3e",
    blurb: "Getting seen by the right people.",
  },
  {
    id: "sales",
    label: "Sales & Revenue",
    emoji: "💰",
    color: "#1e4f4f",
    blurb: "Turning interest into income.",
  },
  {
    id: "clients",
    label: "Customer Relations",
    emoji: "🤝",
    color: "#2f4f7a",
    blurb: "Keeping the clients you have happy.",
  },
];

export const STRATEGIES: Strategy[] = [
  // ---- Procrastination ----
  {
    id: "two-minute-start",
    categoryId: "procrastination",
    title: "Two-Minute Start",
    problem: "Starting feels impossible, so you keep avoiding it.",
    whenToUse: "Any task you've been putting off.",
    steps: [
      "Pick the one task.",
      "Do only the first 2 minutes of it.",
      "Stop if you want — usually you won't want to.",
    ],
    recommended: true,
  },
  {
    id: "shrink-first-step",
    categoryId: "procrastination",
    title: "Shrink the First Step",
    problem: "The task feels too big to begin.",
    whenToUse: "When scope is overwhelming you.",
    steps: [
      "Name the very first physical action.",
      "Make it absurdly small.",
      "Do just that — nothing else.",
    ],
    recommended: true,
  },
  {
    id: "body-double",
    categoryId: "procrastination",
    title: "Body Double",
    problem: "You can't get going alone.",
    whenToUse: "Low accountability, easily distracted.",
    steps: [
      "Get a person present (in room or on video).",
      "Tell them the one thing you'll do.",
      "Start while they're there.",
    ],
  },

  // ---- Perfectionism ----
  {
    id: "good-enough-bar",
    categoryId: "perfectionism",
    title: "Good-Enough Bar",
    problem: "Nothing ever feels finished.",
    whenToUse: "When you're editing something forever.",
    steps: [
      "Decide what 'done' means before you start.",
      "Set a time limit.",
      "Ship it at the limit.",
    ],
    recommended: true,
  },
  {
    id: "ugly-first-draft",
    categoryId: "perfectionism",
    title: "Ugly First Draft",
    problem: "The blank page paralyzes you.",
    whenToUse: "When you can't start creating.",
    steps: [
      "Give yourself permission for it to be bad.",
      "Produce a rough version fast.",
      "Refine later — not now.",
    ],
    recommended: true,
  },
  {
    id: "eighty-percent-ship",
    categoryId: "perfectionism",
    title: "80% Ship",
    problem: "You over-polish past the point it matters.",
    whenToUse: "Diminishing returns on a task.",
    steps: [
      "Get it to 80%.",
      "Ask: does this actually work?",
      "If yes, release it.",
    ],
  },

  // ---- Mindset & Growth ----
  {
    id: "one-hard-thing",
    categoryId: "mindset",
    title: "One Hard Thing",
    problem: "Effort is scattered across too much.",
    whenToUse: "Too many goals, no traction.",
    steps: [
      "Pick the single most important thing today.",
      "Protect 25 minutes for it.",
      "Let the rest wait.",
    ],
    recommended: true,
  },
  {
    id: "win-journal",
    categoryId: "mindset",
    title: "Win Journal",
    problem: "You always feel behind.",
    whenToUse: "Low motivation, can't see progress.",
    steps: [
      "Write 3 things you did today.",
      "Read yesterday's three.",
      "Notice the momentum.",
    ],
    recommended: true,
  },
  {
    id: "future-self-check",
    categoryId: "mindset",
    title: "Future Self Check",
    problem: "Short-term avoidance wins.",
    whenToUse: "When you're dodging something that matters.",
    steps: [
      "Ask what future-you will need.",
      "Do the smallest version of it now.",
    ],
  },

  // ---- Marketing ----
  {
    id: "one-channel",
    categoryId: "marketing",
    title: "One Channel Focus",
    problem: "You're spread thin and nothing lands.",
    whenToUse: "Posting everywhere with no results.",
    steps: [
      "Pick ONE channel.",
      "Show up there once a day for 2 weeks.",
      "Ignore the rest for now.",
    ],
    recommended: true,
  },
  {
    id: "content-from-convos",
    categoryId: "marketing",
    title: "Content from Conversations",
    problem: "You don't know what to post.",
    whenToUse: "Stuck on content ideas.",
    steps: [
      "Note a real question a client asked.",
      "Answer it publicly.",
      "Repeat tomorrow.",
    ],
    recommended: true,
  },
  {
    id: "repurpose-one",
    categoryId: "marketing",
    title: "Repurpose One Idea",
    problem: "Content creation burns you out.",
    whenToUse: "When making new content feels heavy.",
    steps: [
      "Take your single best idea.",
      "Reshape it 3 ways (post, story, email).",
      "Space them across a week.",
    ],
  },

  // ---- Sales & Revenue ----
  {
    id: "follow-up-first",
    categoryId: "sales",
    title: "Follow-Up First",
    problem: "Warm leads go cold.",
    whenToUse: "Revenue dips, pipeline stalls.",
    steps: [
      "List 5 warm leads.",
      "Message one of them today.",
      "Schedule the other four.",
    ],
    recommended: true,
  },
  {
    id: "one-clear-offer",
    categoryId: "sales",
    title: "One Clear Offer",
    problem: "Buyers are confused by your options.",
    whenToUse: "When people 'think about it' and vanish.",
    steps: [
      "Name one problem you solve.",
      "Put one price on it.",
      "Say it in a single sentence.",
    ],
    recommended: true,
  },
  {
    id: "ask-directly",
    categoryId: "sales",
    title: "Ask Directly",
    problem: "You avoid actually closing.",
    whenToUse: "An interested person is on the fence.",
    steps: [
      "Pick one interested person.",
      "Ask if they want to move forward.",
      "Then stay quiet and wait.",
    ],
  },

  // ---- Customer Relations ----
  {
    id: "check-in-cadence",
    categoryId: "clients",
    title: "Check-In Cadence",
    problem: "Clients feel forgotten between projects.",
    whenToUse: "Quiet periods with existing clients.",
    steps: [
      "Pick a rhythm (weekly or monthly).",
      "Send one genuine, no-ask check-in.",
      "Note the date for next time.",
    ],
    recommended: true,
  },
  {
    id: "fix-it-fast",
    categoryId: "clients",
    title: "Fix It Fast",
    problem: "A complaint is sitting unresolved.",
    whenToUse: "An unhappy client just reached out.",
    steps: [
      "Acknowledge within the hour.",
      "Own it — no defensiveness.",
      "Offer one concrete fix.",
    ],
    recommended: true,
  },
  {
    id: "surprise-value",
    categoryId: "clients",
    title: "Surprise Value",
    problem: "Retention is slipping.",
    whenToUse: "You want a client to feel valued.",
    steps: [
      "Pick one client.",
      "Give something unexpected and useful.",
      "Attach no ask to it.",
    ],
  },
];

export function getCategory(id: string): StrategyCategory | undefined {
  return STRATEGY_CATEGORIES.find((c) => c.id === id);
}

export function strategiesFor(categoryId: string): Strategy[] {
  return STRATEGIES.filter((s) => s.categoryId === categoryId);
}

// 2–3 recommended strategies surface first; falls back to the first few.
export function recommendedFor(categoryId: string): Strategy[] {
  const all = strategiesFor(categoryId);
  const rec = all.filter((s) => s.recommended);
  return (rec.length ? rec : all).slice(0, 3);
}

export function getStrategy(id: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.id === id);
}
