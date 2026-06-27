/**
 * Home resume — one unfinished workspace item, never chat snippets.
 * Reads from ContinuityManifest (single source of truth).
 */

import { getActivityById } from "./companionActivities";
import {
  buildContinuityManifest,
  HOME_RESUME_CONTINUITY_TYPES,
  type ContinuityManifestItem,
} from "./continuityManifest";
import { pickEligibleContinuityItem } from "./resumeWorkSignals";

export type HomeResumeItemKind =
  | "create"
  | "project"
  | "client-avatar"
  | "decision-compass"
  | "quick-two-option"
  | "strategy"
  | "workspace"
  | "visual-focus";

export type HomeResumeItem = {
  id: string;
  kind: HomeResumeItemKind;
  title: string;
  typeLabel: string;
  lastAction: string;
  nextStep: string;
  ts: string;
  projectId?: string;
  avatarId?: string;
  activityId?: string;
  strategyId?: string;
};

/** Map a continuity manifest row to a home resume item. */
export function homeResumeFromContinuityItem(
  item: ContinuityManifestItem,
): HomeResumeItem {
  return continuityToHomeResume(item);
}

function continuityToHomeResume(item: ContinuityManifestItem): HomeResumeItem {
  const kind: HomeResumeItemKind =
    item.type === "create-draft" || item.type === "create-saved-for-later"
      ? "create"
      : item.type === "workspace-sop"
        ? "workspace"
        : item.type === "client-avatar"
          ? "client-avatar"
          : item.type === "decision-compass"
            ? "decision-compass"
            : item.type === "strategy-apply"
              ? "strategy"
              : item.type === "visual-focus-map"
                ? "visual-focus"
                : "project";

  return {
    id: item.id,
    kind,
    title: item.title,
    typeLabel: item.location.split(">")[0]?.trim() || resumeTypeLabel(item.type),
    lastAction: item.nextStep ?? "Continue where you left off",
    nextStep: item.nextStep ?? "Continue where you left off",
    ts: item.lastTouchedAt,
    projectId: item.projectId,
    avatarId: item.avatarId,
    activityId:
      item.type === "decision-compass" ? "decision-compass" : undefined,
    strategyId:
      item.type === "strategy-apply"
        ? item.id.replace(/^strategy-apply:/, "")
        : undefined,
  };
}

function resumeTypeLabel(type: ContinuityManifestItem["type"]): string {
  switch (type) {
    case "visual-focus-map":
      return "Visual Thinking";
    case "decision-compass":
      return "Decision Compass";
    case "strategy-apply":
      return "Strategies";
    case "project":
      return "Projects";
    case "workspace-sop":
      return "SOPs";
    case "client-avatar":
      return "Audience Profile";
    default:
      return "Documents";
  }
}

/** Latest eligible genuine work — never navigation-only opens or chat snippets. */
export function findLatestHomeResumeItem(): HomeResumeItem | null {
  const manifest = buildContinuityManifest();
  const candidates = manifest.items.filter((item) =>
    HOME_RESUME_CONTINUITY_TYPES.has(item.type),
  );
  const eligible = pickEligibleContinuityItem(candidates);
  if (!eligible) return null;
  return continuityToHomeResume(eligible);
}

/** @internal tests */
export function homeResumeItemFromActivityId(
  activityId: string,
  updatedAt: string,
): HomeResumeItem | null {
  const activity = getActivityById(activityId);
  if (!activity) return null;
  if (activity.id === "decision-compass") {
    return {
      id: "activity:decision-compass",
      kind: "decision-compass",
      title: activity.title,
      typeLabel: "Decision Compass",
      lastAction: "Pick up your Decision Compass beside chat",
      nextStep: "Pick up your Decision Compass beside chat",
      ts: updatedAt,
      activityId: "decision-compass",
    };
  }
  if (activity.id === "two-option") {
    return {
      id: "activity:two-option",
      kind: "quick-two-option",
      title: activity.title,
      typeLabel: "Decision Compass",
      lastAction: "Continue your quick two-option choice",
      nextStep: "Continue your quick two-option choice",
      ts: updatedAt,
      activityId: "two-option",
    };
  }
  return null;
}

/** @internal tests — eligible resume items, newest first */
export function listHomeResumeCandidates(): HomeResumeItem[] {
  const manifest = buildContinuityManifest();
  const candidates = manifest.items.filter((item) =>
    HOME_RESUME_CONTINUITY_TYPES.has(item.type),
  );
  const latest = findLatestHomeResumeItem();
  if (!latest) return [];
  return [latest];
}

const SESSION_DISMISS_KEY = "companion-home-resume-dismiss-v1";

/** True when the user chose Not Now for this item in the current browser session. */
export function isHomeResumeDismissedForSession(itemId: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_DISMISS_KEY) === itemId;
  } catch {
    return false;
  }
}

/** Hide the home resume reminder until the tab/session ends — does not delete work. */
export function dismissHomeResumeForSession(itemId: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_DISMISS_KEY, itemId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearHomeResumeDismissForSession(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_DISMISS_KEY);
  } catch {
    /* ignore */
  }
}

// Re-export for callers that need full manifest access.
export { buildContinuityManifest } from "./continuityManifest";
