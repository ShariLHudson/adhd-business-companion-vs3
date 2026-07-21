/**
 * Thin origin adapters — every required Estate origin builds one contract.
 */

import type { AnywhereWorkOrigin, BlueprintDepthMode } from "../types";
import type { ShariWorkMode, UniversalLaunchContract } from "./types";
import { resolveAnywhereOriginWork } from "./resolveAnywhereOriginWork";
import type { AnywhereOriginResolution } from "./types";

export type OriginLaunchHints = {
  userIntent?: string | null;
  originalUserMessage?: string | null;
  candidateWorkTypeId?: string | null;
  candidateBlueprintId?: string | null;
  relatedWorkId?: string | null;
  projectId?: string | null;
  sectionId?: string | null;
  taskId?: string | null;
  cartographyNodeId?: string | null;
  conversationId?: string | null;
  chamberMemberId?: string | null;
  boardReviewId?: string | null;
  researchRecordId?: string | null;
  bodyDoublingSessionId?: string | null;
  clearMyMindThoughtId?: string | null;
  knownContext?: Readonly<Record<string, string>>;
  requestedDepth?: BlueprintDepthMode | null;
  shariMode?: ShariWorkMode | null;
  forceNew?: boolean;
  applyApproved?: boolean;
  confirmMultiCreate?: boolean;
};

function contractFor(
  origin: AnywhereWorkOrigin,
  hints: OriginLaunchHints = {},
): UniversalLaunchContract {
  return {
    origin,
    userIntent: hints.userIntent ?? null,
    originalUserMessage: hints.originalUserMessage ?? null,
    candidateWorkTypeId: hints.candidateWorkTypeId ?? null,
    candidateBlueprintId: hints.candidateBlueprintId ?? null,
    relatedWorkId: hints.relatedWorkId ?? null,
    projectId: hints.projectId ?? null,
    sectionId: hints.sectionId ?? null,
    taskId: hints.taskId ?? null,
    cartographyNodeId: hints.cartographyNodeId ?? null,
    conversationId: hints.conversationId ?? null,
    chamberMemberId: hints.chamberMemberId ?? null,
    boardReviewId: hints.boardReviewId ?? null,
    researchRecordId: hints.researchRecordId ?? null,
    bodyDoublingSessionId: hints.bodyDoublingSessionId ?? null,
    clearMyMindThoughtId: hints.clearMyMindThoughtId ?? null,
    knownContext: hints.knownContext,
    requestedDepth: hints.requestedDepth ?? null,
    shariMode: hints.shariMode ?? null,
    forceNew: hints.forceNew,
    applyApproved: hints.applyApproved,
    confirmMultiCreate: hints.confirmMultiCreate,
  };
}

export function launchFromOrigin(
  origin: AnywhereWorkOrigin,
  hints?: OriginLaunchHints,
): AnywhereOriginResolution {
  return resolveAnywhereOriginWork(contractFor(origin, hints));
}

export const launchFromCreate = (h?: OriginLaunchHints) =>
  launchFromOrigin("create", h);
export const launchFromProjects = (h?: OriginLaunchHints) =>
  launchFromOrigin("projects", h);
export const launchFromStrategies = (h?: OriginLaunchHints) =>
  launchFromOrigin("strategies", h);
export const launchFromBlueprints = (h?: OriginLaunchHints) =>
  launchFromOrigin("blueprints", h);
export const launchFromCartography = (h?: OriginLaunchHints) =>
  launchFromOrigin("cartography", h);
export const launchFromBodyDoubling = (h?: OriginLaunchHints) =>
  launchFromOrigin("body_doubling", {
    ...h,
    requestedMode: undefined,
  });
export const launchFromShari = (
  h: OriginLaunchHints & { shariMode?: ShariWorkMode },
) =>
  launchFromOrigin("conversation", {
    ...h,
    shariMode: h.shariMode ?? "talk_only",
  });
export const launchFromChamber = (h?: OriginLaunchHints) =>
  launchFromOrigin("chamber", h);
export const launchFromBoard = (h?: OriginLaunchHints) =>
  launchFromOrigin("board", h);
export const launchFromResearch = (h?: OriginLaunchHints) =>
  launchFromOrigin("research", h);
export const launchFromClearMyMind = (h?: OriginLaunchHints) =>
  launchFromOrigin("clear_my_mind", h);
export const launchFromTasks = (h?: OriginLaunchHints) =>
  launchFromOrigin("tasks", h);
export const launchFromWelcomeHome = (h?: OriginLaunchHints) =>
  launchFromOrigin("welcome_home", h);
export const launchFromTemplates = (h?: OriginLaunchHints) =>
  launchFromOrigin("templates", h);

/** All required 103 origins — used by certification tests. */
export const REQUIRED_ANYWHERE_ORIGINS: readonly AnywhereWorkOrigin[] = [
  "create",
  "projects",
  "strategies",
  "blueprints",
  "cartography",
  "body_doubling",
  "conversation",
  "chamber",
  "board",
  "research",
  "clear_my_mind",
  "tasks",
  "welcome_home",
  "templates",
] as const;
