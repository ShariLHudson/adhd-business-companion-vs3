/**
 * Chamber Expertise Hint — Phase C, extended by the I-1/I-2 pilot.
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
 * See docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md and
 * docs/estate/CHAMBER_ACTIVATION_PHASE_C_PREFLIGHT_REVIEW.md for the
 * architecture and integration decisions this implements.
 */

import { isChamberIntelligencePilotEnabled } from "@/lib/intelligence-layer/featureFlags";
import {
  CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS,
  renderSelectedContribution,
  selectExpertContribution,
} from "@/lib/chamberIntelligence";
import { chamberExpertById } from "./chamberExpertRegistry";
import { chamberCollaborationBridgeLine } from "./chamberCollaborationLanguage";
import { resolveChamberExpertActivation } from "./resolveChamberExpertActivation";
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
  role: "primary" | "supporting",
  userText: string,
): string {
  if (isChamberIntelligencePilotEnabled()) {
    const selection = selectExpertContribution({ expertId: id, userText, role });
    if (selection) return renderSelectedContribution(selection);
  }
  return fallbackContributionLine(id, roleLabel);
}

/**
 * Build the Chamber Expertise Hint for this turn, or return undefined when
 * no expert reaches multi-signal confidence (the common case — most turns
 * are relationship chat, quick answers, or app navigation and should
 * produce no hint at all).
 */
const GUARDRAIL_FOOTER =
  "Use these themes to decide what to notice, ask, and recommend — do not list them as a " +
  "checklist, and do not announce them, name any expert as a separate person, or say things " +
  'like "bringing in the Marketing expert" or "now talking to Systems." Speak only as Shari, ' +
  "one conversation, one voice. Ask before assuming; give one helpful next step; connect it to " +
  'what the member is actually trying to accomplish. The member should feel "Spark is helping ' +
  'me think" — never a handoff, and never a generic answer that ignores these themes.';

const HEADER = "CHAMBER EXPERTISE (internal — shapes Shari's thinking, never announced):";

export function chamberExpertiseHintForChat(
  input: ChamberExpertActivationInput,
): string | undefined {
  if (!input.userText?.trim()) return undefined;

  const activation = resolveChamberExpertActivation(input);
  if (!activation.primary || activation.confidence === "low") return undefined;

  const userText = input.userText;

  // Mandatory segments — always present regardless of budget pressure.
  const header = HEADER;
  const primaryLine = expertContributionLine(activation.primary, "Leading perspective", "primary", userText);
  const footer = GUARDRAIL_FOOTER;

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
  const collaborationBridge = chamberCollaborationBridgeLine(activation);
  if (collaborationBridge) {
    optionalSegments.push(collaborationBridge);
  }

  const mandatoryTokens = estimateTokens([header, primaryLine, footer].join(" "));
  let budgetRemaining = CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS - mandatoryTokens;

  const includedOptional: string[] = [];
  for (const segment of optionalSegments) {
    const segmentTokens = estimateTokens(segment);
    if (segmentTokens > budgetRemaining) break;
    includedOptional.push(segment);
    budgetRemaining -= segmentTokens;
  }

  return [header, primaryLine, ...includedOptional, footer].join(" ");
}
