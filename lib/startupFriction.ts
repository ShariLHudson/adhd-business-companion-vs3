/**
 * Momentum Sprint #1 — reduce startup friction (home, focus routing hints).
 * Reads existing stores only.
 */

import type { AppSection, SidebarNavId } from "./companionUi";
import { getActiveAvatar } from "./companionStore";
import { loadDecisionCompassSession } from "./decisionCompassSessionStore";
import { loadWorkflowRecord } from "./createWorkflowRecordStore";
import { getActiveSavedWork } from "./savedWorkStore";
import { buildContinuityManifest, HOME_RESUME_CONTINUITY_TYPES } from "./continuityManifest";
import { findLatestHomeResumeItem } from "./homeResumeItem";
import { getUserStrategies } from "./userStrategies";
import { buildWeeklyWins } from "./weeklyWins";

export type StartupOpenTarget =
  | { kind: "section"; section: AppSection; nav?: SidebarNavId }
  | { kind: "saved-work"; savedWorkId: string }
  | { kind: "resume" }
  | { kind: "create-draft" };

export type HomeSuggestedStep = {
  id: string;
  reason: string;
  action: string;
  openTarget: StartupOpenTarget;
};

export type TodayMomentumStat = {
  id: string;
  label: string;
  count: number;
  icon: string;
};

export type CreateInspirationItem = {
  id: string;
  title: string;
  kind: "recent" | "suggestion" | "draft";
  artifactType: string;
  savedWorkId?: string;
  createType?: string;
};

export type FocusStartOption = {
  id: string;
  emoji: string;
  label: string;
  description: string;
};

/** @deprecated Use FOCUS_FEELING_ENTRIES from ./focusHub — feelings-only entry points. */
export { FOCUS_FEELING_ENTRIES as FOCUS_START_OPTIONS } from "./focusHub";

export function buildHomeSuggestedStep(): HomeSuggestedStep | null {
  for (const w of getActiveSavedWork()) {
    if (w.projectId || w.status === "archived") continue;
    const blob = `${w.artifactType} ${w.title}`.toLowerCase();
    if (/plan|workshop|sop|strategy|marketing|course|launch/.test(blob)) {
      return {
        id: `suggest:project:${w.id}`,
        reason: `You created "${w.title}" but haven't added it to a project yet.`,
        action: "Open and continue",
        openTarget: { kind: "saved-work", savedWorkId: w.id },
      };
    }
  }

  const session = loadDecisionCompassSession();
  if (session?.complete && session.exploration?.actionPlan) {
    const linked = getActiveSavedWork().some(
      (w) => w.tags.includes("decision-compass") && w.projectId,
    );
    if (!linked) {
      return {
        id: "suggest:decision",
        reason:
          "You completed a Decision Compass but haven't started the action plan in a project.",
        action: "Save action plan",
        openTarget: { kind: "section", section: "decision-compass" },
      };
    }
  }

  const workflow = loadWorkflowRecord();
  if (workflow?.draftContent?.trim() && workflow.draftStatus !== "ready") {
    return {
      id: "suggest:draft",
      reason: "You have a create draft in progress.",
      action: "Continue draft",
      openTarget: { kind: "create-draft" },
    };
  }

  const manifest = buildContinuityManifest();
  const resumeTypes = manifest.items.filter((i) =>
    HOME_RESUME_CONTINUITY_TYPES.has(i.type),
  );
  if (resumeTypes.length > 1 && !findLatestHomeResumeItem()) {
    return {
      id: "suggest:my-work",
      reason: "You have several things in progress.",
      action: "See everything in My Work",
      openTarget: { kind: "section", section: "my-work", nav: "my-work" },
    };
  }

  return null;
}

export function buildTodayMomentum(): TodayMomentumStat[] {
  const { stats } = buildWeeklyWins();
  return stats.map((stat) => ({
    id: stat.id,
    label: stat.label,
    count: stat.count,
    icon: stat.icon,
  }));
}

export function buildCreateInspiration(): CreateInspirationItem[] {
  const items: CreateInspirationItem[] = [];
  const seen = new Set<string>();

  for (const w of getActiveSavedWork().slice(0, 8)) {
    if (w.status === "archived") continue;
    const key = w.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      id: `recent:${w.id}`,
      title: w.title,
      kind: w.status === "draft" ? "draft" : "recent",
      artifactType: w.artifactType,
      savedWorkId: w.id,
    });
    if (items.length >= 3) break;
  }

  const workflow = loadWorkflowRecord();
  if (workflow?.draftContent?.trim() && workflow.draftStatus !== "ready") {
    const title =
      workflow.collectedAnswers.topic?.trim() ||
      workflow.collectedAnswers.title?.trim() ||
      "Continue Draft";
    if (!seen.has(title.toLowerCase())) {
      items.unshift({
        id: "draft:workflow",
        title,
        kind: "draft",
        artifactType: workflow.itemType || "Draft",
        createType: workflow.itemType ?? undefined,
      });
    }
  }

  const avatar = getActiveAvatar();
  const suggestions: CreateInspirationItem[] = [
    {
      id: "suggest:marketing",
      title: "Create a Marketing Plan",
      kind: "suggestion",
      artifactType: "Marketing Plan",
      createType: "Marketing Plan",
    },
    {
      id: "suggest:workshop",
      title: "Create a Workshop",
      kind: "suggestion",
      artifactType: "Workshop",
      createType: "Workshop",
    },
  ];
  if (avatar) {
    suggestions.push({
      id: "suggest:avatar",
      title: `Create Content for ${avatar.name}`,
      kind: "suggestion",
      artifactType: "Content",
      createType: "Social Media Post",
    });
  }

  for (const s of suggestions) {
    if (items.length >= 8) break;
    if (!seen.has(s.title.toLowerCase())) {
      items.push(s);
      seen.add(s.title.toLowerCase());
    }
  }

  return items;
}

export function activeAvatarSummary(): {
  id: string;
  name: string;
} | null {
  const avatar = getActiveAvatar();
  if (!avatar?.name?.trim()) return null;
  return { id: avatar.id, name: avatar.name };
}
