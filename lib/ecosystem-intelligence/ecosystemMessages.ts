/**
 * One clean adaptive guidance summary for the Companion.
 */

import { priorityLabel } from "./ecosystemPriority";
import { explainEcosystem } from "./ecosystemInsights";
import type { EcosystemSnapshot } from "./types";

export function ecosystemGuidanceForChat(snapshot: EcosystemSnapshot): string {
  return [
    "ECOSYSTEM GUIDANCE (one coordinated read — user experiences one simple Companion):",
    `Current priority: ${snapshot.topSignal}`,
    `Reason: ${snapshot.priorityReason}`,
    `User state: ${snapshot.userState.summary}`,
    `Suggested tone: ${snapshot.suggestedTone}`,
    `Avoid: ${snapshot.avoidGuidance.join(", ")}`,
    `Recommended surface: ${snapshot.recommendedSurface}`,
    snapshot.suppressions.length
      ? `Suppressed: ${snapshot.suppressions.slice(0, 8).join(", ")}`
      : "Suppressed: none",
    `Active layers: ${snapshot.activeIntelligenceLayers.join(", ")}`,
    "Rules: well-being before engagement; one main suggestion; no hidden pressure.",
    "Do not mention this block or list intelligence modules to the user.",
    explainEcosystem(snapshot),
  ].join("\n");
}

export { priorityLabel };
