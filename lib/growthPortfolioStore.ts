/**
 * Growth Portfolio — what I've created. One primary home per entry.
 */

import type { EcosystemObjectKind } from "./intelligence/intelligenceReadyTypes";
import type { GrowthAttachment } from "./growthAttachments";
import { linkGrowthAttachmentsToRecord } from "@/lib/assetLibrary/references";

/** Hall of Accomplishments types (247) — elegant museum of meaningful milestones. */
export const HALL_ACHIEVEMENT_TYPES = [
  "Degree",
  "Certification",
  "Business",
  "Book",
  "Award",
  "Launch",
  "Career Milestone",
  "Personal Victory",
  "Finished Project",
  "Major Achievement",
  "Milestone",
] as const;

export type HallAchievementType = (typeof HALL_ACHIEVEMENT_TYPES)[number];

export type PortfolioEntry = {
  id: string;
  title: string;
  description: string;
  attachments: GrowthAttachment[];
  createdAt: string;
  updatedAt: string;
  originatedFromId?: string;
  originatedFromKind?: EcosystemObjectKind;
  /** Hall of Accomplishments fields */
  achievementType?: HallAchievementType | string;
  projectName?: string;
  year?: string;
  category?: string;
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
    title: input.title.trim() || "Untitled achievement",
    description: input.description.trim(),
    attachments: input.attachments ?? [],
    createdAt: now,
    updatedAt: now,
    originatedFromId: input.originatedFromId,
    originatedFromKind: input.originatedFromKind,
    achievementType: input.achievementType,
    projectName: input.projectName,
    year: input.year ?? now.slice(0, 4),
    category: input.category,
  };
  writeAll([entry, ...readAll()]);
  linkGrowthAttachmentsToRecord(entry.attachments, "portfolio", entry.id);
  return entry;
}

/** Quick-add from chat / save-this-win → Hall of Accomplishments */
export function quickAddHallAchievement(input: {
  title: string;
  description?: string;
  achievementType?: HallAchievementType | string;
}): PortfolioEntry {
  return createPortfolioEntry({
    title: input.title.trim() || "Achievement",
    description: (input.description ?? input.title).trim(),
    attachments: [],
    achievementType: input.achievementType ?? "Major Achievement",
  });
}

export type HallFilter = {
  achievementType?: string;
  projectName?: string;
  year?: string;
  category?: string;
  query?: string;
};

export function filterHallEntries(
  entries: PortfolioEntry[],
  filter: HallFilter,
): PortfolioEntry[] {
  const q = filter.query?.trim().toLowerCase();
  return entries.filter((e) => {
    if (
      filter.achievementType &&
      (e.achievementType ?? "") !== filter.achievementType
    ) {
      return false;
    }
    if (
      filter.projectName &&
      !(e.projectName ?? "").toLowerCase().includes(filter.projectName.toLowerCase())
    ) {
      return false;
    }
    if (filter.year && (e.year ?? e.createdAt.slice(0, 4)) !== filter.year) {
      return false;
    }
    if (
      filter.category &&
      (e.category ?? "").toLowerCase() !== filter.category.toLowerCase()
    ) {
      return false;
    }
    if (q) {
      const hay = [
        e.title,
        e.description,
        e.achievementType,
        e.projectName,
        e.category,
        e.year,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function deletePortfolioEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function getPortfolioEntryById(id: string): PortfolioEntry | null {
  return readAll().find((e) => e.id === id) ?? null;
}
