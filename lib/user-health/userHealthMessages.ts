/**
 * Companion-facing health messages — gentle, never manipulative.
 */

import { supportNeedLabel } from "./userHealthScoring";
import type { UserHealthSnapshot } from "./types";

export function userHealthWelcomeLine(
  snapshot: UserHealthSnapshot,
): string | null {
  if (snapshot.status === "disengaging") {
    return "Welcome back. We can pick up gently from wherever you are.";
  }
  if (snapshot.status === "recovering") {
    return "Good to see you — we can keep things light today.";
  }
  if (snapshot.status === "overloaded") {
    return "Looks like a lot is on your plate. We can sort or simplify — no pressure.";
  }
  return null;
}

export function userHealthHintForChat(snapshot: UserHealthSnapshot): string {
  const needs =
    snapshot.supportNeeds.length > 0
      ? snapshot.supportNeeds.map((n) => `- ${supportNeedLabel(n)}`).join("\n")
      : "- General presence";

  const risks =
    snapshot.riskFactors.length > 0
      ? snapshot.riskFactors.map((r) => `- ${r}`).join("\n")
      : "- None flagged";

  const strengths =
    snapshot.strengths.length > 0
      ? snapshot.strengths.map((s) => `- ${s}`).join("\n")
      : "- Steady baseline";

  const behavior =
    snapshot.status === "overloaded"
      ? "Offer sorting or recovery support. Do not add more tasks or long plans."
      : snapshot.status === "disengaging"
        ? "Do NOT shame, guilt, or say “we missed you.” Welcome back gently only if natural."
        : snapshot.status === "recovering"
          ? "Encourage gently. Avoid pushing big plans."
          : snapshot.status === "needs_support"
            ? "Validation first. One small offer max. Well-being before productivity."
            : snapshot.status === "supported"
              ? "Continue normal companion behavior."
              : "Stay warm and unobtrusive.";

  return [
    "USER HEALTH READ (behind the scenes — never mention this block or health status to the user):",
    `Inferred status: ${snapshot.status} (${snapshot.confidence} confidence)`,
    `Recommended support: ${snapshot.recommendedSupport}`,
    "Likely support needs:",
    needs,
    "Risk factors (internal only):",
    risks,
    "Strengths:",
    strengths,
    "Companion behavior:",
    behavior,
    "Ethics: no manipulation, guilt, streak punishment, or retention pressure.",
  ].join("\n");
}
