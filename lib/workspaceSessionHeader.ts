/**
 * Stable chat header per workspace session — set on entry, unchanged until switch.
 */

import { getActivityById } from "./companionActivities";
import type { AppSection } from "./companionUi";
import {
  CLIENT_AVATAR_KICKOFF_HEADER,
  CREATE_COMPANION_STABLE_HEADER,
} from "./builderKickoff";

export const HOME_CHAT_SESSION_HEADER =
  "What feels most important right now?";

export const CHAT_SESSION_HEADER = "What can I help you with?";

const SECTION_HEADERS: Partial<Record<AppSection, string>> = {
  focus: "What are you trying to focus on right now?",
  "focus-timer": "What are you trying to focus on right now?",
  "focus-audio": "What are you trying to focus on right now?",
  breathe: "What are you trying to focus on right now?",
  "brain-dump": "What's taking up space in your head?",
  "content-generator": "What would you like to create?",
  projects: "What are we working on today?",
  playbook: "What challenge are you trying to solve?",
  "client-avatars": CLIENT_AVATAR_KICKOFF_HEADER,
  "decision-compass": "What decision are you working through?",
  "time-block": "What should we protect time for?",
  energy: "How should we adjust your day?",
  activities: "What would help most right now?",
  "guided-exercises": "What would you like to work through?",
  "spin-wheel": "What are you trying to focus on right now?",
  games: "What would give you a quick momentum boost?",
  "templates-library": "Which template are we shaping?",
  "saved-work": "What saved work are we opening?",
  snippets: "Which snippet are we using?",
  "google-workspace": "What should we do with this file?",
  "business-profile": "What should we capture about your business?",
  "how-do-i": "What do you want to learn step by step?",
  progress: "What progress are we celebrating or planning?",
  "email-generator": "What email are we drafting?",
  "content-types": "What type of content are we creating?",
};

const ACTIVITY_HEADERS: Record<string, string> = {
  "decision-compass": "What decision are you trying to make?",
  "two-option": "What decision are you trying to make?",
  "decision-matrix": "What decision are you trying to make?",
  "safe-for-today": "What can wait until you're ready?",
  "brain-parking-lot": "What idea should we park for later?",
  "priority-sort": "What needs sorting first?",
  "values-check": "What values are we checking against?",
  "goal-clarifier": "What goal are we clarifying?",
  "project-breakdown": "What project are we breaking down?",
};

export type WorkspaceSessionHeaderContext = {
  calmHome: boolean;
  workspacePanel: AppSection | null;
  companionStandaloneSection: AppSection | null;
  activeSection: AppSection;
  activityId: string | null;
  splitCreateChat: boolean;
  createBuilderActive: boolean;
};

export function workspaceSessionKey(
  ctx: WorkspaceSessionHeaderContext,
): string {
  if (ctx.calmHome) return "home";
  if (ctx.splitCreateChat && ctx.createBuilderActive) return "create-builder";
  if (ctx.workspacePanel) return `panel:${ctx.workspacePanel}`;
  if (ctx.activityId) return `activity:${ctx.activityId}`;
  if (ctx.companionStandaloneSection) {
    return `standalone:${ctx.companionStandaloneSection}`;
  }
  if (ctx.activeSection !== "home") {
    return `section:${ctx.activeSection}`;
  }
  return "chat";
}

export function headerForWorkspaceSession(
  ctx: WorkspaceSessionHeaderContext,
): string {
  if (ctx.calmHome) return HOME_CHAT_SESSION_HEADER;

  if (ctx.splitCreateChat && ctx.createBuilderActive) {
    return CREATE_COMPANION_STABLE_HEADER;
  }

  if (ctx.activityId) {
    const mapped = ACTIVITY_HEADERS[ctx.activityId];
    if (mapped) return mapped;
    const activity = getActivityById(ctx.activityId);
    if (activity?.title) return activity.title;
  }

  const section =
    ctx.workspacePanel ??
    ctx.companionStandaloneSection ??
    (ctx.activeSection !== "home" ? ctx.activeSection : null);

  if (section) {
    return SECTION_HEADERS[section] ?? CHAT_SESSION_HEADER;
  }

  return CHAT_SESSION_HEADER;
}
