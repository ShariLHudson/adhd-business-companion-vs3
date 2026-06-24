/**
 * P0.16.2 — browser-visible Create open tracing.
 */

import type { AppSection } from "./companionUi";
import type { ChatLayoutMode } from "./workspaceNav";
import { CREATE_PANEL_SECTION } from "./openCreateWorkspace";

export type CreateOpenLiveTraceStage =
  | "before_handler"
  | "after_resolve_hard_nav"
  | "after_open_create_workspace"
  | "after_request_create_open"
  | "after_patch_workspace_panel"
  | "after_react_settle_100ms"
  | "after_react_settle_500ms"
  | "workspace_layout_render";

export type CreateOpenLiveTraceSnapshot = {
  traceId: string;
  stage: CreateOpenLiveTraceStage;
  command?: string;
  matchedHardNav?: boolean;
  hardNavTarget?: string | null;
  workspacePanel: AppSection | null;
  chatLayoutMode: ChatLayoutMode | null;
  workspaceActive: boolean;
  activeSection: AppSection | null;
  activeNav: string | null;
  rightPanelVisible: boolean;
  contentGeneratorMounted: boolean;
  createPanelMounted: boolean;
  createOpenRequest?: boolean | null;
  builderBootstrap?: boolean | null;
  hideWorkspacePanel?: boolean;
  patchBlocked?: boolean;
  patchFrom?: AppSection | null;
  patchTo?: AppSection | null;
  extra?: string;
};

let traceSeq = 0;

export function nextCreateOpenTraceId(command: string): string {
  traceSeq += 1;
  return `co-${traceSeq}-${command.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 24)}`;
}

export function isWorkspaceDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_WORKSPACE_DEBUG === "true";
}

export function buildCreateOpenLiveSnapshot(input: {
  traceId: string;
  stage: CreateOpenLiveTraceStage;
  command?: string;
  matchedHardNav?: boolean;
  hardNavTarget?: string | null;
  workspacePanel: AppSection | null;
  chatLayoutMode: ChatLayoutMode | null;
  workspaceActive: boolean;
  activeSection: AppSection | null;
  activeNav: string | null;
  createOpenRequest?: boolean | null;
  builderBootstrap?: boolean | null;
  hideWorkspacePanel?: boolean;
  patchBlocked?: boolean;
  patchFrom?: AppSection | null;
  patchTo?: AppSection | null;
  extra?: string;
}): CreateOpenLiveTraceSnapshot {
  const panel = input.workspacePanel;
  const createMounted = panel === CREATE_PANEL_SECTION;
  return {
    ...input,
    rightPanelVisible: createMounted && input.workspaceActive,
    contentGeneratorMounted: createMounted,
    createPanelMounted: createMounted,
  };
}

export function logCreateOpenLiveTrace(snapshot: CreateOpenLiveTraceSnapshot): void {
  if (typeof console === "undefined") return;
  const lines = [
    "[create-open-live-trace]",
    `traceId: ${snapshot.traceId}`,
    `stage: ${snapshot.stage}`,
    snapshot.command ? `command: ${snapshot.command}` : null,
    snapshot.matchedHardNav !== undefined
      ? `matchedHardNav: ${snapshot.matchedHardNav}`
      : null,
    snapshot.hardNavTarget !== undefined
      ? `hardNavTarget: ${snapshot.hardNavTarget ?? "null"}`
      : null,
    `workspacePanel: ${snapshot.workspacePanel ?? "null"}`,
    `chatLayoutMode: ${snapshot.chatLayoutMode ?? "null"}`,
    `workspaceActive: ${snapshot.workspaceActive}`,
    `activeSection: ${snapshot.activeSection ?? "null"}`,
    `activeNav: ${snapshot.activeNav ?? "null"}`,
    `rightPanelVisible: ${snapshot.rightPanelVisible}`,
    `contentGeneratorMounted: ${snapshot.contentGeneratorMounted}`,
    `createPanelMounted: ${snapshot.createPanelMounted}`,
    snapshot.createOpenRequest !== undefined
      ? `createOpenRequest: ${snapshot.createOpenRequest}`
      : null,
    snapshot.builderBootstrap !== undefined
      ? `builderBootstrap: ${snapshot.builderBootstrap}`
      : null,
    snapshot.hideWorkspacePanel !== undefined
      ? `hideWorkspacePanel: ${snapshot.hideWorkspacePanel}`
      : null,
    snapshot.patchBlocked ? `patchBlocked: true` : null,
    snapshot.patchFrom !== undefined || snapshot.patchTo !== undefined
      ? `patch: ${snapshot.patchFrom ?? "null"} → ${snapshot.patchTo ?? "null"}`
      : null,
    snapshot.extra ? `extra: ${snapshot.extra}` : null,
  ].filter(Boolean);
  console.log(lines.join("\n"));
}

export type CreateOpenLiveTraceBus = {
  latest: CreateOpenLiveTraceSnapshot | null;
  listeners: Set<(snapshot: CreateOpenLiveTraceSnapshot) => void>;
};

export const createOpenLiveTraceBus: CreateOpenLiveTraceBus = {
  latest: null,
  listeners: new Set(),
};

export function publishCreateOpenLiveTrace(
  snapshot: CreateOpenLiveTraceSnapshot,
): void {
  logCreateOpenLiveTrace(snapshot);
  createOpenLiveTraceBus.latest = snapshot;
  for (const listener of createOpenLiveTraceBus.listeners) {
    listener(snapshot);
  }
}

export function subscribeCreateOpenLiveTrace(
  listener: (snapshot: CreateOpenLiveTraceSnapshot) => void,
): () => void {
  createOpenLiveTraceBus.listeners.add(listener);
  return () => createOpenLiveTraceBus.listeners.delete(listener);
}

export function scheduleCreateOpenLiveTrace(
  delayMs: number,
  build: () => CreateOpenLiveTraceSnapshot,
): void {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    publishCreateOpenLiveTrace(build());
  }, delayMs);
}
