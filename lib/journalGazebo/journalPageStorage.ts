/**
 * Per-journal page position, tassel, and page bodies.
 */

import { JOURNAL_GAZEBO_UPDATED_EVENT } from "./store";
import {
  FIRST_WRITING_PAGE_INDEX,
  LAST_WRITING_PAGE_INDEX,
  MAX_JOURNAL_WRITING_PAGES,
} from "./bookCeremony";
import { sanitizeJournalHtmlForStorage } from "./journalHtmlIntegrity";
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
/** After quota errors, keep memory as source of truth — never reload stale local. */
let localStorageBlocked = false;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  if (!localStorageBlocked) {
    try {
      const fromLocal = localStorage.getItem(key);
      if (fromLocal != null) return fromLocal;
    } catch {
      localStorageBlocked = true;
    }
  }
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  if (!localStorageBlocked) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      localStorageBlocked = true;
    }
  }
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function readPlaces(): Record<string, JournalPlace> {
  if (typeof window === "undefined") return memoryPlaces;
  // While blocked, memory already has the latest writes for this session.
  if (localStorageBlocked && Object.keys(memoryPlaces).length > 0) {
    return memoryPlaces;
  }
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
  if (localStorageBlocked && Object.keys(memoryBodies).length > 0) {
    return memoryBodies;
  }
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

/**
 * Page to open when returning to a journal.
 * Bookmark wins so the member can go back, finish a page, Save, and resume there.
 * Falls back to the last written page when the bookmark is still the default
 * and later pages already have words.
 */
export function resolveResumePageIndex(journalId: string): number {
  const place = clampWritingPageIndex(getJournalPlace(journalId).pageIndex);
  const written = getLastWrittenPageIndex(journalId);
  if (place > FIRST_WRITING_PAGE_INDEX) {
    return place;
  }
  if (pageHasWriting(getPageBody(journalId, place))) {
    return place;
  }
  return clampWritingPageIndex(Math.max(place, written));
}

export function isJournalWritingFull(journalId: string): boolean {
  return getLastWrittenPageIndex(journalId) >= LAST_WRITING_PAGE_INDEX;
}

export function getPageBody(journalId: string, pageIndex: number): string {
  const bodies = readBodies();
  const raw = bodies[journalId]?.[pageIndex] ?? "";
  if (!raw) return "";
  const safe = sanitizeJournalHtmlForStorage(raw);
  // Heal previously corrupted pages on read so the next open is clean.
  if (safe !== raw) {
    const journalBodies = { ...(bodies[journalId] ?? {}), [pageIndex]: safe };
    writeBodies({ ...bodies, [journalId]: journalBodies });
  }
  return safe;
}

export function savePageBody(
  journalId: string,
  pageIndex: number,
  body: string,
  options?: { allowEmptyWipe?: boolean },
): void {
  const safe = sanitizeJournalHtmlForStorage(body);
  const bodies = readBodies();
  const existing = bodies[journalId]?.[pageIndex] ?? "";
  // Never replace real writing with an empty editor remount / race.
  if (
    !pageHasWriting(safe) &&
    pageHasWriting(existing) &&
    !options?.allowEmptyWipe
  ) {
    return;
  }
  const journalBodies = { ...(bodies[journalId] ?? {}), [pageIndex]: safe };
  writeBodies({ ...bodies, [journalId]: journalBodies });
}

function readPageStyles(): Record<string, Record<number, TypingStyle>> {
  if (typeof window === "undefined") return memoryPageStyles;
  if (localStorageBlocked && Object.keys(memoryPageStyles).length > 0) {
    return memoryPageStyles;
  }
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
  if (localStorageBlocked && Object.keys(memoryScrolls).length > 0) {
    return memoryScrolls;
  }
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

/** Drop all saved pages, bookmark, styles, and scroll for one journal. */
export function clearJournalPageData(journalId: string): void {
  const places = { ...readPlaces() };
  delete places[journalId];
  writePlaces(places);

  const bodies = { ...readBodies() };
  delete bodies[journalId];
  writeBodies(bodies);

  const styles = { ...readPageStyles() };
  delete styles[journalId];
  writePageStyles(styles);

  const scrolls = { ...readScrolls() };
  delete scrolls[journalId];
  writeScrolls(scrolls);
}

export function resetJournalPageStorage(): void {
  memoryPlaces = {};
  memoryBodies = {};
  memoryPageStyles = {};
  memoryScrolls = {};
  localStorageBlocked = false;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PLACE_STORAGE_KEY);
    localStorage.removeItem(BODIES_STORAGE_KEY);
    localStorage.removeItem(STYLES_STORAGE_KEY);
    localStorage.removeItem(SCROLL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(PLACE_STORAGE_KEY);
    sessionStorage.removeItem(BODIES_STORAGE_KEY);
    sessionStorage.removeItem(STYLES_STORAGE_KEY);
    sessionStorage.removeItem(SCROLL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** True when a journal already has writing or a bookmark past the cover. */
export function journalHasResumableWriting(journalId: string): boolean {
  const place = getJournalPlace(journalId).pageIndex;
  if (place > FIRST_WRITING_PAGE_INDEX) return true;
  if (pageHasWriting(getPageBody(journalId, place))) return true;
  return getLastWrittenPageIndex(journalId) > FIRST_WRITING_PAGE_INDEX
    || pageHasWriting(getPageBody(journalId, FIRST_WRITING_PAGE_INDEX));
}
