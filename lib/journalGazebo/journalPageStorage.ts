/**
 * Per-journal page position, tassel, and page bodies.
 */

import { JOURNAL_GAZEBO_UPDATED_EVENT } from "./store";
import {
  FIRST_WRITING_PAGE_INDEX,
  LAST_WRITING_PAGE_INDEX,
  MAX_JOURNAL_WRITING_PAGES,
} from "./bookCeremony";
import type { TypingStyle } from "./writingSurface";
import { typingStyleFromConfig } from "./writingSurface";
import type { JournalGazeboConfig } from "./types";

export {
  FIRST_WRITING_PAGE_INDEX,
  LAST_WRITING_PAGE_INDEX,
  MAX_JOURNAL_WRITING_PAGES,
} from "./bookCeremony";

const PLACE_STORAGE_KEY = "companion-journal-gazebo-places-v1";
const BODIES_STORAGE_KEY = "companion-journal-gazebo-page-bodies-v1";
const STYLES_STORAGE_KEY = "companion-journal-gazebo-page-styles-v1";
const SCROLL_STORAGE_KEY = "companion-journal-gazebo-page-scrolls-v1";

export type JournalPlace = {
  pageIndex: number;
  /** 0–100 — vertical position of tassel on the right page. */
  tasselY: number;
};

let memoryPlaces: Record<string, JournalPlace> = {};
let memoryBodies: Record<string, Record<number, string>> = {};
let memoryPageStyles: Record<string, Record<number, TypingStyle>> = {};
let memoryScrolls: Record<string, Record<number, number>> = {};

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
    return;
  } catch {
    /* fall through */
  }
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function readPlaces(): Record<string, JournalPlace> {
  if (typeof window === "undefined") return memoryPlaces;
  const raw = safeGet(PLACE_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, JournalPlace>;
      memoryPlaces = parsed;
      return parsed;
    } catch {
      /* ignore */
    }
  }
  return memoryPlaces;
}

function writePlaces(places: Record<string, JournalPlace>): void {
  memoryPlaces = places;
  safeSet(PLACE_STORAGE_KEY, JSON.stringify(places));
  try {
    window.dispatchEvent(new Event(JOURNAL_GAZEBO_UPDATED_EVENT));
  } catch {
    /* optional */
  }
}

function readBodies(): Record<string, Record<number, string>> {
  if (typeof window === "undefined") return memoryBodies;
  const raw = safeGet(BODIES_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, Record<number, string>>;
      memoryBodies = parsed;
      return parsed;
    } catch {
      /* ignore */
    }
  }
  return memoryBodies;
}

function writeBodies(bodies: Record<string, Record<number, string>>): void {
  memoryBodies = bodies;
  safeSet(BODIES_STORAGE_KEY, JSON.stringify(bodies));
}

export function getJournalPlace(journalId: string): JournalPlace {
  const places = readPlaces();
  return (
    places[journalId] ?? {
      pageIndex: FIRST_WRITING_PAGE_INDEX,
      tasselY: 18,
    }
  );
}

export function saveJournalPlace(
  journalId: string,
  partial: Partial<JournalPlace>,
): JournalPlace {
  const places = readPlaces();
  const next: JournalPlace = { ...getJournalPlace(journalId), ...partial };
  if (typeof next.pageIndex === "number") {
    next.pageIndex = clampWritingPageIndex(next.pageIndex);
  }
  writePlaces({ ...places, [journalId]: next });
  return next;
}

export function clampWritingPageIndex(pageIndex: number): number {
  if (!Number.isFinite(pageIndex)) return FIRST_WRITING_PAGE_INDEX;
  if (pageIndex < FIRST_WRITING_PAGE_INDEX) return FIRST_WRITING_PAGE_INDEX;
  if (pageIndex > LAST_WRITING_PAGE_INDEX) return LAST_WRITING_PAGE_INDEX;
  return Math.floor(pageIndex);
}

function pageHasWriting(html: string): boolean {
  if (!html) return false;
  const plain = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u200b/g, "")
    .trim();
  return plain.length > 0;
}

/**
 * Highest writing page that still has words — so switching journals
 * resumes where the member left off even if place was never saved.
 */
export function getLastWrittenPageIndex(journalId: string): number {
  const bodies = readBodies()[journalId] ?? {};
  let last = FIRST_WRITING_PAGE_INDEX;
  for (const [key, html] of Object.entries(bodies)) {
    const index = Number(key);
    if (!Number.isFinite(index)) continue;
    if (index < FIRST_WRITING_PAGE_INDEX || index > LAST_WRITING_PAGE_INDEX) continue;
    if (pageHasWriting(html)) last = Math.max(last, index);
  }
  return last;
}

/** Page to open when returning to a journal (saved place ∪ last written). */
export function resolveResumePageIndex(journalId: string): number {
  const place = getJournalPlace(journalId).pageIndex;
  const written = getLastWrittenPageIndex(journalId);
  return clampWritingPageIndex(Math.max(place, written));
}

export function isJournalWritingFull(journalId: string): boolean {
  return getLastWrittenPageIndex(journalId) >= LAST_WRITING_PAGE_INDEX;
}

export function getPageBody(journalId: string, pageIndex: number): string {
  const bodies = readBodies();
  return bodies[journalId]?.[pageIndex] ?? "";
}

export function savePageBody(
  journalId: string,
  pageIndex: number,
  body: string,
): void {
  const bodies = readBodies();
  const journalBodies = { ...(bodies[journalId] ?? {}), [pageIndex]: body };
  writeBodies({ ...bodies, [journalId]: journalBodies });
}

function readPageStyles(): Record<string, Record<number, TypingStyle>> {
  if (typeof window === "undefined") return memoryPageStyles;
  const raw = safeGet(STYLES_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, Record<number, TypingStyle>>;
      memoryPageStyles = parsed;
      return parsed;
    } catch {
      /* ignore */
    }
  }
  return memoryPageStyles;
}

function writePageStyles(styles: Record<string, Record<number, TypingStyle>>): void {
  memoryPageStyles = styles;
  safeSet(STYLES_STORAGE_KEY, JSON.stringify(styles));
}

/** Per-page handwriting — each page can differ from journal defaults. */
export function getPageTypingStyle(
  journalId: string,
  pageIndex: number,
): TypingStyle | null {
  const styles = readPageStyles();
  return styles[journalId]?.[pageIndex] ?? null;
}

export function savePageTypingStyle(
  journalId: string,
  pageIndex: number,
  style: TypingStyle,
): void {
  const styles = readPageStyles();
  const journalStyles = { ...(styles[journalId] ?? {}), [pageIndex]: style };
  writePageStyles({ ...styles, [journalId]: journalStyles });
}

/** Stored page style, or journal defaults from design. */
export function resolvePageTypingStyle(
  journalId: string,
  pageIndex: number,
  config: JournalGazeboConfig,
): TypingStyle {
  return getPageTypingStyle(journalId, pageIndex) ?? typingStyleFromConfig(config);
}

function readScrolls(): Record<string, Record<number, number>> {
  if (typeof window === "undefined") return memoryScrolls;
  const raw = safeGet(SCROLL_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, Record<number, number>>;
      memoryScrolls = parsed;
      return parsed;
    } catch {
      /* ignore */
    }
  }
  return memoryScrolls;
}

function writeScrolls(scrolls: Record<string, Record<number, number>>): void {
  memoryScrolls = scrolls;
  safeSet(SCROLL_STORAGE_KEY, JSON.stringify(scrolls));
}

export function getPageScroll(journalId: string, pageIndex: number): number {
  const scrolls = readScrolls();
  return scrolls[journalId]?.[pageIndex] ?? 0;
}

export function savePageScroll(
  journalId: string,
  pageIndex: number,
  scrollTop: number,
): void {
  const scrolls = readScrolls();
  const journalScrolls = { ...(scrolls[journalId] ?? {}), [pageIndex]: scrollTop };
  writeScrolls({ ...scrolls, [journalId]: journalScrolls });
}

export function resetJournalPageStorage(): void {
  memoryPlaces = {};
  memoryBodies = {};
  memoryPageStyles = {};
  memoryScrolls = {};
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PLACE_STORAGE_KEY);
    localStorage.removeItem(BODIES_STORAGE_KEY);
    localStorage.removeItem(STYLES_STORAGE_KEY);
    localStorage.removeItem(SCROLL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
