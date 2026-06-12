import type { CursorPromptInput } from "../cursorPromptGenerator";
import type {
  FounderTrackedExperiment,
  FounderTrackedIssue,
} from "../tracking/types";
import type { FounderWorkspaceItem } from "../types";

export type ImpactLevel = "high" | "medium" | "low";
export type EffortLevel = "high" | "medium" | "low";

export type ActionCenterSource =
  | { kind: "issue"; issue: FounderTrackedIssue }
  | { kind: "project"; project: FounderWorkspaceItem }
  | { kind: "experiment"; experiment: FounderTrackedExperiment }
  | { kind: "focus"; title: string; reason: string };

export type FounderRecommendedTask = {
  title: string;
  reason: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  status: string;
  source: ActionCenterSource;
  navigateTo?: "issue" | "dev_experiment" | "project";
  itemId?: string;
  issueFilter?: "retest";
  cursorContext: CursorPromptInput | null;
};
