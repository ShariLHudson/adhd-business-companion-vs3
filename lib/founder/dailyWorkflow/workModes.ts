import type { FounderWorkMode, FounderWorkModeId } from "./types";
import type { FounderWorkspaceId } from "../types/workspace";
import type { WorkspaceSuggestion } from "../concierge/types";

export const FOUNDER_WORK_MODES: readonly FounderWorkMode[] = [
  {
    id: "think",
    label: "Think",
    summary: "Strategy, decisions, and long-view clarity.",
    workspaceIds: ["discover", "simplify"],
    roomIds: ["executive-strategy", "reflection", "knowledge-library"],
  },
  {
    id: "build",
    label: "Build",
    summary: "Products, architecture, and Spark capabilities.",
    workspaceIds: ["build"],
    roomIds: ["spark-command", "innovation", "strategy"],
  },
  {
    id: "create",
    label: "Create",
    summary: "Workshops, courses, and new offers.",
    workspaceIds: ["grow"],
    roomIds: ["creation-studio", "greenhouse"],
  },
  {
    id: "grow",
    label: "Grow",
    summary: "Revenue, campaigns, and business momentum.",
    workspaceIds: ["grow"],
    roomIds: ["opportunity-vault", "creation-studio"],
  },
  {
    id: "review",
    label: "Review",
    summary: "Reflection, archives, and what can wait.",
    workspaceIds: ["simplify", "discover"],
    roomIds: ["reflection", "decision-vault"],
  },
  {
    id: "lead",
    label: "Lead",
    summary: "Team execution, approvals, and publishing.",
    workspaceIds: ["team"],
    roomIds: ["team-hub"],
  },
] as const;

const WORKSPACE_TO_MODE: Partial<Record<FounderWorkspaceId | "executive-strategy", FounderWorkModeId>> = {
  start: "think",
  discover: "think",
  build: "build",
  grow: "grow",
  team: "lead",
  simplify: "review",
  "executive-strategy": "think",
};

export function getWorkMode(id: FounderWorkModeId): FounderWorkMode {
  const mode = FOUNDER_WORK_MODES.find((m) => m.id === id);
  if (!mode) throw new Error(`Unknown work mode: ${id}`);
  return mode;
}

export function resolveWorkModeFromSuggestion(
  suggestion: WorkspaceSuggestion,
): FounderWorkMode {
  const modeId =
    WORKSPACE_TO_MODE[suggestion.workspaceId] ?? "think";
  return getWorkMode(modeId);
}

export function listWorkModes(): readonly FounderWorkMode[] {
  return FOUNDER_WORK_MODES;
}
