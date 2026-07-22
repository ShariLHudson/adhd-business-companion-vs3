/**
 * Research-Assisted Map Building — universal cartography intelligence.
 *
 * A member should be able to build any map type without already knowing the
 * steps, structure, or framework. Spark researches the subject, builds a first
 * useful map, and preserves sources + confidence so nothing is presented as
 * fact when it is really a starting framework.
 *
 * Intelligence-ready: these types are additive hooks on `VisualFocusMap`.
 * Existing maps carry none of this metadata and behave exactly as before.
 */

import type { VisualFocusMode } from "../types";

/** How sure Spark is about a researched branch. Never hidden from the member. */
export type ResearchConfidence = "high" | "moderate" | "needs-confirmation";

/** Detail depth of a researched map. The member can change this at any time. */
export type MapDetailLevel = "overview" | "working" | "detailed";

/**
 * What Spark understood about how much the member already knows.
 * Drives whether research is offered.
 */
export type MapKnowledgeState =
  | "known" // member already has the content
  | "partial" // member knows part of it
  | "research" // member wants Spark to research it
  | "unsure"; // member is unsure how it should be structured

/** The three plain-language choices offered when the member is uncertain. */
export type ResearchEntryChoice =
  | "research-it" // Research It for Me
  | "build-from-known" // Build From What I Know
  | "think-it-through"; // Help Me Think It Through

/** A source Spark leaned on. Kept discreet — surfaced under "Research Used". */
export type ResearchSource = {
  id: string;
  title: string;
  organization?: string;
  url?: string;
  /** ISO date the source was consulted. */
  accessedAt: string;
  authorityLevel: "primary" | "authoritative" | "secondary" | "community";
};

/** Which nodes lean on which sources, and how confident each branch is. */
export type MapNodeResearch = {
  nodeId: string;
  sourceIds: string[];
  confidence: ResearchConfidence;
  /** ISO date this branch was researched. */
  researchedAt: string;
  notes?: string;
};

/**
 * Freshness category — how time-sensitive the researched material is.
 * Tools/software/regulations go stale; a mind map of themes rarely does.
 */
export type ResearchFreshness = "durable" | "review-periodically" | "time-sensitive";

/**
 * Map-level research metadata attached to a `VisualFocusMap` when Spark helped
 * build it. Separated from estate-memory discovery sources on purpose.
 */
export type ResearchAssistedMapMeta = {
  /** Whether this map was built with research assistance. */
  researchAssisted: true;
  detailLevel: MapDetailLevel;
  /** What the member wanted to map, in their words. */
  topic: string;
  /** Who the map is for — shapes terminology and step size. */
  audience?: string;
  /** Facts the member supplied. Never mixed with researched material. */
  userKnownFacts: string[];
  /** Structure/framework Spark contributed. Not asserted as member fact. */
  researchedFacts: string[];
  /** Working assumptions — clearly separated from facts. */
  assumptions: string[];
  /** Open questions the member still needs to answer. */
  unresolvedQuestions: string[];
  sources: ResearchSource[];
  nodeResearch: MapNodeResearch[];
  /** ISO timestamp of when the research was performed. */
  researchedAt: string;
  freshness: ResearchFreshness;
  /** Honest note about when it would be worth refreshing. */
  refreshRecommendation?: string;
};

/** Result of reading a member's opening statement in the research entry. */
export type ResearchEntryDetection = {
  /** The cleaned topic the member wants to map (best effort). */
  topic: string;
  knowledgeState: MapKnowledgeState;
  /** Whether Spark should offer to research (member signalled uncertainty). */
  shouldOfferResearch: boolean;
  /** The choice Spark would gently lead with — member still decides. */
  suggestedChoice: ResearchEntryChoice;
  /** The natural-language phrases that triggered the research signal. */
  matchedSignals: string[];
};

/** A researched draft ready to become a map — mirrors GuidedDraftResult shape. */
export type ResearchedDraftResult = {
  title: string;
  root: import("../types").VisualFocusNode;
  summaryHint: string;
  research: ResearchAssistedMapMeta;
};

/** Input to build a researched draft for any map type. */
export type BuildResearchedDraftInput = {
  mapType: VisualFocusMode;
  topic: string;
  detailLevel: MapDetailLevel;
  audience?: string;
  /** Anything the member already told us (partial knowledge). */
  knownFacts?: string[];
};
