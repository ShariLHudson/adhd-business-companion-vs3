/**
 * Map member language → Estate Experience via Estate Brain search.
 */

import type { EstateExperienceId } from "./types";
import { resolveExperienceFromBrain } from "@/lib/estateBrain/search";

const NEW_PROJECT_RE =
  /\b(?:create|start|new|add)\s+(?:a\s+)?(?:new\s+)?project\b/i;

/**
 * Best-effort experience classification from natural language.
 * Primary: Estate Brain registry search.
 * Fallback: high-confidence new-project pattern (before generic create) —
 * Start New Project Routing Fix: "new project" opens Momentum/Project Homes,
 * never Create. Create remains for creating content; a Create → Project
 * handoff stays intentional-only.
 */
export function resolveEstateExperienceFromIntent(
  userText: string,
): EstateExperienceId | null {
  const t = userText.trim();
  if (!t) return null;

  if (NEW_PROJECT_RE.test(t)) return "momentum";

  const fromBrain = resolveExperienceFromBrain(t);
  if (fromBrain) return fromBrain;

  return null;
}
