import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { compareDropdownLabels } from "@/lib/dropdownSort";

export type HowDoIEntry = {
  id: string;
  /** Display title, e.g. "How To: Create a Strategy" */
  title: string;
  /** Primary question phrasing for search and list */
  question: string;
  whatItIs: string;
  whenToUse: string;
  steps: string[];
  examples?: string[];
  /** Extra detail blocks (e.g. mode comparisons). */
  details?: { heading: string; body: string }[];
  keywords: string[];
  openSection?: AppSection;
  /** Opens a guided activity (e.g. Decision Compass). */
  openActivityId?: string;
  openLabel: string;
  /** Opens Settings overlay to a section (companion home only). */
  openSettingsSection?: SettingsSection;
  askPrompt?: string;
};

export const HOW_DO_I_OPEN_LABELS: Partial<Record<AppSection, string>> = {
  playbook: "Open Strategies",
  "content-generator": "Open Create",
  "time-block": "Open Calendar",
  projects: "Open Projects",
  focus: "Open Focus",
  "templates-library": "Open Templates",
  "brain-dump": "Open Clear My Mind",
  "talk-it-out": "Open Talk It Out",
  energy: "Open Today's Reality",
  "business-profile": "Open Business Profile",
  settings: "Open Settings",
};

export const HOW_DO_I_ENTRIES: HowDoIEntry[] = [
  {
    id: "talk-it-out",
    title: "Talk It Out",
    question: "How do I talk something through with Shari?",
    whatItIs:
      "Talk through one situation in your own words. Shari asks thoughtful questions, notices what may matter, and helps you hear your own thinking — without rushing to advice.",
    whenToUse:
      "When you are unsure what you think, torn between feelings, replaying a situation, or not ready for formal decision analysis.",
    steps: [
      "Open Talk It Out.",
      "Start in your own words — no need to organize first.",
      "Answer one question at a time.",
      "Pause, save a discovery, or end whenever you want.",
      "Ask for another kind of help only if you want it.",
    ],
    keywords: [
      "talk it out",
      "talk through",
      "think out loud",
      "reflective",
      "one question",
      "help me think",
      "unsure what i think",
      "torn",
      "replaying",
      "not ready to decide",
    ],
    openSection: "talk-it-out",
    openLabel: "Open Talk It Out",
    askPrompt: "I want to talk something through — one question at a time.",
  },
  {
    id: "decision-compass",
    title: "ADHD Decision Compass",
    question: "How do I work through a decision?",
    whatItIs:
      "Work through decisions, compare options, evaluate tradeoffs, and choose a next step.",
    whenToUse:
      "When you are stuck between options, weighing tradeoffs, or need a structured way to decide.",
    steps: [
      "Open Decision Compass.",
      "Name the decision in plain language.",
      "Follow the path that fits — action, strategy, or emotional.",
      "Compare options and note tradeoffs.",
      "Choose a next step you can act on.",
    ],
    keywords: [
      "decision",
      "decisions",
      "decision maker",
      "decision compass",
      "help me decide",
      "compare two options",
      "compare options",
      "choose between options",
      "choose between",
      "should i",
      "a or b",
      "strategic decision",
      "emotional decision",
      "decide",
      "tradeoff",
      "tradeoffs",
      "two options",
      "stuck choosing",
    ],
    openActivityId: "decision-compass",
    openLabel: "Open Decision Compass",
    askPrompt: "Help me work through a decision — one question at a time.",
  },
  {
    id: "create-strategy",
    title: "How To: Create a Strategy",
    question: "How do I create a strategy?",
    whatItIs:
      "A strategy is a repeatable way you solve a recurring problem — so you don't have to reinvent the answer every time.",
    whenToUse:
      "When the same challenge keeps showing up and you want a named approach you can reuse.",
    examples: [
      "The Dishes Need Friends Rule",
      "Future Shari",
      "Make It Visible Or It Doesn't Exist",
    ],
    steps: [
      "Open Strategies.",
      "Click New Strategy.",
      "Describe the recurring challenge.",
      "Describe what works for you.",
      "Shari helps turn it into a reusable strategy you can open anytime.",
    ],
    keywords: [
      "strategy",
      "strategies",
      "create strategy",
      "new strategy",
      "playbook",
      "pattern",
      "recurring",
    ],
    openSection: "playbook",
    openLabel: "Open Strategies",
    askPrompt:
      "Help me create a new strategy for a recurring problem — one question at a time.",
  },
  {
    id: "use-strategies",
    title: "How To: Use a Strategy",
    question: "How do I use strategies?",
    whatItIs:
      "Strategies are saved playbooks — short frameworks for problems that come back (procrastination, scope creep, decision fatigue).",
    whenToUse:
      "When you feel stuck and want a proven approach instead of starting from zero.",
    steps: [
      "Open Strategies.",
      "Browse or search for a match.",
      "Read the four sections.",
      "Under “Use this strategy right now,” describe your situation.",
      "Open the workspace Shari recommends (project, task, or decision).",
    ],
    keywords: ["strategy", "strategies", "playbook", "stuck", "use strategy"],
    openSection: "playbook",
    openLabel: "Open Strategies",
  },
  {
    id: "deep-dives",
    title: "How To: Deep Dives",
    question: "What are Deep Dives?",
    whatItIs:
      "Deep Dives are richer learning conversations about one business concept — positioning, pricing, content, niche, audience growth — without jumping to relationship reflection.",
    whenToUse:
      "When you want to understand a topic more deeply, not just a quick definition.",
    steps: [
      "Ask a learning question in chat (e.g. “What is a sales funnel?”).",
      "Ask in chat for a quick answer, example, business application, or deep dive — or say 'give me a deep dive on…'",
      "Or ask directly: “Give me a deep dive on positioning.”",
      "Shari stays on the concept — one richer explanation, then you can apply or build.",
    ],
    keywords: [
      "deep dive",
      "deep dives",
      "dive deeper",
      "learn more",
      "positioning",
      "pricing",
      "niche",
      "content that converts",
    ],
    openLabel: "Ask in Chat",
    askPrompt: "Give me a deep dive on positioning for my business.",
  },
  {
    id: "schedule-appointment",
    title: "How To: Schedule an Appointment",
    question: "How do I schedule an appointment?",
    whatItIs:
      "Calendar (Time Bank) holds your time blocks — fixed commitments and work you assign to specific days.",
    whenToUse:
      "When you need to block time for a call, meeting, or focused work.",
    steps: [
      "Open Calendar.",
      "Add a time block with a clear title.",
      "Pick the date and start time.",
      "Optional: link it to a project.",
      "Shari can remind you when a block is about to start.",
    ],
    keywords: [
      "schedule",
      "appointment",
      "meeting",
      "calendar",
      "book",
      "block time",
      "time block",
    ],
    openSection: "time-block",
    openLabel: "Open Calendar",
  },
  {
    id: "create-workshop",
    title: "How To: Create a Workshop",
    question: "How do I create a workshop?",
    whatItIs:
      "A workshop is a structured session you design for participants — agenda, outcomes, and activities.",
    whenToUse:
      "When you're planning a live session, webinar, or training and need an outline or materials.",
    steps: [
      "Open Create.",
      "Choose Workshop (or search for it).",
      "Answer Shari's questions one at a time in chat or the panel.",
      "Approve when you're ready — then generate your draft.",
      "Edit, print, save, or send to Google Docs from the workspace.",
    ],
    keywords: ["workshop", "webinar", "training", "session", "masterclass"],
    openSection: "content-generator",
    openLabel: "Open Create",
    askPrompt: "Help me plan a workshop — one question at a time.",
  },
  {
    id: "plan-day",
    title: "How To: Plan My Day",
    question: "How do I plan my day?",
    whatItIs:
      "A realistic day plan matched to your energy — not an idealized to-do list.",
    whenToUse: "Morning, after a pivot, or when the day already feels overloaded.",
    steps: [
      "Open Today's Reality (🌤️ top bar) or Plan My Day (📅) when you know your energy.",
      "Answer one question at a time about energy and priorities.",
      "Review the plan Shari suggests.",
      "Move or trim blocks in Calendar if needed.",
    ],
    keywords: ["plan", "day", "schedule", "morning", "agenda", "today"],
    openSection: "energy",
    openLabel: "Open Today's Reality",
    askPrompt: "Help me plan my day — one question at a time.",
  },
  {
    id: "use-focus",
    title: "How To: Use Focus",
    question: "How do I use Focus?",
    whatItIs:
      "Focus tools — timer and audio — to start one task without fighting your brain.",
    whenToUse: "When you know what to do but can't seem to start.",
    steps: [
      "Tell me you'd like to focus, or say what you want to work on.",
      "Pick a timer or calming audio. Say \"help me breathe\" anytime for Breathe.",
      "Name one task — everything else can wait.",
      "Start the session and work until the timer ends.",
    ],
    keywords: ["focus", "timer", "pomodoro", "concentrate", "deep work", "start"],
    openSection: "focus",
    openLabel: "Open Focus",
  },
  {
    id: "create-project",
    title: "How To: Create a Project",
    question: "How do I create a project?",
    whatItIs:
      "A project is a container for related work — outcome, tasks, and next actions in one place.",
    whenToUse: "When work has multiple steps or lasts more than one session.",
    steps: [
      "Open Projects.",
      "Click New Project.",
      "Start blank, from a template, strategy, or Clear My Mind items.",
      "Add one clear next action.",
      "Optional: link Create drafts or time blocks to the project.",
    ],
    keywords: ["project", "new", "create", "folder"],
    openSection: "projects",
    openLabel: "Open Projects",
  },
  {
    id: "create-content",
    title: "How To: Create Content",
    question: "How do I create content?",
    whatItIs:
      "Create builds business assets — emails, posts, proposals, SOPs, and more — with guided questions.",
    whenToUse: "When you need a draft, not a blank page.",
    steps: [
      "Open Create.",
      "Pick a category and type.",
      "Answer questions one at a time (chat or panel).",
      "Approve generation when Shari has enough detail.",
      "Edit, print, save, or export to Google Docs.",
    ],
    keywords: [
      "create",
      "content",
      "write",
      "email",
      "post",
      "proposal",
      "sop",
      "draft",
    ],
    openSection: "content-generator",
    openLabel: "Open Create",
  },
  {
    id: "time-blocks",
    title: "How To: Use Time Bank & Calendar",
    question: "How do I use time blocks?",
    whatItIs:
      "Time Bank holds unscheduled tasks; Calendar shows what is assigned to each day.",
    whenToUse:
      "When tasks need a time home, or you want to see the day at a glance.",
    steps: [
      "Open Calendar.",
      "Add tasks to Time Bank without a date first.",
      "Assign blocks to a day when you are ready.",
      "Shari can remind you when a block starts.",
    ],
    keywords: ["time", "block", "bank", "schedule", "calendar"],
    openSection: "time-block",
    openLabel: "Open Calendar",
  },
  {
    id: "clear-mind",
    title: "How To: Clear My Mind",
    question: "How do I clear my mind?",
    whatItIs:
      "Clear My Mind is a safe brain dump — get everything out and see it safely held without sorting first.",
    whenToUse: "When your head feels full, noisy, or overwhelming.",
    steps: [
      "Open Clear My Mind from the top navigation (🧠).",
      "Capture — add as many thoughts as you want; separate with commas.",
      "If Smart Split is offered, choose Separate Them or Keep As Entered.",
      "Tap See what's held to view the Mental Landscape — Everything is held.",
      "Expand a cluster → View thoughts → use Thought Actions when ready.",
      "Tap Add More Thoughts anytime to continue the same session.",
    ],
    keywords: ["brain", "dump", "clear", "overwhelm", "mind", "capture"],
    openSection: "brain-dump",
    openLabel: "Open Clear My Mind",
  },
  {
    id: "templates",
    title: "How To: Use Templates",
    question: "How do I use templates?",
    whatItIs:
      "Templates are starting frameworks — not finished documents.",
    whenToUse: "When you want structure without starting from scratch.",
    steps: [
      "Open Templates.",
      "Search or browse by category.",
      "Pick a template and open it in Create.",
      "Personalize with your details and approve generation.",
    ],
    keywords: ["template", "framework", "reuse"],
    openSection: "templates-library",
    openLabel: "Open Templates",
  },
  {
    id: "business-profile",
    title: "How To: Set Up Business Profile",
    question: "How do I set up my business profile?",
    whatItIs:
      "Your business profile tells Shari who you serve and what you are building.",
    whenToUse: "Early setup, or when Create recommendations feel too generic.",
    steps: [
      "Open Business Profile from Profile.",
      "Add your business, audience, and goals.",
      "Shari uses this to personalize Create and suggestions.",
    ],
    keywords: ["business", "profile", "setup", "personalize"],
    openSection: "business-profile",
    openLabel: "Open Business Profile",
  },
  {
    id: "chat-workspace",
    title: "How To: Chat Workspace",
    question: "How do I start a new chat or new day?",
    whatItIs:
      "Chat Workspace manages your current conversation context — separate from Clear My Mind, Plan My Day, and Today's Reality.",
    whenToUse:
      "When you want a fresh conversation or a fresh daily start without losing projects, memory, or goals.",
    steps: [
      "Open Chat Workspace (💬) in the top navigation.",
      "Choose New Chat for a completely fresh conversation — memory, projects, goals, analytics, and Founder Intelligence stay.",
      "Choose New Day's Chat when starting a new day — fresh daily conversation, Plan My Day reset, daily planning cleared; memory and projects stay.",
      "Confirm in the dialog — nothing important is deleted.",
    ],
    keywords: [
      "chat workspace",
      "new chat",
      "new day",
      "fresh",
      "reset",
      "context",
      "conversation",
    ],
    openLabel: "Learn in How Do I",
  },
  {
    id: "colors",
    title: "Adaptive vs Category Colors",
    question: "What's the difference between Adaptive and Category colors?",
    whatItIs:
      "Two optional ways the app uses color. Neither changes how anything works — only how much color you see and what it means.",
    whenToUse:
      "When the interface feels too busy, too plain, or you want colors to always mean the same category.",
    details: [
      {
        heading: "Adaptive Colors",
        body:
          "Colors shift with your situation — support, recovery, focus, celebration, or planning. The app adapts the mood of the interface to match how you're using it right now.",
      },
      {
        heading: "Category Colors",
        body:
          "Each area keeps a fixed color — Projects, Focus, Recovery, Relationships, Planning — so you always know which part of the app you're in.",
      },
      {
        heading: "Minimal",
        body: "No color coding — clean and minimal.",
      },
    ],
    examples: [
      "Adaptive: soft blue when you need support, teal when you're in focus mode, warm gold for a win.",
      "Category: Projects always teal, Focus always blue, Recovery always purple.",
    ],
    steps: [
      "Open Account (⋯) in the top bar → Settings.",
      "Tap Appearance.",
      "Choose Adaptive Colors, Category Colors, or Minimal.",
      "Use the preview, then tap Save Changes.",
    ],
    keywords: [
      "color",
      "colors",
      "colour",
      "dynamic",
      "dynami",
      "meaning",
      "meaning-based",
      "appearance",
      "visual",
      "difference",
    ],
    openSettingsSection: "appearance",
    openLabel: "Open Settings",
  },
];

/** Canonical browse/search order — alphabetical by title; never re-sorted by relevance. */
export const HOW_DO_I_STABLE_ORDER: HowDoIEntry[] = [...HOW_DO_I_ENTRIES].sort(
  (a, b) => compareDropdownLabels(a.title, b.title),
);

/** Strip filler words so “how do I create a strategy” matches strategy entries. */
export function normalizeHowDoIQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/^how\s+(?:do\s+i|to|can\s+i)\s+/i, "")
    .replace(/[?.!]+$/g, "")
    .trim();
}

function scoreEntry(entry: HowDoIEntry, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  const n = normalizeHowDoIQuery(rawQuery);
  if (!q) return 0;

  let score = 0;
  const haystacks = [
    entry.question.toLowerCase(),
    entry.title.toLowerCase(),
    entry.whatItIs.toLowerCase(),
    ...entry.keywords,
  ];

  if (entry.question.toLowerCase().includes(q)) score += 20;
  if (entry.title.toLowerCase().includes(n)) score += 15;
  if (n && entry.question.toLowerCase().includes(n)) score += 12;

  for (const kw of entry.keywords) {
    if (q.includes(kw) || n.includes(kw)) score += 8;
    if (kw.includes(n) && n.length > 2) score += 5;
  }

  if (
    entry.id === "decision-compass" &&
    /\bdecision|decide|choose between|compare.*option|tradeoff|help me decide|should i|a or b/i.test(
      q,
    )
  ) {
    score += 12;
  }

  if (entry.details?.length) {
    for (const block of entry.details) {
      const blob = `${block.heading} ${block.body}`.toLowerCase();
      if (blob.includes(q) || (n && blob.includes(n))) score += 4;
    }
  }

  const tokens = n.split(/\s+/).filter((t) => t.length > 2);
  for (const token of tokens) {
    if (haystacks.some((h) => h.includes(token))) score += 3;
  }

  return score;
}

export function searchHowDoI(query: string): HowDoIEntry[] {
  const q = query.trim();
  if (!q) {
    return [...HOW_DO_I_STABLE_ORDER];
  }

  const matchingIds = new Set(
    HOW_DO_I_ENTRIES.filter((entry) => scoreEntry(entry, q) > 0).map(
      (entry) => entry.id,
    ),
  );

  return HOW_DO_I_STABLE_ORDER.filter((entry) => matchingIds.has(entry.id));
}

/** Best single match for explicit search submit — uses relevance, not display order. */
export function bestHowDoIMatch(query: string): HowDoIEntry | null {
  const q = query.trim();
  if (!q) return null;

  const scored = HOW_DO_I_ENTRIES.map((entry) => ({
    entry,
    score: scoreEntry(entry, q),
  }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        compareDropdownLabels(a.entry.title, b.entry.title),
    );

  return scored[0]?.entry ?? null;
}

export function resolveHowDoI(query: string): HowDoIEntry {
  const best = bestHowDoIMatch(query);
  if (best) return best;

  const n = normalizeHowDoIQuery(query);
  return {
    id: "fallback",
    title: `How To: ${query.trim() || "Get Help"}`,
    question: query.trim() || "How do I…",
    whatItIs:
      "How Do I is your in-app guide — short explanations with steps and a button to open the right workspace.",
    whenToUse: "Whenever you are not sure where something lives in the app.",
    steps: [
      "Try a shorter search (e.g. “strategy”, “calendar”, “create workshop”).",
      "Tap a topic below if one fits.",
      "Or ask Shari in chat — she can open the right place for you.",
    ],
    keywords: [],
    openLabel: "Open Chat",
    askPrompt: query.trim()
      ? `How do I ${normalizeHowDoIQuery(query)}?`
      : "Help me find the right tool in the app.",
  };
}

export function formatHowDoIEntry(entry: HowDoIEntry): string {
  const lines = [
    entry.title,
    "",
    `**What it is:** ${entry.whatItIs}`,
    "",
    `**When to use it:** ${entry.whenToUse}`,
  ];

  if (entry.examples?.length) {
    lines.push("", "**Examples:**", ...entry.examples.map((ex) => `- ${ex}`));
  }

  if (entry.details?.length) {
    for (const block of entry.details) {
      lines.push("", `**${block.heading}:** ${block.body}`);
    }
  }

  lines.push("", "**Steps:**");
  entry.steps.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });

  return lines.join("\n");
}

export const HOW_DO_I_FEATURED_IDS = [
  "create-strategy",
  "schedule-appointment",
  "create-workshop",
  "create-content",
  "plan-day",
  "use-focus",
] as const;

export type HowDoITopicGroupId =
  | "business"
  | "clear-mind"
  | "create"
  | "decisions"
  | "focus"
  | "projects"
  | "settings"
  | "strategies"
  | "templates"
  | "time";

export type HowDoITopicGroup = {
  id: HowDoITopicGroupId;
  label: string;
};

const HOW_DO_I_TOPIC_GROUP_BY_ENTRY: Record<string, HowDoITopicGroupId> = {
  "talk-it-out": "decisions",
  "decision-compass": "decisions",
  "create-strategy": "strategies",
  "use-strategies": "strategies",
  "deep-dives": "strategies",
  "schedule-appointment": "time",
  "create-workshop": "create",
  "plan-day": "focus",
  "use-focus": "focus",
  "create-project": "projects",
  "create-content": "create",
  "time-blocks": "time",
  "clear-mind": "clear-mind",
  templates: "templates",
  "business-profile": "business",
  colors: "settings",
};

const HOW_DO_I_TOPIC_GROUPS = (
  [
    { id: "business", label: "Business profile" },
    { id: "clear-mind", label: "Clear My Mind" },
    { id: "create", label: "Create & workshops" },
    { id: "decisions", label: "Decisions" },
    { id: "focus", label: "Focus & energy" },
    { id: "projects", label: "Projects" },
    { id: "settings", label: "Settings & appearance" },
    { id: "strategies", label: "Strategies" },
    { id: "templates", label: "Templates" },
    { id: "time", label: "Calendar & time blocks" },
  ] satisfies HowDoITopicGroup[]
).sort((a, b) => compareDropdownLabels(a.label, b.label));

export function howDoITopicGroups(): {
  group: HowDoITopicGroup;
  entries: HowDoIEntry[];
}[] {
  const buckets = new Map<HowDoITopicGroupId, HowDoIEntry[]>();
  for (const entry of HOW_DO_I_ENTRIES) {
    if (entry.id === "fallback") continue;
    const groupId = HOW_DO_I_TOPIC_GROUP_BY_ENTRY[entry.id] ?? "settings";
    const list = buckets.get(groupId) ?? [];
    list.push(entry);
    buckets.set(groupId, list);
  }
  return HOW_DO_I_TOPIC_GROUPS.map((group) => ({
    group,
    entries: (buckets.get(group.id) ?? []).sort((a, b) =>
      compareDropdownLabels(a.title, b.title),
    ),
  })).filter((row) => row.entries.length > 0);
}

export function featuredHowDoIEntries(): HowDoIEntry[] {
  return HOW_DO_I_FEATURED_IDS.map(
    (id) => HOW_DO_I_ENTRIES.find((e) => e.id === id)!,
  ).filter(Boolean);
}
