/**
 * Estate Context Isolation Rule
 *
 * Estate conversation must never expose system/debug language.
 * Priority: Estate conversation → navigation → intent bridge → recovery → silent log.
 *
 * Keep this module free of shariCompanionEngine / conversation graph imports so
 * load-failure recovery chunks stay small.
 */

import { SHARI_ERROR_RECOVERY_LINE } from "@/lib/conversation/shariCompanionEnginePrompt";
import { rewriteBannedSplitExperienceCopy } from "@/lib/singleExperienceWorkspace/bannedCopy";

/** Canonical Shari recovery — first line when something breaks underneath. */
export const ESTATE_RECOVERY_OPENING = SHARI_ERROR_RECOVERY_LINE;

function lightRecovery(continuation?: string): string {
  const tail =
    continuation?.trim() ||
    "Pick up wherever you left off — I'm still with you.";
  return `${SHARI_ERROR_RECOVERY_LINE} ${tail}`;
}

/**
 * System-level phrases forbidden in member-facing Estate copy.
 * Dev tooling may log these; Estate chat may not speak them.
 */
export const ESTATE_SYSTEM_LANGUAGE_PATTERNS: readonly RegExp[] = [
  /failed to fetch/i,
  /network\s*error/i,
  /\bwebpack\b/i,
  /\bnext\.?js\b/i,
  /\bdev server\b/i,
  /\bnpm\s+(run|install)\b/i,
  /\bterminal\b/i,
  /\bapi\s+debug/i,
  /\bruntime diagnostic/i,
  /\brequest failed\b/i,
  /\bstatus\s*\d{3}\b/i,
  /\bcheck your connection\b/i,
  /\btrouble connecting\b/i,
  /couldn'?t reach the server/i,
  /\bsupabase\b/i,
  /\.env\.local\b/i,
  /unexpected token/i,
  /<!doctype/i,
  /syntaxerror/i,
];

export function containsEstateSystemLanguage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return ESTATE_SYSTEM_LANGUAGE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Last gate before Estate-facing copy renders.
 * System language → Shari recovery voice only.
 * Dual-experience language → single-experience rewrite.
 */
export function sanitizeEstateFacingCopy(
  text: string,
  continuation?: string,
): string {
  if (containsEstateSystemLanguage(text)) {
    return lightRecovery(continuation);
  }
  return rewriteBannedSplitExperienceCopy(text);
}
