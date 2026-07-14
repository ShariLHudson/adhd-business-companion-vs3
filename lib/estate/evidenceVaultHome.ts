/**
 * Evidence Vault home — private archive orientation, helpers, and gentle copy.
 * Does not change capture questions or entrance ceremony.
 */

import type { EvidenceCategory, EvidenceEntry } from "@/lib/evidenceBankStore";
import {
  filterEvidenceEntries,
  getEvidenceEntries,
  pickRandomEvidenceEntries,
} from "@/lib/evidenceBankStore";

export const EVIDENCE_VAULT_HOME_KICKER = "A private archive" as const;

export const EVIDENCE_VAULT_HOME_TITLE = "Evidence Vault" as const;

export const EVIDENCE_VAULT_HOME_LEAD =
  "Life, growth, achievements, and encouragement — proof of who you are and how far you've come." as const;

export const EVIDENCE_VAULT_HOME_NEXT =
  "Preserve a moment, continue something you started, or look back when you need to remember." as const;

export const EVIDENCE_VAULT_EMPTY_INTRO = [
  "Every meaningful journey leaves behind evidence.",
  "This is where you'll collect moments that remind you who you are and how far you've come.",
].join("\n\n");

export const EVIDENCE_VAULT_EMPTY_CTA = "Add My First Evidence" as const;

export const EVIDENCE_VAULT_ADD_LABEL = "Add Evidence" as const;
export const EVIDENCE_VAULT_CONTINUE_DRAFT_LABEL = "Continue Draft" as const;
export const EVIDENCE_VAULT_BROWSE_LABEL = "Browse My Evidence" as const;
export const EVIDENCE_VAULT_SURPRISE_LABEL = "Surprise Me" as const;
export const EVIDENCE_VAULT_VIEW_ALL_LABEL = "View All" as const;
export const EVIDENCE_VAULT_HOW_DO_I_LABEL = "How Do I?" as const;

export const EVIDENCE_VAULT_HOW_DO_I_BODY = [
  "Your Evidence Vault is a quiet place to keep moments that matter — wins, kindness, growth, and proof you can return to on harder days.",
  "Use it when something feels worth remembering: a client result, a compliment, a milestone, a lesson, or a day you showed up for yourself.",
  "What belongs here is personal. Achievements, notes, photos, faith, family, health, business — or anything uncategorized that simply feels true.",
  "When discouragement or self-doubt visits, this archive helps you see evidence instead of guessing. You do not have to remember everything alone.",
].join("\n\n");

export const EVIDENCE_VAULT_GENTLE_REMINDER =
  "You haven't added anything in a while. Whenever you're ready, a small moment is enough." as const;

export const EVIDENCE_VAULT_CHAT_OPEN_OFFER =
  "Would you like me to open your Evidence Vault?" as const;

/** Visual home themes — not required; uncategorized is always allowed. */
export const EVIDENCE_VAULT_HOME_CATEGORIES = [
  "Achievements",
  "Client Wins",
  "Compliments",
  "Testimonials",
  "Personal Growth",
  "Photos",
  "Milestones",
  "Journal Highlights",
  "Lessons Learned",
  "Favorite Memories",
  "Faith",
  "Family",
  "Health",
  "Business",
] as const;

export type EvidenceVaultHomeCategory =
  (typeof EVIDENCE_VAULT_HOME_CATEGORIES)[number];

/** Map home themes → existing storage categories (soft; browse still allows uncategorized). */
export const EVIDENCE_VAULT_HOME_CATEGORY_MAP: Record<
  EvidenceVaultHomeCategory,
  EvidenceCategory[]
> = {
  Achievements: ["Small Win", "Courage", "Moved Forward"],
  "Client Wins": ["Client Result", "Client Impact", "Lives Impacted"],
  Compliments: ["Encouraging Message", "Thank-You Note", "Gratitude"],
  Testimonials: ["Testimonial"],
  "Personal Growth": ["Personal Growth", "Personal Proof", "Progress"],
  Photos: ["Before/After", "Journal Evidence"],
  Milestones: ["Business Growth", "Moved Forward", "Progress"],
  "Journal Highlights": ["Journal Evidence"],
  "Lessons Learned": ["Problem Solving", "Prevented Problem"],
  "Favorite Memories": ["Gratitude", "Personal Proof", "Courage"],
  Faith: ["Personal Growth", "Courage", "Gratitude"],
  Family: ["Lives Impacted", "Gratitude", "Personal Proof"],
  Health: ["Health"],
  Business: ["Business Growth", "Client Result", "Client Impact", "Problem Solving"],
};

export const EVIDENCE_VAULT_RECENT_LIMIT = 5;
export const EVIDENCE_VAULT_REMINDER_IDLE_DAYS = 14;
export const EVIDENCE_VAULT_SURPRISE_RECENT_KEY =
  "companion-evidence-vault-surprise-recent-v1";

export function getRecentEvidenceEntries(
  limit = EVIDENCE_VAULT_RECENT_LIMIT,
  pool?: EvidenceEntry[],
): EvidenceEntry[] {
  const source = pool ?? getEvidenceEntries();
  return source.slice(0, Math.max(0, limit));
}

export function searchEvidenceEntries(
  query: string,
  pool?: EvidenceEntry[],
): EvidenceEntry[] {
  const source = pool ?? getEvidenceEntries();
  return filterEvidenceEntries(source, { query });
}

export function shouldShowGentleReminder(
  entries: EvidenceEntry[],
  nowMs = Date.now(),
  idleDays = EVIDENCE_VAULT_REMINDER_IDLE_DAYS,
): boolean {
  if (entries.length === 0) return false;
  const latest = entries[0];
  if (!latest?.createdAt) return false;
  const ageMs = nowMs - new Date(latest.createdAt).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) return false;
  return ageMs >= idleDays * 24 * 60 * 60 * 1000;
}

function readSurpriseRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(EVIDENCE_VAULT_SURPRISE_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeSurpriseRecentIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      EVIDENCE_VAULT_SURPRISE_RECENT_KEY,
      JSON.stringify(ids.slice(0, 8)),
    );
  } catch {
    /* noop */
  }
}

/** Prefer entries not shown recently; fall back to any when the vault is small. */
export function pickSurpriseEvidenceEntry(
  pool?: EvidenceEntry[],
): EvidenceEntry | null {
  const source = pool ?? getEvidenceEntries();
  if (source.length === 0) return null;
  const recentIds = new Set(readSurpriseRecentIds());
  const fresh = source.filter((entry) => !recentIds.has(entry.id));
  const candidates = fresh.length > 0 ? fresh : source;
  const [picked] = pickRandomEvidenceEntries(1, candidates);
  if (!picked) return null;
  const nextRecent = [
    picked.id,
    ...readSurpriseRecentIds().filter((id) => id !== picked.id),
  ];
  writeSurpriseRecentIds(nextRecent);
  return picked;
}

export function evidenceEntriesForHomeCategory(
  category: EvidenceVaultHomeCategory,
  pool?: EvidenceEntry[],
): EvidenceEntry[] {
  const mapped = EVIDENCE_VAULT_HOME_CATEGORY_MAP[category] ?? [];
  const source = pool ?? getEvidenceEntries();
  if (mapped.length === 0) return source;
  return source.filter((entry) => mapped.includes(entry.category));
}

export function evidencePreviewLine(entry: EvidenceEntry): string {
  const line = entry.whatHappened.trim().split(/\n/)[0] ?? "";
  if (line.length <= 90) return line;
  return `${line.slice(0, 87)}…`;
}
