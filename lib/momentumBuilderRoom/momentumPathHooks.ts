/**
 * Momentum Path™ — architecture hooks (V2 visual; V1 types + stub recorder).
 * Progress = journey stones through the Estate — not checklists or streaks.
 *
 * @see docs/MOMENTUM_BUILDER_V1_ORCHESTRATION.md
 */

import type { IntelligenceReadyHooks } from "@/lib/intelligence/intelligenceReadyTypes";

export type MomentumPathMilestoneKind =
  | "first_step_taken"
  | "easy_win_completed"
  | "focus_session_honored"
  | "roadblock_named"
  | "return_after_absence"
  | "meaningful_forward_motion";

export type MomentumPathMilestone = IntelligenceReadyHooks & {
  kind: "momentum-path-milestone";
  id: string;
  milestoneKind: MomentumPathMilestoneKind;
  label: string;
  recordedAt: string;
  /** Future: LIG edge to Today's Path™, project, or conversation. */
  todaysPathId?: string;
};

const MILESTONE_STORAGE_KEY = "spark-momentum-path-milestones-v1";

/** V1 — local stub; V2 persists to narrative / LIG. */
export function recordMomentumPathMilestone(
  milestone: Omit<MomentumPathMilestone, "kind">,
): MomentumPathMilestone {
  const record: MomentumPathMilestone = {
    kind: "momentum-path-milestone",
    ...milestone,
  };

  if (typeof window === "undefined") return record;

  try {
    const raw = window.localStorage.getItem(MILESTONE_STORAGE_KEY);
    const existing: MomentumPathMilestone[] = raw ? JSON.parse(raw) : [];
    existing.push(record);
    window.localStorage.setItem(
      MILESTONE_STORAGE_KEY,
      JSON.stringify(existing.slice(-50)),
    );
  } catch {
    // Fail silent — celebration still works in conversation
  }

  return record;
}

export function readMomentumPathMilestones(): MomentumPathMilestone[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MILESTONE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Stone count for V2 garden visual — meaningful milestones only. */
export function momentumPathStoneCount(): number {
  return readMomentumPathMilestones().length;
}
