import type {
  SparkAction,
  SparkConfidence,
  SparkConfidenceLevel,
  SparkEvidence,
  SparkFinding,
  SparkGraphEdge,
  SparkGraphNode,
  SparkInsight,
  SparkKnowledge,
  SparkMemoryReference,
  SparkObservation,
  SparkOpportunity,
  SparkPattern,
  SparkPriority,
  SparkQuestion,
  SparkRecommendation,
  SparkRisk,
  SparkSignal,
  SparkSource,
  SparkTheme,
  SparkTrend,
} from "../../types";

const conf = (level: SparkConfidenceLevel, score: number): SparkConfidence => ({
  level,
  score,
});

export const SPARK_SAMPLE_SOURCES: SparkSource[] = [
  {
    id: "src-companion",
    name: "Companion Conversations",
    category: "member-signals",
    productScope: "companion",
  },
  {
    id: "src-founder",
    name: "Founder Executive Notes",
    category: "executive",
    productScope: "founder",
  },
  {
    id: "src-postcraft",
    name: "PostCraft Campaigns",
    category: "content",
    productScope: "postcraft",
  },
  {
    id: "src-research",
    name: "Research Library",
    category: "research",
    productScope: "ecosystem",
  },
];

export const SPARK_SAMPLE_SIGNALS: SparkSignal[] = [
  {
    id: "sig-001",
    sourceId: "src-companion",
    title: "Members ask for calmer onboarding",
    summary: "Repeated language about overwhelm during first-week setup.",
    category: "customer",
    observedAt: "2026-07-01T10:00:00.000Z",
    confidence: conf("high", 0.82),
  },
  {
    id: "sig-002",
    sourceId: "src-founder",
    title: "Executive focus on Decision Vault continuity",
    summary: "Founder sessions reference preserving strategic decisions across quarters.",
    category: "operations",
    observedAt: "2026-07-02T14:30:00.000Z",
    confidence: conf("high", 0.88),
  },
  {
    id: "sig-003",
    sourceId: "src-postcraft",
    title: "Workshop-to-course funnel interest",
    summary: "Campaign engagement rises when workshop outcomes are named explicitly.",
    category: "revenue",
    observedAt: "2026-07-03T09:15:00.000Z",
    confidence: conf("medium", 0.71),
  },
  {
    id: "sig-004",
    sourceId: "src-research",
    title: "ADHD executive function framing resonates",
    summary: "Research notes align with member language in Companion sessions.",
    category: "learning",
    observedAt: "2026-07-04T11:00:00.000Z",
    confidence: conf("medium", 0.76),
  },
];

export const SPARK_SAMPLE_OBSERVATIONS: SparkObservation[] = [
  {
    id: "obs-001",
    signalId: "sig-001",
    summary: "Three unrelated members used calm-home language within one week.",
    recordedAt: "2026-07-01T12:00:00.000Z",
    confidence: conf("high", 0.8),
  },
  {
    id: "obs-002",
    signalId: "sig-002",
    summary: "Decision Vault searches cluster around pricing and positioning choices.",
    recordedAt: "2026-07-02T16:00:00.000Z",
    confidence: conf("medium", 0.74),
  },
  {
    id: "obs-003",
    signalId: "sig-003",
    summary: "PostCraft drafts referencing workshop outcomes outperform generic hooks.",
    recordedAt: "2026-07-03T10:00:00.000Z",
    confidence: conf("medium", 0.69),
  },
];

export const SPARK_SAMPLE_THEMES: SparkTheme[] = [
  {
    id: "theme-calm-onboarding",
    title: "Calm First Impression",
    summary: "Reduce cognitive load at arrival without sacrificing depth.",
    patternIds: ["pat-001"],
  },
  {
    id: "theme-continuity",
    title: "Executive Continuity",
    summary: "Strategic memory should travel across Founder sessions and products.",
    patternIds: ["pat-002"],
  },
];

export const SPARK_SAMPLE_PATTERNS: SparkPattern[] = [
  {
    id: "pat-001",
    title: "Overwhelm at onboarding",
    summary: "Member signals repeat calm-home and orientation language.",
    themeId: "theme-calm-onboarding",
    signalIds: ["sig-001", "sig-004"],
    confidence: conf("high", 0.84),
    detectedAt: "2026-07-04T08:00:00.000Z",
  },
  {
    id: "pat-002",
    title: "Decision lineage matters",
    summary: "Founder and research signals both emphasize durable decision memory.",
    themeId: "theme-continuity",
    signalIds: ["sig-002"],
    confidence: conf("medium", 0.77),
    detectedAt: "2026-07-04T08:30:00.000Z",
  },
];

export const SPARK_SAMPLE_EVIDENCE: SparkEvidence[] = [
  {
    id: "ev-001",
    label: "Companion session cluster",
    sourceId: "src-companion",
    excerpt: "Members describe first week as busy rather than welcoming.",
  },
  {
    id: "ev-002",
    label: "Founder strategy note",
    sourceId: "src-founder",
    excerpt: "Pricing decision from Q2 should inform Q3 workshop positioning.",
  },
];

export const SPARK_SAMPLE_PRIORITIES: SparkPriority[] = [
  {
    id: "pri-001",
    title: "Strengthen calm arrival intelligence",
    summary: "Unify arrival signals across Companion and Founder without new UI.",
    compositeScore: 0.81,
    confidence: conf("high", 0.85),
    evidenceIds: ["ev-001"],
    scores: [
      { dimension: "strategic-value", value: 0.82, weight: 0.14 },
      { dimension: "customer-impact", value: 0.9, weight: 0.14 },
      { dimension: "product-importance", value: 0.78, weight: 0.12 },
      { dimension: "urgency", value: 0.65, weight: 0.1 },
    ],
  },
  {
    id: "pri-002",
    title: "Connect workshop outcomes to campaigns",
    summary: "Lineage from workshop → course → PostCraft should be traceable in SPARK.",
    compositeScore: 0.74,
    confidence: conf("medium", 0.72),
    evidenceIds: ["ev-002"],
    scores: [
      { dimension: "revenue-potential", value: 0.8, weight: 0.1 },
      { dimension: "learning-value", value: 0.7, weight: 0.08 },
      { dimension: "innovation", value: 0.68, weight: 0.08 },
    ],
  },
];

export const SPARK_SAMPLE_RECOMMENDATIONS: SparkRecommendation[] = [
  {
    id: "rec-001",
    title: "Prepare arrival intelligence brief",
    summary: "Bundle top calm-onboarding signals for FLAME and Concierge consumers.",
    priorityId: "pri-001",
    preparedFor: "founder",
    confidence: conf("high", 0.83),
    evidenceIds: ["ev-001"],
  },
  {
    id: "rec-002",
    title: "Map workshop-to-campaign lineage",
    summary: "Register PostCraft campaign nodes in the knowledge graph.",
    priorityId: "pri-002",
    preparedFor: "postcraft",
    confidence: conf("medium", 0.7),
    evidenceIds: ["ev-002"],
  },
];

export const SPARK_SAMPLE_OPPORTUNITIES: SparkOpportunity[] = [
  {
    id: "opp-001",
    title: "Unified SPARK consumption layer",
    summary: "Products share scoring and pattern engines instead of duplicating logic.",
    confidence: conf("high", 0.86),
    scores: [
      { dimension: "strategic-value", value: 0.92, weight: 0.14 },
      { dimension: "product-importance", value: 0.88, weight: 0.12 },
    ],
  },
];

export const SPARK_SAMPLE_RISKS: SparkRisk[] = [
  {
    id: "risk-001",
    title: "Fragmented intelligence per product",
    summary: "Without SPARK, each screen rebuilds pattern and scoring logic.",
    severity: "medium",
    confidence: conf("high", 0.8),
  },
];

export const SPARK_SAMPLE_FINDINGS: SparkFinding[] = [
  {
    id: "find-001",
    title: "Orientation before action",
    summary: "Members respond when next step is obvious within one exchange.",
    category: "customer",
    signalId: "sig-001",
    confidence: conf("high", 0.81),
  },
];

export const SPARK_SAMPLE_INSIGHTS: SparkInsight[] = [
  {
    id: "ins-001",
    title: "Continuity is a product feature",
    summary: "Memory and lineage increase trust more than new dashboards.",
    themeId: "theme-continuity",
    confidence: conf("medium", 0.75),
    discoveredAt: "2026-07-04T09:00:00.000Z",
  },
];

export const SPARK_SAMPLE_TRENDS: SparkTrend[] = [
  {
    id: "trend-001",
    title: "Executive memory systems",
    direction: "rising",
    summary: "Founder and ecosystem signals converge on durable decision graphs.",
    confidence: conf("medium", 0.73),
  },
];

export const SPARK_SAMPLE_ACTIONS: SparkAction[] = [
  {
    id: "act-001",
    title: "Register lineage nodes",
    summary: "Add workshop and campaign entities to the knowledge graph.",
    urgency: { dimension: "urgency", value: 0.6, weight: 0.1 },
  },
];

export const SPARK_SAMPLE_QUESTIONS: SparkQuestion[] = [
  {
    id: "q-001",
    question: "Which product should consume calm-arrival intelligence first?",
    context: "Multiple signals without a single routing owner.",
    confidence: conf("low", 0.55),
  },
];

export const SPARK_SAMPLE_KNOWLEDGE: SparkKnowledge[] = [
  {
    id: "know-001",
    title: "Spark Estate arrival principle",
    summary: "Beauty and orientation precede feature exposure.",
    category: "product",
    sourceId: "src-research",
    memoryRefIds: ["mem-001"],
  },
];

export const SPARK_SAMPLE_MEMORY_REFS: SparkMemoryReference[] = [
  {
    id: "mem-001",
    kind: "knowledge",
    entityId: "know-001",
    label: "Estate arrival canon",
    productScope: "ecosystem",
  },
];

/** Lineage chain: Research → Idea → Workshop → Course → Feature → PostCraft → GHL → Customer Result */
export const SPARK_SAMPLE_GRAPH_NODES: SparkGraphNode[] = [
  { id: "node-research-001", kind: "knowledge", label: "ADHD executive function research" },
  { id: "node-idea-001", kind: "finding", label: "Calm companion onboarding idea" },
  { id: "node-workshop-001", kind: "knowledge", label: "Spark Workshop: Calm Starts" },
  { id: "node-course-001", kind: "knowledge", label: "Companion Foundations Course" },
  { id: "node-feature-001", kind: "knowledge", label: "Arrival Intelligence" },
  { id: "node-postcraft-001", kind: "knowledge", label: "Welcome Home Campaign" },
  { id: "node-ghl-001", kind: "knowledge", label: "GHL nurture sequence" },
  { id: "node-result-001", kind: "finding", label: "Member calm-first week" },
];

export const SPARK_SAMPLE_GRAPH_EDGES: SparkGraphEdge[] = [
  { id: "edge-1", fromId: "node-research-001", toId: "node-idea-001", relationship: "informs" },
  { id: "edge-2", fromId: "node-idea-001", toId: "node-workshop-001", relationship: "evolved-from" },
  { id: "edge-3", fromId: "node-workshop-001", toId: "node-course-001", relationship: "enables" },
  { id: "edge-4", fromId: "node-course-001", toId: "node-feature-001", relationship: "supports" },
  { id: "edge-5", fromId: "node-feature-001", toId: "node-postcraft-001", relationship: "enables" },
  { id: "edge-6", fromId: "node-postcraft-001", toId: "node-ghl-001", relationship: "resulted-in" },
  { id: "edge-7", fromId: "node-ghl-001", toId: "node-result-001", relationship: "resulted-in" },
];
