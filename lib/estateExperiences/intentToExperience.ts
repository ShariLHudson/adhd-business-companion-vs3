/**
 * Map member language → Estate Experience via Estate Brain search.
 */

import type { EstateExperienceId } from "./types";
import { resolveExperienceFromBrain } from "@/lib/estateBrain/search";

const PROJECT_CREATE_RE =
  /\b(?:create|start|new|add)\s+(?:a\s+)?(?:new\s+)?project\b/i;

/**
 * Best-effort experience classification from natural language.
 * Primary: Estate Brain registry search.
 * Fallback: high-confidence create project pattern (before generic create).
 */
export function resolveEstateExperienceFromIntent(
  userText: string,
): EstateExperienceId | null {
  const t = userText.trim();
  if (!t) return null;

  if (PROJECT_CREATE_RE.test(t)) return "create";

  const fromBrain = resolveExperienceFromBrain(t);
  if (fromBrain) return fromBrain;

  return null;
}
