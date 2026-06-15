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
  | "focus"
  | "progress"
  | "time-block"
  | "activities"
  | "spin-wheel"
  | "email-generator"
  | "snippets"
  | "content-types"
  | "content-generator"
  | "google-workspace"
  | "business-profile"
  | "client-avatars"
  | "how-do-i";

export type SidebarNavId =
  | "chat"
  | "focus"
  | "create"
  | "tools"
  | "progress"
  | "projects"
  | "templates"
  | "saved-work"
  | "playbook"
  | "how-do-i";

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
  | "spin-wheel";

export const ASSETS = {
  background: "/images/companion-bg.jpg",
  logo: "/logo.png",
  profile: "/shari.jpg",
} as const;

export const BRAND = {
  name: "Spark Studio Companions",
  tagline: "Your Coach & Companion",
} as const;

// Primary doors — what a first-time, overwhelmed user sees. Three only.
// "Would someone need this before they've talked to Shari once?" If no → MORE.
export const SIDEBAR_NAV: {
  id: SidebarNavId;
  label: string;
  emoji: string;
  mode?: CoachingMode;
}[] = [
  // Each door answers "what am I doing right now?" — no overlapping intent.
  { id: "chat", label: "Chat", emoji: "💬", mode: "today" }, // think / get unstuck
  { id: "focus", label: "Focus", emoji: "🎯", mode: "focus" }, // execute / focus / start
  { id: "create", label: "Create", emoji: "✨" }, // produce content
];

// Everything else stays in the product but leaves the main path. Shari can
// send people here; users don't choose a "mode" on day one.
export const MORE_NAV: {
  id: SidebarNavId;
  label: string;
  emoji: string;
  mode?: CoachingMode;
}[] = [
  { id: "templates", label: "Templates", emoji: "📚" },
  { id: "playbook", label: "Strategies", emoji: "📘" },
  { id: "projects", label: "Projects", emoji: "📁" },
  { id: "how-do-i", label: "How Do I", emoji: "❓" },
];

// Top-level nav items that open their own section (a panel) rather than
// switching the chat into a coaching mode.
export const SECTION_NAV: Partial<Record<SidebarNavId, AppSection>> = {
  focus: "focus",
  create: "content-generator",
  projects: "projects",
  templates: "templates-library",
  "saved-work": "saved-work",
  playbook: "playbook",
  "how-do-i": "how-do-i",
};

export const SIDEBAR_TOOLS: {
  id: SidebarToolId;
  label: string;
  emoji: string;
}[] = [
  { id: "brain-dump", label: "Clear My Mind", emoji: "🧠" },
  { id: "focus-timer", label: "Pomodoro", emoji: "⏱" },
  { id: "reset-day", label: "Fresh Start", emoji: "🔄" },
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
  "spin-wheel": "spin-wheel",
};

export const INPUT_PLACEHOLDER = "";

export const MODE_FEEDBACK: Record<CoachingMode, string> = {
  today: "Chat — I'm here with you.",
  focus: "Focus — let's take it one step at a time.",
  "how-do-i": "Let's walk through this together.",
  playbook: "Let's work on what you're creating.",
  progress: "Let's take one gentle step forward.",
};
