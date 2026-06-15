import type { AppSection } from "@/lib/companionUi";

export type HowDoIEntry = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  openSection?: AppSection;
  askPrompt?: string;
};

export const HOW_DO_I_ENTRIES: HowDoIEntry[] = [
  {
    id: "plan-day",
    question: "How do I plan my day?",
    answer:
      "Open Adjust My Day or tell Shari “help me plan my day.” She’ll ask one question at a time and build a realistic plan for your energy.",
    keywords: ["plan", "day", "schedule", "morning", "agenda"],
    openSection: "energy",
    askPrompt: "Help me plan my day — one question at a time.",
  },
  {
    id: "use-focus",
    question: "How do I use Focus?",
    answer:
      "Go to Focus in the sidebar. Pick a timer, calming audio, or breathing — then name one task. Everything else can wait.",
    keywords: ["focus", "timer", "pomodoro", "concentrate", "deep work"],
    openSection: "focus",
  },
  {
    id: "create-project",
    question: "How do I create a project?",
    answer:
      "Open Projects → New Project. Start blank, from a template, strategy, or Clear My Mind items — then add one next action.",
    keywords: ["project", "new", "create", "folder"],
    openSection: "projects",
  },
  {
    id: "use-strategies",
    question: "How do I use strategies?",
    answer:
      "Open Strategies, pick one, read the four sections, then under “Use this strategy right now” say what you're struggling with — ideas, projects, tasks, or decisions — and open the workspace it recommends.",
    keywords: ["strategy", "strategies", "playbook", "stuck", "pattern"],
    openSection: "playbook",
  },
  {
    id: "create-content",
    question: "How do I create content?",
    answer:
      "Open Create, choose a type (email, post, proposal…), answer one question, then Improve or Update Draft until it fits.",
    keywords: ["create", "content", "write", "email", "post", "proposal"],
    openSection: "content-generator",
  },
  {
    id: "time-blocks",
    question: "How do I use time blocks?",
    answer:
      "Open Time Bank. Add tasks without a time first; assign them to a day when you’re ready. Shari can remind you when a block starts.",
    keywords: ["time", "block", "bank", "schedule", "calendar"],
    openSection: "time-block",
  },
  {
    id: "clear-mind",
    question: "How do I clear my mind?",
    answer:
      "Open Clear My Mind from Tools. Dump everything out — no sorting required. Shari helps organize when you’re ready.",
    keywords: ["brain", "dump", "clear", "overwhelm", "mind"],
    openSection: "brain-dump",
  },
  {
    id: "templates",
    question: "How do I use templates?",
    answer:
      "Templates Library holds frameworks. Search, pick one, open in Create, and personalize — templates are starting points, not final docs.",
    keywords: ["template", "framework", "reuse"],
    openSection: "templates-library",
  },
  {
    id: "business-profile",
    question: "How do I set up my business profile?",
    answer:
      "Profile → Business Profile. Add your business, who you serve, and goals — Shari uses this to personalize Create and recommendations.",
    keywords: ["business", "profile", "setup", "personalize"],
    openSection: "business-profile",
  },
  {
    id: "colors",
    question: "What’s the difference between Dynamic and Meaning-Based colors?",
    answer:
      "Dynamic colors shift with your situation (support, focus, recovery). Meaning-Based colors stay fixed per category (Projects, Focus, Planning). Change in Settings → Appearance.",
    keywords: ["color", "dynamic", "meaning", "appearance", "visual"],
    openSection: "settings",
  },
];

export function searchHowDoI(query: string): HowDoIEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return HOW_DO_I_ENTRIES;
  return HOW_DO_I_ENTRIES.filter(
    (e) =>
      e.question.toLowerCase().includes(q) ||
      e.answer.toLowerCase().includes(q) ||
      e.keywords.some((k) => k.includes(q) || q.includes(k)),
  );
}
