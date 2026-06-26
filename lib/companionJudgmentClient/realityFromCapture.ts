/**
 * Capture → Live Reality™ — producers never require Today's Reality™ repeat.
 */

import { publishRealitySignal } from "./liveEcosystem";
import type { RealitySignal, RealitySignalSource } from "./types";

const REALITY_CAPTURE_RE =
  /\b(?:exhausted|exhaustion|migraine|can'?t focus|cannot focus|worried about|stressed|overwhelm(?:ed)?|sick|not feeling|low energy|no energy|need recharge|running on fumes|recovery|grief|celebrat|mom|dad|family|health|pain|anxious|anxiety|burned?\s*out|behind on|no time|interrupted)\b/i;

const HEALTH_CAPTURE_RE =
  /\b(?:migraine|sick|ill|pain|doctor|health|hospital|medication)\b/i;

const FAMILY_CAPTURE_RE =
  /\b(?:mom|dad|mother|father|family|kids?|child|spouse|partner)\b/i;

/**
 * Whether capture text should trigger a Live Reality™ re-evaluation.
 */
export function captureAffectsLiveReality(text: string): boolean {
  return REALITY_CAPTURE_RE.test(text.trim());
}

function inferSourceKind(
  text: string,
  source: RealitySignalSource,
): Pick<RealitySignal, "source" | "kind" | "note"> {
  const trimmed = text.trim().slice(0, 120);
  if (HEALTH_CAPTURE_RE.test(text)) {
    return { source: "health", kind: "capture", note: trimmed };
  }
  if (FAMILY_CAPTURE_RE.test(text)) {
    return { source: "family", kind: "capture", note: trimmed };
  }
  if (/\b(?:exhausted|low energy|no energy|burned?\s*out|recovery)\b/i.test(text)) {
    return { source: "capacity", kind: "capture", note: trimmed };
  }
  if (/\b(?:stressed|anxious|overwhelm|worried|grief)\b/i.test(text)) {
    return { source: "mood", kind: "capture", note: trimmed };
  }
  return { source, kind: "capture", note: trimmed };
}

/**
 * Publish reality from Clear My Mind™ or My Thoughts™ when capture changes today's truth.
 */
export function maybePublishCaptureReality(
  text: string,
  workspace: "clear-my-mind" | "my-thoughts",
): boolean {
  if (!captureAffectsLiveReality(text)) return false;
  const signal = inferSourceKind(text, workspace);
  publishRealitySignal({
    ...signal,
    at: new Date().toISOString(),
  });
  return true;
}
