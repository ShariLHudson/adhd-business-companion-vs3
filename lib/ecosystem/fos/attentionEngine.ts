// Founder Ecosystem — Phase 8 Attention Engine.
// What's competing for the founder's attention? Too many projects, priorities,
// opportunities or unfinished items. Returns an attention load score + a plain
// list of what's pulling. Pure.

import type { AttentionState } from "./fosTypes";
import { clamp } from "./fosUtil";

export type AttentionInputs = {
  activeProjects: number;
  openPriorities: number;
  openOpportunities: number;
  openTasks: number;
  openDecisions: number;
};

export function computeAttention(i: AttentionInputs): AttentionState {
  const unfinishedItems = i.openTasks + i.openDecisions;
  const competing: string[] = [];

  if (i.activeProjects > 3) competing.push(`${i.activeProjects} active projects`);
  if (i.openPriorities > 5) competing.push(`${i.openPriorities} competing priorities`);
  if (i.openOpportunities > 4)
    competing.push(`${i.openOpportunities} open opportunities`);
  if (unfinishedItems > 8) competing.push(`${unfinishedItems} unfinished items`);
  if (i.openDecisions > 2) competing.push(`${i.openDecisions} decisions waiting`);

  const loadScore = clamp(
    i.activeProjects * 8 +
      unfinishedItems * 4 +
      i.openOpportunities * 5 +
      i.openDecisions * 4,
  );
  const level: AttentionState["level"] =
    loadScore >= 66 ? "overloaded" : loadScore >= 33 ? "busy" : "clear";

  return {
    loadScore,
    level,
    activeProjects: i.activeProjects,
    openPriorities: i.openPriorities,
    openOpportunities: i.openOpportunities,
    unfinishedItems,
    competing,
  };
}
