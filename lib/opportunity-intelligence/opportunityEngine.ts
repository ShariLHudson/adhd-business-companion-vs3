/**
 * Opportunity Intelligence — surface possibilities gently.
 */

import {
  candidateToOpportunity,
  detectOpportunityCandidates,
  pickTopOpportunity,
} from "./opportunityDetection";
import { collectOpportunitySignals } from "./opportunitySignals";
import { buildCompanionOffer, explorePrompt } from "./opportunityMessages";
import {
  dismissOpportunityOffer,
  getOpportunityStore,
  isOpportunityOfferDismissedToday,
  notifyOpportunityUpdated,
  recordOfferSurfaced,
  updateOpportunityStatus,
} from "./opportunityStore";
import type { Opportunity, OpportunityInput, OpportunityOffer } from "./types";

export function evaluateOpportunities(
  input: OpportunityInput = {},
): Opportunity[] {
  const hits = collectOpportunitySignals(input);
  const candidates = detectOpportunityCandidates(hits);
  const now = input.now ?? new Date();
  return candidates.map((c) => candidateToOpportunity(c, now));
}

export function evaluateOpportunityOffer(
  input: OpportunityInput = {},
): OpportunityOffer | null {
  const now = input.now ?? new Date();
  if (isOpportunityOfferDismissedToday(now)) return null;

  const store = getOpportunityStore();
  const opportunities = evaluateOpportunities(input);
  const top = pickTopOpportunity(
    opportunities.filter(
      (o) =>
        o.confidence !== "low" &&
        !store.dismissedOpportunityIds.includes(o.id),
    ),
  );

  if (!top) return null;

  const offer: OpportunityOffer = {
    opportunity: top,
    companionOffer: buildCompanionOffer(top),
    createdAt: now.toISOString(),
  };

  recordOfferSurfaced(offer);
  notifyOpportunityUpdated();
  return offer;
}

export function shouldSurfaceOpportunityOffer(
  offer: OpportunityOffer | null,
): boolean {
  return Boolean(offer?.companionOffer.trim());
}

export function acceptOpportunityExplore(
  offer: OpportunityOffer,
): { message: string } {
  updateOpportunityStatus(offer.opportunity.id, "exploring");
  notifyOpportunityUpdated();
  return { message: explorePrompt(offer.opportunity) };
}

export { dismissOpportunityOffer, getOpportunities } from "./opportunityStore";
export type { OpportunityInput, OpportunityOffer };
