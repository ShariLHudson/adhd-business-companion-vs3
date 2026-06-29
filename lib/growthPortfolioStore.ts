/**
 * Growth Portfolio — what I've created. One primary home per entry.
 */

import type { EcosystemObjectKind } from "./intelligence/intelligenceReadyTypes";
import type { GrowthAttachment } from "./growthAttachments";
import { linkGrowthAttachmentsToRecord } from "@/lib/assetLibrary/references";

export type PortfolioEntry = {
  id: string;
  title: string;
  description: string;
  attachments: GrowthAttachment[];
  createdAt: string;
  updatedAt: string;
  originatedFromId?: string;
  originatedFromKind?: EcosystemObjectKind;
};

const STORAGE_KEY = "companion-growth-portfolio-v1";

export const GROWTH_PORTFOLIO_UPDATED_EVENT = "companion-growth-portfolio-updated";

function newId(): string {
  return `pf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): PortfolioEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is PortfolioEntry =>
        e && typeof e.id === "string" && typeof e.title === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(list: PortfolioEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(GROWTH_PORTFOLIO_UPDATED_EVENT));
  } catch {
    /* quota */
  }
}

export function getPortfolioEntries(): PortfolioEntry[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export type PortfolioEntryInput = Omit<
  PortfolioEntry,
  "id" | "createdAt" | "updatedAt"
>;

export function createPortfolioEntry(input: PortfolioEntryInput): PortfolioEntry {
  const now = new Date().toISOString();
  const entry: PortfolioEntry = {
    id: newId(),
    title: input.title.trim() || "Untitled work",
    description: input.description.trim(),
    attachments: input.attachments ?? [],
    createdAt: now,
    updatedAt: now,
    originatedFromId: input.originatedFromId,
    originatedFromKind: input.originatedFromKind,
  };
  writeAll([entry, ...readAll()]);
  linkGrowthAttachmentsToRecord(entry.attachments, "portfolio", entry.id);
  return entry;
}

export function deletePortfolioEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function getPortfolioEntryById(id: string): PortfolioEntry | null {
  return readAll().find((e) => e.id === id) ?? null;
}
