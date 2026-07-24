import type {
  ResearchCollection,
  ResearchFinding,
  UniversalRequestUnderstanding,
} from "./types";
import {
  getLiveResearchProviderStatus,
  resolveResearchStatus,
} from "./generateSubstantive";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

const RESEARCH_SESSION_KEY = "companion-universal-research-collection-v1";

/**
 * Capture contextual Research This input — topic + surrounding intent.
 */
export function captureResearchThisContext(input: {
  selectedTopic: string;
  surroundingContext?: string | null;
  sourceExperience?: string | null;
  sourceEntityId?: string | null;
  sourceSelectionIds?: string[];
  rawRequest?: string | null;
}): {
  topic: string;
  researchQuestion: string;
  intendedOutcome: string;
  sourceExperience: string | null;
} {
  const topic = input.selectedTopic.trim();
  const ctx = (input.surroundingContext ?? "").trim();
  const raw = (input.rawRequest ?? "").trim();
  const intendedOutcome = raw
    ? raw
    : ctx
      ? `Use research on ${topic} in context of: ${ctx.slice(0, 160)}`
      : `Understand ${topic} well enough to act`;
  return {
    topic,
    researchQuestion: ctx
      ? `Given ${ctx.slice(0, 120)}, what matters most about ${topic}?`
      : `What should someone know about ${topic} to make a good next decision?`,
    intendedOutcome,
    sourceExperience: input.sourceExperience ?? null,
  };
}

/**
 * Create a reusable Research Collection.
 * Does not claim current research unless a live provider actually ran.
 */
export function createResearchCollection(input: {
  understanding?: UniversalRequestUnderstanding | null;
  topic: string;
  purpose?: string;
  researchQuestion?: string;
  intendedOutcome?: string;
  sourceExperience?: string | null;
  sourceEntityId?: string | null;
  sourceSelectionIds?: string[];
  stableFindings?: Array<Pick<ResearchFinding, "title" | "content" | "source">>;
}): ResearchCollection {
  const live = getLiveResearchProviderStatus();
  const u = input.understanding;
  const usedStable = (input.stableFindings?.length ?? 0) > 0;
  const status = resolveResearchStatus({
    requiresCurrentInformation: Boolean(u?.requiresCurrentInformation),
    requiresResearch: true,
    liveAvailable: live.liveResearchAvailable,
    liveSucceeded: false,
    usedStableKnowledge: usedStable || !live.liveResearchAvailable,
  });

  const findings: ResearchFinding[] = (input.stableFindings ?? []).map((f) => ({
    id: newId("rf"),
    title: f.title,
    content: f.content,
    source: f.source,
    freshness: "stable" as const,
    confidence: "medium" as const,
    verificationStatus: "partially_verified" as const,
  }));

  const timestamp = nowIso();
  return {
    id: newId("rcol"),
    topic: input.topic,
    purpose: input.purpose ?? u?.desiredOutcome ?? `Research: ${input.topic}`,
    researchQuestion:
      input.researchQuestion ??
      u?.normalizedRequest ??
      `What matters about ${input.topic}?`,
    intendedOutcome:
      input.intendedOutcome ?? u?.desiredOutcome ?? `Act on ${input.topic}`,
    sourceExperience: input.sourceExperience ?? null,
    sourceEntityId: input.sourceEntityId ?? null,
    sourceSelectionIds: input.sourceSelectionIds ?? [],
    findings,
    facts: findings.map((f) => f.content),
    themes: [],
    examples: [],
    options: [],
    recommendations: [],
    risks: [],
    questions: live.liveResearchAvailable
      ? []
      : ["Live current research was unavailable — verify time-sensitive claims."],
    conflicts: [],
    uncertainties: live.note ? [live.note] : [],
    sourceReferences: findings.map((f) => f.source),
    retrievalDates: [timestamp],
    freshness: usedStable ? "stable" : "unknown",
    confidence: usedStable ? "medium" : "low",
    verificationStatus: usedStable ? "partially_verified" : "unverified",
    userNotes: [],
    approvedFindingIds: [],
    excludedFindingIds: [],
    status,
    failureState:
      status === "current_research_unavailable"
        ? "live_provider_unavailable"
        : null,
    retryState: null,
    possibleUses: [],
    selectedUse: null,
    linkedCreationIds: [],
    linkedProjectIds: [],
    linkedWorkspaceIds: [],
    linkedStrategyIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Context-aware Use This Research choices — never dump every destination. */
export function resolveUseThisResearchOptions(
  collection: ResearchCollection,
  understanding?: UniversalRequestUnderstanding | null,
): string[] {
  if (understanding?.primaryDeliverable && understanding.primaryIntent !== "research") {
    // Outcome already specified — automatic continuation, no menu required.
    return [];
  }
  const topic = collection.topic.toLowerCase();
  const opts: string[] = [];
  if (/\b(microphone|equipment|tool|software|crm)\b/.test(topic)) {
    opts.push("Create a Comparison", "Create a Guide", "Keep as Research");
  } else if (/\b(podcast)\b/.test(topic)) {
    opts.push(
      "Create a Guide",
      "Build a Project Plan",
      "Compare Equipment",
      "Keep as Research",
    );
  } else if (/\b(webinar|marketing|social)\b/.test(topic)) {
    opts.push(
      "Create a Content Plan",
      "Create a Report",
      "Add to Strategic Planning",
      "Keep as Research",
    );
  } else {
    opts.push(
      "Create a Guide",
      "Create a Report",
      "Show It Visually",
      "Keep as Research",
    );
  }
  return opts.slice(0, 4);
}

export function saveResearchCollection(collection: ResearchCollection): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      RESEARCH_SESSION_KEY,
      JSON.stringify(collection),
    );
  } catch {
    /* ignore */
  }
}

export function loadResearchCollection(): ResearchCollection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RESEARCH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResearchCollection;
  } catch {
    return null;
  }
}

export { RESEARCH_SESSION_KEY };
