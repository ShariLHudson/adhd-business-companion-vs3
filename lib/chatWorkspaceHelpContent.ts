/**
 * Chat Workspace navigation — instructional copy for help articles, tooltips, and guidance.
 * Top bar: Clear My Mind, Plan My Day, Today's Reality (companion workspaces) + Chat Workspace ▼ (session context).
 */

export const TOP_NAV_COMPANION_WORKSPACES =
  "Clear My Mind, Plan My Day, and Today's Reality";

export const CHAT_WORKSPACE_MENU_HINT =
  "Chat Workspace manages your current conversation context — not your projects or memory.";

export const NEW_CHAT_INSTRUCTION = {
  label: "New Chat",
  menuPath: "Top navigation **💬 Chat Workspace** → **New Chat**",
  useWhen: "I want to start a completely new conversation.",
  summary:
    "Starts a fresh conversation with the companion while preserving your memory, projects, goals, analytics, and Founder Intelligence learning.",
  preserves: [
    "Memory and learning",
    "Founder Intelligence",
    "Analytics",
    "Projects and goals",
    "Your profile",
  ],
} as const;

export const NEW_DAYS_CHAT_INSTRUCTION = {
  label: "New Day's Chat",
  menuPath: "Top navigation **💬 Chat Workspace** → **New Day's Chat**",
  useWhen: "I'm starting a new day and want a clean daily workspace.",
  summary:
    "Starts a fresh day with the companion — a fresh daily conversation with today's planning workspace reset.",
  behavior: [
    "Starts a fresh daily conversation",
    "Resets Plan My Day",
    "Clears daily planning items",
    "Preserves memory and learning",
    "Preserves projects and goals",
    "Preserves Founder Intelligence",
  ],
} as const;

export const CHAT_WORKSPACE_NAV_MODEL = `The companion is the center. ${TOP_NAV_COMPANION_WORKSPACES} are companion workspaces in the top bar. Chat Workspace (💬) manages the current conversation context.`;
