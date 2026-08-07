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

/**
 * V2-2, `confidence: "co-primary"` only. Deliberately does NOT use
 * "lead"/"support" language at all — per
 * CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md §3, co-primary's whole point
 * is that neither expert is subordinate to the other.
 */
export function chamberCoPrimaryBridgeLine(
  idA: ChamberExpertId,
  idB: ChamberExpertId,
): string {
  const labelA = expertLabel(idA);
  const labelB = expertLabel(idB);
  const focusA = focusPhrase(idA);
  const focusB = focusPhrase(idB);
  return (
    `These are equally central, not sequential: this request genuinely needs both ${labelA}'s read ` +
    `on ${focusA} AND ${labelB}'s read on ${focusB} at the same time. Weave both into one answer with ` +
    `two lenses — never say "lead with X" or "Y also helps," and never present these as two experts ` +
    "or a handoff. One voice, two lenses, addressed together."
  );
}

/**
 * V2-2, `confidence: "contested"` only. Replaces the confident
 * collaboration-bridge framing with an internal note that this is a close
 * call — per CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md §3, Shari should
 * hold the answer a little more loosely, never announce uncertainty to
 * the member, and be ready to pivot smoothly if the founder's next words
 * point the other way.
 */
export function chamberContestedFramingLine(
  primaryId: ChamberExpertId,
  runnerUpId: ChamberExpertId,
): string {
  const primaryLabel = expertLabel(primaryId);
  const runnerUpLabel = expertLabel(runnerUpId);
  return (
    `This is a close call, held loosely, not a confident read: this reads as ${primaryLabel}-shaped for ` +
    `now, though it could also turn out to be a ${runnerUpLabel} question. Answer with ${primaryLabel}'s ` +
    "lens without over-asserting it, and stay genuinely ready to shift naturally if the founder's next " +
    "words point the other way — never say \"I wasn't sure\" or restart/apologize if it turns out to be " +
    "the other one, just continue from there."
  );
}
