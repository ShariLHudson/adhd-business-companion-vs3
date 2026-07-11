import type { AppSection } from "@/lib/companionUi";

export type HowDoIEcosystemCard = {
  id: string;
  title: string;
  emoji: string;
  whatItIs: string;
  whenToUse: string;
  workflow: string[];
  tips: string[];
  keywords: string[];
  openSection: AppSection;
  openLabel: string;
};

export const HOW_DO_I_COMPANION_PRINCIPLE =
  "The Companion helps you think. You stay in control. Nothing is added to your workspace unless you choose to add it.";

export const HOW_DO_I_CORE_WORKFLOW = {
  title: "ADHD Business Ecosystem Workflow",
  steps: [
    "Capture thoughts in Clear My Mind.",
    "Move important ideas into Projects.",
    "Use Create to build content.",
    "Use Plan My Day to schedule work.",
    "Save finished work in My Work.",
    "Track progress through Wins This Week and Evidence Vault.",
  ],
} as const;

/** Display order — PostCraft-style card grid */
export const HOW_DO_I_ECOSYSTEM_CARDS: HowDoIEcosystemCard[] = [
  {
    id: "plan-my-day",
    title: "Plan My Day",
    emoji: "📅",
    whatItIs:
      "Turns tasks into a visual daily plan — list, timeline, cards, or kanban.",
    whenToUse:
      "When you need structure or help deciding what to do next.",
    workflow: [
      "Add tasks or pull from projects.",
      "Choose a view that fits your brain.",
      "Move one item to Doing when ready.",
      "Mark done or park what is not for today.",
    ],
    tips: [
      "List when overwhelmed. Kanban for larger task lists.",
      "Open Visual Focus when you want to think spatially.",
    ],
    keywords: ["plan", "day", "today", "schedule", "kanban", "tasks"],
    openSection: "plan-my-day",
    openLabel: "Open Plan My Day",
  },
  {
    id: "visual-focus",
    title: "Visual Focus",
    emoji: "🎨",
    whatItIs:
      "A cognitive workspace for visual thinking — mind maps, decision trees, project maps, and spatial planning.",
    whenToUse:
      "When you organize ideas through pictures, relationships, clusters, or branching decisions.",
    workflow: [
      "Choose how you want to think — mind map, decision tree, project map, and more.",
      "Create a new map or open a saved one.",
      "Add branches, clusters, and connections as ideas unfold.",
      "Use Visual Kanban when you want flexible grouping.",
    ],
    tips: [
      "Visual Focus is for thinking — Plan My Day is for today's tasks.",
      "Find it from Focus when your brain feels crowded or stuck.",
    ],
    keywords: ["visual", "mind map", "decision tree", "spatial", "thinking"],
    openSection: "visual-focus",
    openLabel: "Open Visual Focus",
  },
  {
    id: "projects",
    title: "Projects",
    emoji: "📁",
    whatItIs:
      "A home for multi-step work — outcome, tasks, notes, and next actions together.",
    whenToUse: "When work has more than one step or lasts more than one session.",
    workflow: [
      "Create or open a project.",
      "Name the outcome.",
      "Add one clear next action.",
      "Schedule time or open Create when ready.",
    ],
    tips: [
      "One next action beats a long list.",
      "Pause anytime — projects stay in My Work.",
    ],
    keywords: ["project", "projects", "launch", "campaign"],
    openSection: "projects",
    openLabel: "Open Projects",
  },
  {
    id: "create",
    title: "Create",
    emoji: "✍️",
    whatItIs:
      "Build business assets — emails, posts, workshops, proposals, SOPs — through guided conversation.",
    whenToUse: "When you need a draft and want help thinking before anything lands in your workspace.",
    workflow: [
      "Pick what you want to make.",
      "Answer one question at a time.",
      "Review the plan as it takes shape.",
      "Choose when to generate and save your draft.",
    ],
    tips: [
      "Nothing saves until you choose to save.",
      "Use Client Avatars so drafts sound personal.",
    ],
    keywords: [
      "create",
      "workshop",
      "content",
      "email",
      "post",
      "proposal",
      "draft",
    ],
    openSection: "content-generator",
    openLabel: "Open Create",
  },
  {
    id: "clear-my-mind",
    title: "Clear My Mind",
    emoji: "🧠",
    whatItIs:
      "Capture business thoughts first — organize later, without pressure to sort immediately.",
    whenToUse: "When your head feels full, noisy, or scattered.",
    workflow: [
      "Capture each thought as its own card.",
      "Search or filter when ready.",
      "Route to a project or park for later.",
      "Turn into a project when it is ready for work.",
    ],
    tips: [
      "Capture first, sort second.",
      "Nothing is permanent — move or delete anytime.",
    ],
    keywords: ["brain", "dump", "clear", "mind", "thoughts", "organize"],
    openSection: "brain-dump",
    openLabel: "Open Clear My Mind",
  },
  {
    id: "strategies",
    title: "Strategies",
    emoji: "🎯",
    whatItIs:
      "Saved playbooks — ADHD techniques for now, business strategies you build over time.",
    whenToUse:
      "When the same challenge keeps showing up and you want a named approach.",
    workflow: [
      "Open Strategies from More.",
      "Pick ADHD or Business strategies.",
      "Browse or search by topic.",
      "Apply step by step or save what works.",
    ],
    tips: [
      "ADHD strategies are for now; business strategies build systems.",
      "Save your own when you discover a pattern that works.",
    ],
    keywords: ["strategy", "strategies", "playbook", "marketing plan"],
    openSection: "playbook",
    openLabel: "Open Strategies",
  },
  {
    id: "client-avatars",
    title: "Client Avatars",
    emoji: "👥",
    whatItIs:
      "Profiles of who you help — so messaging and drafts stay aimed at real people.",
    whenToUse: "When content feels generic or you are launching something new.",
    workflow: [
      "Create an avatar one question at a time.",
      "Set a primary avatar for default context.",
      "Edit as your offer sharpens.",
      "Reference when creating content or strategies.",
    ],
    tips: ["A clear avatar makes every draft feel written for someone real."],
    keywords: ["avatar", "client", "audience", "ideal client"],
    openSection: "client-avatars",
    openLabel: "Open Client Avatars",
  },
  {
    id: "templates",
    title: "Templates",
    emoji: "📚",
    whatItIs: "Reusable starting frameworks — structure without a blank page.",
    whenToUse: "When you want a proven outline instead of starting from zero.",
    workflow: [
      "Browse or search templates.",
      "Pick one that matches your goal.",
      "Build With Shari to adapt it in conversation.",
      "Save frameworks you want to reuse.",
    ],
    tips: [
      "Templates are starting points — not finished documents.",
      "You choose when to open something in Create.",
    ],
    keywords: ["template", "templates", "framework"],
    openSection: "templates-library",
    openLabel: "Open Templates",
  },
  {
    id: "snippets",
    title: "Snippets",
    emoji: "📝",
    whatItIs:
      "Small reusable text blocks — hooks, CTAs, subject lines, short copy.",
    whenToUse: "When a full draft feels heavy but you need a line you can reuse.",
    workflow: [
      "Open Snippets from More.",
      "Generate or write snippet ideas.",
      "Save lines you like.",
      "Copy or build into Create when ready.",
    ],
    tips: ["Snippets are small — perfect when a whole document is too much."],
    keywords: ["snippet", "snippets", "hook", "cta"],
    openSection: "snippets",
    openLabel: "Open Snippets",
  },
  {
    id: "my-work",
    title: "My Work",
    emoji: "💼",
    whatItIs:
      "Your trusted home for everything created, saved, and in progress.",
    whenToUse: "When you want to resume, find saved work, or see the full picture.",
    workflow: [
      "Say 'open my work' or tell me what you're looking for.",
      "Continue what you left mid-stream.",
      "Browse projects, saved work, and files.",
      "Search when you know a name but not where it lives.",
    ],
    tips: [
      "My Work is visibility — not another inbox.",
      "Exports from Create land in Files automatically.",
    ],
    keywords: ["my work", "saved", "resume", "continue"],
    openSection: "my-work",
    openLabel: "Open My Work",
  },
  {
    id: "evidence-bank",
    title: "Evidence Vault",
    emoji: "🏆",
    whatItIs:
      "Proof that you are making progress — what changed because of what you did.",
    whenToUse:
      "When imposter syndrome shows up or you need to see real impact.",
    workflow: [
      "Add evidence when something mattered.",
      "Save from Wins This Week to capture the deeper story.",
      "Review when planning or talking about your business.",
      "Use proof when pricing or pitching.",
    ],
    tips: ["Wins capture what happened. Evidence captures why it mattered."],
    keywords: ["evidence", "proof", "wins", "momentum", "progress", "impact"],
    openSection: "evidence-bank",
    openLabel: "Open Evidence Vault",
  },
  {
    id: "wins-this-week",
    title: "Wins This Week",
    emoji: "🌟",
    whatItIs:
      "A weekly view of what you moved forward — encouragement without pressure.",
    whenToUse: "End of week reflection or when you need to see you are not starting from zero.",
    workflow: [
      "Open Wins This Week from More.",
      "Review what was noticed this week.",
      "Save a moment to Evidence Vault when you want the deeper story.",
      "Glance at previous weeks for perspective.",
    ],
    tips: [
      "Wins capture what happened. Evidence Vault captures why it mattered.",
      "Every small step counts — including showing up.",
    ],
    keywords: ["wins", "week", "weekly", "celebration"],
    openSection: "wins-this-week",
    openLabel: "Open Wins This Week",
  },
  {
    id: "settings",
    title: "Settings & Personalization",
    emoji: "⚙️",
    whatItIs:
      "Appearance, profile, business context, and how the Companion adapts to you.",
    whenToUse: "When colors feel too busy, you want to update your profile, or recommendations feel too generic.",
    workflow: [
      "Say 'settings' or ask to change your preferences.",
      "Adjust appearance (Adaptive, Category, or Minimal colors).",
      "Update Profile and Business Profile when your context changes.",
      "Save changes — nothing else in the app changes until you act.",
    ],
    tips: [
      "Category colors help you always know which area you are in.",
      "Business Profile improves Create suggestions — you control what is stored.",
    ],
    keywords: [
      "settings",
      "appearance",
      "colors",
      "profile",
      "personalization",
      "customize",
    ],
    openSection: "settings",
    openLabel: "Open Settings",
  },
];

function scoreCard(card: HowDoIEcosystemCard, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return 0;

  let score = 0;
  const haystacks = [
    card.title.toLowerCase(),
    card.whatItIs.toLowerCase(),
    card.whenToUse.toLowerCase(),
    ...card.workflow.map((s) => s.toLowerCase()),
    ...card.tips.map((s) => s.toLowerCase()),
    ...card.keywords,
  ];

  if (card.title.toLowerCase().includes(q)) score += 20;
  if (q.includes(card.id.replace(/-/g, " "))) score += 15;

  for (const kw of card.keywords) {
    if (q.includes(kw)) score += 10;
    if (kw.includes(q) && q.length > 2) score += 5;
  }

  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  for (const token of tokens) {
    if (haystacks.some((h) => h.includes(token))) score += 4;
  }

  return score;
}

export function searchEcosystemCards(query: string): HowDoIEcosystemCard[] {
  const q = query.trim();
  if (!q) return [...HOW_DO_I_ECOSYSTEM_CARDS];

  return HOW_DO_I_ECOSYSTEM_CARDS.filter((card) => scoreCard(card, q) > 0).sort(
    (a, b) => scoreCard(b, q) - scoreCard(a, q) || a.title.localeCompare(b.title),
  );
}

export function bestEcosystemCardMatch(
  query: string,
): HowDoIEcosystemCard | null {
  const q = query.trim();
  if (!q) return null;
  const results = searchEcosystemCards(q);
  return results[0] ?? null;
}
