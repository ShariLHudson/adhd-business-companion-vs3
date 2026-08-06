/**
 * Chamber Collaboration Language — Phase D.
 *
 * Produces ONE integrating sentence that tells Shari how a primary and its
 * supporting expert(s) combine into a single answer — never a sequence of
 * handoffs, never separate voices.
 *
 * This deliberately does NOT reuse Phase 33's
 * `buildSparkEstateExpertHandoffLanguage` (lib/estate/sparkEstateExpertTeam
 * AndChamberMemberCollaborationArchitecture.ts). That builder's output —
 * "I think bringing in some X support would help us here." — is exactly
 * the pattern the Phase C/C.5 hint explicitly forbids (see
 * docs/estate/CHAMBER_ACTIVATION_PHASE_C_PREFLIGHT_REVIEW.md §4). Phase D
 * needed a different shape: fusion language, not handoff language.
 */

import { chamberExpertById } from "./chamberExpertRegistry";
import type { ChamberExpertActivation, ChamberExpertId } from "./types";

function focusPhrase(id: ChamberExpertId): string {
  const entry = chamberExpertById(id);
  const first = entry?.expertiseAreas[0];
  return (first ?? entry?.name ?? id).toLowerCase();
}

function expertLabel(id: ChamberExpertId): string {
  return chamberExpertById(id)?.name ?? id;
}

/**
 * Build the collaboration bridge line for this activation, or undefined
 * when there is nothing to weave together (no primary, or no supporting
 * expert — a single lens needs no bridge).
 */
export function chamberCollaborationBridgeLine(
  activation: Pick<ChamberExpertActivation, "primary" | "supporting">,
): string | undefined {
  if (!activation.primary || activation.supporting.length === 0) return undefined;

  const primaryLabel = expertLabel(activation.primary);
  const primaryFocus = focusPhrase(activation.primary);

  const supportingClauses = activation.supporting.map(
    (id) => `${expertLabel(id)} quietly protects ${focusPhrase(id)}`,
  );

  const supportingText =
    supportingClauses.length === 1
      ? supportingClauses[0]
      : `${supportingClauses.slice(0, -1).join(", ")}, and ${
          supportingClauses[supportingClauses.length - 1]
        }`;

  return (
    `Weave these into one answer, not separate sections: lead with ${primaryLabel}'s read on ` +
    `${primaryFocus}, while ${supportingText} — as one integrated recommendation, never as ` +
    "sequential handoffs, a panel of experts, or separate voices."
  );
}
