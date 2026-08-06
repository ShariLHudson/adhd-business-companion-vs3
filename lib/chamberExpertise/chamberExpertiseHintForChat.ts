/**
 * Chamber Expertise Hint — Phase C.
 *
 * Mirrors the shape of lib/appFeatureKnowledge.ts's
 * `appFeatureKnowledgeHintForChat`: a short, internal string appended to
 * the existing `intentHint` stack that already feeds
 * `buildCompanionSystemPrompt` (lib/companionPrompt.ts) via
 * `app/api/companion-chat/route.ts`.
 *
 * This is NOT a new engine, agent, or conversation system. It is one more
 * optional hint in the stack that already includes
 * `intentRoutingHintForChat`, `sparkEstateExpertCollaborationCompanionHint`,
 * and `appFeatureKnowledgeHintForChat`. Shari is the only voice the member
 * hears — this hint only shapes what Shari notices and asks about.
 *
 * See docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md and
 * docs/estate/CHAMBER_ACTIVATION_PHASE_C_PREFLIGHT_REVIEW.md for the
 * architecture and integration decisions this implements.
 */

import { chamberExpertById } from "./chamberExpertRegistry";
import { resolveChamberExpertActivation } from "./resolveChamberExpertActivation";
import type { ChamberExpertActivationInput, ChamberExpertId } from "./types";

function expertLabel(id: ChamberExpertId): string {
  return chamberExpertById(id)?.name ?? id;
}

/**
 * Build the Chamber Expertise Hint for this turn, or return undefined when
 * no expert reaches multi-signal confidence (the common case — most turns
 * are relationship chat, quick answers, or app navigation and should
 * produce no hint at all).
 */
export function chamberExpertiseHintForChat(
  input: ChamberExpertActivationInput,
): string | undefined {
  if (!input.userText?.trim()) return undefined;

  const activation = resolveChamberExpertActivation(input);
  if (!activation.primary || activation.confidence === "low") return undefined;

  const primaryLabel = expertLabel(activation.primary);
  const supportingLabels = activation.supporting.map(expertLabel);
  const possibleLabels = activation.possible.map(expertLabel);

  const lines = [
    "CHAMBER EXPERTISE (internal — shapes Shari's thinking, never announced):",
    `Leading perspective: ${primaryLabel}.`,
  ];
  if (supportingLabels.length > 0) {
    lines.push(`Also relevant: ${supportingLabels.join(", ")}.`);
  }
  if (possibleLabels.length > 0) {
    lines.push(`Worth a mention if it fits: ${possibleLabels.join(", ")}.`);
  }
  lines.push(
    "Use this to decide what to notice, ask, and recommend — do not announce it, name it as a " +
      'separate person, or say things like "bringing in the Marketing expert" or "now talking to ' +
      'Systems." Speak only as Shari, one conversation, one voice. Ask before assuming; give one ' +
      "helpful next step; connect it to what the member is actually trying to accomplish. The member " +
      'should feel "Spark is helping me think" — never a handoff.',
  );

  return lines.join(" ");
}
