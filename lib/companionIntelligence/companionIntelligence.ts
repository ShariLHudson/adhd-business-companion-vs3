/**
 * Companion Intelligence™ feature gate.
 */

export function isCompanionIntelligenceEnabled(): boolean {
  if (typeof process === "undefined") return true;
  return process.env.NEXT_PUBLIC_COMPANION_INTELLIGENCE !== "0";
}
