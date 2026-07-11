/**
 * Chamber of Momentum — demo room experience (Phase 7).
 * Surfaces momentum path + progress only when data exists — no empty dashboard sections.
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_DEMO_EXPERIENCE_AND_VISUAL_ROOM_SPECIFICATION_PHASE7.md
 */

import { getMomentumEvents, getProjects, getWeekMomentum } from "@/lib/companionStore";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import {
  readMomentumPathMilestones,
  type MomentumPathMilestoneKind,
} from "@/lib/momentumBuilderRoom/momentumPathHooks";
import { getChamberProjectMeta } from "./chamberProjectMeta";

export type ChamberMomentumPathItem = {
  id: string;
  trademark: string;
  label: string;
  detail?: string;
};

export type ChamberProgressMoment = {
  id: string;
  label: string;
  ts: string;
  kind: "win" | "momentum" | "project";
};

function milestoneTrademark(kind: MomentumPathMilestoneKind): string | null {
  switch (kind) {
    case "first_step_taken":
      return "First Step";
    case "easy_win_completed":
      return "Easy Wins";
    case "focus_session_honored":
      return "Focus Session";
    case "roadblock_named":
      return "Roadblocks";
    default:
      return null;
  }
}

/** Current movement — only populated items, max four. */
export function buildChamberMomentumPathItems(): ChamberMomentumPathItem[] {
  const items: ChamberMomentumPathItem[] = [];

  const activeProjects = getProjects().filter(
    (project) =>
      project.status !== "completed" &&
      project.status !== "paused" &&
      project.nextAction.trim().length > 0,
  );
  const focusProject =
    activeProjects.find(
      (project) =>
        getChamberProjectMeta(project.id)?.momentumState === "active-focus",
    ) ?? activeProjects[0];

  if (focusProject) {
    items.push({
      id: `first-step-${focusProject.id}`,
      trademark: "First Step",
      label: focusProject.nextAction.trim(),
      detail: focusProject.name,
    });
  }

  for (const milestone of readMomentumPathMilestones().slice(-2)) {
    const trademark = milestoneTrademark(milestone.milestoneKind);
    if (!trademark) continue;
    items.push({
      id: milestone.id,
      trademark,
      label: milestone.label,
    });
  }

  return items.slice(0, 4);
}

/** Recent wins and movement — max three moments. */
export function buildChamberProgressMoments(): ChamberProgressMoment[] {
  const moments: ChamberProgressMoment[] = [];

  for (const win of getSavedGrowthWins().slice(0, 2)) {
    moments.push({
      id: win.id,
      label: win.whatHappened,
      ts: win.ts,
      kind: "win",
    });
  }

  const movementSource =
    getWeekMomentum().length > 0 ? getWeekMomentum() : getMomentumEvents(6);
  for (const event of movementSource) {
    if (moments.length >= 3) break;
    if (moments.some((moment) => moment.id === event.id)) continue;
    moments.push({
      id: event.id,
      label: event.label,
      ts: event.ts,
      kind: "momentum",
    });
  }

  return moments.slice(0, 3);
}

export function hasChamberSupplementalPanels(): boolean {
  return (
    buildChamberMomentumPathItems().length > 0 ||
    buildChamberProgressMoments().length > 0
  );
}
