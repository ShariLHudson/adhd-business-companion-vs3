/**
 * Universal Growth Capture inbox — uncategorized items are always allowed.
 */

import type { GrowthAttachment } from "@/lib/growthAttachments";
import { linkGrowthAttachmentsToRecord } from "@/lib/assetLibrary/references";
import { suggestGrowthDestination } from "./suggestDestination";
import type { GrowthCaptureItem, GrowthPrimaryDestination } from "./types";

const STORAGE_KEY = "companion-growth-capture-v1";

export const GROWTH_CAPTURE_UPDATED_EVENT = "companion-growth-capture-updated";

function newId(): string {
  return `gc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): GrowthCaptureItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GrowthCaptureItem =>
        item && typeof item.id === "string" && typeof item.body === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(items: GrowthCaptureItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(GROWTH_CAPTURE_UPDATED_EVENT));
  } catch {
    /* quota */
  }
}

export function getGrowthCaptureItems(): GrowthCaptureItem[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getUncategorizedCaptures(): GrowthCaptureItem[] {
  return getGrowthCaptureItems().filter(
    (item) => !item.filedDestination || item.filedDestination === "uncategorized",
  );
}

export function createGrowthCapture(input: {
  body: string;
  attachments?: GrowthAttachment[];
}): GrowthCaptureItem {
  const body = input.body.trim();
  const now = new Date().toISOString();
  const suggestion = suggestGrowthDestination(body);
  const item: GrowthCaptureItem = {
    id: newId(),
    body,
    attachments: input.attachments ?? [],
    suggestedDestination: suggestion.destination,
    createdAt: now,
    updatedAt: now,
    originatedFromKind: "capture-session",
  };
  writeAll([item, ...readAll()]);
  if (item.attachments.length > 0) {
    linkGrowthAttachmentsToRecord(item.attachments, "capture-session", item.id);
  }
  return item;
}

export function updateGrowthCapture(
  id: string,
  patch: Partial<Pick<GrowthCaptureItem, "filedDestination" | "filedRecordId">>,
): GrowthCaptureItem | null {
  const list = readAll();
  const idx = list.findIndex((item) => item.id === id);
  if (idx < 0) return null;
  const updated: GrowthCaptureItem = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  writeAll(list);
  return updated;
}

export function getGrowthCaptureById(id: string): GrowthCaptureItem | null {
  return readAll().find((item) => item.id === id) ?? null;
}

export function markCaptureFiled(
  captureId: string,
  destination: GrowthPrimaryDestination,
  recordId: string,
): void {
  updateGrowthCapture(captureId, {
    filedDestination: destination,
    filedRecordId: recordId,
  });
}
