/**
 * Standard 071 / 073 — Detect chat / NL intent to resume an active Creation Workspace.
 * Match by human-readable identity; reopen by internal Workspace ID.
 */

import {
  getMostRecentActiveWorkspace,
  listActiveWorkspaces,
} from "./registry";
import type { ActiveWorkspaceEntry } from "./types";

/**
 * Member asks to return to existing Creation work — not start new Create.
 * Allows modifiers: "my productivity workshop", "the simple productivity workshop".
 */
export const ACTIVE_WORKSPACE_RESUME_RE =
  /\b(?:continue where i left off|pick up where i (?:left off|were)|resume (?:my )?(?:\w+\s+){0,5}?(?:workshop|document|draft|sop|course|project|creation)|(?:go )?back to (?:my |the )?(?:\w+\s+){0,5}?(?:workshop|document|draft|sop|course|creation)|continue (?:my |the )?(?:\w+\s+){0,5}?(?:workshop|document|draft|sop|course|creation|work)|keep working on (?:this|my (?:\w+\s+){0,5}?(?:workshop|document|draft))|go back to (?:what we were doing)|let'?s (?:go back to|pick up|continue) (?:the |my )?(?:\w+\s+){0,5}?(?:workshop|document|draft|creation|sop|guide)|open (?:my |the )?(?:\w+\s+){0,5}?(?:workshop|document|draft|sop|guide)(?: i was (?:working on|creating))?|where i left off|reopen (?:my |the )?(?:\w+\s+){0,5}?(?:workshop|document|draft)|take me back to (?:my |the )?(?:\w+\s+){0,5}?(?:workshop|document|draft|sop|guide))\b/i;

export function isActiveWorkspaceResumeRequest(text: string): boolean {
  return ACTIVE_WORKSPACE_RESUME_RE.test(text.trim());
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
