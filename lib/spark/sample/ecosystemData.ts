/**
 * SPARK sample ecosystem data — demonstrates cross-product intelligence linkage.
 * No AI. No external APIs. Replace internally in future phases without changing public API.
 */
import type {
  SparkConfidence,
  SparkConnection,
  SparkEvidence,
  SparkFinding,
  SparkGraphEdge,
  SparkGraphNode,
  SparkKnowledgeItem,
  SparkMemoryReference,
  SparkObservation,
  SparkOpportunity,
  SparkPattern,
  SparkPriority,
  SparkRecommendation,
  SparkRisk,
  SparkSignal,
  SparkSource,
  SparkTheme,
} from "../types";

const TS = "2026-07-05T12:00:00.000Z";

const conf = (level: SparkConfidence["level"], score: number): SparkConfidence => ({
  level,
  score,
});

export const SPARK_SAMPLE_SOURCES: SparkSource[] = [
  {
    id: "src-companion",
    sourceCategory: "companion",
    title: "Companion member sessions",
    summary: "Conversation signals from Spark Companion.",
    tags: ["companion", "member"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
  },
  {
    id: "src-founder",
    sourceCategory: "founder",
    title: "Founder Studio executive notes",
    summary: "Executive decisions and reflections from Founder Studio.",
    tags: ["founder", "executive"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
  },
  {
    id: "src-postcraft",
    sourceCategory: "postcraft",
    title: "PostCraft campaign drafts",
    summary: "Content and campaign performance signals.",
    tags: ["postcraft", "content"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
  },
  {
    id: "src-research",
    sourceCategory: "research",
    title: "ADHD executive function research",
    summary: "Research library on restart friction and gentle re-entry.",
    tags: ["research", "adhd"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
  },
  {
    id: "src-user-feedback",
    sourceCategory: "user-feedback",
    title: "Member feedback — interruptions",
    summary: "Members describe losing thread after interruptions.",
    tags: ["feedback", "restart"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
  },
  {
    id: "src-development",
    sourceCategory: "development",
    title: "Cursor build notes",
    summary: "Engineering recommendations from Team Hub / Cursor workflows.",
    tags: ["teamhub", "cursor"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
  },
  {
    id: "src-ghl",
    sourceCategory: "ghl",
    title: "GoHighLevel nurture performance",
    summary: "Funnel and nurture sequence engagement (sample).",
    tags: ["ghl", "nurture"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
  },
];

export const SPARK_SAMPLE_EVIDENCE: SparkEvidence[] = [
  {
    id: "ev-restart-001",
    sourceId: "src-user-feedback",
    title: "Restart after interruption",
    summary: "Members lose momentum returning after context switches.",
    excerpt:
      "I was in the middle of planning and when I came back I didn't know where to start.",
    tags: ["restart", "adhd"],
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: "ev-listening-001",
    sourceId: "src-companion",
    title: "Listening Rooms calm re-entry",
    summary: "Members describe Listening Rooms as gentle return points.",
    excerpt: "The listening room helped me settle before picking back up.",
    tags: ["listening-rooms", "calm"],
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: "ev-strategy-001",
    sourceId: "src-founder",
    title: "Executive Strategy Center decision",
    summary: "Decision to prioritize gentle re-entry over new features.",
    excerpt: "We will invest in restart intelligence before adding dashboards.",
    tags: ["strategy-center", "decision"],
    createdAt: TS,
    updatedAt: TS,
  },
];

export const SPARK_SAMPLE_SIGNALS: SparkSignal[] = [
  {
    id: "sig-restart-001",
    sourceId: "src-user-feedback",
    title: "ADHD entrepreneurs struggle to restart after interruptions",
    summary:
      "Repeated member language about losing thread and needing a soft landing.",
    category: "customer",
    tags: ["adhd", "restart", "interruption"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 86),
    evidenceIds: ["ev-restart-001"],
    relationshipIds: ["rel-restart-pattern"],
  },
  {
    id: "sig-listening-001",
    sourceId: "src-companion",
    title: "Listening Rooms support calm re-entry",
    summary: "Members voluntarily choose Listening Rooms when returning overwhelmed.",
    category: "product",
    tags: ["listening-rooms", "estate"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 82),
    evidenceIds: ["ev-listening-001"],
  },
  {
    id: "sig-decision-compass-001",
    sourceId: "src-founder",
    title: "Decision Compass referenced in executive sessions",
    summary: "Founder searches cluster around decision framing before action.",
    category: "executive",
    tags: ["decision-compass", "founder"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("medium", 74),
    evidenceIds: ["ev-strategy-001"],
  },
  {
    id: "sig-postcraft-001",
    sourceId: "src-postcraft",
    title: "Campaign idea: Gentle Restart Workshop series",
    summary: "PostCraft draft hooks about re-entry outperform generic productivity angles.",
    category: "content",
    tags: ["postcraft", "campaign"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("medium", 71),
  },
  {
    id: "sig-cursor-001",
    sourceId: "src-development",
    title: "Cursor recommends SPARK bridge before Founder UI wiring",
    summary: "Engineering note: consume lib/spark before duplicating scoring in Founder.",
    category: "operations",
    tags: ["cursor", "architecture"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 88),
  },
];

export const SPARK_SAMPLE_OBSERVATIONS: SparkObservation[] = [
  {
    id: "obs-restart-001",
    signalId: "sig-restart-001",
    title: "Three unrelated members used restart language in one week",
    summary: "Pattern cluster without shared campaign or onboarding change.",
    category: "customer",
    tags: ["restart"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 84),
    evidenceIds: ["ev-restart-001"],
  },
  {
    id: "obs-listening-001",
    signalId: "sig-listening-001",
    title: "Listening Rooms chosen after absence",
    summary: "Return visits often open in Listening Rooms before Conservatory.",
    category: "product",
    tags: ["listening-rooms"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("medium", 76),
  },
];

export const SPARK_SAMPLE_FINDINGS: SparkFinding[] = [
  {
    id: "find-restart-001",
    signalId: "sig-restart-001",
    sourceId: "src-research",
    title: "Gentle re-entry reduces abandonment after interruption",
    summary: "Research aligns with live member feedback on restart friction.",
    category: "research",
    tags: ["adhd", "re-entry"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 85),
    evidenceIds: ["ev-restart-001"],
  },
  {
    id: "find-decision-001",
    signalId: "sig-decision-compass-001",
    sourceId: "src-founder",
    title: "Decision Compass supports restart framing",
    summary: "Executive decisions benefit from visible alternatives before action.",
    category: "executive",
    tags: ["decision-compass"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("medium", 72),
    evidenceIds: ["ev-strategy-001"],
  },
];

export const SPARK_SAMPLE_THEMES: SparkTheme[] = [
  {
    id: "theme-gentle-reentry",
    title: "Gentle Re-Entry",
    summary: "Help members return without shame or re-orientation overload.",
    patternIds: ["pat-restart-001"],
    tags: ["adhd", "restart"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
  },
];

export const SPARK_SAMPLE_PATTERNS: SparkPattern[] = [
  {
    id: "pat-restart-001",
    title: "Multiple sources point to ADHD entrepreneurs needing gentle re-entry after interruptions",
    summary:
      "Companion feedback, research, Listening Rooms usage, and Founder strategy align on restart intelligence.",
    themeId: "theme-gentle-reentry",
    signalIds: ["sig-restart-001", "sig-listening-001", "sig-decision-compass-001"],
    findingIds: ["find-restart-001", "find-decision-001"],
    category: "customer",
    tags: ["adhd", "restart", "pattern"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 87),
    evidenceIds: ["ev-restart-001", "ev-listening-001"],
    relationshipIds: ["rel-restart-pattern"],
  },
];

export const SPARK_SAMPLE_PRIORITIES: SparkPriority[] = [
  {
    id: "pri-restart-intelligence",
    title: "Unify gentle re-entry intelligence across Companion and Founder",
    summary:
      "Connect Listening Rooms signals, Decision Compass, and SPARK scoring without new dashboards.",
    category: "product",
    tags: ["restart", "spark"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    compositeScore: 84,
    confidence: conf("high", 86),
    evidenceIds: ["ev-restart-001", "ev-listening-001"],
    scores: [
      { dimension: "strategicValue", value: 88, weight: 0.14 },
      { dimension: "customerImpact", value: 92, weight: 0.14 },
      { dimension: "productImportance", value: 85, weight: 0.12 },
      { dimension: "urgency", value: 68, weight: 0.1 },
    ],
  },
  {
    id: "pri-postcraft-campaign",
    title: "PostCraft Gentle Restart campaign aligned to SPARK pattern",
    summary: "Campaign idea should trace to pat-restart-001 and future GHL nurture.",
    category: "content",
    tags: ["postcraft", "ghl"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    compositeScore: 76,
    confidence: conf("medium", 73),
    evidenceIds: ["ev-strategy-001"],
    scores: [
      { dimension: "revenuePotential", value: 78, weight: 0.1 },
      { dimension: "learningValue", value: 70, weight: 0.08 },
      { dimension: "innovationValue", value: 72, weight: 0.08 },
    ],
  },
];

export const SPARK_SAMPLE_RECOMMENDATIONS: SparkRecommendation[] = [
  {
    id: "rec-cursor-spark-bridge",
    title: "Cursor build: wire Founder services through SPARK bridge only",
    summary:
      "Use lib/founder/services/sparkBridge.ts — do not duplicate pattern or scoring logic in Founder UI.",
    priorityId: "pri-restart-intelligence",
    preparedFor: "founder",
    category: "operations",
    tags: ["cursor", "architecture"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 90),
    evidenceIds: ["ev-strategy-001"],
  },
  {
    id: "rec-postcraft-nurture",
    title: "PostCraft → GHL nurture: Gentle Restart sequence",
    summary:
      "Campaign educates on re-entry; GHL workflow measures completion and feeds SPARK.",
    priorityId: "pri-postcraft-campaign",
    preparedFor: "postcraft",
    category: "content",
    tags: ["postcraft", "ghl", "nurture"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("medium", 70),
    evidenceIds: ["ev-restart-001"],
  },
  {
    id: "rec-companion-listening",
    title: "Surface Listening Rooms when restart signals detected",
    summary: "Companion consumes SPARK pattern pat-restart-001 — no new intelligence in Companion.",
    preparedFor: "companion",
    category: "product",
    tags: ["companion", "listening-rooms"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 81),
    evidenceIds: ["ev-listening-001"],
  },
];

export const SPARK_SAMPLE_OPPORTUNITIES: SparkOpportunity[] = [
  {
    id: "opp-ecosystem-spark",
    title: "Single SPARK consumption layer across products",
    summary: "Founder, Companion, PostCraft, Team Hub share observe/score/prioritize APIs.",
    category: "innovation",
    tags: ["spark", "ecosystem"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 89),
    scores: [
      { dimension: "strategicValue", value: 94, weight: 0.14 },
      { dimension: "productImportance", value: 90, weight: 0.12 },
    ],
  },
];

export const SPARK_SAMPLE_RISKS: SparkRisk[] = [
  {
    id: "risk-duplicate-intelligence",
    title: "Per-product intelligence duplication",
    summary: "Without SPARK, each screen rebuilds patterns, scoring, and relationships.",
    severity: "medium",
    category: "operations",
    tags: ["architecture"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    confidence: conf("high", 83),
  },
];

export const SPARK_SAMPLE_KNOWLEDGE: SparkKnowledgeItem[] = [
  {
    id: "know-listening-rooms",
    title: "Listening Rooms — calm re-entry estate space",
    summary: "Estate place for focus and gentle return without productivity pressure.",
    category: "product",
    sourceId: "src-companion",
    tags: ["listening-rooms", "estate"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    memoryRefIds: ["mem-listening-001"],
  },
  {
    id: "know-decision-compass",
    title: "Decision Compass — executive framing tool",
    summary: "Helps Shari see alternatives before committing in Founder Studio.",
    category: "executive",
    sourceId: "src-founder",
    tags: ["decision-compass"],
    createdAt: TS,
    updatedAt: TS,
    status: "active",
    memoryRefIds: ["mem-decision-001"],
  },
];

export const SPARK_SAMPLE_MEMORY_REFS: SparkMemoryReference[] = [
  {
    id: "mem-listening-001",
    kind: "knowledge",
    entityId: "know-listening-rooms",
    title: "Listening Rooms canon",
    summary: "Estate cognitive space for calm re-entry.",
    productScope: "companion",
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: "mem-decision-001",
    kind: "knowledge",
    entityId: "know-decision-compass",
    title: "Decision Compass reference",
    summary: "Founder executive framing capability.",
    productScope: "founder",
    createdAt: TS,
    updatedAt: TS,
  },
];

/** Knowledge graph: research → insight → recommendation → feature → campaign → workflow → result → recommendation */
export const SPARK_SAMPLE_GRAPH_NODES: SparkGraphNode[] = [
  { id: "node-research-restart", kind: "finding", label: "ADHD restart research" },
  { id: "node-insight-reentry", kind: "finding", label: "Gentle re-entry insight" },
  { id: "node-rec-listening", kind: "recommendation", label: "Listening Rooms recommendation" },
  { id: "node-feature-restart", kind: "knowledge", label: "Restart intelligence feature" },
  { id: "node-campaign-restart", kind: "knowledge", label: "Gentle Restart PostCraft campaign" },
  { id: "node-ghl-nurture", kind: "knowledge", label: "GHL nurture sequence" },
  { id: "node-result-completion", kind: "finding", label: "Member completed re-entry flow" },
  { id: "node-rec-future", kind: "recommendation", label: "Future nurture optimization" },
  { id: "node-strategy-decision", kind: "knowledge", label: "Executive Strategy Center decision" },
];

export const SPARK_SAMPLE_GRAPH_EDGES: SparkGraphEdge[] = [
  {
    id: "edge-research-insight",
    fromId: "node-research-restart",
    toId: "node-insight-reentry",
    relationship: "derived_from",
  },
  {
    id: "edge-insight-rec",
    fromId: "node-insight-reentry",
    toId: "node-rec-listening",
    relationship: "influences",
  },
  {
    id: "edge-rec-feature",
    fromId: "node-rec-listening",
    toId: "node-feature-restart",
    relationship: "supports",
  },
  {
    id: "edge-feature-campaign",
    fromId: "node-feature-restart",
    toId: "node-campaign-restart",
    relationship: "extends",
  },
  {
    id: "edge-campaign-ghl",
    fromId: "node-campaign-restart",
    toId: "node-ghl-nurture",
    relationship: "generated",
  },
  {
    id: "edge-ghl-result",
    fromId: "node-ghl-nurture",
    toId: "node-result-completion",
    relationship: "related_to",
  },
  {
    id: "edge-result-future",
    fromId: "node-result-completion",
    toId: "node-rec-future",
    relationship: "influences",
  },
  {
    id: "edge-strategy-feature",
    fromId: "node-strategy-decision",
    toId: "node-feature-restart",
    relationship: "requires",
  },
];

export const SPARK_SAMPLE_CONNECTIONS: SparkConnection[] = [
  {
    id: "rel-restart-pattern",
    fromKind: "signal",
    fromId: "sig-restart-001",
    toKind: "pattern",
    toId: "pat-restart-001",
    relationship: "supports",
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: "conn-research-finding",
    fromKind: "finding",
    fromId: "find-restart-001",
    toKind: "pattern",
    toId: "pat-restart-001",
    relationship: "supports",
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: "conn-postcraft-ghl",
    fromKind: "recommendation",
    fromId: "rec-postcraft-nurture",
    toKind: "knowledge",
    toId: "node-ghl-nurture",
    relationship: "generated",
    createdAt: TS,
    updatedAt: TS,
  },
];
