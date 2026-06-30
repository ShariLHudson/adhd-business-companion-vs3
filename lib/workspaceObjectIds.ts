/**
 * Maps app sections and tool ids to Companion Object Library entries.
 * Single lookup for navigation imagery — never use raw emoji for features.
 */

import type { AppSection } from "./companionUi";

export const WORKSPACE_OBJECT_ID: Partial<Record<AppSection, string>> = {
  home: "messages",
  projects: "projects",
  "my-work": "my-work",
  "content-generator": "create",
  "google-workspace": "google-workspace",
  "templates-library": "templates",
  "saved-work": "toolbelt-saved-work",
  playbook: "playbook",
  "how-do-i": "help",
  "brain-dump": "clear-my-mind",
  "time-block": "calendar",
  "email-generator": "email-generator",
  snippets: "toolbelt-snippets",
  "business-profile": "business",
  "client-avatars": "client-avatars",
  "decision-compass": "decision-compass",
  today: "calendar",
  "plan-my-day": "plan-my-day",
  "visual-focus": "visual-thinking",
  "wins-this-week": "wins",
  "evidence-bank": "evidence-bank",
  growth: "growth",
  "confidence-vault": "my-highlights",
  "my-journey": "my-journey",
  "welcome-room": "welcome-room",
  "life-experience": "life-experience",
  "the-gallery": "the-gallery",
  "focus-audio": "focus-audio",
  "focus-timer": "focus-timer",
  focus: "focus-my-brain",
  breathe: "breathing",
  energy: "todays-reality",
  activities: "games",
  "guided-exercises": "breathing",
  "spin-wheel": "spin-wheel",
  games: "games",
  "quick-recharge": "games",
  grow: "grow",
  "grow-momentum-builders": "momentum-builders",
  "grow-spark-cards": "spark-cards",
  "grow-guilds": "guilds",
  "grow-daily-discoveries": "daily-discoveries",
  "grow-business-history": "business-history",
  "grow-observatory": "observatory",
  settings: "settings",
  profile: "profile",
  progress: "growth",
  "content-types": "content-types",
};

export const STRESS_RELIEF_OBJECT_ID: Record<
  import("./stressRouting").StressReliefOptionId,
  string
> = {
  breathe: "breathing",
  "calm-audio": "focus-audio",
  "clear-mind": "clear-my-mind",
  "safe-for-today": "safe-for-today",
  "adjust-day": "todays-reality",
  "talk-through": "messages",
};

export const MOMENTUM_NEED_OBJECT_ID: Record<
  import("./momentumGames").MomentumNeedId,
  string
> = {
  "focus-attention": "momentum-focus-attention",
  "momentum-action": "momentum-action",
  "creative-spark": "momentum-creative-spark",
  "mental-vacation": "momentum-mental-vacation",
  "just-for-fun": "momentum-just-for-fun",
};

export const SIDEBAR_NAV_OBJECT_ID: Record<
  import("./companionUi").SidebarNavId,
  string
> = {
  chat: "messages",
  "clear-my-mind": "clear-my-mind",
  "plan-my-day": "plan-my-day",
  focus: "focus-my-brain",
  "todays-reality": "todays-reality",
  "visual-thinking": "visual-thinking",
  create: "create",
  grow: "grow",
  playbook: "playbook",
  growth: "the-gallery",
  journal: "journal",
  portfolio: "portfolio",
  "evidence-bank": "evidence-bank",
  "confidence-vault": "my-highlights",
  "welcome-room": "welcome-room",
  "fire-pit": "fire-pit",
  "butterfly-conservatory": "butterfly-conservatory",
  "rain-porch": "rain-porch",
  pool: "pool",
  "deck-balcony": "deck-balcony",
  other: "other-tools",
  "how-do-i": "help",
  tools: "other-tools",
  progress: "growth",
  projects: "projects",
  templates: "templates",
  snippets: "toolbelt-snippets",
  "saved-work": "toolbelt-saved-work",
  "my-work": "my-work",
  "client-avatars": "client-avatars",
  settings: "settings",
  "wins-this-week": "wins",
  "my-journey": "my-journey",
};

export const SIDEBAR_TOOL_OBJECT_ID: Record<
  import("./companionUi").SidebarToolId,
  string
> = {
  voice: "voice",
  "brain-dump": "clear-my-mind",
  "focus-timer": "focus-timer",
  breathe: "breathing",
  "focus-audio": "focus-audio",
  "reset-day": "messages",
  "new-chat": "messages",
  "time-block": "calendar",
  activities: "games",
  "guided-exercises": "breathing",
  "spin-wheel": "spin-wheel",
  games: "games",
};

export function workspaceObjectId(section: AppSection): string {
  return WORKSPACE_OBJECT_ID[section] ?? "other-tools";
}
