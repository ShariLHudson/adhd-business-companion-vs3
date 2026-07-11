/**
 * UserMemoryStore — aggregates journal, portfolio, and evidence from domain stores.
 * Read-only aggregation — writes stay in Capture / domain stores.
 */

import {
  getEvidenceEntries,
  EVIDENCE_BANK_UPDATED_EVENT,
} from "@/lib/evidenceBankStore";
import {
  getGrowthMemoryEntries,
  GROWTH_JOURNAL_UPDATED_EVENT,
} from "@/lib/growthJournalStore";
import {
  getPortfolioEntries,
  GROWTH_PORTFOLIO_UPDATED_EVENT,
} from "@/lib/growthPortfolioStore";
import type { UserMemoryEntry, UserMemoryStore } from "./types";
import { USER_MEMORY_UPDATED_EVENT } from "./types";

function evidenceContent(entry: ReturnType<typeof getEvidenceEntries>[number]): string {
  const parts = [
    entry.whatHappened,
    entry.whatImproved,
    entry.whatMovedForward,
    entry.whoBenefited,
    entry.whyItMattered,
    entry.whatThisProves,
  ].filter((p) => p?.trim());
  return parts.join("\n\n").trim() || entry.whatHappened;
}

function journalEntries(): UserMemoryEntry[] {
  return getGrowthMemoryEntries({
    types: ["journal", "capture_moment", "reflection", "story_reflection"],
  }).map((e) => ({
    id: e.id,
    type: "journal" as const,
    content: e.body,
    title: e.title,
    timestamp: e.createdAt,
    tags: [...e.tags],
  }));
}

function portfolioItems(): UserMemoryEntry[] {
  return getPortfolioEntries().map((e) => ({
    id: e.id,
    type: "portfolio" as const,
    content: e.description || e.title,
    title: e.title,
    timestamp: e.createdAt,
    tags: [] as string[],
  }));
}

function evidenceItems(): UserMemoryEntry[] {
  return getEvidenceEntries().map((e) => ({
    id: e.id,
    type: "evidence" as const,
    content: evidenceContent(e),
    title: e.category,
    timestamp: e.createdAt,
    tags: [e.category],
  }));
}

/** Unified memory snapshot — sorted newest first within each bucket. */
export function getUserMemoryStore(): UserMemoryStore {
  const sortNewest = (a: UserMemoryEntry, b: UserMemoryEntry) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();

  return {
    journals: journalEntries().sort(sortNewest),
    portfolioItems: portfolioItems().sort(sortNewest),
    evidenceItems: evidenceItems().sort(sortNewest),
  };
}

export function getAllMemoryEntriesChronological(): UserMemoryEntry[] {
  const store = getUserMemoryStore();
  return [...store.journals, ...store.portfolioItems, ...store.evidenceItems].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function dispatchUserMemoryUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(USER_MEMORY_UPDATED_EVENT));
}

/** Subscribe to any underlying store change affecting memory. */
export function subscribeUserMemoryStore(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  const events = [
    USER_MEMORY_UPDATED_EVENT,
    GROWTH_JOURNAL_UPDATED_EVENT,
    GROWTH_PORTFOLIO_UPDATED_EVENT,
    EVIDENCE_BANK_UPDATED_EVENT,
  ];
  for (const name of events) {
    window.addEventListener(name, handler);
  }
  return () => {
    for (const name of events) {
      window.removeEventListener(name, handler);
    }
  };
}
