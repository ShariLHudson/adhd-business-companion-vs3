/**
 * Standard 071 / 073 — Detect chat / NL intent to resume an active Creation Workspace.
 * Match by human-readable identity; reopen by internal Workspace ID.
 *
 * Continuation fix (2026-08-06) — the type-noun half of this detector used
 * to be a small hand-maintained regex alternation (workshop|document|draft|
 * sop|...), so a request naming any type outside that list — "Continue my
 * Newsletter," "Continue my Marketing Plan," "Continue my Strategy" — fell
 * through as unrecognized, even with the matching workspace sitting right
 * there in the active registry. Fixed by deriving the type-reference check
 * from lib/createCatalog's CREATE_CATALOG (see referencesCreationType
 * below) — every catalog item's label, matchTerms, and significant
 * constituent words are recognized automatically, so a future Build Type
 * needs zero changes here to gain resume-intent recognition. The intent
 * VERB phrasing ("continue," "resume," "back to," …) stays a small fixed
 * set deliberately — those are English intent phrases, not creation-type
 * nouns, and don't grow when a new catalog item is added.
 *
 * @see docs/create-experience/UNIVERSAL_REASONING_JOURNEY_ACCEPTANCE_TESTS.md
 */

import { allCatalogItems } from "@/lib/createCatalog";
import {
  getMostRecentActiveWorkspace,
  listActiveWorkspaces,
} from "./registry";
import type { ActiveWorkspaceEntry } from "./types";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Complete on their own — the original regex never required a trailing
// type noun for these; preserved verbatim.
const RESUME_COMPLETE_PHRASE_RE =
  /\b(?:continue where i left off|pick up where i (?:left off|were)|where i left off|go back to what we were doing|keep working on this)\b/i;

// Verb phrasing that DOES need a following creation-type reference to count
// as resume — e.g. "open the newsletter" resumes; "open a new newsletter"
// (no "my"/"the") does not, preserving the original's create-vs-resume
// disambiguation for "open."
const RESUME_VERB_NEEDS_TYPE_RE =
  /\b(?:resume(?: my)?|(?:go )?back to (?:my |the )|continue (?:my |the )?|keep working on (?:my )|let'?s (?:go back to|pick up|continue) (?:the |my )?|open (?:my |the )|reopen (?:my |the )?|take me back to (?:my |the ))/i;

/** Every catalog label / matchTerm / significant constituent word, lazily built once. */
let typeReferenceCache: { phrases: readonly string[]; words: ReadonlySet<string> } | null = null;

function typeReferenceSet(): { phrases: readonly string[]; words: ReadonlySet<string> } {
  if (typeReferenceCache) return typeReferenceCache;
  const phrases: string[] = [];
  const words = new Set<string>();
  for (const item of allCatalogItems()) {
    for (const term of [item.label, ...(item.matchTerms ?? [])]) {
      const lower = term.trim().toLowerCase();
      if (!lower) continue;
      phrases.push(lower);
      // Constituent words (>=4 chars) from multi-word labels, so a compound
      // label like "Marketing Strategy" / "Content Strategy" automatically
      // covers a bare "Continue my Strategy" without a hand-added entry.
      for (const word of lower.split(/\s+/)) {
        if (word.length >= 4) words.add(word);
      }
    }
  }
  typeReferenceCache = { phrases, words };
  return typeReferenceCache;
}

/** Test-only — the catalog is static in production; nothing invalidates the cache at runtime. */
export function resetTypeReferenceCacheForTests(): void {
  typeReferenceCache = null;
}

// Small, deliberately generic — words members use to mean "the thing I was
// making" without naming a specific Build Type. Distinct in kind from the
// catalog-derived set: these never need to grow when a new catalog item is
// added, so keeping a short fixed list here doesn't reintroduce the
// original bug.
const GENERIC_CREATION_REFERENTS = [
  "document",
  "draft",
  "creation",
  "work",
  "project",
  "course",
];

/** Registry-driven — see the file header. */
export function referencesCreationType(text: string): boolean {
  const t = text.toLowerCase();
  const { phrases, words } = typeReferenceSet();
  for (const phrase of phrases) {
    if (new RegExp(`\\b${escapeRegex(phrase)}\\b`, "i").test(t)) return true;
  }
  for (const generic of GENERIC_CREATION_REFERENTS) {
    if (new RegExp(`\\b${generic}\\b`, "i").test(t)) return true;
  }
  const tokens = t.replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
  return tokens.some((tok) => words.has(tok));
}

export function isActiveWorkspaceResumeRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (RESUME_COMPLETE_PHRASE_RE.test(t)) return true;
  if (RESUME_VERB_NEEDS_TYPE_RE.test(t)) return referencesCreationType(t);
  return false;
}

function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length >= 3 &&
        ![
          "the",
          "and",
          "for",
          "my",
          "our",
          "was",
          "were",
          "working",
          "continue",
          "back",
          "open",
          "resume",
          "lets",
          "let",
          "take",
          "me",
          "to",
          "with",
          "that",
          "this",
          "want",
        ].includes(w),
    );
}

function scoreEntry(entry: ActiveWorkspaceEntry, text: string): number {
  const t = text.toLowerCase();
  let score = 1;
  const type = entry.creationType.toLowerCase();
  const title = entry.title.toLowerCase();
  if (type && t.includes(type.toLowerCase())) score += 5;
  if (/\bworkshop\b/i.test(t) && /workshop|event|retreat/i.test(type + title)) {
    score += 4;
  }
  if (
    /\b(?:document|doc|email|newsletter|guide|sop)\b/i.test(t) &&
    /email|document|newsletter|letter|guide|sop/i.test(type + title)
  ) {
    score += 4;
  }
  if (/\bsop\b/i.test(t) && /sop/i.test(type + title)) score += 4;
  if (/\bcourse\b/i.test(t) && /course/i.test(type + title)) score += 4;

  // 073 — full human-readable title / token overlap
  if (title.length > 3 && t.includes(title)) {
    score += 10;
  } else {
    const titleTokens = significantTokens(entry.title);
    const queryTokens = significantTokens(text);
    let overlap = 0;
    for (const tok of queryTokens) {
      if (titleTokens.some((tt) => tt.includes(tok) || tok.includes(tt))) {
        overlap += 1;
      }
    }
    if (overlap >= 2) score += 6 + overlap;
    else if (overlap === 1) score += 3;
  }
  return score;
}

export type ActiveWorkspaceMatchResult =
  | { kind: "single"; entry: ActiveWorkspaceEntry }
  | { kind: "clarify"; candidates: ActiveWorkspaceEntry[] }
  | { kind: "none" };

/**
 * Resolve resume match with 073 multi-match clarification.
 */
export function matchActiveWorkspaceResumeDetailed(
  text: string,
): ActiveWorkspaceMatchResult {
  const active = listActiveWorkspaces();
  if (!active.length) return { kind: "none" };

  // Only score when the member is asking to resume — never treat "create a…" as resume
  if (!isActiveWorkspaceResumeRequest(text)) {
    return { kind: "none" };
  }

  const scored = active
    .map((entry) => ({ entry, score: scoreEntry(entry, text) }))
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top) return { kind: "none" };

  const close = scored.filter((s) => s.score >= top.score - 2 && s.score >= 6);
  if (close.length >= 2) {
    return {
      kind: "clarify",
      candidates: close.slice(0, 4).map((c) => c.entry),
    };
  }

  return {
    kind: "single",
    entry: top.entry,
  };
}

/**
 * Resolve which active workspace a resume request should open.
 * Prefers type/title match; falls back to most recent.
 * Prefer `matchActiveWorkspaceResumeDetailed` when clarification is needed.
 */
export function matchActiveWorkspaceResume(
  text: string,
): ActiveWorkspaceEntry | null {
  const result = matchActiveWorkspaceResumeDetailed(text);
  if (result.kind === "single") return result.entry;
  if (result.kind === "clarify") return result.candidates[0] ?? null;
  return getMostRecentActiveWorkspace();
}

export function buildActiveWorkspaceResumeGuidance(
  entry: ActiveWorkspaceEntry,
): string {
  const focus = entry.currentFocusTitle?.trim();
  const label = entry.title?.trim() || entry.creationType || "your work";
  if (focus) {
    return `Welcome back. I've reopened ${label}. We were working on the ${focus} section.`;
  }
  if (entry.hasDraft) {
    return `Welcome back. I've reopened ${label}. Your draft is still here — Current Focus will guide the next step.`;
  }
  return `Welcome back. I've reopened ${label}. We'll pick up in Current Focus.`;
}

/** 073 — clarify when multiple human-readable titles match. */
export function buildActiveWorkspaceClarifyGuidance(
  candidates: ActiveWorkspaceEntry[],
): string {
  const lines = candidates.map((c) => `**${c.title}**`).join("\n\n");
  const typeHint =
    candidates.every((c) =>
      c.creationType.toLowerCase().includes("workshop"),
    )
      ? "workshops"
      : "items";
  return `I found two ${typeHint}:\n\n${lines}\n\nWhich one would you like to continue?`.replace(
    "two",
    candidates.length === 2 ? "two" : `${candidates.length}`,
  );
}

/**
 * 073 — Find active work by human-readable title tokens (even without resume regex).
 */
export function findActiveWorkspaceByHumanTitle(
  text: string,
): ActiveWorkspaceEntry | null {
  const active = listActiveWorkspaces();
  if (!active.length) return null;
  const t = text.toLowerCase();
  let best: ActiveWorkspaceEntry | null = null;
  let bestScore = 0;
  for (const entry of active) {
    const title = entry.title.toLowerCase();
    if (title.length < 4) continue;
    let score = 0;
    if (t.includes(title)) score += 12;
    const tokens = significantTokens(entry.title);
    const q = significantTokens(text);
    let overlap = 0;
    for (const tok of q) {
      if (tokens.some((tt) => tt.includes(tok) || tok.includes(tt))) {
        overlap += 1;
      }
    }
    score += overlap * 3;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore >= 6 ? best : null;
}
