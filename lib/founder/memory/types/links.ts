/** Cross-linking architecture — every future object connects here. */

export type FounderMemoryEntityKind =
  | "memory"
  | "decision"
  | "lesson"
  | "milestone"
  | "win"
  | "challenge"
  | "idea"
  | "research"
  | "reasoning"
  | "revision"
  | "meeting"
  | "journal"
  | "product-history"
  | "roadmap-change"
  | "relationship"
  | "insight"
  | "timeline";

export type FounderMemoryRef = {
  kind: FounderMemoryEntityKind;
  id: string;
  label: string;
};

export type FounderMemoryLink = {
  id: string;
  from: FounderMemoryRef;
  to: FounderMemoryRef;
  relationship:
    | "supports"
    | "informed-by"
    | "supersedes"
    | "related-to"
    | "documented-in"
    | "resulted-in";
  notedAt: string;
};
