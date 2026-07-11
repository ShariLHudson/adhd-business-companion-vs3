import type { ExecutiveMemoryRecord, GraphNode, GraphRelationship, GraphTimelineEvent } from "../types";

const TS = "2026-07-06T10:00:00.000Z";
const TS_2024 = "2024-03-15T00:00:00.000Z";
const TS_2026 = "2026-01-10T00:00:00.000Z";

function timeline(
  nodeId: string,
  events: Omit<GraphTimelineEvent, "id" | "nodeId">[],
): GraphTimelineEvent[] {
  return events.map((e, i) => ({
    id: `tl-${nodeId}-${i}`,
    nodeId,
    ...e,
  }));
}

function node(partial: GraphNode): GraphNode {
  return partial;
}

export const SAMPLE_GRAPH_NODES: GraphNode[] = [
  node({
    id: "node-listening-rooms",
    kind: "listening-room",
    title: "Listening Rooms",
    summary: "Calm estate re-entry for members returning after absence.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["restart", "adhd", "estate"],
    createdAt: TS_2024,
    updatedAt: TS,
    timeline: timeline("node-listening-rooms", [
      { kind: "created", summary: "Mission concept defined.", occurredAt: TS_2024 },
      { kind: "updated", summary: "Estate scene entered QA.", occurredAt: TS },
      { kind: "referenced", summary: "Executive Brief highlighted as priority.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-mission-lr",
    kind: "mission",
    title: "Listening Rooms Mission",
    summary: "Flagship 2026 mission — shame-free restart.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["mission", "critical"],
    createdAt: TS_2024,
    updatedAt: TS,
    timeline: timeline("node-mission-lr", [
      { kind: "created", summary: "Mission chartered.", occurredAt: TS_2024 },
      { kind: "modified", summary: "Priority set to critical.", occurredAt: TS_2026 },
    ]),
  }),
  node({
    id: "node-research-adhd-restart",
    kind: "research-paper",
    title: "ADHD Restart Rituals Research",
    summary: "124 sources — shame-free return beats streak recovery.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["research", "adhd", "restart"],
    createdAt: "2025-11-01T00:00:00.000Z",
    updatedAt: TS,
    timeline: timeline("node-research-adhd-restart", [
      { kind: "created", summary: "Research batch imported.", occurredAt: "2025-11-01T00:00:00.000Z" },
      { kind: "referenced", summary: "Cited in Overnight Cycle.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-finding-decision-fatigue",
    kind: "finding",
    title: "Decision Fatigue Pattern",
    summary: "Members stall when asked to choose before feeling safe.",
    status: "active",
    missionIds: ["listening-rooms", "workshop-series"],
    tags: ["decision-fatigue", "pattern"],
    createdAt: TS_2026,
    updatedAt: TS,
    timeline: timeline("node-finding-decision-fatigue", [
      { kind: "created", summary: "SPARK pattern detected.", occurredAt: TS_2026 },
    ]),
  }),
  node({
    id: "node-feedback-restart",
    kind: "customer-feedback",
    title: "Customer Requests — Gentle Return",
    summary: "Repeated member voice: guilt after absence, need welcome not tasks.",
    status: "active",
    missionIds: ["listening-rooms", "companion"],
    tags: ["customer-voice", "restart"],
    createdAt: TS_2026,
    updatedAt: TS,
    timeline: timeline("node-feedback-restart", [
      { kind: "created", summary: "Companion themes aggregated.", occurredAt: TS_2026 },
      { kind: "used", summary: "Informed workshop ideation.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-workshop-fatigue",
    kind: "workshop",
    title: "Decision Fatigue Workshop",
    summary: "Live experience helping members choose without shame.",
    status: "candidate",
    missionIds: ["workshop-series"],
    tags: ["workshop", "decision-fatigue"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-workshop-fatigue", [
      { kind: "created", summary: "Workshop concept from customer requests.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-course-choosing",
    kind: "course",
    title: "Choosing With Calm — Micro Course",
    summary: "Async companion to Decision Fatigue workshop.",
    status: "candidate",
    missionIds: ["workshop-series"],
    tags: ["course", "micro-learning"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-course-choosing", [
      { kind: "created", summary: "Course outline drafted.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-newsletter-restart",
    kind: "newsletter",
    title: "Gentle Restart Newsletter",
    summary: "Nurture angle aligned to Listening Rooms estate scene.",
    status: "active",
    missionIds: ["marketing-launch", "listening-rooms"],
    tags: ["newsletter", "nurture"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-newsletter-restart", [
      { kind: "created", summary: "PostCraft draft created.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-campaign-gentle-restart",
    kind: "campaign",
    title: "Gentle Restart Campaign",
    summary: "PostCraft campaign awaiting estate visual proof.",
    status: "active",
    missionIds: ["marketing-launch", "postcraft"],
    tags: ["campaign", "postcraft"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-campaign-gentle-restart", [
      { kind: "created", summary: "Campaign brief authored.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-ghl-gentle-restart",
    kind: "ghl-funnel",
    title: "GHL Gentle Restart Funnel",
    summary: "Automated nurture — logistics only, not companion voice.",
    status: "active",
    missionIds: ["marketing-launch"],
    tags: ["ghl", "automation"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-ghl-gentle-restart", [
      { kind: "created", summary: "Funnel draft in GHL.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-analytics-retention",
    kind: "analytics-event",
    title: "Return-After-Absence Cohort Lift",
    summary: "Early signal after companion copy refinement.",
    status: "active",
    missionIds: ["listening-rooms", "companion"],
    tags: ["analytics", "retention"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-analytics-retention", [
      { kind: "created", summary: "Analytics snapshot recorded.", occurredAt: TS },
      { kind: "referenced", summary: "Cited in Executive Brief.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-lesson-restart-first",
    kind: "lesson-learned",
    title: "Welcome Before Productivity",
    summary: "Never prompt tasks on first return — presence only.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["lesson", "hospitality"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-lesson-restart-first", [
      { kind: "created", summary: "Validated across research and member voice.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-roadmap-improvements",
    kind: "roadmap-item",
    title: "Future Restart Improvements",
    summary: "Voice capture, additional estate scenes, mobile perf.",
    status: "active",
    missionIds: ["listening-rooms", "companion"],
    tags: ["roadmap"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-roadmap-improvements", [
      { kind: "created", summary: "Roadmap item from lessons learned.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-decision-invest-restart",
    kind: "decision",
    title: "Invest in Restart Experience",
    summary: "Founder decision — prioritize Listening Rooms through Q3.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["decision", "vault"],
    createdAt: TS_2026,
    updatedAt: TS,
    timeline: timeline("node-decision-invest-restart", [
      { kind: "created", summary: "Decision recorded in vault.", occurredAt: TS_2026 },
      { kind: "referenced", summary: "Advisory council consensus prepared.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-opp-lr-expansion",
    kind: "opportunity",
    title: "Listening Rooms Expansion",
    summary: "Own ADHD restart category with estate re-entry.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["opportunity"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-opp-lr-expansion", [{ kind: "created", summary: "Opportunity scored.", occurredAt: TS }]),
  }),
  node({
    id: "node-eq-build-next",
    kind: "executive-question",
    title: "What should we build next?",
    summary: "Executive question tied to mission priority.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["executive-question"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-eq-build-next", [{ kind: "created", summary: "Question catalog.", occurredAt: TS }]),
  }),
  node({
    id: "node-brief-2026-07-06",
    kind: "executive-brief",
    title: "Executive Brief — 2026-07-06",
    summary: "Continue Listening Rooms; one first action.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["executive-brief"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-brief-2026-07-06", [
      { kind: "created", summary: "Overnight cycle prepared office.", occurredAt: TS },
    ]),
  }),
  node({
    id: "node-journal-restart",
    kind: "founder-journal",
    title: "Journal — Restart Must Feel Like Home",
    summary: "Shari note: beauty before information on return.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["founder", "journal"],
    createdAt: TS_2026,
    updatedAt: TS,
    timeline: timeline("node-journal-restart", [{ kind: "created", summary: "Journal entry.", occurredAt: TS_2026 }]),
  }),
  node({
    id: "node-success-retention-signal",
    kind: "success",
    title: "Early Retention Signal",
    summary: "Return cohort improved after copy refinement.",
    status: "active",
    missionIds: ["listening-rooms"],
    tags: ["success", "analytics"],
    createdAt: TS,
    updatedAt: TS,
    timeline: timeline("node-success-retention-signal", [{ kind: "created", summary: "Win captured.", occurredAt: TS }]),
  }),
];

function edge(
  partial: Omit<GraphRelationship, "id"> & { id?: string },
): GraphRelationship {
  return { id: partial.id ?? `edge-${partial.fromId}-${partial.toId}-${partial.kind}`, ...partial };
}

export const SAMPLE_GRAPH_RELATIONSHIPS: GraphRelationship[] = [
  edge({
    fromId: "node-listening-rooms",
    toId: "node-mission-lr",
    kind: "belongs_to",
    confidence: 95,
    strength: 98,
    reason: "Listening Rooms is the flagship expression of the mission.",
    date: TS_2024,
    evidence: [{ id: "ev-mission-charter", label: "Mission charter", summary: "Listening Rooms mission" }],
  }),
  edge({
    fromId: "node-mission-lr",
    toId: "node-research-adhd-restart",
    kind: "references",
    confidence: 92,
    strength: 90,
    reason: "Mission grounded in restart research.",
    date: TS_2026,
    evidence: [],
  }),
  edge({
    fromId: "node-research-adhd-restart",
    toId: "node-finding-decision-fatigue",
    kind: "inspired_by",
    confidence: 88,
    strength: 85,
    reason: "Research surfaced decision fatigue as adjacent pattern.",
    date: TS_2026,
    evidence: [],
  }),
  edge({
    fromId: "node-feedback-restart",
    toId: "node-finding-decision-fatigue",
    kind: "validated_by",
    confidence: 90,
    strength: 88,
    reason: "Customer voice confirms research pattern.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-feedback-restart",
    toId: "node-workshop-fatigue",
    kind: "inspired_by",
    confidence: 86,
    strength: 82,
    reason: "Workshop demand from member requests.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-workshop-fatigue",
    toId: "node-course-choosing",
    kind: "extends",
    confidence: 80,
    strength: 75,
    reason: "Course extends workshop themes.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-mission-lr",
    toId: "node-newsletter-restart",
    kind: "created_from",
    confidence: 84,
    strength: 80,
    reason: "Newsletter tells restart story.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-newsletter-restart",
    toId: "node-campaign-gentle-restart",
    kind: "marketed_by",
    confidence: 88,
    strength: 85,
    reason: "Campaign carries newsletter angle.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-campaign-gentle-restart",
    toId: "node-ghl-gentle-restart",
    kind: "launched_with",
    confidence: 90,
    strength: 88,
    reason: "GHL funnel executes campaign nurture.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-ghl-gentle-restart",
    toId: "node-analytics-retention",
    kind: "generated",
    confidence: 75,
    strength: 70,
    reason: "Funnel activity feeds retention analytics.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-analytics-retention",
    toId: "node-success-retention-signal",
    kind: "supports",
    confidence: 82,
    strength: 78,
    reason: "Analytics validated early win.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-lesson-restart-first",
    toId: "node-roadmap-improvements",
    kind: "improves",
    confidence: 85,
    strength: 80,
    reason: "Lesson informs future roadmap.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-listening-rooms",
    toId: "node-lesson-restart-first",
    kind: "learned_from",
    confidence: 91,
    strength: 88,
    reason: "Mission execution produced institutional lesson.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-decision-invest-restart",
    toId: "node-mission-lr",
    kind: "supports",
    confidence: 94,
    strength: 92,
    reason: "Decision commits resources to mission.",
    date: TS_2026,
    evidence: [],
  }),
  edge({
    fromId: "node-opp-lr-expansion",
    toId: "node-mission-lr",
    kind: "supports",
    confidence: 90,
    strength: 88,
    reason: "Opportunity aligns with mission.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-eq-build-next",
    toId: "node-mission-lr",
    kind: "answers",
    confidence: 85,
    strength: 80,
    reason: "Question scoped to mission priority.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-brief-2026-07-06",
    toId: "node-mission-lr",
    kind: "references",
    confidence: 88,
    strength: 85,
    reason: "Brief recommends mission focus.",
    date: TS,
    evidence: [],
  }),
  edge({
    fromId: "node-journal-restart",
    toId: "node-decision-invest-restart",
    kind: "remembered_from",
    confidence: 80,
    strength: 75,
    reason: "Journal informed decision framing.",
    date: TS_2026,
    evidence: [],
  }),
  edge({
    fromId: "node-listening-rooms",
    toId: "node-research-adhd-restart",
    kind: "inspired_by",
    confidence: 93,
    strength: 90,
    reason: "Product inspired by research.",
    date: TS_2024,
    evidence: [],
  }),
  edge({
    fromId: "node-feedback-restart",
    toId: "node-listening-rooms",
    kind: "solves",
    confidence: 92,
    strength: 95,
    reason: "Listening Rooms solves restart pain.",
    date: TS,
    evidence: [],
  }),
];

export const SAMPLE_EXECUTIVE_MEMORY: ExecutiveMemoryRecord[] = [
  {
    id: "mem-dec-invest-restart",
    decisionNodeId: "node-decision-invest-restart",
    decisionTitle: "Invest in Restart Experience",
    decidedAt: "2026-01-10T00:00:00.000Z",
    whyItWasMade: "Member voice and research aligned — restart is the make-or-break moment.",
    conditionsAtDecision: "Competitor calm planners emerging; estate differentiation viable.",
    rediscoveredAt: TS,
    whatChanged: "GHL nurture ready before estate scene proof; timing tension.",
    shouldReconsider: false,
    reconsiderRationale: "Decision still valid — execution order adjusted, not strategy.",
  },
];

const NODE_MAP = new Map(SAMPLE_GRAPH_NODES.map((n) => [n.id, n]));
const EDGES_BY_FROM = new Map<string, GraphRelationship[]>();
const EDGES_BY_TO = new Map<string, GraphRelationship[]>();

for (const rel of SAMPLE_GRAPH_RELATIONSHIPS) {
  EDGES_BY_FROM.set(rel.fromId, [...(EDGES_BY_FROM.get(rel.fromId) ?? []), rel]);
  EDGES_BY_TO.set(rel.toId, [...(EDGES_BY_TO.get(rel.toId) ?? []), rel]);
}

export function getSampleNode(id: string): GraphNode | undefined {
  return NODE_MAP.get(id);
}

export function listSampleNodes(): GraphNode[] {
  return [...SAMPLE_GRAPH_NODES];
}

export function listSampleRelationships(): GraphRelationship[] {
  return [...SAMPLE_GRAPH_RELATIONSHIPS];
}

export function relationshipsFrom(nodeId: string): GraphRelationship[] {
  return EDGES_BY_FROM.get(nodeId) ?? [];
}

export function relationshipsTo(nodeId: string): GraphRelationship[] {
  return EDGES_BY_TO.get(nodeId) ?? [];
}

export function getSampleExecutiveMemory(decisionNodeId: string): ExecutiveMemoryRecord | undefined {
  return SAMPLE_EXECUTIVE_MEMORY.find((m) => m.decisionNodeId === decisionNodeId);
}

export function listSampleExecutiveMemory(): ExecutiveMemoryRecord[] {
  return [...SAMPLE_EXECUTIVE_MEMORY];
}
