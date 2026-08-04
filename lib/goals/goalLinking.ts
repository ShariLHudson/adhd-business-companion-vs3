/**
 * P0.33 / P0.34 — explicit Outcome Goal™ links across growth stores and workspaces.
 */

import type { EvidenceEntry } from "../evidenceBankStore";
import type { SavedGrowthWin } from "../growthWinsStore";
import type { JourneyEntry } from "../myJourneyStore";
import type { Project } from "../companionStore";
import type { PlanDayItem } from "../planMyDay/types";
import type { OutcomeGoal } from "./outcomeGoals";
import { getGoalMetrics } from "./outcomeGoals";

export type GoalLinkable = {
  outcomeGoalId?: string;
  outcomeGoalIds?: string[];
};

/** Normalize single + multi goal links into a deduped id list. */
export function getLinkedGoalIds(
  item: GoalLinkable | null | undefined,
): string[] {
  if (!item) return [];
  const fromArray = (item.outcomeGoalIds ?? []).filter(Boolean);
  if (fromArray.length > 0) return [...new Set(fromArray)];
  if (item.outcomeGoalId) return [item.outcomeGoalId];
  return [];
}

export function itemLinkedToGoal(
  item: GoalLinkable | null | undefined,
  goalId: string,
): boolean {
  return getLinkedGoalIds(item).includes(goalId);
}

/** Persist both fields — first id remains primary for legacy readers. */
export function packGoalLinks(ids: string[]): {
  outcomeGoalId?: string;
  outcomeGoalIds?: string[];
} {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  return { outcomeGoalId: unique[0], outcomeGoalIds: unique };
}

export function growthItemSupportsGoal(
  text: string,
  goal: OutcomeGoal,
  explicitGoalIds?: string | string[],
): boolean {
  const ids = Array.isArray(explicitGoalIds)
    ? explicitGoalIds
    : explicitGoalIds
      ? [explicitGoalIds]
      : [];
  if (ids.includes(goal.id)) return true;

  const t = text.toLowerCase();
  const sources = [
    goal.statement,
    goal.metric,
    goal.definitionOfDone,
    ...goal.supportingActivities,
    ...getGoalMetrics(goal).map((m) => m.label),
  ];
  const tokens = sources
    .join(" ")
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);

  return tokens.some((token) => {
    if (t.includes(token)) return true;
    const stem = token.replace(/s$/, "");
    return stem.length > 2 && t.includes(stem);
  });
}

export function winSupportsGoal(win: SavedGrowthWin, goal: OutcomeGoal): boolean {
  return growthItemSupportsGoal(
    win.whatHappened,
    goal,
    getLinkedGoalIds(win),
  );
}

export function evidenceSupportsGoal(
  entry: EvidenceEntry,
  goal: OutcomeGoal,
): boolean {
  return growthItemSupportsGoal(
    `${entry.whatHappened} ${entry.whyItMattered} ${entry.whatThisProves}`,
    goal,
    getLinkedGoalIds(entry),
  );
}

export function journeySupportsGoal(
  entry: JourneyEntry,
  goal: OutcomeGoal,
): boolean {
  return growthItemSupportsGoal(
    `${entry.title} ${entry.whatHappened} ${entry.whatDidILearn}`,
    goal,
    getLinkedGoalIds(entry),
  );
}

export function projectSupportsGoal(project: Project, goal: OutcomeGoal): boolean {
  if (itemLinkedToGoal(project, goal.id)) return true;
  return growthItemSupportsGoal(
    `${project.name} ${project.goal} ${(project.goals ?? []).join(" ")}`,
    goal,
  );
}

export function planItemSupportsGoal(
  item: PlanDayItem,
  goal: OutcomeGoal,
): boolean {
  if (itemLinkedToGoal(item, goal.id)) return true;
  return growthItemSupportsGoal(item.title, goal);
}

export function outcomeGoalLabel(
  goalId: string | undefined,
  goals: OutcomeGoal[],
): string | null {
  if (!goalId) return null;
  return goals.find((g) => g.id === goalId)?.statement ?? null;
}

export function outcomeGoalLabels(
  goalIds: string[],
  goals: OutcomeGoal[],
): string[] {
  return goalIds
    .map((id) => outcomeGoalLabel(id, goals))
    .filter((l): l is string => Boolean(l));
}
