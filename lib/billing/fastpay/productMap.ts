/**
 * Map verified FastPay / FastPayDirect product (or payment-link) ids → Voice plans.
 * Defaults match the existing Plan & Voice payment links.
 */

import type { VoicePaidPlan } from "./types";

const DEFAULT_LITE_IDS = ["69ff6b3034d67b041e7e886e"] as const;
const DEFAULT_PRO_IDS = ["69ff6b81c43a7488828c26be"] as const;

function parseIdList(raw: string | undefined, fallback: readonly string[]): string[] {
  const fromEnv = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : [...fallback];
}

export function voiceLiteProductIds(): string[] {
  return parseIdList(process.env.FASTPAY_VOICE_LITE_PRODUCT_IDS, DEFAULT_LITE_IDS);
}

export function voiceProProductIds(): string[] {
  return parseIdList(process.env.FASTPAY_VOICE_PRO_PRODUCT_IDS, DEFAULT_PRO_IDS);
}

/** Normalize product / link identifiers for comparison. */
export function normalizeProductCandidate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const linkMatch = trimmed.match(/payment-link\/([a-zA-Z0-9]+)/i);
  if (linkMatch?.[1]) return linkMatch[1].toLowerCase();
  return trimmed.toLowerCase();
}

export function mapProductCandidateToVoicePlan(
  candidates: readonly string[],
): VoicePaidPlan | null {
  const lite = new Set(voiceLiteProductIds().map(normalizeProductCandidate));
  const pro = new Set(voiceProProductIds().map(normalizeProductCandidate));

  for (const raw of candidates) {
    const id = normalizeProductCandidate(raw);
    if (!id) continue;
    if (pro.has(id)) return "voice-pro";
    if (lite.has(id)) return "voice-lite";
  }

  // Name fallbacks (provider may send human labels instead of ids).
  for (const raw of candidates) {
    const lower = raw.trim().toLowerCase();
    if (!lower) continue;
    if (lower.includes("voice pro") || lower === "voice-pro") return "voice-pro";
    if (lower.includes("voice lite") || lower === "voice-lite") return "voice-lite";
  }

  return null;
}
