import type { FounderExperimentStatus } from "@/lib/founderWorkspace/tracking/types";

export function parseMilestones(testPlan: string): string[] {
  return testPlan
    .split(/\n/)
    .map((line) => line.replace(/^[-*•\d.)\]]+\s*/, "").trim())
    .filter(Boolean);
}

const STATUS_RATE: Record<FounderExperimentStatus, number> = {
  idea: 10,
  testing: 55,
  successful: 100,
  failed: 100,
  parked: 20,
};

export function milestoneProgress(
  status: FounderExperimentStatus | string,
  milestoneCount: number,
): { completed: number; rate: number } {
  const s = status as FounderExperimentStatus;
  if (milestoneCount <= 0) {
    return { completed: 0, rate: STATUS_RATE[s] ?? 0 };
  }
  const completedByStatus: Record<FounderExperimentStatus, number> = {
    idea: 0,
    testing: Math.max(1, Math.ceil(milestoneCount / 2)),
    successful: milestoneCount,
    failed: milestoneCount,
    parked: Math.floor(milestoneCount * 0.2),
  };
  const completed = completedByStatus[s] ?? 0;
  return {
    completed,
    rate: Math.round((completed / milestoneCount) * 100),
  };
}

export function avgDaysPerMilestone(
  createdAt: string,
  updatedAt: string,
  milestoneCount: number,
  finished: boolean,
): number | null {
  if (!finished || milestoneCount <= 0) return null;
  const ms = new Date(updatedAt).getTime() - new Date(createdAt).getTime();
  const days = ms / 86_400_000;
  if (days <= 0) return null;
  return Math.round((days / milestoneCount) * 10) / 10;
}
