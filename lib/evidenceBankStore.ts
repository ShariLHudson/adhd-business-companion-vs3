/**
 * Evidence Vault (248) — proof for difficult days.
 * Emotional role: "Remember who you are."
 * Core question: "What changed because of what I did?"
 */

import type { EcosystemObjectKind } from "./intelligence/intelligenceReadyTypes";
import type { GrowthAttachment } from "./growthAttachments";
import { linkGrowthAttachmentsToRecord } from "@/lib/assetLibrary/references";

/** Vault categories aligned to 246 capture moments + 248 example types. */
export const EVIDENCE_CATEGORIES = [
  "Small Win",
  "Testimonial",
  "Encouraging Message",
  "Thank-You Note",
  "Gratitude",
  "Progress",
  "Problem Solving",
  "Lives Impacted",
  "Client Result",
  "Client Impact",
  "Personal Proof",
  "Before/After",
  "Journal Evidence",
  "Business Growth",
  "Personal Growth",
  "Health",
  "Courage",
  "Prevented Problem",
  "Moved Forward",
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
  originatedFromId?: string;
  originatedFromKind?: EcosystemObjectKind;
  /** Optional filters for Vault browse */
  source?: string;
  emotion?: string;
  projectName?: string;
  personName?: string;
  confidenceBoost?: boolean;
  noteOrLink?: string;
  /** Internal tag — possible Hall of Accomplishment candidate; never auto-promoted. */
  hallCandidate?: boolean;
  /** Optional favorite for rediscovery — absent on legacy entries means false. */
  favorite?: boolean;
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

function normalizeCategory(raw: string): EvidenceCategory {
  if (raw === "Health & Wellbeing") return "Health";
  if ((EVIDENCE_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as EvidenceCategory;
  }
  return "Business Growth";
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
        category: normalizeCategory(e.category),
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
    attachments: input.attachments ?? [],
    createdAt: now,
    updatedAt: now,
  };
  writeAll([entry, ...readAll()]);
  linkGrowthAttachmentsToRecord(
    entry.attachments,
    "evidence-bank",
    entry.id,
  );
  return entry;
}

/** Quick-add from chat / save-this-win flow. */
export function quickAddEvidenceEntry(input: {
  text: string;
  category?: EvidenceCategory;
  source?: string;
  confidenceBoost?: boolean;
}): EvidenceEntry {
  const text = input.text.trim();
  return createEvidenceEntry({
    category: input.category ?? "Small Win",
    whatHappened: text,
    whatImproved: "",
    whatMovedForward: "",
    whatProblemSolved: "",
    whoBenefited: "",
    whyItMattered: "",
    whatThisProves: text,
    attachments: [],
    source: input.source ?? "conversation",
    confidenceBoost: input.confidenceBoost ?? true,
  });
}

export type EvidenceFilter = {
  category?: string;
  source?: string;
  emotion?: string;
  projectName?: string;
  personName?: string;
  confidenceBoostOnly?: boolean;
  recentDays?: number;
  query?: string;
};

export function filterEvidenceEntries(
  entries: EvidenceEntry[],
  filter: EvidenceFilter,
): EvidenceEntry[] {
  const q = filter.query?.trim().toLowerCase();
  const cutoff =
    filter.recentDays != null
      ? Date.now() - filter.recentDays * 24 * 60 * 60 * 1000
      : null;
  return entries.filter((e) => {
    if (filter.category && e.category !== filter.category) return false;
    if (filter.source && (e.source ?? "").toLowerCase() !== filter.source.toLowerCase()) {
      return false;
    }
    if (filter.emotion && (e.emotion ?? "").toLowerCase() !== filter.emotion.toLowerCase()) {
      return false;
    }
    if (
      filter.projectName &&
      !(e.projectName ?? "").toLowerCase().includes(filter.projectName.toLowerCase())
    ) {
      return false;
    }
    if (
      filter.personName &&
      !(e.personName ?? e.whoBenefited ?? "")
        .toLowerCase()
        .includes(filter.personName.toLowerCase())
    ) {
      return false;
    }
    if (filter.confidenceBoostOnly && !e.confidenceBoost) return false;
    if (cutoff != null && new Date(e.createdAt).getTime() < cutoff) return false;
    if (q) {
      const hay = [
        e.whatHappened,
        e.whatThisProves,
        e.whyItMattered,
        e.category,
        e.source,
        e.projectName,
        e.personName,
        e.noteOrLink,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
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

export function formatEvidenceEntryAsMarkdown(entry: EvidenceEntry): string {
  const lines = [
    `# Evidence Vault Discovery`,
    ``,
    `**Category:** ${entry.category}`,
    `**Date:** ${new Date(entry.createdAt).toLocaleString()}`,
    ``,
    `## Discovery`,
    entry.whatHappened,
  ];
  if (entry.whoBenefited.trim())
    lines.push(``, `## Who benefited`, entry.whoBenefited);
  if (entry.whatThisProves.trim())
    lines.push(``, `## Why it mattered`, entry.whatThisProves);
  return lines.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatParagraphs(text: string): string {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function relatedDiscoveries(entry: EvidenceEntry): EvidenceEntry[] {
  return getEvidenceEntries()
    .filter((candidate) => candidate.id !== entry.id)
    .filter(
      (candidate) =>
        candidate.category === entry.category ||
        candidate.whatHappened
          .toLowerCase()
          .split(/\s+/)
          .some(
            (word) =>
              word.length > 5 &&
              entry.whatHappened.toLowerCase().includes(word),
          ),
    )
    .slice(0, 3);
}

/** Branded print layout — typography only, not selectable plain text. */
export function buildEvidenceDiscoveryPrintHtml(entry: EvidenceEntry): string {
  const dateLabel = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const related = relatedDiscoveries(entry);
  const sections: { title: string; body: string }[] = [
    { title: "Discovery", body: entry.whatHappened },
  ];
  if (entry.whatProblemSolved.trim())
    sections.push({ title: "Problem Solved", body: entry.whatProblemSolved });
  if (entry.whoBenefited.trim())
    sections.push({ title: "People Helped", body: entry.whoBenefited });
  if (entry.whatImproved.trim())
    sections.push({ title: "What Improved", body: entry.whatImproved });
  if (entry.whatMovedForward.trim())
    sections.push({ title: "Progress Made", body: entry.whatMovedForward });
  if (entry.whatThisProves.trim())
    sections.push({ title: "Lesson Learned", body: entry.whatThisProves });
  if (entry.whyItMattered.trim())
    sections.push({ title: "Why It Matters", body: entry.whyItMattered });

  const sectionHtml = sections
    .map(
      (section) => `
      <section class="block">
        <h2>${escapeHtml(section.title)}</h2>
        ${formatParagraphs(section.body)}
      </section>`,
    )
    .join("");

  const attachmentHtml =
    entry.attachments.length > 0
      ? `<section class="block"><h2>Attachments</h2><ul>${entry.attachments
          .map(
            (att) =>
              `<li>${escapeHtml(att.name)} <span class="meta">(${escapeHtml(att.kind)})</span></li>`,
          )
          .join("")}</ul></section>`
      : "";

  const relatedHtml =
    related.length > 0
      ? `<section class="block related"><h2>Related Discoveries</h2><ul>${related
          .map(
            (item) =>
              `<li><span class="meta">${escapeHtml(new Date(item.createdAt).toLocaleDateString())}</span> — ${escapeHtml(item.whatHappened.slice(0, 120))}${item.whatHappened.length > 120 ? "…" : ""}</li>`,
          )
          .join("")}</ul></section>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Spark Estate — Discovery</title>
  <style>
    @page { margin: 1.1in; }
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; }
    body {
      margin: 0;
      padding: 48px 56px;
      font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
      color: #2f261f;
      background: #faf6ee;
    }
    .brand {
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-size: 11px;
      color: #8a7358;
      margin-bottom: 8px;
    }
    h1 {
      margin: 0 0 6px;
      font-size: 32px;
      font-weight: 500;
    }
    .date {
      margin: 0 0 28px;
      font-style: italic;
      color: #6b5a46;
    }
    .block { margin-bottom: 22px; page-break-inside: avoid; }
    h2 {
      margin: 0 0 8px;
      font-size: 13px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #8a7358;
      font-weight: 600;
    }
    p { margin: 0 0 10px; font-size: 18px; line-height: 1.65; }
    ul { margin: 0; padding-left: 1.1rem; font-size: 17px; line-height: 1.55; }
  .meta { color: #8a7358; font-size: 14px; }
    .footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid rgba(107, 90, 70, 0.25);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #8a7358;
    }
  </style>
</head>
<body oncontextmenu="return false">
  <p class="brand">Spark Estate · Evidence Vault</p>
  <h1>Today's Discovery</h1>
  <p class="date">${escapeHtml(dateLabel)}</p>
  ${sectionHtml}
  ${attachmentHtml}
  ${relatedHtml}
  <p class="footer">Preserved discovery — for your eyes and your journey.</p>
</body>
</html>`;
}

export function formatEvidenceEntryForExport(entry: EvidenceEntry): string {
  const lines = [
    `Evidence Vault Entry`,
    `Category: ${entry.category}`,
    `Date: ${new Date(entry.createdAt).toLocaleString()}`,
    ``,
    `Discovery:`,
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
  const html = buildEvidenceDiscoveryPrintHtml(entry);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

/** Pick random entries for Remind Me overlay. */
export function pickRandomEvidenceEntries(
  count: number,
  pool?: EvidenceEntry[],
): EvidenceEntry[] {
  const source = pool ?? getEvidenceEntries();
  if (source.length === 0) return [];
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function formatAllEvidenceForExport(entries: EvidenceEntry[]): string {
  if (entries.length === 0) return "Evidence Vault — no entries.";
  return entries
    .map((e, i) => {
      const block = formatEvidenceEntryForExport(e);
      return i === 0 ? block : `\n${"─".repeat(40)}\n\n${block}`;
    })
    .join("");
}

export function downloadAllEvidence(entries: EvidenceEntry[]): void {
  if (typeof window === "undefined" || entries.length === 0) return;
  const blob = new Blob([formatAllEvidenceForExport(entries)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `evidence-vault-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function printAllEvidence(entries: EvidenceEntry[]): void {
  if (typeof window === "undefined" || entries.length === 0) return;
  const body = formatAllEvidenceForExport(entries).replace(/</g, "&lt;");
  const html = `<!DOCTYPE html><html><head><title>Evidence Vault</title></head><body><pre style="font-family:Georgia,serif;padding:32px;white-space:pre-wrap;color:#2f261f;">${body}</pre></body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function downloadBlob(filename: string, blob: Blob): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportEvidenceEntry(
  entry: EvidenceEntry,
  format: "plain" | "markdown" | "word" | "pdf" | "print",
): void {
  if (typeof window === "undefined") return;
  const base = `evidence-vault-discovery-${entry.id}`;
  switch (format) {
    case "plain":
      downloadEvidenceEntry(entry);
      return;
    case "markdown":
      downloadBlob(
        `${base}.md`,
        new Blob([formatEvidenceEntryAsMarkdown(entry)], {
          type: "text/markdown;charset=utf-8",
        }),
      );
      return;
    case "word":
      downloadBlob(
        `${base}.doc`,
        new Blob([formatEvidenceEntryForExport(entry)], {
          type: "application/msword;charset=utf-8",
        }),
      );
      return;
    case "pdf":
    case "print":
      printEvidenceEntry(entry);
      return;
  }
}

export function exportAllEvidence(
  format: "plain" | "markdown" | "word" | "pdf" | "print",
): void {
  const entries = getEvidenceEntries();
  if (entries.length === 0) return;
  if (format === "print" || format === "pdf") {
    printAllEvidence(entries);
    return;
  }
  if (format === "markdown") {
    const body = entries
      .map((entry) => formatEvidenceEntryAsMarkdown(entry))
      .join("\n\n---\n\n");
    downloadBlob(
      "evidence-vault-discoveries.md",
      new Blob([body], { type: "text/markdown;charset=utf-8" }),
    );
    return;
  }
  if (format === "word") {
    downloadBlob(
      "evidence-vault-discoveries.doc",
      new Blob([formatAllEvidenceForExport(entries)], {
        type: "application/msword;charset=utf-8",
      }),
    );
    return;
  }
  downloadAllEvidence(entries);
}

export function tagEvidenceHallCandidate(id: string, candidate: boolean): void {
  updateEvidenceEntry(id, { hallCandidate: candidate });
}

export function isEvidenceFavorite(entry: EvidenceEntry): boolean {
  return entry.favorite === true;
}

export function toggleEvidenceFavorite(id: string): EvidenceEntry | null {
  const existing = getEvidenceEntryById(id);
  if (!existing) return null;
  return updateEvidenceEntry(id, { favorite: !isEvidenceFavorite(existing) });
}

export function getFavoriteEvidenceEntries(pool?: EvidenceEntry[]): EvidenceEntry[] {
  const source = pool ?? getEvidenceEntries();
  return source.filter(isEvidenceFavorite);
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
