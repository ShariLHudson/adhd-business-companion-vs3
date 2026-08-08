/**
 * Chamber Expertise Hint — Phase C, extended by the I-1/I-2 pilot and
 * Chamber Activation V2 (V2-2).
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
 * Pilot (I-1/I-2): when `isChamberIntelligencePilotEnabled()` is true AND
 * the activated expert has a migrated deep intelligence module (currently
 * Marketing, Systems, Events — see lib/chamberIntelligence/), the
 * per-expert line is built from `selectExpertContribution` (frameworks,
 * ADHD translations, a signature question — all trigger-matched, never
 * dumped) instead of the plain expertiseAreas list. Every other expert,
 * and the whole system when the flag is off, is completely unchanged.
 * See docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md.
 *
 * V2-2: when `isChamberActivationV2Enabled()` is true, activation is
 * resolved by `resolveChamberExpertActivationV2` instead of V1, which can
 * additionally produce `confidence: "co-primary"` (two equally central
 * experts, both full-depth, no lead/support framing — see
 * `chamberCoPrimaryBridgeLine`), `confidence: "contested"` (a close call,
 * held loosely — see `chamberContestedFramingLine`), and an
 * "insufficient evidence" clarifying-question hint in place of the
 * normal per-expert content when nothing clears real eligibility. When
 * the flag is off, this file's behavior is byte-for-byte what it was
 * before V2-2. See docs/estate/CHAMBER_ACTIVATION_DECISION_TABLE.md for
 * the behavioral contract each branch below implements.
 *
 * See docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md and
 * docs/estate/CHAMBER_ACTIVATION_PHASE_C_PREFLIGHT_REVIEW.md for the
 * architecture and integration decisions this implements.
 */

import { isChamberActivationV2Enabled, isChamberIntelligencePilotEnabled } from "@/lib/intelligence-layer/featureFlags";
import {
  CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS,
  renderSelectedContribution,
  selectExpertContribution,
} from "@/lib/chamberIntelligence";
import type { ChamberIntelligenceRole } from "@/lib/chamberIntelligence";
import { chamberExpertById } from "./chamberExpertRegistry";
import {
  chamberCollaborationBridgeLine,
  chamberCoPrimaryBridgeLine,
  chamberContestedFramingLine,
} from "./chamberCollaborationLanguage";
import { resolveChamberExpertActivation } from "./resolveChamberExpertActivation";
import { resolveChamberExpertActivationV2 } from "./resolveChamberExpertActivationV2";
import { estimateTokens } from "./textMatch";
import type { ChamberExpertActivationInput, ChamberExpertId } from "./types";

/** How many concrete themes to surface per expert — enough to change the
 * answer's substance, short enough to stay a hint, not a knowledge dump. */
const MAX_THEMES_PER_EXPERT = 5;

function expertLabel(id: ChamberExpertId): string {
  return chamberExpertById(id)?.name ?? id;
}

/** Today's format: name, signature thinking pattern, expertise-area themes. */
function fallbackContributionLine(id: ChamberExpertId, roleLabel: string): string {
  const entry = chamberExpertById(id);
  if (!entry) return `${roleLabel}: ${id}.`;
  const themes = entry.expertiseAreas.slice(0, MAX_THEMES_PER_EXPERT).join(", ");
  return `${roleLabel}: ${entry.name} — ${entry.expertThinkingPattern} Bring in: ${themes}.`;
}

/**
 * Substance line for one expert this turn. This is the piece that makes a
 * Chamber hint *change what gets recommended* rather than just naming
 * which expert is "in the room" — see the Chamber Expertise Contribution
 * Tests (docs/estate/CHAMBER_EXPERTISE_CONTRIBUTION_TESTS.md) for why
 * naming alone was judged insufficient.
 */
function expertContributionLine(
  id: ChamberExpertId,
  roleLabel: string,
  role: ChamberIntelligenceRole,
  userText: string,
): string {
  if (isChamberIntelligencePilotEnabled()) {
    const selection = selectExpertContribution({ expertId: id, userText, role });
    if (selection) return renderSelectedContribution(selection);
  }
  return fallbackContributionLine(id, roleLabel);
}

const GUARDRAIL_FOOTER =
  "Use these themes to decide what to notice, ask, and recommend — do not list them as a " +
  "checklist, and do not announce them, name any expert as a separate person, or say things " +
  'like "bringing in the Marketing expert" or "now talking to Systems." Speak only as Shari, ' +
  "one conversation, one voice. Ask before assuming; give one helpful next step; connect it to " +
  'what the member is actually trying to accomplish. The member should feel "Spark is helping ' +
  'me think" — never a handoff, and never a generic answer that ignores these themes.';

const HEADER = "CHAMBER EXPERTISE (internal — shapes Shari's thinking, never announced):";

/**
 * V2-2, insufficient-evidence state: no expert lens activates at all.
 * Deliberately does not use expertContributionLine/GUARDRAIL_FOOTER — this
 * is a different shape (a question, not a set of themes) with its own,
 * equally strict never-a-menu / never-more-than-one-question guardrail.
 */
function buildInsufficientEvidenceHint(question: string): string {
  return (
    `${HEADER} No specific expert lens is clearly right yet — there isn't enough real evidence to ` +
    `lead with one confidently. Rather than guessing, ask ONE grounded clarifying question in your ` +
    `own words, close to: "${question}" Do not activate or lean on any specific expert framework ` +
    "until the founder's answer narrows this down. Speak only as Shari, one voice — never a menu, " +
    "never more than one question, never mention experts or activation by name."
  );
}

/**
 * V2-2, co-primary state: both experts get full-depth contribution, no
 * lead/support framing. Assembled under the same 550-token whole-hint
 * budget as the normal path, with the second expert's line and the
 * fusion bridge as the only droppable segments under real pressure — see
 * docs/estate/CHAMBER_ACTIVATION_DECISION_TABLE.md's co-primary row.
 */
function buildCoPrimaryHint(
  coPrimary: readonly [ChamberExpertId, ChamberExpertId],
  userText: string,
): string {
  const [a, b] = coPrimary;
  const header = HEADER;
  const lineA = expertContributionLine(a, "Equally central perspective", "co-primary", userText);
  const footer = GUARDRAIL_FOOTER;

  const optional = [
    expertContributionLine(b, "Equally central perspective", "co-primary", userText),
    chamberCoPrimaryBridgeLine(a, b),
  ];

  const mandatoryTokens = estimateTokens([header, lineA, footer].join(" "));
  let budgetRemaining = CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS - mandatoryTokens;
  const included: string[] = [];
  for (const segment of optional) {
    const segmentTokens = estimateTokens(segment);
    if (segmentTokens > budgetRemaining) break;
    included.push(segment);
    budgetRemaining -= segmentTokens;
  }

  return [header, lineA, ...included, footer].join(" ");
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

  const v2Enabled = isChamberActivationV2Enabled();
  const activation = v2Enabled
    ? resolveChamberExpertActivationV2(input)
    : resolveChamberExpertActivation(input);

  if (!activation.primary) {
    if (v2Enabled && activation.clarifyingQuestion) {
      return buildInsufficientEvidenceHint(activation.clarifyingQuestion);
    }
    return undefined;
  }
  if (activation.confidence === "low") return undefined;

  const userText = input.userText;

  if (v2Enabled && activation.confidence === "co-primary" && activation.coPrimary) {
    return buildCoPrimaryHint(activation.coPrimary, userText);
  }

  // Mandatory segments — always present regardless of budget pressure.
  const header = HEADER;
  const primaryLine = expertContributionLine(activation.primary, "Leading perspective", "primary", userText);
  const footer = GUARDRAIL_FOOTER;

  const contestedFraming =
    v2Enabled && activation.confidence === "contested" && activation.runnerUp
      ? chamberContestedFramingLine(activation.primary, activation.runnerUp)
      : undefined;

  // Optional segments, already in priority order (highest value first).
  // Dropped from the END when the hard cap (§3 of the architecture doc)
  // would otherwise be exceeded — never the header, primary line, or
  // guardrail footer, which are what keep this safe and non-generic.
  const optionalSegments: string[] = [];
  for (const supportingId of activation.supporting) {
    optionalSegments.push(expertContributionLine(supportingId, "Also relevant", "supporting", userText));
  }
  if (activation.possible.length > 0) {
    const possibleLabels = activation.possible.map(expertLabel);
    optionalSegments.push(`Worth a mention if it fits: ${possibleLabels.join(", ")}.`);
  }
  if (!contestedFraming) {
    // Confident collaboration framing only applies outside "contested" —
    // a close call gets the softened framing instead, never both.
    const collaborationBridge = chamberCollaborationBridgeLine(activation);
    if (collaborationBridge) {
      optionalSegments.push(collaborationBridge);
    }
  }

  const mandatorySegments = contestedFraming
    ? [header, primaryLine, contestedFraming, footer]
    : [header, primaryLine, footer];
  const mandatoryTokens = estimateTokens(mandatorySegments.join(" "));
  let budgetRemaining = CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS - mandatoryTokens;

  const includedOptional: string[] = [];
  for (const segment of optionalSegments) {
    const segmentTokens = estimateTokens(segment);
    if (segmentTokens > budgetRemaining) break;
    includedOptional.push(segment);
    budgetRemaining -= segmentTokens;
  }

  return contestedFraming
    ? [header, primaryLine, contestedFraming, ...includedOptional, footer].join(" ")
    : [header, primaryLine, ...includedOptional, footer].join(" ");
}
