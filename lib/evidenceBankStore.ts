/**
 * Evidence Bank — proof that progress, impact, and forward motion are real.
 * Core question: "What changed because of what I did?"
 */

import type { GrowthAttachment } from "./growthAttachments";

export const EVIDENCE_CATEGORIES = [
  "Business Growth",
  "Client Impact",
  "Personal Growth",
  "Health & Wellbeing",
  "Courage",
  "Problem Solving",
] as const;

export type EvidenceCategory = (typeof EVIDENCE_CATEGORIES)[number];

export type EvidenceEntry = {
  id: string;
  category: EvidenceCategory;
  whatHappened: string;
  whatImproved: string;
  whatMovedForward: string;
  whatProblemSolved: string;
  whoBenefited: string;
  whyItMattered: string;
  whatThisProves: string;
  attachments: GrowthAttachment[];
  createdAt: string;
  updatedAt: string;
  /** Momentum event or win moment id when saved from Wins This Week */
  sourceWinId?: string;
};

export type EvidenceDashboardStats = {
  totalEntries: number;
  problemsSolved: number;
  thingsImproved: number;
  peopleBenefited: number;
  courageMoments: number;
};

export type EvidencePrefill = {
  whatHappened?: string;
  sourceWinId?: string;
};

const STORAGE_KEY = "companion-evidence-bank-v1";
const PREFILL_KEY = "companion-evidence-prefill-v1";

export const EVIDENCE_BANK_UPDATED_EVENT = "companion-evidence-bank-updated";

function newId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): EvidenceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is EvidenceEntry =>
          e &&
          typeof e.id === "string" &&
          typeof e.whatHappened === "string" &&
          typeof e.category === "string",
      )
      .map((e) => ({
        ...e,
        attachments: Array.isArray(e.attachments) ? e.attachments : [],
      }));
  } catch {
    return [];
  }
}

function writeAll(list: EvidenceEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVIDENCE_BANK_UPDATED_EVENT));
  } catch {
    /* noop */
  }
}

export function getEvidenceEntries(): EvidenceEntry[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getEvidenceDashboardStats(): EvidenceDashboardStats {
  const entries = readAll();
  const hasText = (value: string) => value.trim().length > 0;
  return {
    totalEntries: entries.length,
    problemsSolved: entries.filter((e) => hasText(e.whatProblemSolved)).length,
    thingsImproved: entries.filter((e) => hasText(e.whatImproved)).length,
    peopleBenefited: entries.filter((e) => hasText(e.whoBenefited)).length,
    courageMoments: entries.filter((e) => e.category === "Courage").length,
  };
}

export function hasEvidenceForWin(sourceWinId: string): boolean {
  return readAll().some((e) => e.sourceWinId === sourceWinId);
}

export type EvidenceEntryInput = Omit<
  EvidenceEntry,
  "id" | "createdAt" | "updatedAt"
>;

export function createEvidenceEntry(
  input: EvidenceEntryInput,
): EvidenceEntry {
  const now = new Date().toISOString();
  const entry: EvidenceEntry = {
    id: newId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([entry, ...readAll()]);
  return entry;
}

export function deleteEvidenceEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function updateEvidenceEntry(
  id: string,
  patch: Partial<EvidenceEntryInput>,
): EvidenceEntry | null {
  const list = readAll();
  const idx = list.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  const updated: EvidenceEntry = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  writeAll(list);
  return updated;
}

export function getEvidenceEntryById(id: string): EvidenceEntry | null {
  return readAll().find((e) => e.id === id) ?? null;
}

export function formatEvidenceEntryForExport(entry: EvidenceEntry): string {
  const lines = [
    `Evidence Bank Entry`,
    `Category: ${entry.category}`,
    `Date: ${new Date(entry.createdAt).toLocaleString()}`,
    ``,
    `What happened:`,
    entry.whatHappened,
  ];
  if (entry.whatImproved.trim()) lines.push(``, `What improved:`, entry.whatImproved);
  if (entry.whatMovedForward.trim())
    lines.push(``, `What moved forward:`, entry.whatMovedForward);
  if (entry.whatProblemSolved.trim())
    lines.push(``, `Problem solved:`, entry.whatProblemSolved);
  if (entry.whoBenefited.trim()) lines.push(``, `Who benefited:`, entry.whoBenefited);
  if (entry.whyItMattered.trim()) lines.push(``, `Why it mattered:`, entry.whyItMattered);
  if (entry.whatThisProves.trim()) lines.push(``, `What this proves:`, entry.whatThisProves);
  if (entry.attachments.length > 0) {
    lines.push(``, `Attachments:`);
    for (const att of entry.attachments) {
      lines.push(`- ${att.name} (${att.kind})`);
    }
  }
  return lines.join("\n");
}

export function downloadEvidenceEntry(entry: EvidenceEntry): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([formatEvidenceEntryForExport(entry)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `evidence-${entry.id}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function printEvidenceEntry(entry: EvidenceEntry): void {
  if (typeof window === "undefined") return;
  const html = `<!DOCTYPE html><html><head><title>Evidence</title></head><body><pre style="font-family:system-ui,sans-serif;padding:24px;white-space:pre-wrap;">${formatEvidenceEntryForExport(entry).replace(/</g, "&lt;")}</pre></body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export function setEvidencePrefill(prefill: EvidencePrefill): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
  } catch {
    /* noop */
  }
}

export function consumeEvidencePrefill(): EvidencePrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    sessionStorage.removeItem(PREFILL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EvidencePrefill;
  } catch {
    return null;
  }
}

export const EMPTY_EVIDENCE_DRAFT: EvidenceEntryInput = {
  category: "Business Growth",
  whatHappened: "",
  whatImproved: "",
  whatMovedForward: "",
  whatProblemSolved: "",
  whoBenefited: "",
  whyItMattered: "",
  whatThisProves: "",
  attachments: [],
};

export function categoryLabel(category: EvidenceCategory): string {
  return category;
}
