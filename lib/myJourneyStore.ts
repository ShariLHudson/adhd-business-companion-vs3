/**
 * My Journey — personal and professional story, lessons, and milestones.
 * Core questions: Who am I? What has shaped me? What have I learned?
 */

import type { GrowthAttachment } from "./growthAttachments";

export const JOURNEY_CATEGORIES = [
  "Personal Life",
  "Career & Work",
  "Education",
  "Businesses Built",
  "Major Life Events",
  "Challenges Overcome",
  "Personal Growth",
  "Health Journey",
  "Relationships",
  "Lessons Learned",
  "Wisdom",
  "Legacy",
] as const;

export type JourneyCategory = (typeof JOURNEY_CATEGORIES)[number];

export const JOURNEY_CHAPTER_PRESETS = [
  "Early Life",
  "Family",
  "Career",
  "Entrepreneurship",
  "Health",
  "ADHD Discovery",
  "Current Season",
] as const;

export type JourneyChapterPreset = (typeof JOURNEY_CHAPTER_PRESETS)[number];

export type JourneyFilter =
  | "all"
  | "chapters"
  | "lessons"
  | "career"
  | "business"
  | "education"
  | "milestones"
  | "wisdom";

export type JourneyEntry = {
  id: string;
  title: string;
  category: JourneyCategory;
  chapter: string;
  date: string;
  whatHappened: string;
  whatDidILearn: string;
  howDidThisShapeMe: string;
  whatWisdom: string;
  attachments: GrowthAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type JourneyDashboardStats = {
  lifeChapters: number;
  lessonsLearned: number;
  careerExperiences: number;
  businessesBuilt: number;
  education: number;
  milestones: number;
  personalGrowth: number;
  wisdomEntries: number;
  total: number;
};

const STORAGE_KEY = "companion-my-journey-v1";
const CHAPTERS_KEY = "companion-my-journey-chapters-v1";

export const MY_JOURNEY_UPDATED_EVENT = "companion-my-journey-updated";

function newId(): string {
  return `mj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): JourneyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is JourneyEntry =>
          e && typeof e.id === "string" && typeof e.title === "string",
      )
      .map((e) => ({
        ...e,
        attachments: Array.isArray(e.attachments) ? e.attachments : [],
        chapter: typeof e.chapter === "string" ? e.chapter : "",
      }));
  } catch {
    return [];
  }
}

function writeAll(list: JourneyEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(MY_JOURNEY_UPDATED_EVENT));
  } catch {
    /* noop */
  }
}

export function getJourneyEntries(): JourneyEntry[] {
  return readAll().sort((a, b) => {
    const aDate = a.date || a.createdAt;
    const bDate = b.date || b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
}

export function getCustomChapters(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAPTERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((c): c is string => typeof c === "string")
      : [];
  } catch {
    return [];
  }
}

export function getAllJourneyChapters(): string[] {
  const custom = getCustomChapters();
  const used = new Set(readAll().map((e) => e.chapter).filter(Boolean));
  const merged = [
    ...JOURNEY_CHAPTER_PRESETS,
    ...custom,
    ...Array.from(used),
  ];
  return Array.from(new Set(merged.filter(Boolean)));
}

export function addCustomChapter(name: string): void {
  const trimmed = name.trim();
  if (!trimmed || typeof window === "undefined") return;
  const chapters = getCustomChapters();
  if (chapters.includes(trimmed)) return;
  try {
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify([...chapters, trimmed]));
  } catch {
    /* noop */
  }
}

export function getJourneyDashboardStats(): JourneyDashboardStats {
  const entries = readAll();
  const chapters = new Set(entries.map((e) => e.chapter).filter(Boolean));
  return {
    lifeChapters: chapters.size,
    lessonsLearned: entries.filter(
      (e) => e.category === "Lessons Learned" || e.whatDidILearn.trim(),
    ).length,
    careerExperiences: entries.filter((e) => e.category === "Career & Work")
      .length,
    businessesBuilt: entries.filter((e) => e.category === "Businesses Built")
      .length,
    education: entries.filter((e) => e.category === "Education").length,
    milestones: entries.filter((e) => e.category === "Major Life Events")
      .length,
    personalGrowth: entries.filter((e) => e.category === "Personal Growth")
      .length,
    wisdomEntries: entries.filter(
      (e) => e.category === "Wisdom" || e.whatWisdom.trim(),
    ).length,
    total: entries.length,
  };
}

export type JourneyEntryInput = Omit<
  JourneyEntry,
  "id" | "createdAt" | "updatedAt"
>;

export function createJourneyEntry(input: JourneyEntryInput): JourneyEntry {
  const now = new Date().toISOString();
  if (input.chapter.trim()) addCustomChapter(input.chapter);
  const entry: JourneyEntry = {
    id: newId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([entry, ...readAll()]);
  return entry;
}

export function deleteJourneyEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function filterJourneyEntries(filter: JourneyFilter): JourneyEntry[] {
  const all = getJourneyEntries();
  switch (filter) {
    case "lessons":
      return all.filter((e) => e.category === "Lessons Learned");
    case "career":
      return all.filter((e) => e.category === "Career & Work");
    case "business":
      return all.filter((e) => e.category === "Businesses Built");
    case "education":
      return all.filter((e) => e.category === "Education");
    case "milestones":
      return all.filter((e) => e.category === "Major Life Events");
    case "wisdom":
      return all.filter((e) => e.category === "Wisdom");
    default:
      return all;
  }
}

export function searchJourneyEntries(
  query: string,
  filter: JourneyFilter = "all",
): JourneyEntry[] {
  const q = query.trim().toLowerCase();
  const base = filterJourneyEntries(filter);
  if (!q) return base;
  return base.filter((e) => {
    const haystack = [
      e.title,
      e.chapter,
      e.category,
      e.whatHappened,
      e.whatDidILearn,
      e.howDidThisShapeMe,
      e.whatWisdom,
      ...e.attachments.map((a) => `${a.name} ${a.url}`),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function groupJourneyByChapter(
  entries: JourneyEntry[],
): { chapter: string; items: JourneyEntry[] }[] {
  const groups = new Map<string, JourneyEntry[]>();
  for (const entry of entries) {
    const chapter = entry.chapter.trim() || "Uncategorized";
    const list = groups.get(chapter) ?? [];
    list.push(entry);
    groups.set(chapter, list);
  }

  const sortItems = (items: JourneyEntry[]) =>
    items.sort((a, b) => {
      const aDate = a.date || a.createdAt;
      const bDate = b.date || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  const chapterOrder = getAllJourneyChapters();
  const ordered: { chapter: string; items: JourneyEntry[] }[] = [];

  for (const chapter of chapterOrder) {
    const items = groups.get(chapter);
    if (items?.length) {
      ordered.push({ chapter, items: sortItems(items) });
      groups.delete(chapter);
    }
  }

  for (const [chapter, items] of groups.entries()) {
    ordered.push({ chapter, items: sortItems(items) });
  }

  return ordered;
}

/** Chapter view includes preset chapters even when empty. */
export function getJourneyChapterOutline(
  entries: JourneyEntry[] = getJourneyEntries(),
): { chapter: string; items: JourneyEntry[] }[] {
  const grouped = groupJourneyByChapter(entries);
  const byChapter = new Map(grouped.map((g) => [g.chapter, g.items]));
  const outline: { chapter: string; items: JourneyEntry[] }[] = [];

  for (const preset of JOURNEY_CHAPTER_PRESETS) {
    outline.push({ chapter: preset, items: byChapter.get(preset) ?? [] });
    byChapter.delete(preset);
  }

  for (const { chapter, items } of grouped) {
    if (!(JOURNEY_CHAPTER_PRESETS as readonly string[]).includes(chapter)) {
      if (!outline.some((o) => o.chapter === chapter)) {
        outline.push({ chapter, items });
      }
    }
  }

  for (const [chapter, items] of byChapter.entries()) {
    if (chapter !== "Uncategorized") {
      outline.push({ chapter, items });
    }
  }

  const uncategorized = byChapter.get("Uncategorized");
  if (uncategorized?.length) {
    outline.push({ chapter: "Uncategorized", items: uncategorized });
  }

  return outline;
}

export const EMPTY_JOURNEY_DRAFT: JourneyEntryInput = {
  title: "",
  category: "Personal Life",
  chapter: "",
  date: "",
  whatHappened: "",
  whatDidILearn: "",
  howDidThisShapeMe: "",
  whatWisdom: "",
  attachments: [],
};

const JOURNEY_PREFILL_KEY = "companion-journey-prefill-v1";

export type JourneyPrefill = {
  title?: string;
  whatHappened?: string;
  category?: JourneyCategory;
};

export function setJourneyPrefill(prefill: JourneyPrefill): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(JOURNEY_PREFILL_KEY, JSON.stringify(prefill));
  } catch {
    /* noop */
  }
}

export function consumeJourneyPrefill(): JourneyPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(JOURNEY_PREFILL_KEY);
    sessionStorage.removeItem(JOURNEY_PREFILL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as JourneyPrefill;
  } catch {
    return null;
  }
}
