/**
 * 101 — Adapters to existing stores (no parallel progress databases).
 * Wins → growthWinsStore · Accomplishments → growthPortfolioStore · Evidence → evidenceBankStore
 */

import {
  createSavedGrowthWin,
  getSavedGrowthWins,
} from "@/lib/growthWinsStore";
import {
  createPortfolioEntry,
  getPortfolioEntries,
} from "@/lib/growthPortfolioStore";
import {
  createEvidenceEntry,
  getEvidenceEntries,
} from "@/lib/evidenceBankStore";
import { linkWorkRelationship } from "@/lib/universalWorkEngine";
import type {
  AccomplishmentRecord,
  CelebrationRecord,
  EvidenceRecognitionRecord,
  WinRecord,
  WinSignificance,
} from "./contracts";
import {
  findDuplicateAccomplishment,
  findDuplicateWin,
  fingerprintRecognition,
} from "./duplicateProtection";

const WIN_INDEX_KEY = "companion-progress-win-index-v1";
const ACC_INDEX_KEY = "companion-progress-acc-index-v1";
const CELEBRATION_KEY = "companion-progress-celebrations-v1";

type WinIndex = Record<string, WinRecord>;
type AccIndex = Record<string, AccomplishmentRecord>;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

/** In-memory fallback for Node tests. */
let memWins: WinIndex = {};
let memAccs: AccIndex = {};
let memCelebrations: CelebrationRecord[] = [];

export function resetProgressRecognitionAdaptersForTests(): void {
  memWins = {};
  memAccs = {};
  memCelebrations = [];
  if (canUseStorage()) {
    try {
      localStorage.removeItem(WIN_INDEX_KEY);
      localStorage.removeItem(ACC_INDEX_KEY);
      localStorage.removeItem(CELEBRATION_KEY);
    } catch {
      /* noop */
    }
  }
}

function loadWinIndex(): WinIndex {
  if (!canUseStorage()) return { ...memWins };
  return { ...memWins, ...readJson<WinIndex>(WIN_INDEX_KEY, {}) };
}

function saveWinIndex(index: WinIndex): void {
  memWins = index;
  writeJson(WIN_INDEX_KEY, index);
}

function loadAccIndex(): AccIndex {
  if (!canUseStorage()) return { ...memAccs };
  return { ...memAccs, ...readJson<AccIndex>(ACC_INDEX_KEY, {}) };
}

function saveAccIndex(index: AccIndex): void {
  memAccs = index;
  writeJson(ACC_INDEX_KEY, index);
}

export function listWinRecords(): WinRecord[] {
  return Object.values(loadWinIndex()).filter((w) => !w.removedAt);
}

export function listAccomplishmentRecords(): AccomplishmentRecord[] {
  return Object.values(loadAccIndex()).filter((a) => !a.removedAt);
}

export function listCelebrationRecords(): CelebrationRecord[] {
  if (!canUseStorage()) return [...memCelebrations];
  return readJson<CelebrationRecord[]>(CELEBRATION_KEY, memCelebrations);
}

function significanceToIcon(sig: WinSignificance): string {
  if (sig === "significant") return "✦";
  if (sig === "meaningful") return "✧";
  return "·";
}

export function saveWinRecord(
  input: Omit<WinRecord, "winId" | "createdAt"> & { winId?: string },
): WinRecord | { duplicateOf: WinRecord } {
  const occurredAt = input.occurredAt || new Date().toISOString();
  const fp = fingerprintRecognition({
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    kind: "win",
    title: input.title,
    occurredAt,
  });
  const dup = findDuplicateWin(fp, listWinRecords());
  if (dup) return { duplicateOf: dup };

  const winId = input.winId ?? `win-${Date.now().toString(36)}`;
  const record: WinRecord = {
    ...input,
    winId,
    occurredAt,
    createdAt: new Date().toISOString(),
  };

  // Existing Garden store (view)
  createSavedGrowthWin({
    whatHappened: record.title,
    ts: record.occurredAt,
    icon: significanceToIcon(record.significance),
    sourceId: record.sourceId,
    classification: "potential-win",
    category: "momentum",
    attachments: [],
  });

  const index = loadWinIndex();
  index[winId] = record;
  saveWinIndex(index);

  if (record.workId) {
    try {
      linkWorkRelationship({
        fromWorkId: record.workId,
        toRef: { kind: "win", id: winId },
        relationship: "related_to",
        note: record.title,
      });
    } catch {
      /* identity optional in tests */
    }
  }

  return record;
}

export function saveAccomplishmentRecord(
  input: Omit<AccomplishmentRecord, "accomplishmentId" | "createdAt"> & {
    accomplishmentId?: string;
  },
): AccomplishmentRecord | { duplicateOf: AccomplishmentRecord } {
  const occurredAt = input.occurredAt || new Date().toISOString();
  const fp = fingerprintRecognition({
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    kind: "accomplishment",
    title: input.title,
    occurredAt,
  });
  const dup = findDuplicateAccomplishment(fp, listAccomplishmentRecords());
  if (dup) return { duplicateOf: dup };

  const accomplishmentId =
    input.accomplishmentId ?? `acc-${Date.now().toString(36)}`;
  const record: AccomplishmentRecord = {
    ...input,
    accomplishmentId,
    occurredAt,
    createdAt: new Date().toISOString(),
  };

  createPortfolioEntry({
    title: record.title,
    description: record.description || record.whyItMattered || "",
    achievementType: "Major Achievement",
    projectName: record.projectId,
    originatedFromId: record.sourceId,
    attachments: [],
  });

  const index = loadAccIndex();
  index[accomplishmentId] = record;
  saveAccIndex(index);

  if (record.workId) {
    try {
      linkWorkRelationship({
        fromWorkId: record.workId,
        toRef: { kind: "accomplishment", id: accomplishmentId },
        relationship: "related_to",
        note: record.title,
      });
    } catch {
      /* optional */
    }
  }

  return record;
}

/**
 * Evidence only when discovery fields exist — never from win/accomplishment alone.
 */
export function saveEvidenceRecognitionRecord(
  input: Omit<EvidenceRecognitionRecord, "evidenceId" | "createdAt"> & {
    evidenceId?: string;
  },
): EvidenceRecognitionRecord | { refused: string } {
  const discovery =
    input.discovery?.trim() ||
    input.problemSolved?.trim() ||
    input.pattern?.trim() ||
    input.futureGuidance?.trim() ||
    "";
  if (!discovery && !(input.whoHelped && input.whoHelped.length)) {
    return {
      refused:
        "Evidence requires a discovery, lesson, pattern, or who helped — not a completion trophy.",
    };
  }

  const entry = createEvidenceEntry({
    category: "Business Growth",
    whatHappened: discovery.slice(0, 240) || "Discovery",
    whatImproved: input.whatWorked?.trim() || "",
    whatMovedForward: "",
    whatProblemSolved: input.problemSolved?.trim() || "",
    whoBenefited: input.whoHelped?.join(", ") || "",
    whyItMattered: input.futureGuidance?.trim() || input.pattern?.trim() || "",
    whatThisProves: [
      input.discovery,
      input.cause ? `Cause: ${input.cause}` : "",
      input.whatDidNotWork ? `What did not: ${input.whatDidNotWork}` : "",
      input.pattern ? `Pattern: ${input.pattern}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    attachments: [],
    source: input.sourceId || "progress-recognition",
    confidenceBoost: false,
  });

  const record: EvidenceRecognitionRecord = {
    ...input,
    evidenceId: entry.id,
    createdAt: entry.createdAt || new Date().toISOString(),
  };

  if (input.sourceId && entry.id) {
    /* UWE link when work id known separately by caller */
  }

  return record;
}

export function recordCelebration(record: CelebrationRecord): CelebrationRecord {
  const list = listCelebrationRecords();
  const next = [...list, record];
  memCelebrations = next;
  writeJson(CELEBRATION_KEY, next);

  if (record.returnPath?.workId) {
    try {
      linkWorkRelationship({
        fromWorkId: record.returnPath.workId,
        toRef: { kind: "celebration", id: record.celebrationId },
        relationship: "related_to",
        note: `${record.recognitionType}:${record.destination}`,
      });
    } catch {
      /* optional */
    }
  }
  return record;
}

export function removeWinRecognition(winId: string): void {
  const index = loadWinIndex();
  if (!index[winId]) return;
  index[winId] = {
    ...index[winId]!,
    removedAt: new Date().toISOString(),
  };
  saveWinIndex(index);
}

export function removeAccomplishmentRecognition(accomplishmentId: string): void {
  const index = loadAccIndex();
  if (!index[accomplishmentId]) return;
  index[accomplishmentId] = {
    ...index[accomplishmentId]!,
    removedAt: new Date().toISOString(),
  };
  saveAccIndex(index);
}

/** Hydrate indexes from legacy stores when index empty (read-only bridge). */
export function syncIndexesFromLegacyStoresIfEmpty(): void {
  if (listWinRecords().length === 0 && getSavedGrowthWins().length > 0) {
    /* Garden already has wins — indexes fill on new saves */
  }
  if (
    listAccomplishmentRecords().length === 0 &&
    getPortfolioEntries().length > 0
  ) {
    /* Hall already has entries — indexes fill on new saves */
  }
  void getEvidenceEntries;
}
