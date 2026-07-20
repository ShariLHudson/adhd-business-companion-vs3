/**
 * Event Asset Instances — created assets for one Event Record.
 * Registry definitions never store event-specific content.
 */

import type { EventRecord } from "../types";
import { getEventAssetDefinition } from "./query";
import type {
  EventAssetInstance,
  EventAssetInstantiationLinks,
} from "./types";

const STORAGE_KEY = "companion-event-asset-instances-v1";

function newId(): string {
  return `eai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readAll(): EventAssetInstance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EventAssetInstance[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: EventAssetInstance[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* quota */
  }
}

export function listEventAssetInstances(
  eventRecordId?: string,
): EventAssetInstance[] {
  const all = readAll();
  return eventRecordId
    ? all.filter((i) => i.eventRecordId === eventRecordId)
    : all;
}

export function getEventAssetInstance(
  instanceId: string,
): EventAssetInstance | null {
  return readAll().find((i) => i.instanceId === instanceId) ?? null;
}

/**
 * Create an instance linked to Event Record + Creation Workspace.
 * Throws / returns null if required links are missing (no orphans).
 */
export function createEventAssetInstance(
  assetTypeId: string,
  links: EventAssetInstantiationLinks,
): EventAssetInstance | null {
  if (!links.eventRecordId?.trim() || !links.creationWorkspaceId?.trim()) {
    return null;
  }

  const def = getEventAssetDefinition(assetTypeId);
  if (!def || def.status === "deprecated") return null;

  const existing = listEventAssetInstances(links.eventRecordId).find(
    (i) => i.assetTypeId === assetTypeId && i.status !== "archived",
  );
  if (existing) return existing;

  const now = new Date().toISOString();
  const instance: EventAssetInstance = {
    instanceId: newId(),
    assetTypeId,
    eventRecordId: links.eventRecordId,
    creationWorkspaceId: links.creationWorkspaceId,
    eventType: links.eventType,
    eventSubtype: links.eventSubtype ?? null,
    lifecyclePhase: links.lifecyclePhase,
    planningSectionId:
      links.planningSectionId ?? def.eventSections[0] ?? null,
    primaryChamberOwner: def.primaryChamberOwner,
    sourceBlueprintId: links.sourceBlueprintId ?? null,
    canonicalWorkId: links.canonicalWorkId ?? null,
    projectHomeId: links.projectHomeId ?? null,
    displayName: links.displayName?.trim() || def.userFacingName,
    status: "drafting",
    contentRef: links.templateId?.trim()
      ? `template:${links.templateId.trim()}`
      : null,
    relationshipRegistryKey: `${links.eventRecordId}:${assetTypeId}`,
    createdAt: now,
    updatedAt: now,
  };

  writeAll([instance, ...readAll()]);
  return instance;
}

/** Build instantiation links from an Event Record (canonical path). */
export function linksFromEventRecord(
  record: EventRecord,
  options?: {
    creationWorkspaceId?: string | null;
    sourceBlueprintId?: string | null;
  },
): EventAssetInstantiationLinks {
  return {
    eventRecordId: record.id,
    creationWorkspaceId:
      options?.creationWorkspaceId?.trim() ||
      record.canonicalWorkId ||
      record.id,
    eventType: record.eventType,
    eventSubtype: null,
    lifecyclePhase: record.lifecyclePhase,
    sourceBlueprintId: options?.sourceBlueprintId ?? null,
    canonicalWorkId: record.canonicalWorkId,
    projectHomeId: record.projectHomeId,
  };
}

export function updateEventAssetInstance(
  instanceId: string,
  patch: Partial<
    Pick<
      EventAssetInstance,
      | "displayName"
      | "status"
      | "contentRef"
      | "planningSectionId"
      | "projectHomeId"
      | "canonicalWorkId"
      | "lifecyclePhase"
    >
  >,
): EventAssetInstance | null {
  const all = readAll();
  const idx = all.findIndex((i) => i.instanceId === instanceId);
  if (idx < 0) return null;
  const next: EventAssetInstance = {
    ...all[idx]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const rows = [...all];
  rows[idx] = next;
  writeAll(rows);
  return next;
}

export function clearEventAssetInstancesForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
