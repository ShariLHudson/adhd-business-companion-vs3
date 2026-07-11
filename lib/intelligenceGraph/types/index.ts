/** Companion Intelligence Graph — ecosystem-wide connected institutional memory. */

export type GraphNodeKind =
  | "mission"
  | "research"
  | "research-question"
  | "finding"
  | "pattern"
  | "opportunity"
  | "risk"
  | "decision"
  | "executive-question"
  | "executive-brief"
  | "workshop"
  | "course"
  | "product"
  | "feature"
  | "listening-room"
  | "content"
  | "newsletter"
  | "blog"
  | "podcast"
  | "video"
  | "lead-magnet"
  | "campaign"
  | "ghl-funnel"
  | "automation"
  | "customer-feedback"
  | "companion-conversation"
  | "founder-journal"
  | "lesson-learned"
  | "success"
  | "failure"
  | "team-member"
  | "project"
  | "roadmap-item"
  | "analytics-event"
  | "ai-development"
  | "competitor"
  | "technology"
  | "book"
  | "article"
  | "research-paper";

export type GraphRelationshipKind =
  | "supports"
  | "created_from"
  | "inspired_by"
  | "answers"
  | "solves"
  | "improves"
  | "blocks"
  | "duplicates"
  | "extends"
  | "references"
  | "belongs_to"
  | "generated"
  | "requires"
  | "launched_with"
  | "marketed_by"
  | "validated_by"
  | "contradicted_by"
  | "superseded_by"
  | "learned_from"
  | "remembered_from"
  | "linked_to"
  | "related_to";

export type GraphTimelineEventKind =
  | "created"
  | "modified"
  | "used"
  | "referenced"
  | "updated"
  | "archived"
  | "reopened";

export type GraphNodeStatus = "active" | "archived" | "candidate" | "superseded";

export type GraphEvidence = {
  id: string;
  label: string;
  summary: string;
  refId?: string;
};

export type GraphRelationship = {
  id: string;
  fromId: string;
  toId: string;
  kind: GraphRelationshipKind;
  /** 0–100 */
  confidence: number;
  /** 0–100 */
  strength: number;
  reason: string;
  date: string;
  evidence: GraphEvidence[];
};

export type GraphTimelineEvent = {
  id: string;
  nodeId: string;
  kind: GraphTimelineEventKind;
  summary: string;
  occurredAt: string;
};

export type GraphNode = {
  id: string;
  kind: GraphNodeKind;
  title: string;
  summary: string;
  status: GraphNodeStatus;
  missionIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  timeline: GraphTimelineEvent[];
};

export type GraphCluster = {
  id: string;
  label: string;
  nodeIds: string[];
  centerNodeId?: string;
};

export type GraphPath = {
  nodeIds: string[];
  edgeIds: string[];
  length: number;
};

export type ExecutiveMemoryRecord = {
  id: string;
  decisionNodeId: string;
  decisionTitle: string;
  decidedAt: string;
  whyItWasMade: string;
  conditionsAtDecision: string;
  rediscoveredAt?: string;
  whatChanged?: string;
  shouldReconsider?: boolean;
  reconsiderRationale?: string;
};

export type GraphQueryFilter = {
  nodeKind?: GraphNodeKind;
  relationshipKind?: GraphRelationshipKind;
  missionId?: string;
  tag?: string;
  search?: string;
};

export type GraphQueryResult = {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  query: string;
};

export type MissionGraphView = {
  missionId: string;
  missionNode: GraphNode | null;
  research: GraphNode[];
  customerPain: GraphNode[];
  content: GraphNode[];
  courses: GraphNode[];
  workshops: GraphNode[];
  products: GraphNode[];
  funnels: GraphNode[];
  analytics: GraphNode[];
  decisions: GraphNode[];
  risks: GraphNode[];
  opportunities: GraphNode[];
  lessons: GraphNode[];
};

export type ContentMemoryView = {
  contentNodeId: string;
  whyItExists: string;
  problemSolved: GraphNode[];
  researchInspired: GraphNode[];
  missionCreated: GraphNode[];
  campaignsUsed: GraphNode[];
  funnelsPromoted: GraphNode[];
  performance: GraphNode[];
  revenueInfluenced: GraphNode[];
};

export type FounderMemoryView = {
  ideas: GraphNode[];
  conversations: GraphNode[];
  journalEntries: GraphNode[];
  wins: GraphNode[];
  mistakes: GraphNode[];
  lessons: GraphNode[];
  decisions: GraphNode[];
  relationships: GraphRelationship[];
};
