/**
 * Companion-facing invitation copy — why now, not a directory.
 */

import type { EstateRecommendationDecision } from "./types";

export function formatRecommendationInvitation(
  decision: EstateRecommendationDecision,
): string {
  if (!decision.primary) {
    return "I'm here with you. We can stay right here, or explore when you're ready.";
  }

  const lines: string[] = [];

  lines.push(
    `When it feels like this, ${decision.primary.officialDisplayName} might help — ${decision.primary.whyNow}`,
  );

  const alts = decision.alternatives ?? [];
  if (alts.length === 1) {
    lines.push(
      `Or ${alts[0]!.officialDisplayName} — ${alts[0]!.whyNow}`,
    );
  } else if (alts.length >= 2) {
    lines.push(
      `Or ${alts[0]!.officialDisplayName} — ${alts[0]!.whyNow}`,
      `Or ${alts[1]!.officialDisplayName} — ${alts[1]!.whyNow}`,
    );
  }

  if (decision.stayHereOffered) {
    lines.push("", "Would any of those help — or should we stay right here?");
  } else {
    lines.push("", "Would you like to go — or stay here with me?");
  }

  return lines.join("\n");
}

export function formatPrimaryRecommendationLine(
  decision: EstateRecommendationDecision,
): string | null {
  if (!decision.primary) return null;
  return `${decision.primary.officialDisplayName} — ${decision.primary.whyNow}`;
}
