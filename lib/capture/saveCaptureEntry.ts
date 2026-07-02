/**
 * saveCaptureEntry™ — instant local persist for capture systems.
 * No LLM. On failure → silent queue for retry.
 */

import {
  createEvidenceEntry,
  EMPTY_EVIDENCE_DRAFT,
  type EvidenceCategory,
} from "@/lib/evidenceBankStore";
import {
  createJournalEntry,
  generateEntryTitle,
} from "@/lib/growthJournalStore";
import { createPortfolioEntry } from "@/lib/growthPortfolioStore";
import { dispatchUserMemoryUpdated } from "@/lib/memory/userMemoryStore";
import type { CaptureType, SaveCaptureResult } from "./types";

const PENDING_KEY = "companion-capture-pending-v1";

export type PendingCaptureEntry = {
  id: string;
  captureType: CaptureType;
  content: string;
  createdAt: string;
  attempts: number;
};

function newPendingId(): string {
  return `cap-pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readPending(): PendingCaptureEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingCaptureEntry[]) : [];
  } catch {
    return [];
  }
}

function writePending(list: PendingCaptureEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    /* quota */
  }
}

function queuePending(captureType: CaptureType, content: string): void {
  const entry: PendingCaptureEntry = {
    id: newPendingId(),
    captureType,
    content,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  writePending([entry, ...readPending()].slice(0, 24));
}

function evidenceCategoryForContent(content: string): EvidenceCategory {
  const t = content.toLowerCase();
  if (/\bhelped\s+(?:someone|a\s+|my\s+)/.test(t)) return "Client Impact";
  if (/\b(?:courage|brave|scared|afraid)\b/.test(t)) return "Courage";
  if (/\b(?:health|wellness|sleep|exercise)\b/.test(t)) return "Health";
  if (/\b(?:learned|lesson|grew|growth)\b/.test(t)) return "Personal Growth";
  return "Business Growth";
}

function persistCapture(
  captureType: CaptureType,
  content: string,
): { ok: true; recordId: string } | { ok: false } {
  const body = content.trim();
  if (!body) return { ok: false };

  if (typeof window === "undefined") return { ok: false };

  try {
    if (captureType === "journal") {
      const { entry, ok } = createJournalEntry({
        body,
        title: generateEntryTitle(body),
        sourcePage: "capture_system",
        type: "journal",
      });
      if (!ok || !entry) return { ok: false };
      return { ok: true, recordId: entry.id };
    }

    if (captureType === "portfolio") {
      const entry = createPortfolioEntry({
        title: generateEntryTitle(body),
        description: body,
        attachments: [],
      });
      return { ok: true, recordId: entry.id };
    }

    const entry = createEvidenceEntry({
      ...EMPTY_EVIDENCE_DRAFT,
      category: evidenceCategoryForContent(body),
      whatHappened: body,
      whoBenefited:
        /\bhelped\b/i.test(body) ? body.slice(0, 200) : "",
      whyItMattered: body.slice(0, 280),
      attachments: [],
    });
    return { ok: true, recordId: entry.id };
  } catch {
    return { ok: false };
  }
}

/** Flush queued captures — call before new writes. */
export function flushPendingCaptureQueue(): number {
  const pending = readPending();
  if (!pending.length) return 0;

  const remaining: PendingCaptureEntry[] = [];
  let saved = 0;

  for (const item of pending) {
    const result = persistCapture(item.captureType, item.content);
    if (result.ok) {
      saved += 1;
    } else if (item.attempts < 5) {
      remaining.push({ ...item, attempts: item.attempts + 1 });
    }
  }

  writePending(remaining);
  return saved;
}

/**
 * Write capture content immediately — no routing, no LLM, no chat.
 */
export function saveCaptureEntry(
  captureType: CaptureType,
  content: string,
): SaveCaptureResult {
  flushPendingCaptureQueue();

  const result = persistCapture(captureType, content);
  if (result.ok) {
    dispatchUserMemoryUpdated();
    return { ok: true, recordId: result.recordId, captureType };
  }

  queuePending(captureType, content);
  return { ok: false, queued: true };
}
