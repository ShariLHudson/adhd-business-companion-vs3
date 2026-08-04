/**
 * P0.35 — Cluster-level operations on brain dump thoughts.
 */

import { BRAINDUMP_CATEGORY_GROUPS } from "./brainDumpCategories";
import { createOutcomeGoal } from "./goals/outcomeGoals";
import {
  saveProject,
  updateBrainDump,
  type BrainDumpEntry,
} from "./companionStore";
import type { ThoughtCluster } from "./brainDumpClusterModel";
import { getClusterEntryIds } from "./brainDumpClusterModel";

export function moveThoughtToCluster(
  entryId: string,
  targetClusterKey: string,
): void {
  if (targetClusterKey === "__worries__") {
    updateBrainDump(entryId, {
      contextType: "urgent",
      topic: "Worries",
    });
    return;
  }
  const group = BRAINDUMP_CATEGORY_GROUPS.find((g) => g.group === targetClusterKey);
  if (group) {
    updateBrainDump(entryId, {
      topic: targetClusterKey,
      category: group.categories[0],
    });
    return;
  }
  updateBrainDump(entryId, {
    topic: targetClusterKey,
    category: targetClusterKey,
  });
}

export function convertClusterToProject(
  cluster: ThoughtCluster,
  entries: BrainDumpEntry[],
): { projectId: string; count: number } | null {
  const ids = new Set(getClusterEntryIds(cluster));
  const clusterEntries = entries.filter((e) => ids.has(e.id));
  if (!clusterEntries.length) return null;

  const name = cluster.label.slice(0, 60) || "From Clear My Mind";
  const project = saveProject({
    name,
    goal: clusterEntries.map((e) => e.text).join("; ").slice(0, 200),
    horizon: "soon",
  });

  for (const entry of clusterEntries) {
    updateBrainDump(entry.id, {
      projectId: project.id,
      done: true,
      routedAction: "project",
    });
  }

  return { projectId: project.id, count: clusterEntries.length };
}

export function convertClusterToGoal(
  cluster: ThoughtCluster,
  entries: BrainDumpEntry[],
): { goalId: string; count: number } | null {
  const ids = new Set(getClusterEntryIds(cluster));
  const clusterEntries = entries.filter((e) => ids.has(e.id));
  if (!clusterEntries.length) return null;

  const statement =
    cluster.label.length > 3
      ? cluster.label
      : clusterEntries[0]!.text.slice(0, 120);
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 3);

  const goal = createOutcomeGoal({
    statement,
    metric: "Progress",
    targetValue: 1,
    deadline: deadline.toISOString().slice(0, 10),
    definitionOfDone: `Thoughts from Clear My Mind cluster "${cluster.label}" are linked here.`,
    whyItMatters: clusterEntries.map((e) => e.text).join(" · ").slice(0, 300),
    supportingActivities: clusterEntries.map((e) => e.text.slice(0, 80)),
  });

  for (const entry of clusterEntries) {
    updateBrainDump(entry.id, {
      outcomeGoalId: goal.id,
      done: true,
      routedAction: "goal",
    });
  }

  return { goalId: goal.id, count: clusterEntries.length };
}
