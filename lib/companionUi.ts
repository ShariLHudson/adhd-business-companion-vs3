import type { CoachingMode } from "./companionPrompt";

export type AppSection =
  | "home"
  | "focus-timer"
  | "brain-dump"
  | "breathe"
  | "focus-audio"
  | "settings"
  | "projects"
  | "playbook"
  | "profile"
  | "energy"
  | "templates-library"
  | "saved-work"
  | "my-work"
  | "focus"
  | "progress"
  | "time-block"
  | "activities"
  | "guided-exercises"
  | "spin-wheel"
  | "games"
  | "email-generator"
  | "snippets"
  | "content-types"
  | "content-generator"
  | "google-workspace"
  | "business-profile"
  | "client-avatars"
  | "how-do-i"
  | "decision-compass"
  | "today"
  | "plan-my-day"
  | "visual-focus"
  | "wins-this-week"
  | "evidence-bank"
  | "growth"
  | "confidence-vault"
  | "my-journey";

export type SidebarNavId =
  | "chat"
  | "focus"
  | "visual-thinking"
  | "other"
  | "create"
  | "tools"
  | "progress"
  | "projects"
  | "templates"
  | "snippets"
  | "saved-work"
  | "my-work"
  | "playbook"
  | "client-avatars"
  | "settings"
  | "how-do-i"
  | "wins-this-week"
  | "evidence-bank"
  | "growth"
  | "confidence-vault"
  | "my-journey";

export type SidebarToolId =
  | "voice"
  | "brain-dump"
  | "focus-timer"
  | "breathe"
  | "focus-audio"
  | "reset-day"
  | "new-chat"
  | "time-block"
  | "activities"
  | "guided-exercises"
  | "spin-wheel"
  | "games";

export const ASSETS = {
  background: "/images/companion-bg.jpg",
  logo: "/logo.png",
  profile: "/shari.jpg",
} as const;

export const BRAND = {
  name: "Spark Studio Companions",
  tagline: "Your Coach & Companion",
} as const;

// Six sidebar doors — Companion First: chat, regulation, visual thinking, growth, other, learning.
export const SIDEBAR_NAV: {
  id: SidebarNavId;
  label: string;
  emoji: string;
  mode?: CoachingMode;
}[] = [
  { id: "chat", label: "Chat", emoji: "💬", mode: "today" },
  { id: "focus", label: "Focus My Brain", emoji: "🚧", mode: "focus" },
  { id: "visual-thinking", label: "Visual Thinking", emoji: "💡" },
  { id: "growth", label: "Growth", emoji: "📈" },
  { id: "other", label: "Other", emoji: "➕" },
  { id: "how-do-i", label: "How Do I...?", emoji: "❓" },
];

/** @deprecated More menu removed — My Work and How Do I are primary sidebar items. */
export const MORE_NAV: {
  id: SidebarNavId;
  label: string;
  emoji: string;
  mode?: CoachingMode;
}[] = [];

// Top-level nav items that open their own section (a panel) rather than
// switching the chat into a coaching mode.
export const SECTION_NAV: Partial<Record<SidebarNavId, AppSection>> = {
  focus: "focus",
  "visual-thinking": "visual-focus",
  growth: "growth",
  other: "my-work",
  create: "content-generator",
  "my-work": "my-work",
  projects: "projects",
  templates: "templates-library",
  snippets: "snippets",
  playbook: "playbook",
  "how-do-i": "how-do-i",
};

/** Map legacy or sub-area nav ids to a primary sidebar door. */
export function normalizeSidebarNav(nav: SidebarNavId): SidebarNavId {
  if (nav === "create" || nav === "my-work") return "other";
  if (
    nav === "projects" ||
    nav === "templates" ||
    nav === "snippets" ||
    nav === "saved-work" ||
    nav === "playbook"
  ) {
    return "other";
  }
  if (
    nav === "wins-this-week" ||
    nav === "evidence-bank" ||
    nav === "confidence-vault" ||
    nav === "my-journey"
  ) {
    return "growth";
  }
  return nav;
}

/** Primary sidebar nav for an open workspace section. */
export function sidebarNavForSection(section: AppSection): SidebarNavId | null {
  switch (section) {
    case "my-work":
    case "content-generator":
    case "projects":
    case "templates-library":
    case "snippets":
    case "saved-work":
    case "playbook":
      return "other";
    case "visual-focus":
      return "visual-thinking";
    case "focus":
    case "focus-timer":
    case "breathe":
    case "focus-audio":
    case "activities":
    case "guided-exercises":
    case "spin-wheel":
    case "games":
      return "focus";
    case "growth":
    case "wins-this-week":
    case "evidence-bank":
    case "confidence-vault":
    case "my-journey":
      return "growth";
    case "how-do-i":
      return "how-do-i";
    case "home":
    case "today":
      return "chat";
    default:
      return null;
  }
}

export const SIDEBAR_TOOLS: {
  id: SidebarToolId;
  label: string;
  emoji: string;
}[] = [
  { id: "brain-dump", label: "Clear My Mind", emoji: "🧠" },
  { id: "focus-timer", label: "Pomodoro", emoji: "⏱" },
  { id: "reset-day", label: "New Chat", emoji: "💬" },
  { id: "breathe", label: "Breathe", emoji: "🌬" },
  { id: "voice", label: "Voice", emoji: "🎤" },
];

// Nested sidebar menu structure. A leaf dispatches a tool action; a branch
// expands to reveal child nodes. Supports arbitrary nesting (currently 2 deep).
export type MenuLeaf = {
  kind: "leaf";
  id: string;
  label: string;
  emoji: string;
  tool: SidebarToolId;
};

export type MenuBranch = {
  kind: "branch";
  id: string;
  label: string;
  emoji: string;
  children: MenuNode[];
};

export type MenuNode = MenuLeaf | MenuBranch;

// Focus  (expands only — no dedicated page; focus is a chat state)
//  ├─ What's on your mind   → Brain Dump
//  └─ Focus Tools
//       ├─ Focus Audio      → focus-audio
//       ├─ Breathe          → breathe
//       └─ Pomodoro timer   → focus-timer
export const FOCUS_MENU: MenuNode[] = [
  {
    kind: "leaf",
    id: "whats-on-your-mind",
    label: "What's on your mind",
    emoji: "🧠",
    tool: "brain-dump",
  },
  {
    kind: "branch",
    id: "focus-tools",
    label: "Focus Tools",
    emoji: "🧰",
    children: [
      {
        kind: "leaf",
        id: "focus-audio",
        label: "Focus Audio",
        emoji: "🎧",
        tool: "focus-audio",
      },
      {
        kind: "leaf",
        id: "breathe",
        label: "Breathe",
        emoji: "🌬",
        tool: "breathe",
      },
      {
        kind: "leaf",
        id: "pomodoro",
        label: "Pomodoro timer",
        emoji: "⏱",
        tool: "focus-timer",
      },
    ],
  },
];

// Maps a tool action to the AppSection it opens (null = no section switch).
export const TOOL_SECTION: Partial<Record<SidebarToolId, AppSection>> = {
  "brain-dump": "brain-dump",
  "focus-timer": "focus-timer",
  breathe: "breathe",
  "focus-audio": "focus-audio",
  "time-block": "time-block",
  activities: "activities",
  "guided-exercises": "guided-exercises",
  "spin-wheel": "spin-wheel",
  games: "games",
};

export const INPUT_PLACEHOLDER = "";

export const MODE_FEEDBACK: Record<CoachingMode, string> = {
  today: "Chat — I'm here with you.",
  focus: "Focus — let's take it one step at a time.",
  "how-do-i": "Let's walk through this together.",
  playbook: "Let's work on what you're creating.",
  progress: "Let's take one gentle step forward.",
};
