/** Founder Memory & Decision Vault™ — institutional memory types */

import type { FounderMemoryLink, FounderMemoryRef } from "./links";

export type {
  FounderMemoryEntityKind,
  FounderMemoryLink,
  FounderMemoryRef,
} from "./links";

export type FounderMemoryKind =
  | "decision"
  | "lesson"
  | "milestone"
  | "idea"
  | "insight"
  | "research"
  | "journal"
  | "timeline";

/** Umbrella memory record — searchable institutional anchor */
export type FounderMemory = {
  id: string;
  kind: FounderMemoryKind;
  title: string;
  summary: string;
  whyItMatters: string;
  recordedAt: string;
  tags: string[];
  relatedRefs: FounderMemoryRef[];
};

export type FounderDecisionCategory =
  | "product"
  | "pricing"
  | "strategy"
  | "marketing"
  | "operations"
  | "people"
  | "research"
  | "workshop";

export type FounderDecisionStatus =
  | "decided"
  | "revisited"
  | "superseded"
  | "pending-review";

export type FounderDecisionRelations = {
  products: FounderMemoryRef[];
  research: FounderMemoryRef[];
  projects: FounderMemoryRef[];
  reports: FounderMemoryRef[];
  people: FounderMemoryRef[];
  timeline: FounderMemoryRef[];
  memories: FounderMemoryRef[];
};

/** Decision Vault™ centerpiece */
export type FounderDecision = {
  id: string;
  title: string;
  decidedAt: string;
  category: FounderDecisionCategory;
  reason: string;
  supportingEvidence: string[];
  alternativesConsidered: string[];
  finalDecision: string;
  expectedOutcome: string;
  actualOutcome?: string;
  status: FounderDecisionStatus;
  related: FounderDecisionRelations;
};

export type FounderLessonKind =
  | "worked"
  | "failed"
  | "unexpected"
  | "repeat"
  | "avoid";

export type FounderLesson = {
  id: string;
  title: string;
  kind: FounderLessonKind;
  summary: string;
  context: string;
  recordedAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderMilestone = {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
  category: "product" | "revenue" | "community" | "integration" | "culture";
  relatedRefs: FounderMemoryRef[];
};

export type FounderWin = {
  id: string;
  title: string;
  summary: string;
  celebratedAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderChallenge = {
  id: string;
  title: string;
  summary: string;
  facedAt: string;
  resolution?: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderIdea = {
  id: string;
  title: string;
  summary: string;
  capturedAt: string;
  status: "seed" | "exploring" | "approved" | "parked" | "shipped";
  relatedRefs: FounderMemoryRef[];
};

export type FounderResearchReference = {
  id: string;
  title: string;
  source: string;
  summary: string;
  discoveredAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderReasoning = {
  id: string;
  title: string;
  question: string;
  reasoning: string;
  conclusion: string;
  recordedAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderRevision = {
  id: string;
  title: string;
  priorVersion: string;
  revisedTo: string;
  reason: string;
  revisedAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderMeeting = {
  id: string;
  title: string;
  heldAt: string;
  attendees: string[];
  summary: string;
  decisions: FounderMemoryRef[];
  relatedRefs: FounderMemoryRef[];
};

export type FounderJournalEntryKind =
  | "thought"
  | "lesson"
  | "idea"
  | "reflection"
  | "future-letter"
  | "note-to-self";

export type FounderJournalEntry = {
  id: string;
  kind: FounderJournalEntryKind;
  title: string;
  body: string;
  writtenAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderProductHistory = {
  id: string;
  productName: string;
  event: string;
  summary: string;
  occurredAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderRoadmapChange = {
  id: string;
  title: string;
  fromState: string;
  toState: string;
  reason: string;
  changedAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderRelationship = {
  id: string;
  name: string;
  role: string;
  context: string;
  lastNotedAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderInsightHistory = {
  id: string;
  insight: string;
  source: string;
  recordedAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderTimelineEventKind =
  | "product-idea"
  | "workshop-approved"
  | "feature-launched"
  | "pricing-changed"
  | "research-discovered"
  | "lesson"
  | "customer-insight"
  | "strategic-shift"
  | "milestone"
  | "decision";

export type FounderTimelineEvent = {
  id: string;
  kind: FounderTimelineEventKind;
  title: string;
  summary: string;
  occurredAt: string;
  relatedRefs: FounderMemoryRef[];
};

export type FounderMemorySearchScope =
  | "all"
  | "decisions"
  | "ideas"
  | "lessons"
  | "products"
  | "research"
  | "roadmap"
  | "timeline"
  | "journal";

export type FounderMemorySearchResult = {
  id: string;
  scope: FounderMemorySearchScope;
  title: string;
  excerpt: string;
  occurredAt: string;
  ref: FounderMemoryRef;
};

export type FounderMemoryVaultOverview = {
  memories: FounderMemory[];
  decisions: FounderDecision[];
  lessons: FounderLesson[];
  milestones: FounderMilestone[];
  timeline: FounderTimelineEvent[];
  wins: FounderWin[];
  challenges: FounderChallenge[];
  ideas: FounderIdea[];
  research: FounderResearchReference[];
  reasoning: FounderReasoning[];
  revisions: FounderRevision[];
  meetings: FounderMeeting[];
  journal: FounderJournalEntry[];
  productHistory: FounderProductHistory[];
  roadmapChanges: FounderRoadmapChange[];
  relationships: FounderRelationship[];
  insights: FounderInsightHistory[];
  links: FounderMemoryLink[];
};
