/**
 * Board/Director → Shari-facing finalization adapter.
 *
 * NOT a new voice layer. The canonical member-facing finalizer
 * (finalizeMemberFacingAssistantText) lives inside CompanionPageClient and is not
 * importable, so this thin adapter routes already-generated Board/Director
 * substance through the SAME existing importable layers the Companion/Chamber
 * path uses — applyShariVoiceLayer (tone/warmth) + toPlainLanguageDisplay
 * (markdown / mechanical-formatting normalization). Deterministic; no model call.
 *
 * Substance is preserved: Board/Directors own the reasoning; this only changes how
 * it is communicated. If the voice pass would collapse rich substance (e.g. the
 * "concise" pref truncates to two sentences), the plain-language-normalized
 * substance is kept instead — never reduced to generic encouragement.
 */

import { applyShariVoiceLayer } from "@/lib/conversationStabilization/shariVoiceLayer";
import { toPlainLanguageDisplay } from "@/lib/plainLanguageFormatting";
import { isDisplayableAssistantAnswer } from "@/lib/shariAnswerFirst/answerPreservation";

/** Below this length, any displayable voiced result is accepted as-is. */
const SUBSTANCE_GUARD_MIN_CHARS = 80;
/** A voiced result must retain at least this fraction of the substance. */
const SUBSTANCE_RETENTION_RATIO = 0.6;

export function finalizeBoardFacingText(text: string | null | undefined): string {
  const raw = (text ?? "").toString();
  // Empty / whitespace: leave untouched so the caller's existing safe fallback
  // (empty-response handling) still applies. Fallbacks fill absence, not substance.
  if (!raw.trim()) return raw;

  // 1. Normalize mechanical formatting: markdown headings, **bold**, --- rules,
  //    backticks, bullets → readable plain language (structure preserved as text).
  const normalized = toPlainLanguageDisplay(raw);

  // 2. Apply the existing Shari voice layer (tone, warmth, openers). Deterministic.
  let voiced = normalized;
  try {
    voiced = applyShariVoiceLayer({ text: normalized }).text;
  } catch {
    voiced = normalized;
  }
  const v = (voiced ?? "").trim();

  // 3. Substance guard: the voice pass must not collapse the reasoning. If it did
  //    (empty/fragment, or a big drop for a long response), keep the normalized
  //    substance instead.
  if (!isDisplayableAssistantAnswer(v)) return normalized;
  const normalizedLen = normalized.trim().length;
  if (
    normalizedLen > SUBSTANCE_GUARD_MIN_CHARS &&
    v.length < Math.floor(normalizedLen * SUBSTANCE_RETENTION_RATIO)
  ) {
    return normalized;
  }
  return v || normalized;
}
