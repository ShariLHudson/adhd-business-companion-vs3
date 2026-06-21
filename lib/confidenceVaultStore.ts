/**
 * Confidence Vault — proof of value, expertise, and recognition.
 * Core question: "What proof exists that I have value?"
 */

import type { GrowthAttachment } from "./growthAttachments";

export const CONFIDENCE_CATEGORIES = [
  "Testimonials",
  "Praise & Compliments",
  "Credentials",
  "Certifications",
  "Awards",
  "Accomplishments",
  "Client Results",
  "Success Stories",
  "Speaking Engagements",
  "Media Features",
  "Personal Achievements",
] as const;

export type ConfidenceCategory = (typeof CONFIDENCE_CATEGORIES)[number];

export const CONFIDENCE_SOURCES = [
  "Client",
  "Colleague",
  "Friend",
  "Organization",
  "Self",
] as const;

export type ConfidenceSource = (typeof CONFIDENCE_SOURCES)[number];

export type ConfidenceVaultFilter =
  | "all"
  | "testimonials"
  | "praise"
  | "credentials"
  | "awards"
  | "achievements"
  | "client-results"
  | "favorites";

export type ConfidenceEntry = {
  id: string;
  title: string;
  category: ConfidenceCategory;
  description: string;
  source: ConfidenceSource;
  date: string;
  link: string;
  attachments: GrowthAttachment[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ConfidenceDashboardStats = {
  testimonials: number;
  praise: number;
  credentials: number;
  accomplishments: number;
  certifications: number;
  awards: number;
  clientResults: number;
  successStories: number;
  speakingEvents: number;
  mediaMentions: number;
  total: number;
  favorites: number;
};

const STORAGE_KEY = "companion-confidence-vault-v1";
const PREFILL_KEY = "companion-confidence-prefill-v1";

export const CONFIDENCE_VAULT_UPDATED_EVENT = "companion-confidence-vault-updated";

function newId(): string {
  return `cv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): ConfidenceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is ConfidenceEntry =>
        e && typeof e.id === "string" && typeof e.title === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(list: ConfidenceEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CONFIDENCE_VAULT_UPDATED_EVENT));
  } catch {
    /* noop */
  }
}

function sortEntries(list: ConfidenceEntry[]): ConfidenceEntry[] {
  return [...list].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    const aDate = a.date || a.createdAt;
    const bDate = b.date || b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
}

export function getConfidenceEntries(): ConfidenceEntry[] {
  return sortEntries(readAll());
}

export function getConfidenceDashboardStats(): ConfidenceDashboardStats {
  const entries = readAll();
  const count = (cat: ConfidenceCategory) =>
    entries.filter((e) => e.category === cat).length;
  return {
    testimonials: count("Testimonials"),
    praise: count("Praise & Compliments"),
    credentials: count("Credentials"),
    accomplishments:
      count("Accomplishments") + count("Personal Achievements"),
    certifications: count("Certifications"),
    awards: count("Awards"),
    clientResults: count("Client Results"),
    successStories: count("Success Stories"),
    speakingEvents: count("Speaking Engagements"),
    mediaMentions: count("Media Features"),
    total: entries.length,
    favorites: entries.filter((e) => e.favorite).length,
  };
}

export type ConfidenceEntryInput = Omit<
  ConfidenceEntry,
  "id" | "createdAt" | "updatedAt"
>;

export function createConfidenceEntry(
  input: ConfidenceEntryInput,
): ConfidenceEntry {
  const now = new Date().toISOString();
  const entry: ConfidenceEntry = {
    id: newId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([entry, ...readAll()]);
  return entry;
}

export function updateConfidenceEntry(
  id: string,
  patch: Partial<ConfidenceEntryInput>,
): void {
  const now = new Date().toISOString();
  writeAll(
    readAll().map((e) =>
      e.id === id ? { ...e, ...patch, updatedAt: now } : e,
    ),
  );
}

export function toggleConfidenceFavorite(id: string): void {
  const entry = readAll().find((e) => e.id === id);
  if (!entry) return;
  updateConfidenceEntry(id, { favorite: !entry.favorite });
}

export function deleteConfidenceEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function filterConfidenceEntries(
  filter: ConfidenceVaultFilter,
): ConfidenceEntry[] {
  const all = getConfidenceEntries();
  switch (filter) {
    case "testimonials":
      return all.filter((e) => e.category === "Testimonials");
    case "praise":
      return all.filter((e) => e.category === "Praise & Compliments");
    case "credentials":
      return all.filter(
        (e) =>
          e.category === "Credentials" || e.category === "Certifications",
      );
    case "awards":
      return all.filter((e) => e.category === "Awards");
    case "achievements":
      return all.filter(
        (e) =>
          e.category === "Accomplishments" ||
          e.category === "Personal Achievements" ||
          e.category === "Success Stories",
      );
    case "client-results":
      return all.filter((e) => e.category === "Client Results");
    case "favorites":
      return all.filter((e) => e.favorite);
    default:
      return all;
  }
}

export function searchConfidenceEntries(
  query: string,
  filter: ConfidenceVaultFilter = "all",
): ConfidenceEntry[] {
  const q = query.trim().toLowerCase();
  const base = filterConfidenceEntries(filter);
  if (!q) return base;
  return base.filter((e) => {
    const haystack = [
      e.title,
      e.description,
      e.source,
      e.category,
      e.link,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export type ConfidencePrefill = {
  title?: string;
  description?: string;
  category?: ConfidenceCategory;
};

export function setConfidencePrefill(prefill: ConfidencePrefill): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
  } catch {
    /* noop */
  }
}

export function consumeConfidencePrefill(): ConfidencePrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    sessionStorage.removeItem(PREFILL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConfidencePrefill;
  } catch {
    return null;
  }
}

export const EMPTY_CONFIDENCE_DRAFT: ConfidenceEntryInput = {
  title: "",
  category: "Praise & Compliments",
  description: "",
  source: "Self",
  date: new Date().toISOString().slice(0, 10),
  link: "",
  attachments: [],
  favorite: false,
};
