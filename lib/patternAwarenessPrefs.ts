/**
 * Pattern awareness preference — suppresses proactive pattern observations when off.
 */

import { getPrefs, type PatternAwareness } from "./companionStore";

export function getPatternAwarenessLevel(): PatternAwareness {
  return getPrefs().patternAwareness;
}

/** When false, suppress proactive pattern / growth / future-impact observations in chat. */
export function isProactivePatternInsightsEnabled(): boolean {
  return getPatternAwarenessLevel() !== "off";
}

export function shouldSuppressProactivePatternInsights(): boolean {
  return !isProactivePatternInsightsEnabled();
}
