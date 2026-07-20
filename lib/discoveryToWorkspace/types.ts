/**
 * 058 / 059 — Workspace experience + Discovery → Workspace transition.
 */

export type DiscoveryConfidence = "low" | "medium" | "high" | "very_high";

export type WhatWeKnowRow = {
  label: string;
  value: string;
};

export type WorkspaceCurrentFocus = {
  title: string;
  reason: string;
  actionLabel: string;
  estimatedEffort: string | null;
  /** When set, Continue opens this connected asset (e.g. agenda). */
  assetTypeId?: string | null;
  sectionId?: string | null;
};

export type DiscoveryTransitionSnapshot = {
  confidence: DiscoveryConfidence;
  foundationReady: boolean;
  whatWeKnow: WhatWeKnowRow[];
  knownFactLines: string[];
  currentFocus: WorkspaceCurrentFocus;
  phaseLabel: string;
  /** Member-facing chat reply for the transition — never blank-opener language */
  conversationReply: string;
  bannedBlankOpeners: readonly string[];
  /** 060 — ≤3 secondary recommendations */
  secondaryRecommendations?: { title: string; reason: string }[];
  /** 061 — Universal Creation State */
  universalCreationState?: string;
};
