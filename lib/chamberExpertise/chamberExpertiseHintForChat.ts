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
import { chamberCollaborationBridgeLine } from "./chamberCollaborationLanguage";
import { resolveChamberExpertActivation } from "./resolveChamberExpertActivation";
import type { ChamberExpertActivationInput, ChamberExpertId } from "./types";

/** How many concrete themes to surface per expert — enough to change the
 * answer's substance, short enough to stay a hint, not a knowledge dump. */
const MAX_THEMES_PER_EXPERT = 5;

function expertLabel(id: ChamberExpertId): string {
  return chamberExpertById(id)?.name ?? id;
}

/**
 * Substance line for one expert: name, signature thinking pattern, and the
 * concrete themes it should pull into the answer. This is the piece that
 * makes a Chamber hint *change what gets recommended* rather than just
 * naming which expert is "in the room" — see the Chamber Expertise
 * Contribution Tests (docs/estate/CHAMBER_EXPERTISE_CONTRIBUTION_TESTS.md)
 * for why naming alone was judged insufficient.
 */
function expertContributionLine(id: ChamberExpertId, roleLabel: string): string {
  const entry = chamberExpertById(id);
  if (!entry) return `${roleLabel}: ${id}.`;
  const themes = entry.expertiseAreas.slice(0, MAX_THEMES_PER_EXPERT).join(", ");
  return `${roleLabel}: ${entry.name} — ${entry.expertThinkingPattern} Bring in: ${themes}.`;
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

  const lines = [
    "CHAMBER EXPERTISE (internal — shapes Shari's thinking, never announced):",
    expertContributionLine(activation.primary, "Leading perspective"),
  ];
  for (const supportingId of activation.supporting) {
    lines.push(expertContributionLine(supportingId, "Also relevant"));
  }
  if (activation.possible.length > 0) {
    const possibleLabels = activation.possible.map(expertLabel);
    lines.push(`Worth a mention if it fits: ${possibleLabels.join(", ")}.`);
  }
  const collaborationBridge = chamberCollaborationBridgeLine(activation);
  if (collaborationBridge) {
    lines.push(collaborationBridge);
  }
  lines.push(
    "Use these themes to decide what to notice, ask, and recommend — do not list them as a " +
      "checklist, and do not announce them, name any expert as a separate person, or say things " +
      'like "bringing in the Marketing expert" or "now talking to Systems." Speak only as Shari, ' +
      "one conversation, one voice. Ask before assuming; give one helpful next step; connect it to " +
      'what the member is actually trying to accomplish. The member should feel "Spark is helping ' +
      'me think" — never a handoff, and never a generic answer that ignores these themes.',
  );

  return lines.join(" ");
}
