/**
 * Blueprint audit history — universal ownership.
 */

import type { CanonicalWorkId } from "../types";
import type { BlueprintAuditEvent } from "./types";

const events: BlueprintAuditEvent[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function newAuditId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `bpa-${crypto.randomUUID().slice(0, 10)}`;
  }
  return `bpa-${Date.now().toString(36)}`;
}

export function resetBlueprintAuditForTests(): void {
  events.length = 0;
}

export function recordBlueprintAudit(
  input: Omit<BlueprintAuditEvent, "id" | "at"> & { at?: string },
): BlueprintAuditEvent {
  const event: BlueprintAuditEvent = {
    id: newAuditId(),
    at: input.at ?? nowIso(),
    blueprintId: input.blueprintId,
    blueprintVersion: input.blueprintVersion ?? null,
    workId: input.workId ?? null,
    action: input.action,
    detail: input.detail ?? null,
  };
  events.push(event);
  return event;
}

export function listBlueprintAudit(filter?: {
  blueprintId?: string;
  workId?: CanonicalWorkId | string;
}): BlueprintAuditEvent[] {
  return events.filter((e) => {
    if (filter?.blueprintId && e.blueprintId !== filter.blueprintId) return false;
    if (filter?.workId && e.workId !== filter.workId) return false;
    return true;
  });
}
