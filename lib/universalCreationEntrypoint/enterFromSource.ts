/**
 * 055 — Convenience entry helpers for each platform surface.
 */

import { resolveUniversalCreationEntrypoint } from "./resolveUniversalCreationEntrypoint";
import type {
  CreationEntrySource,
  ResolveEntrypointInput,
  UniversalCreationEntrypointResult,
} from "./types";

function enter(
  source: CreationEntrySource,
  input: Omit<ResolveEntrypointInput, "entrySource">,
): UniversalCreationEntrypointResult {
  return resolveUniversalCreationEntrypoint({ ...input, entrySource: source });
}

export const enterCreationFromShari = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("shari", input);

export const enterCreationFromCreate = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("create", input);

export const enterCreationFromProjects = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("projects", input);

export const enterCreationFromChamber = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("chamber", input);

export const enterCreationFromBoard = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("board", input);

export const enterCreationFromCartography = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("cartography", input);

export const enterCreationFromDashboard = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("dashboard", input);

export const enterCreationFromHome = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("home", input);

export const enterCreationFromSearch = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("search", input);

export const enterCreationFromConversation = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("conversation", input);

export const enterCreationFromNotification = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("notification", input);

export const enterCreationFromRecommendation = (
  input: Omit<ResolveEntrypointInput, "entrySource">,
) => enter("recommendation", input);

/** All sources share one resolver — no per-workspace routing forks. */
export const CREATION_ENTRY_SOURCES: readonly CreationEntrySource[] = [
  "shari",
  "create",
  "projects",
  "chamber",
  "board",
  "cartography",
  "dashboard",
  "home",
  "search",
  "conversation",
  "asset",
  "notification",
  "recommendation",
  "related_work",
] as const;
