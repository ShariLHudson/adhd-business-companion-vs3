/**
 * Board Director relationship registry — every Director knows their circle.
 * Completely separate from Chamber relationships.
 */

import type { BoardDirectorId } from "@/lib/board/types";
import type {
  DirectorRelationshipEdge,
  DirectorRelationshipProfile,
} from "@/lib/board/relationships/types";

const PROFILES: Record<BoardDirectorId, DirectorRelationshipProfile> = {
  "board-chair": {
    directorId: "board-chair",
    oftenWorksWith: [
      "vice-chair",
      "founder-advocate",
      "financial-stewardship",
      "customer-market",
    ],
    providesBalance: ["devils-advocate", "founder-advocate", "values-trust"],
    recommends: ["financial-stewardship", "risk-resilience"],
    inviteForDecisions: [
      {
        themes: ["launch", "investment", "pricing"],
        cues: [
          "launch",
          "invest",
          "pricing",
          "budget",
          "financial commitment",
        ],
        inviteDirectorIds: ["financial-stewardship", "risk-resilience"],
        reason:
          "High-stakes commitments need stewardship and resilience at the table.",
      },
      {
        themes: ["direction", "vision"],
        cues: ["direction", "pivot", "vision", "what kind of business"],
        inviteDirectorIds: ["founder-advocate", "values-trust"],
        reason: "Directional choices need founder fit and values clarity.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 0,
      challengeTendency: "medium",
      pairsWellInDebateWith: ["devils-advocate", "vice-chair"],
    },
  },
  "vice-chair": {
    directorId: "vice-chair",
    oftenWorksWith: [
      "board-chair",
      "operations-capacity",
      "risk-resilience",
      "values-trust",
    ],
    providesBalance: ["growth-opportunity", "technology-future"],
    recommends: ["operations-capacity", "risk-resilience"],
    inviteForDecisions: [
      {
        themes: ["follow-up", "unresolved"],
        cues: ["unresolved", "follow-up", "next review", "open questions"],
        inviteDirectorIds: ["operations-capacity", "risk-resilience"],
        reason: "Open loops need delivery and continuity lenses.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 1,
      challengeTendency: "medium",
      pairsWellInDebateWith: ["board-chair", "founder-advocate"],
    },
  },
  "founder-advocate": {
    directorId: "founder-advocate",
    oftenWorksWith: [
      "board-chair",
      "values-trust",
      "financial-stewardship",
      "growth-opportunity",
    ],
    providesBalance: ["growth-opportunity", "technology-future"],
    recommends: ["values-trust", "financial-stewardship"],
    inviteForDecisions: [
      {
        themes: ["capacity", "quality-of-life", "growth"],
        cues: [
          "capacity",
          "burnout",
          "quality of life",
          "grow",
          "scale",
          "hire",
        ],
        inviteDirectorIds: ["values-trust", "operations-capacity"],
        reason: "Growth that costs the founder needs values and capacity check.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 2,
      challengeTendency: "high",
      pairsWellInDebateWith: ["growth-opportunity", "devils-advocate"],
    },
  },
  "financial-stewardship": {
    directorId: "financial-stewardship",
    oftenWorksWith: [
      "board-chair",
      "operations-capacity",
      "risk-resilience",
      "growth-opportunity",
    ],
    providesBalance: ["growth-opportunity", "technology-future"],
    recommends: ["risk-resilience", "operations-capacity"],
    inviteForDecisions: [
      {
        themes: ["investment", "pricing", "cash"],
        cues: ["invest", "cost", "price", "cash", "revenue", "afford"],
        inviteDirectorIds: ["risk-resilience", "operations-capacity"],
        reason: "Money decisions need exposure and delivery realism.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 3,
      challengeTendency: "high",
      pairsWellInDebateWith: ["growth-opportunity", "founder-advocate"],
    },
  },
  "operations-capacity": {
    directorId: "operations-capacity",
    oftenWorksWith: [
      "financial-stewardship",
      "customer-market",
      "risk-resilience",
      "technology-future",
    ],
    providesBalance: ["growth-opportunity", "technology-future"],
    recommends: ["customer-market", "risk-resilience"],
    inviteForDecisions: [
      {
        themes: ["delivery", "hiring", "systems"],
        cues: ["deliver", "hire", "ops", "capacity", "system", "process"],
        inviteDirectorIds: ["financial-stewardship", "technology-future"],
        reason: "Delivery load pairs with cost and systems choices.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 4,
      challengeTendency: "medium",
      pairsWellInDebateWith: ["growth-opportunity", "founder-advocate"],
    },
  },
  "customer-market": {
    directorId: "customer-market",
    oftenWorksWith: [
      "growth-opportunity",
      "founder-advocate",
      "values-trust",
      "operations-capacity",
    ],
    providesBalance: ["growth-opportunity", "technology-future"],
    recommends: ["growth-opportunity", "values-trust"],
    inviteForDecisions: [
      {
        themes: ["audience", "offer", "positioning"],
        cues: [
          "audience",
          "market",
          "customer",
          "avatar",
          "positioning",
          "offer",
        ],
        inviteDirectorIds: ["growth-opportunity", "founder-advocate"],
        reason: "Market moves need upside check and founder fit.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 3,
      challengeTendency: "medium",
      pairsWellInDebateWith: ["growth-opportunity", "devils-advocate"],
    },
  },
  "growth-opportunity": {
    directorId: "growth-opportunity",
    oftenWorksWith: [
      "customer-market",
      "financial-stewardship",
      "technology-future",
      "founder-advocate",
    ],
    providesBalance: ["financial-stewardship", "risk-resilience", "founder-advocate"],
    recommends: ["customer-market", "financial-stewardship"],
    inviteForDecisions: [
      {
        themes: ["expansion", "new-market", "partnership"],
        cues: [
          "expand",
          "new market",
          "partnership",
          "opportunity",
          "upside",
        ],
        inviteDirectorIds: ["customer-market", "risk-resilience"],
        reason: "Opportunity needs evidence and downside clarity.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 4,
      challengeTendency: "medium",
      pairsWellInDebateWith: ["financial-stewardship", "risk-resilience"],
    },
  },
  "risk-resilience": {
    directorId: "risk-resilience",
    oftenWorksWith: [
      "financial-stewardship",
      "operations-capacity",
      "technology-future",
      "devils-advocate",
    ],
    providesBalance: ["growth-opportunity", "technology-future"],
    recommends: ["financial-stewardship", "devils-advocate"],
    inviteForDecisions: [
      {
        themes: ["continuity", "exposure", "recovery"],
        cues: [
          "risk",
          "exposure",
          "continuity",
          "recovery",
          "failure",
          "downside",
        ],
        inviteDirectorIds: ["financial-stewardship", "devils-advocate"],
        reason: "Resilience questions benefit from stewardship and challenge.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 5,
      challengeTendency: "high",
      pairsWellInDebateWith: ["growth-opportunity", "technology-future"],
    },
  },
  "technology-future": {
    directorId: "technology-future",
    oftenWorksWith: [
      "operations-capacity",
      "risk-resilience",
      "financial-stewardship",
      "growth-opportunity",
    ],
    providesBalance: ["founder-advocate", "values-trust"],
    recommends: ["growth-opportunity", "operations-capacity"],
    inviteForDecisions: [
      {
        themes: ["systems", "automation", "platform"],
        cues: [
          "tech",
          "technology",
          "software",
          "system",
          "automat",
          "platform",
          "ai",
        ],
        inviteDirectorIds: ["growth-opportunity", "operations-capacity"],
        reason:
          "Technology bets need growth upside and delivery capacity beside them.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 5,
      challengeTendency: "medium",
      pairsWellInDebateWith: ["risk-resilience", "financial-stewardship"],
    },
  },
  "values-trust": {
    directorId: "values-trust",
    oftenWorksWith: [
      "founder-advocate",
      "customer-market",
      "board-chair",
      "devils-advocate",
    ],
    providesBalance: ["growth-opportunity", "technology-future"],
    recommends: ["founder-advocate", "customer-market"],
    inviteForDecisions: [
      {
        themes: ["trust", "brand", "ethics"],
        cues: ["trust", "values", "brand", "reputation", "promise"],
        inviteDirectorIds: ["founder-advocate", "customer-market"],
        reason: "Trust decisions need founder integrity and market reality.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 4,
      challengeTendency: "medium",
      pairsWellInDebateWith: ["growth-opportunity", "devils-advocate"],
    },
  },
  "devils-advocate": {
    directorId: "devils-advocate",
    oftenWorksWith: [
      "board-chair",
      "risk-resilience",
      "values-trust",
      "financial-stewardship",
    ],
    providesBalance: ["growth-opportunity", "technology-future", "customer-market"],
    recommends: ["risk-resilience", "board-chair"],
    inviteForDecisions: [
      {
        themes: ["challenge", "assumption-test"],
        cues: [
          "challenge",
          "assumption",
          "what if we're wrong",
          "stress test",
        ],
        inviteDirectorIds: ["risk-resilience", "board-chair"],
        reason:
          "Hard challenges land best with resilience and the Chair keeping focus.",
      },
    ],
    discussionAffinity: {
      speakingOrderBias: 8,
      challengeTendency: "high",
      pairsWellInDebateWith: ["growth-opportunity", "founder-advocate"],
    },
  },
};

export const DIRECTOR_RELATIONSHIP_PROFILES: readonly DirectorRelationshipProfile[] =
  Object.values(PROFILES);

export function getDirectorRelationshipProfile(
  directorId: string,
): DirectorRelationshipProfile | undefined {
  return PROFILES[directorId as BoardDirectorId];
}

export function listDirectorRelationshipProfiles(): readonly DirectorRelationshipProfile[] {
  return DIRECTOR_RELATIONSHIP_PROFILES;
}

/** Flat edges for graph consumers / future Board discussion tooling. */
export function listDirectorRelationshipEdges(): DirectorRelationshipEdge[] {
  const edges: DirectorRelationshipEdge[] = [];
  for (const profile of DIRECTOR_RELATIONSHIP_PROFILES) {
    for (const to of profile.oftenWorksWith) {
      edges.push({
        fromDirectorId: profile.directorId,
        toDirectorId: to,
        kind: "often_works_with",
      });
    }
    for (const to of profile.providesBalance) {
      edges.push({
        fromDirectorId: profile.directorId,
        toDirectorId: to,
        kind: "provides_balance",
      });
    }
    for (const to of profile.recommends) {
      edges.push({
        fromDirectorId: profile.directorId,
        toDirectorId: to,
        kind: "recommends",
        reason: `${profile.directorId} recommends ${to}`,
      });
    }
    for (const rule of profile.inviteForDecisions) {
      for (const to of rule.inviteDirectorIds) {
        edges.push({
          fromDirectorId: profile.directorId,
          toDirectorId: to,
          kind: "invite_for_decision",
          reason: rule.reason,
          themes: rule.themes,
        });
      }
    }
  }
  return edges;
}

/**
 * Compatibility map: primary suggestion list per Director
 * (recommends + oftenWorksWith, deduped, recommends first).
 */
export function buildLegacyRelationshipSuggestionMap(): Record<
  BoardDirectorId,
  readonly BoardDirectorId[]
> {
  const map = {} as Record<BoardDirectorId, readonly BoardDirectorId[]>;
  for (const profile of DIRECTOR_RELATIONSHIP_PROFILES) {
    const seen = new Set<BoardDirectorId>();
    const ordered: BoardDirectorId[] = [];
    for (const id of [...profile.recommends, ...profile.oftenWorksWith]) {
      if (seen.has(id) || id === profile.directorId) continue;
      seen.add(id);
      ordered.push(id);
    }
    map[profile.directorId] = ordered;
  }
  return map;
}
