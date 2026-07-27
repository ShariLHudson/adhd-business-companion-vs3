/**
 * Shared research model — one engine, honest evidence labeling.
 *
 * A finding's `evidenceBasis` is the source of truth for whether it may be
 * presented as a cited source. Only genuine retrieved sources
 * (`live_source` / `connected_source`) may carry citation metadata and render
 * citation-style source cards. Model conversation, built-in packs, and the
 * member's own words are labeled honestly and never shown as citations.
 *
 * This module is the ONLY place findings are constructed, so the honesty
 * invariant cannot be bypassed elsewhere.
 */

export type ResearchEvidenceBasis =
  | "live_source" // retrieved live from the open web
  | "connected_source" // retrieved from a connected/authorized data source
  | "built_in_guidance" // built-in reference pack (offline), NOT a citation
  | "user_provided" // the member's own words / existing profile content
  | "interpretation"; // Shari's conversational guidance / inference

/** The only bases that may ever carry real citations / source cards. */
export const CITATION_EVIDENCE_BASES: readonly ResearchEvidenceBasis[] = [
  "live_source",
  "connected_source",
];

export type ResearchFindingKind =
  | "fact"
  | "inference"
  | "theme"
  | "example"
  | "option"
  | "recommendation"
  | "risk"
  | "caution"
  | "question"
  | "implication";

/** A real citation. Only ever attached to live/connected findings. */
export type ResearchSourceCitation = {
  title: string;
  /** Either a resolvable URL or a stable connected-source identifier. */
  url?: string;
  sourceId?: string;
  publisher?: string | null;
  /** ISO date the source was actually retrieved. */
  retrievalDate: string;
  /** ISO publication date, when the source provides one. */
  publicationDate?: string | null;
};

export type SharedResearchFinding = {
  id: string;
  title: string;
  content: string;
  kind: ResearchFindingKind;
  evidenceBasis: ResearchEvidenceBasis;
  /** Non-empty ONLY for live_source / connected_source. */
  sources: ResearchSourceCitation[];
  /** Derived from the actual source; only meaningful for source-based findings. */
  confidence?: "high" | "medium" | "low";
  freshness?: "current" | "stable" | "unknown";
  verificationStatus?: "verified" | "partially_verified" | "unverified";
  important?: boolean;
};

export function isCitationEvidenceBasis(
  basis: ResearchEvidenceBasis,
): boolean {
  return basis === "live_source" || basis === "connected_source";
}

/** A citation is real only with a title, a locator (url or id), and a retrieval date. */
export function isRealSourceCitation(source: ResearchSourceCitation): boolean {
  const hasTitle = Boolean(source.title && source.title.trim());
  const hasLocator = Boolean(
    (source.url && source.url.trim()) ||
      (source.sourceId && source.sourceId.trim()),
  );
  const hasRetrieval = Boolean(source.retrievalDate && source.retrievalDate.trim());
  return hasTitle && hasLocator && hasRetrieval;
}

/**
 * The single gate the UI uses to decide whether to render citation-style
 * source cards. True ONLY for live/connected findings whose every source
 * carries real citation metadata. Interpretation / guidance / user-provided
 * findings can never pass, even if sources are injected onto them.
 */
export function findingMayShowCitation(finding: SharedResearchFinding): boolean {
  if (!isCitationEvidenceBasis(finding.evidenceBasis)) return false;
  if (!finding.sources.length) return false;
  return finding.sources.every(isRealSourceCitation);
}

export type MakeFindingInput = {
  id: string;
  title: string;
  content: string;
  kind: ResearchFindingKind;
  evidenceBasis: ResearchEvidenceBasis;
  sources?: ResearchSourceCitation[];
  confidence?: SharedResearchFinding["confidence"];
  freshness?: SharedResearchFinding["freshness"];
  verificationStatus?: SharedResearchFinding["verificationStatus"];
  important?: boolean;
};

/**
 * The ONLY constructor for a finding. Enforces the honesty invariant:
 * non-source findings never keep sources or source-derived quality labels,
 * and source findings only keep sources that are real citations.
 */
export function makeFinding(input: MakeFindingInput): SharedResearchFinding {
  const citationBasis = isCitationEvidenceBasis(input.evidenceBasis);
  const sources = citationBasis
    ? (input.sources ?? []).filter(isRealSourceCitation)
    : [];
  const base: SharedResearchFinding = {
    id: input.id,
    title: input.title,
    content: input.content,
    kind: input.kind,
    evidenceBasis: input.evidenceBasis,
    sources,
    important: input.important,
  };
  // Source-derived quality labels only travel with genuine sources.
  if (citationBasis && sources.length) {
    base.confidence = input.confidence;
    base.freshness = input.freshness;
    base.verificationStatus = input.verificationStatus;
  }
  return base;
}

/**
 * Friendly, member-facing label for a finding's evidence basis (used by the
 * shared card). The internal enum stays stable; only this display copy is warm.
 */
export function evidenceBasisLabel(basis: ResearchEvidenceBasis): string {
  switch (basis) {
    case "live_source":
      return "Live Sources";
    case "connected_source":
      return "Connected Sources";
    case "built_in_guidance":
      return "Built-in Guidance";
    case "user_provided":
      return "Your Thoughts";
    case "interpretation":
      return "Shari's Insights";
    default: {
      const _exhaustive: never = basis;
      return _exhaustive;
    }
  }
}
