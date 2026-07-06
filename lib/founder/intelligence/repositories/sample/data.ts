import type {
  FounderContentCandidate,
  FounderDecisionCandidate,
  FounderInsightCandidate,
  FounderIntelligenceArchiveRecord,
  FounderIntelligenceFinding,
  FounderIntelligenceInboxItem,
  FounderIntelligenceObservation,
  FounderIntelligenceSignal,
  FounderIntelligenceTimelineEvent,
  FounderOpportunityCandidate,
  FounderRecommendationCandidate,
  FounderReportCandidate,
} from "../../types";

const SAMPLE_SCORES_HIGH = {
  importance: 0.88,
  confidence: 0.82,
  urgency: 0.74,
  strategicValue: 0.86,
  revenuePotential: 0.62,
  innovationScore: 0.78,
  customerImpact: 0.91,
  implementationEffort: 0.45,
} as const;

const SAMPLE_SCORES_MEDIUM = {
  importance: 0.72,
  confidence: 0.76,
  urgency: 0.55,
  strategicValue: 0.68,
  revenuePotential: 0.58,
  innovationScore: 0.64,
  customerImpact: 0.7,
  implementationEffort: 0.52,
} as const;

export const SAMPLE_INTELLIGENCE_SIGNALS: readonly FounderIntelligenceSignal[] = [
  {
    id: "sig-001",
    sourceId: "companion",
    title: "Return pause before speaking",
    summary:
      "Members returning mid-task pause longer before their first message.",
    observedAt: "2026-07-05T07:12:00Z",
    status: "received",
  },
  {
    id: "sig-002",
    sourceId: "ux",
    title: "Conservatory dwell increase",
    summary: "Ocean Conservatory sessions lengthened after living-scene polish.",
    observedAt: "2026-07-05T06:40:00Z",
    status: "routed",
  },
  {
    id: "sig-003",
    sourceId: "development",
    title: "Founder pipeline module staged",
    summary: "Intelligence pipeline scaffolding ready for sample wiring.",
    observedAt: "2026-07-05T05:30:00Z",
    status: "processing",
  },
  {
    id: "sig-004",
    sourceId: "social-media",
    title: "Estate warmth post saved",
    summary: "LinkedIn draft on conversation-first onboarding gained saves.",
    observedAt: "2026-07-04T18:20:00Z",
    status: "received",
  },
  {
    id: "sig-005",
    sourceId: "founder-notes",
    title: "Listening Rooms priority",
    summary: "Shari noted atmosphere continuity as today's build emphasis.",
    observedAt: "2026-07-05T08:05:00Z",
    status: "routed",
  },
];

export const SAMPLE_INTELLIGENCE_OBSERVATIONS: readonly FounderIntelligenceObservation[] =
  [
    {
      id: "obs-001",
      signalId: "sig-001",
      sourceId: "companion",
      summary: "Three members returned within ten minutes and did not resume prior topic.",
      recordedAt: "2026-07-05T07:18:00Z",
    },
    {
      id: "obs-002",
      signalId: "sig-002",
      sourceId: "ux",
      summary: "Average session length increased without additional navigation taps.",
      recordedAt: "2026-07-05T06:45:00Z",
    },
  ];

export const SAMPLE_INTELLIGENCE_FINDINGS: readonly FounderIntelligenceFinding[] = [
  {
    id: "find-001",
    kind: "customer",
    signalId: "sig-001",
    sourceId: "companion",
    title: "Re-entry friction on return",
    summary: "Calm continuity matters more than surfacing unfinished tasks.",
    discoveredAt: "2026-07-05T07:25:00Z",
  },
  {
    id: "find-002",
    kind: "product",
    signalId: "sig-002",
    sourceId: "ux",
    title: "Living scenes support dwell",
    summary: "Subtle motion increases stay without dashboard distraction.",
    discoveredAt: "2026-07-05T06:50:00Z",
  },
  {
    id: "find-003",
    kind: "research",
    signalId: "sig-005",
    sourceId: "adhd-research",
    title: "Interruption recovery pattern",
    summary: "Entrepreneurs with ADHD benefit from one gentle orientation cue.",
    discoveredAt: "2026-07-05T08:15:00Z",
  },
  {
    id: "find-004",
    kind: "competitor",
    signalId: "sig-004",
    sourceId: "competitors",
    title: "Generic AI apps emphasize speed",
    summary: "Category messaging still leads with answers, not relationship.",
    discoveredAt: "2026-07-04T19:00:00Z",
  },
  {
    id: "find-005",
    kind: "analytics",
    signalId: "sig-003",
    sourceId: "development",
    title: "Pipeline architecture complete",
    summary: "Sample repositories wired — ready for SPARK without UI refactor.",
    discoveredAt: "2026-07-05T05:45:00Z",
  },
];

export const SAMPLE_INSIGHT_CANDIDATES: readonly FounderInsightCandidate[] = [
  {
    id: "ins-c-001",
    findingId: "find-001",
    title: "Welcome back without task pressure",
    summary: "Orientation copy should reduce shame and restore continuity.",
    scores: { ...SAMPLE_SCORES_HIGH },
    stage: "insight-candidate",
  },
  {
    id: "ins-c-002",
    findingId: "find-002",
    title: "Atmosphere before information",
    summary: "Estate scenes earn trust before any executive function demand.",
    scores: { ...SAMPLE_SCORES_MEDIUM },
    stage: "insight-candidate",
  },
];

export const SAMPLE_OPPORTUNITY_CANDIDATES: readonly FounderOpportunityCandidate[] = [
  {
    id: "opp-c-001",
    findingId: "find-004",
    title: "Premium cohort invitation",
    summary: "Position Spark as relationship continuity — not another AI tool.",
    scores: { ...SAMPLE_SCORES_MEDIUM, revenuePotential: 0.84 },
    stage: "opportunity-candidate",
  },
];

export const SAMPLE_DECISION_CANDIDATES: readonly FounderDecisionCandidate[] = [
  {
    id: "dec-c-001",
    findingId: "find-003",
    title: "Approve re-entry copy pass",
    summary: "One orientation sentence before conversation resumes.",
    scores: { ...SAMPLE_SCORES_HIGH, urgency: 0.81 },
    stage: "decision-candidate",
  },
];

export const SAMPLE_CONTENT_CANDIDATES: readonly FounderContentCandidate[] = [
  {
    id: "cnt-c-001",
    findingId: "find-002",
    title: "Thursday note — staying in conversation",
    summary: "One member story about returning without explaining everything again.",
    scores: { ...SAMPLE_SCORES_MEDIUM, innovationScore: 0.55 },
    stage: "content-candidate",
  },
];

export const SAMPLE_RECOMMENDATION_CANDIDATES: readonly FounderRecommendationCandidate[] =
  [
    {
      id: "rec-c-001",
      insightCandidateId: "ins-c-001",
      title: "Polish calm re-entry after interruption",
      summary: "Review Discover research, then approve one copy pass.",
      scores: { ...SAMPLE_SCORES_HIGH },
      stage: "recommendation-candidate",
    },
  ];

export const SAMPLE_REPORT_CANDIDATES: readonly FounderReportCandidate[] = [
  {
    id: "rep-c-001",
    recommendationCandidateId: "rec-c-001",
    title: "FIRE brief segment — Member Re-entry",
    summary: "Candidate section for tomorrow's executive portfolio.",
    scores: { ...SAMPLE_SCORES_HIGH, urgency: 0.68 },
    stage: "report-candidate",
  },
];

export const SAMPLE_INTELLIGENCE_ARCHIVES: readonly FounderIntelligenceArchiveRecord[] =
  [
    {
      id: "arc-001",
      reportCandidateId: "rep-c-000",
      title: "Architecture freeze decision",
      summary: "Observation Mode active — evolve from evidence only.",
      archivedAt: "2026-06-20T16:00:00Z",
      stage: "archive",
    },
  ];

export const SAMPLE_INBOX_ITEMS: readonly FounderIntelligenceInboxItem[] = [
  {
    id: "inbox-001",
    signalId: "sig-001",
    sourceId: "companion",
    title: "Return pause before speaking",
    summary: "Awaiting SPARK review — customer re-entry pattern.",
    status: "new",
    receivedAt: "2026-07-05T07:12:00Z",
  },
  {
    id: "inbox-002",
    signalId: "sig-004",
    sourceId: "social-media",
    title: "Estate warmth post performance",
    summary: "Saved draft — consider Grow workspace follow-up.",
    status: "needs-review",
    receivedAt: "2026-07-04T18:20:00Z",
  },
  {
    id: "inbox-003",
    signalId: "sig-002",
    sourceId: "ux",
    title: "Conservatory dwell increase",
    summary: "Accepted for Listening Rooms continuity work.",
    status: "accepted",
    receivedAt: "2026-07-05T06:40:00Z",
  },
  {
    id: "inbox-004",
    signalId: "sig-legacy",
    sourceId: "business",
    title: "Q2 positioning draft",
    summary: "Archived after strategy session — reference only.",
    status: "archived",
    receivedAt: "2026-06-15T10:00:00Z",
  },
];

export const SAMPLE_TIMELINE_EVENTS: readonly FounderIntelligenceTimelineEvent[] = [
  {
    id: "tl-001",
    type: "signal-received",
    title: "Companion signal — return pause",
    summary: "Re-entry friction observed across three sessions.",
    sourceId: "companion",
    occurredAt: "2026-07-05T07:12:00Z",
  },
  {
    id: "tl-002",
    type: "finding-recorded",
    title: "Customer finding — re-entry friction",
    summary: "Distilled from companion signal sig-001.",
    sourceId: "companion",
    occurredAt: "2026-07-05T07:25:00Z",
  },
  {
    id: "tl-003",
    type: "feature-completed",
    title: "FIRE executive portfolio shipped",
    summary: "Phase 3 briefing experience live on sample data.",
    sourceId: "development",
    occurredAt: "2026-07-05T04:00:00Z",
  },
  {
    id: "tl-004",
    type: "research-discovered",
    title: "ADHD interruption recovery pattern",
    summary: "One gentle orientation cue reduces restart cost.",
    sourceId: "adhd-research",
    occurredAt: "2026-07-05T08:15:00Z",
  },
  {
    id: "tl-005",
    type: "user-request",
    title: "Member asked for calmer return",
    summary: "Verbatim: I don't want to feel behind when I come back.",
    sourceId: "companion",
    occurredAt: "2026-07-04T14:30:00Z",
  },
  {
    id: "tl-006",
    type: "competitor-update",
    title: "Category emphasizes instant answers",
    summary: "Relationship positioning remains differentiated.",
    sourceId: "competitors",
    occurredAt: "2026-07-04T19:00:00Z",
  },
  {
    id: "tl-007",
    type: "workshop-created",
    title: "ADHD Business Clarity outline drafted",
    summary: "Creation Studio candidate — awaiting approval.",
    sourceId: "founder-notes",
    occurredAt: "2026-07-03T11:00:00Z",
  },
  {
    id: "tl-008",
    type: "idea-captured",
    title: "Intelligence pipeline architecture",
    summary: "Single path for all future ecosystem signals.",
    sourceId: "founder",
    occurredAt: "2026-07-05T05:00:00Z",
  },
];
