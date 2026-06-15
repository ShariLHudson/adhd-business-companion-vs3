/**
 * Local persistence for opportunities — user/founder controlled.
 */

import type { Opportunity, OpportunityOffer } from "./types";

const STORE_KEY = "companion-opportunity-intelligence-v1";

export type OpportunityStore = {
  opportunities: Opportunity[];
  founderSamples: {
    at: string;
    type: string;
    impact: string;
    effort: string;
    title: string;
  }[];
  offerDismissedOn: string | null;
  dismissedOpportunityIds: string[];
  lastSurfacedAt: string | null;
};

const DEFAULT_STORE: OpportunityStore = {
  opportunities: [],
  founderSamples: [],
  offerDismissedOn: null,
  dismissedOpportunityIds: [],
  lastSurfacedAt: null,
};

export function getOpportunityStore(): OpportunityStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<OpportunityStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      opportunities: Array.isArray(parsed.opportunities)
        ? parsed.opportunities
        : [],
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
      dismissedOpportunityIds: Array.isArray(parsed.dismissedOpportunityIds)
        ? parsed.dismissedOpportunityIds
        : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveOpportunityStore(
  update: Partial<OpportunityStore>,
): OpportunityStore {
  const next = { ...getOpportunityStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function recordOpportunity(opportunity: Opportunity): void {
  const store = getOpportunityStore();
  const withoutDup = store.opportunities.filter((o) => o.id !== opportunity.id);
  saveOpportunityStore({
    opportunities: [...withoutDup, opportunity].slice(-100),
    founderSamples: [
      ...store.founderSamples,
      {
        at: opportunity.createdAt,
        type: opportunity.opportunityType,
        impact: opportunity.impact,
        effort: opportunity.effort,
        title: opportunity.title,
      },
    ].slice(-500),
  });
}

export function updateOpportunityStatus(
  id: string,
  status: Opportunity["status"],
): void {
  const store = getOpportunityStore();
  saveOpportunityStore({
    opportunities: store.opportunities.map((o) =>
      o.id === id
        ? { ...o, status, updatedAt: new Date().toISOString() }
        : o,
    ),
  });
}

export function getOpportunities(): Opportunity[] {
  return getOpportunityStore().opportunities;
}

export function isOpportunityOfferDismissedToday(now = new Date()): boolean {
  return getOpportunityStore().offerDismissedOn === dayKey(now);
}

export function dismissOpportunityOffer(
  opportunityId?: string,
  now = new Date(),
): void {
  const store = getOpportunityStore();
  if (opportunityId) {
    saveOpportunityStore({
      dismissedOpportunityIds: [
        ...store.dismissedOpportunityIds,
        opportunityId,
      ].slice(-50),
    });
    updateOpportunityStatus(opportunityId, "dismissed");
    return;
  }
  saveOpportunityStore({ offerDismissedOn: dayKey(now) });
}

export function recordOfferSurfaced(offer: OpportunityOffer): void {
  recordOpportunity(offer.opportunity);
  saveOpportunityStore({ lastSurfacedAt: offer.createdAt });
}

export const OPPORTUNITY_UPDATED_EVENT =
  "companion-opportunity-intelligence-updated";

export function notifyOpportunityUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPPORTUNITY_UPDATED_EVENT));
  }
}
