/**
 * Portfolio™ — completed assets and creations (courses, books, funnels, etc.).
 */

import type { GrowthAttachment } from "./growthAttachments";

export const PORTFOLIO_ASSET_TYPES = [
  "Course",
  "Book",
  "Product",
  "Funnel",
  "Template",
  "Website",
  "Workshop",
  "Lead Magnet",
  "Presentation",
  "Other",
] as const;

export type PortfolioAssetType = (typeof PORTFOLIO_ASSET_TYPES)[number];

export type PortfolioEntry = {
  id: string;
  title: string;
  assetType: PortfolioAssetType | string;
  description: string;
  link: string;
  completedAt: string;
  attachments: GrowthAttachment[];
  outcomeGoalId?: string;
  outcomeGoalIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type PortfolioEntryInput = Omit<
  PortfolioEntry,
  "id" | "createdAt" | "updatedAt"
>;

const STORAGE_KEY = "companion-portfolio-v1";
const PREFILL_KEY = "companion-portfolio-prefill-v1";

export const PORTFOLIO_UPDATED_EVENT = "companion-portfolio-updated";

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
    return parsed
      .filter(
        (e): e is PortfolioEntry =>
          e &&
          typeof e.id === "string" &&
          typeof e.title === "string" &&
          typeof e.assetType === "string",
      )
      .map((e) => ({
        ...e,
        attachments: Array.isArray(e.attachments) ? e.attachments : [],
        description: typeof e.description === "string" ? e.description : "",
        link: typeof e.link === "string" ? e.link : "",
        completedAt:
          typeof e.completedAt === "string"
            ? e.completedAt
            : new Date().toISOString().slice(0, 10),
      }));
  } catch {
    return [];
  }
}

function writeAll(list: PortfolioEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
  } catch {
    /* noop */
  }
}

export function getPortfolioEntries(): PortfolioEntry[] {
  return readAll().sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function createPortfolioEntry(input: PortfolioEntryInput): PortfolioEntry {
  const now = new Date().toISOString();
  const entry: PortfolioEntry = {
    id: newId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([entry, ...readAll()]);
  return entry;
}

export function updatePortfolioEntry(
  id: string,
  patch: Partial<PortfolioEntryInput>,
): PortfolioEntry | null {
  const list = readAll();
  const idx = list.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  const updated: PortfolioEntry = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  writeAll(list);
  return updated;
}

export function deletePortfolioEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export type PortfolioPrefill = {
  title?: string;
  description?: string;
  assetType?: string;
};

export function setPortfolioPrefill(prefill: PortfolioPrefill): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
  } catch {
    /* noop */
  }
}

export function consumePortfolioPrefill(): PortfolioPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    sessionStorage.removeItem(PREFILL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PortfolioPrefill;
  } catch {
    return null;
  }
}
