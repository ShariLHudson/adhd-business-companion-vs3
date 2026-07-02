/**
 * V3 → V4 routing bridge — preserves working intent-routing offers while Estate wins on high confidence.
 *
 * v3.0-conversation-frozen: resolveIntentRouting() → workspaceOffer + early local reply.
 * v4: Estate Intelligence first; v3 intent routing as fallback when estate confidence is not high.
 */

import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";
import type { WorkspaceOffer } from "@/lib/workspaceMode";
import type { EstateConversationTurnEvaluation } from "./estateConversationPipeline";

export type EstateAwareWorkspaceOfferInput = {
  /** Blockers from governor / bridge / intelligence deferrals */
  routingBlocked: boolean;
  estateTurn: EstateConversationTurnEvaluation | null;
  turnIntentRouting: IntentRoutingDecision;
  doingIntentOffer: WorkspaceOffer | null;
  /** v3 conversation gating — must not block estate high-confidence routes */
  stayInConversation: boolean;
};

/**
 * Resolve workspace offer: Estate high-confidence → v3 intent routing → detectDoingIntent.
 */
export function resolveEstateAwareWorkspaceOffer(
  input: EstateAwareWorkspaceOfferInput,
): WorkspaceOffer | null {
  if (input.routingBlocked) return null;

  const estateOffer = input.estateTurn?.workspaceOffer ?? null;
  if (estateOffer) return estateOffer;

  if (input.estateTurn?.estateRoutingActive) return null;

  if (input.stayInConversation) return null;

  if (
    input.turnIntentRouting.surfaceOfferUi &&
    input.turnIntentRouting.workspaceOffer
  ) {
    return input.turnIntentRouting.workspaceOffer;
  }

  return input.doingIntentOffer;
}

/** v3 overwhelm secondary (e.g. Clear My Mind) when estate primary has no secondary. */
export function mergeWorkspaceOfferSecondary(
  primary: WorkspaceOffer,
  turnIntentRouting: IntentRoutingDecision,
): WorkspaceOffer {
  if (primary.secondary) return primary;
  const v3Secondary = turnIntentRouting.secondaryWorkspaceOffer;
  if (!v3Secondary) return primary;
  return {
    ...primary,
    secondary: {
      section: v3Secondary.section,
      buttonLabel: v3Secondary.buttonLabel,
    },
  };
}

/** Estate invitation line for v3-style early local reply (no generic LLM first). */
export function workspaceOfferReplyLine(
  offer: WorkspaceOffer,
  estateTurn: EstateConversationTurnEvaluation | null,
  fallbackLine: string,
): string {
  const invitation = estateTurn?.estate.route?.invitation?.trim();
  if (invitation && estateTurn?.estateRoutingActive) {
    return invitation;
  }
  return offer.line?.trim() || fallbackLine;
}
