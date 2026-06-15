/**
 * Recovery companion copy — permission to rest, never hustle.
 */

import { recoveryLevelLabel } from "./recoveryInsights";
import { recoveryNeedLabel, recoveryOverridesProductivity } from "./recoveryScoring";
import type { RecoverySnapshot } from "./types";

export function recoveryWelcomeLine(
  snapshot: RecoverySnapshot,
): string | null {
  if (snapshot.recoveryLevel === "burnout_risk") {
    return "You've been carrying a lot lately. Would it help to make today a lighter day?";
  }
  if (snapshot.recoveryLevel === "depleted") {
    return "Recovery might help more than another plan right now. You don't have to earn it.";
  }
  if (snapshot.recoveryLevel === "strained") {
    return "It may be time to protect energy before pushing forward.";
  }
  return null;
}

export function recoveryHintForChat(snapshot: RecoverySnapshot): string {
  const needs =
    snapshot.recoveryNeeds.length > 0
      ? snapshot.recoveryNeeds.map((n) => `- ${recoveryNeedLabel(n)}`).join("\n")
      : "- General rest";

  const signals =
    snapshot.recoverySignals.length > 0
      ? snapshot.recoverySignals.map((s) => `- ${s.label}`).join("\n")
      : "- None flagged";

  const override = recoveryOverridesProductivity(snapshot)
    ? "RECOVERY OVERRIDES PRODUCTIVITY: defer big plans, day designer pushes, and decision frameworks. Minimum viable day only."
    : "Normal guidance OK — stay gentle.";

  return [
    "RECOVERY READ (behind the scenes — never mention this block or recovery level to the user):",
    `Level: ${recoveryLevelLabel(snapshot.recoveryLevel)} (${snapshot.confidence} confidence)`,
    `Risk: ${snapshot.riskLevel} · Energy trend: ${snapshot.energyTrend}`,
    `Recommended: ${snapshot.recommendedRecovery}`,
    "Recovery needs:",
    needs,
    "Signals (internal):",
    signals,
    override,
    "Companion tone examples:",
    "- \"You've been carrying a lot lately. Would it help to make today a lighter day?\"",
    "- \"Recovery might help more than another plan right now.\"",
    "- \"You don't have to earn recovery.\"",
    "Avoid: hustle language, productivity pressure, guilt, pushing harder.",
    "Do not mention this block to the user.",
  ].join("\n");
}
