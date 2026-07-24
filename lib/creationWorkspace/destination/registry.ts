/**
 * CreationWorkspaceHandoffRegistry — prevents duplicate destination creation,
 * stale reuse, and silent loss after navigation failure.
 */

import type { CreationWorkspaceHandoffDestination } from "../types";
import type {
  CreationWorkspaceHandoffRegistryEntry,
  CreationWorkspaceRegistryStatus,
} from "./contracts";
import { CREATION_WORKSPACE_HANDOFF_REGISTRY_KEY } from "./keys";

let memoryRegistry: CreationWorkspaceHandoffRegistryEntry[] = [];

function readStore(): CreationWorkspaceHandoffRegistryEntry[] {
  if (typeof window === "undefined") return memoryRegistry;
  try {
    const raw = window.sessionStorage.getItem(
      CREATION_WORKSPACE_HANDOFF_REGISTRY_KEY,
    );
    if (!raw) return memoryRegistry;
    const parsed = JSON.parse(raw) as CreationWorkspaceHandoffRegistryEntry[];
    if (!Array.isArray(parsed)) return memoryRegistry;
    memoryRegistry = parsed;
    return memoryRegistry;
  } catch {
    return memoryRegistry;
  }
}

function writeStore(entries: CreationWorkspaceHandoffRegistryEntry[]): void {
  memoryRegistry = entries;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      CREATION_WORKSPACE_HANDOFF_REGISTRY_KEY,
      JSON.stringify(entries),
    );
  } catch {
    /* ignore */
  }
}

export function listHandoffRegistryEntries(): CreationWorkspaceHandoffRegistryEntry[] {
  return [...readStore()];
}

export function getHandoffRegistryEntry(
  handoffId: string,
): CreationWorkspaceHandoffRegistryEntry | null {
  return readStore().find((e) => e.handoffId === handoffId) ?? null;
}

export function findActiveHandoffForDestination(input: {
  workspaceId: string;
  destination: CreationWorkspaceHandoffDestination;
}): CreationWorkspaceHandoffRegistryEntry | null {
  const active = new Set<CreationWorkspaceRegistryStatus>([
    "prepared",
    "opening",
    "ready_for_review",
    "consumed",
    "approved",
  ]);
  return (
    readStore().find(
      (e) =>
        e.workspaceId === input.workspaceId &&
        e.destination === input.destination &&
        active.has(e.status) &&
        e.status !== "failed" &&
        e.status !== "cancelled" &&
        e.status !== "superseded",
    ) ?? null
  );
}

/** True when a completed destination entity already exists for this workspace+dest. */
export function hasCompletedDestinationEntity(input: {
  workspaceId: string;
  destination: CreationWorkspaceHandoffDestination;
}): CreationWorkspaceHandoffRegistryEntry | null {
  return (
    readStore().find(
      (e) =>
        e.workspaceId === input.workspaceId &&
        e.destination === input.destination &&
        (e.status === "completed" || e.status === "approved") &&
        Boolean(e.destinationEntityId),
    ) ?? null
  );
}

export function registerPreparedHandoff(input: {
  handoffId: string;
  workspaceId: string;
  packageId: string;
  destination: CreationWorkspaceHandoffDestination;
  payloadVersion: string;
  status?: CreationWorkspaceRegistryStatus;
}): CreationWorkspaceHandoffRegistryEntry {
  const now = new Date().toISOString();
  const entries = readStore();
  // Supersede prior prepared/opening entries for same workspace+destination
  const next = entries.map((e) =>
    e.workspaceId === input.workspaceId &&
    e.destination === input.destination &&
    (e.status === "prepared" || e.status === "opening" || e.status === "ready_for_review")
      ? { ...e, status: "superseded" as const }
      : e,
  );
  const entry: CreationWorkspaceHandoffRegistryEntry = {
    handoffId: input.handoffId,
    workspaceId: input.workspaceId,
    packageId: input.packageId,
    destination: input.destination,
    payloadVersion: input.payloadVersion,
    status: input.status ?? "prepared",
    destinationEntityId: null,
    createdAt: now,
    consumedAt: null,
    failureStage: null,
    retryAction: null,
    lastSynchronizationAt: null,
  };
  writeStore([entry, ...next]);
  return entry;
}

export function updateHandoffRegistryEntry(
  handoffId: string,
  patch: Partial<
    Pick<
      CreationWorkspaceHandoffRegistryEntry,
      | "status"
      | "destinationEntityId"
      | "consumedAt"
      | "failureStage"
      | "retryAction"
      | "lastSynchronizationAt"
    >
  >,
): CreationWorkspaceHandoffRegistryEntry | null {
  const entries = readStore();
  let updated: CreationWorkspaceHandoffRegistryEntry | null = null;
  const next = entries.map((e) => {
    if (e.handoffId !== handoffId) return e;
    updated = { ...e, ...patch };
    return updated;
  });
  if (!updated) return null;
  writeStore(next);
  return updated;
}

export function markHandoffOpening(handoffId: string): void {
  updateHandoffRegistryEntry(handoffId, { status: "opening" });
}

export function markHandoffConsumed(
  handoffId: string,
  destinationEntityId?: string | null,
): void {
  updateHandoffRegistryEntry(handoffId, {
    status: "consumed",
    consumedAt: new Date().toISOString(),
    destinationEntityId: destinationEntityId ?? null,
    failureStage: null,
    retryAction: null,
  });
}

export function markHandoffFailed(
  handoffId: string,
  failureStage: string,
  retryAction = "retry_destination_open",
): void {
  updateHandoffRegistryEntry(handoffId, {
    status: "failed",
    failureStage,
    retryAction,
  });
}

export function markHandoffApproved(
  handoffId: string,
  destinationEntityId?: string | null,
): void {
  updateHandoffRegistryEntry(handoffId, {
    status: "approved",
    destinationEntityId: destinationEntityId ?? null,
    consumedAt: new Date().toISOString(),
  });
}

export function markHandoffCompleted(
  handoffId: string,
  destinationEntityId?: string | null,
): void {
  updateHandoffRegistryEntry(handoffId, {
    status: "completed",
    destinationEntityId: destinationEntityId ?? null,
    consumedAt: new Date().toISOString(),
  });
}

export function isHandoffReusable(handoffId: string): boolean {
  const entry = getHandoffRegistryEntry(handoffId);
  if (!entry) return true; // not registered yet — allow first consume attempt
  if (entry.status === "superseded" || entry.status === "cancelled") return false;
  if (entry.status === "completed" || entry.status === "consumed") {
    // Allow reopen of existing entity, not duplicate create
    return false;
  }
  if (entry.status === "failed") return true;
  return (
    entry.status === "prepared" ||
    entry.status === "opening" ||
    entry.status === "ready_for_review"
  );
}

export function __resetHandoffRegistryForTests(): void {
  memoryRegistry = [];
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CREATION_WORKSPACE_HANDOFF_REGISTRY_KEY);
  } catch {
    /* ignore */
  }
}
