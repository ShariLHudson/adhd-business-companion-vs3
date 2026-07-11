/**
 * Save-this-win offer — Evidence Capture Standard (246).
 * Evidence Vault / Hall of Accomplishments (member choice).
 */

import {
  EVIDENCE_CAPTURE_PROMPT,
  shouldRecommendEvidenceVault,
} from "./evidenceIntelligence";

export type WinSaveDestination =
  | "evidence-vault"
  | "hall-of-accomplishments"
  | "both"
  | "not-now";

export type WinSaveOffer = {
  kind: "win-save-offer";
  text: string;
  prompt: string;
  options: { id: WinSaveDestination; label: string }[];
};

const WIN_SAVE_RE =
  /\b(?:save\s+this\s+win|save\s+this\s+(?:as\s+)?(?:evidence|proof)|add\s+this\s+to\s+(?:my\s+)?(?:hall\s+of\s+)?accomplishments|add\s+this\s+to\s+(?:my\s+)?(?:evidence\s+)?vault|preserve\s+this\s+(?:win|moment|proof)|file\s+this\s+(?:win|as\s+evidence)|would\s+you\s+like\s+to\s+save\s+this)\b/i;

const ENCOURAGEMENT_NEED_RE =
  /\b(?:i\s+need\s+encouragement|i'?m\s+(?:feeling\s+)?(?:discouraged|doubt(?:ing)?\s+myself|stuck)|remind\s+me\s+what\s+(?:i'?ve|i\s+have)\s+done|remind\s+me\s+who\s+i\s+am|show\s+me\s+proof\s+i\s+can|i\s+don'?t\s+trust\s+myself|feeling\s+defeated)\b/i;

export function detectsWinSaveRequest(text: string): boolean {
  return WIN_SAVE_RE.test(text.trim());
}

export function detectsEncouragementNeed(text: string): boolean {
  return (
    ENCOURAGEMENT_NEED_RE.test(text.trim()) ||
    shouldRecommendEvidenceVault(text)
  );
}

/** When the member already named a destination, skip the menu. */
export function preferredWinSaveDestination(
  text: string,
): WinSaveDestination | null {
  const t = text.trim().toLowerCase();
  if (
    /\badd\s+this\s+to\s+(?:my\s+)?(?:hall\s+of\s+)?accomplishments\b/.test(t) ||
    /\bsave\s+(?:this\s+)?to\s+(?:my\s+)?(?:hall\s+of\s+)?accomplishments\b/.test(t)
  ) {
    return "hall-of-accomplishments";
  }
  if (
    /\b(?:save|add)\s+(?:this\s+)?(?:to\s+)?(?:my\s+)?evidence\s+vault\b/.test(t) ||
    /\bsave\s+this\s+(?:as\s+)?(?:evidence|proof)\b/.test(t)
  ) {
    return "evidence-vault";
  }
  if (/\bsave\s+to\s+both\b/.test(t)) {
    return "both";
  }
  return null;
}

/** 246 — exact prompt + destinations (Vault / Hall / Both / Not now). */
export function buildWinSaveOffer(seedText?: string): WinSaveOffer {
  return {
    kind: "win-save-offer",
    text: seedText?.trim() || "",
    prompt: EVIDENCE_CAPTURE_PROMPT,
    options: [
      { id: "evidence-vault", label: "Evidence Vault" },
      { id: "hall-of-accomplishments", label: "Hall of Accomplishments" },
      { id: "both", label: "Both" },
      { id: "not-now", label: "Not now" },
    ],
  };
}

export const EVIDENCE_VAULT_ENCOURAGEMENT_LINE =
  "Would it help to look at some evidence of what you've already handled?" as const;

export function parseWinSaveChoice(text: string): WinSaveDestination | null {
  const t = text.trim().toLowerCase();
  if (/\bboth\b/.test(t)) return "both";
  if (/\bnot\s+now\b|\blater\b|\bskip\b/.test(t)) return "not-now";
  if (/\bhall\b|\baccomplishments?\b/.test(t) && !/\bevidence\b|\bvault\b/.test(t)) {
    return "hall-of-accomplishments";
  }
  if (/\bevidence\b|\bvault\b|\bproof\b/.test(t)) return "evidence-vault";
  if (/\b1\b|\bfirst\b/.test(t)) return "evidence-vault";
  if (/\b2\b|\bsecond\b/.test(t)) return "hall-of-accomplishments";
  if (/\b3\b|\bthird\b/.test(t)) return "both";
  if (/\b4\b|\bfourth\b/.test(t)) return "not-now";
  return null;
}
