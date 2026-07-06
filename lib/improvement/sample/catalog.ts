import type { ImprovementEvidence, ImprovementExperiment, ImprovementHistory, ImprovementMetric, ImprovementObservation, ImprovementOutcome, ImprovementRecommendation, ImprovementRelationship, ImprovementReview } from "../types";
import { SAMPLE_IMPROVEMENT_OPPORTUNITIES } from "./opportunities";

export { SAMPLE_IMPROVEMENT_EVIDENCE, SAMPLE_IMPROVEMENT_OPPORTUNITIES, buildSampleRoi } from "./opportunities";

export const SAMPLE_IMPROVEMENT_OBSERVATIONS: ImprovementObservation[] = [
  {
    id: "obs-approval-scatter",
    category: "founder_studio",
    whatIsHappening: "Launch approvals arrive without prepared context.",
    whyIsHappening: "No single daily approval ritual.",
    evidence: [
      {
        id: "iev-approval-queue",
        label: "Approval queue",
        summary: "Three initiatives waiting more than 48 hours.",
        source: "executive_orchestrator",
      },
    ],
    rootCause: "Approvals are reactive, not batched.",
    symptoms: ["Delayed launches", "Repeated context rebuilding"],
    possibleSolutions: ["Daily approval block", "Overnight packets"],
    recommendedSolution: "One prepared approval packet per morning.",
    suggestedAction: "improve",
    missionId: "listening-rooms",
    observedAt: "2026-07-06T08:00:00.000Z",
  },
];

export const SAMPLE_IMPROVEMENT_RECOMMENDATIONS: ImprovementRecommendation[] = [
  {
    id: "rec-approval-packets",
    opportunityId: "imp-approval-packets",
    title: "Batch morning approvals",
    recommendation: "Review one prepared packet after the Executive Brief — defer the rest.",
    action: "improve",
    priority: "high",
    roi: SAMPLE_IMPROVEMENT_OPPORTUNITIES[0].roi,
    evidenceIds: ["iev-approval-queue", "iev-brief-planning"],
    rationale: "Evidence shows brief-first planning and batched approvals restore momentum.",
  },
  {
    id: "rec-gentle-onboarding",
    opportunityId: "imp-gentle-onboarding",
    title: "Audio-first welcome",
    recommendation: "Offer welcome audio before any feature tour — permission only.",
    action: "improve",
    priority: "high",
    roi: SAMPLE_IMPROVEMENT_OPPORTUNITIES[1].roi,
    evidenceIds: ["iev-onboarding-drop"],
    rationale: "Institutional memory links welcome-first to better restart behavior.",
  },
];

export const SAMPLE_IMPROVEMENT_EXPERIMENTS: ImprovementExperiment[] = [
  {
    id: "exp-gentle-restart-pilot",
    title: "Gentle Restart automation pilot",
    category: "automation",
    hypothesis: "Prepared restart sequences reduce founder manual follow-up.",
    change: "Overnight prepares restart drafts — nothing sends until approval.",
    status: "running",
    lessons: ["Members respond to calm copy", "Approval gate is essential"],
    missionId: "listening-rooms",
    institutionalMemoryId: "mem-gentle-restart-campaign",
    startedAt: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "exp-onboarding-audio",
    title: "Welcome audio before tour",
    category: "onboarding",
    hypothesis: "Audio-first arrival improves 48-hour return.",
    change: "Replace feature grid with one welcome audio invitation.",
    status: "completed",
    result: "48-hour return improved in sample cohort.",
    lessons: ["Relationship before features", "Keep choices to one invitation"],
    recommendation: "Roll out quietly — monitor, do not announce.",
    startedAt: "2026-05-01T00:00:00.000Z",
    completedAt: "2026-06-01T00:00:00.000Z",
    institutionalMemoryId: "mem-lesson-welcome-first",
  },
  {
    id: "exp-listening-room-ui",
    title: "Listening Rooms calm surface",
    category: "listening_rooms",
    hypothesis: "Fewer competing controls increase session completion.",
    change: "Hide secondary chrome during capture sessions.",
    status: "planned",
    lessons: [],
    missionId: "listening-rooms",
  },
];

export const SAMPLE_IMPROVEMENT_REVIEWS: ImprovementReview[] = [
  {
    id: "rev-weekly-2026-w27",
    kind: "weekly",
    title: "Weekly Improvement Review",
    periodLabel: "Week 27 · 2026",
    generatedAt: "2026-07-06T07:00:00.000Z",
    whatWorked: ["Morning strategy blocks", "Listening Rooms focus sessions", "Tuesday research synthesis"],
    whatDidNotWork: ["Afternoon long-form writing", "Scattered approval requests"],
    slowingDown: ["Approval queue without packets", "Mid-day context switching"],
    simplify: ["One mission on the desk", "One decision per day"],
    eliminate: ["Competing NOW items after noon"],
    automate: ["Overnight approval packet prep", "Gentle restart draft preparation"],
    delegate: ["Team Hub packets from orchestrator output"],
    improve: ["Audio-first onboarding", "Outline-before-record in PostCraft"],
    opportunityIds: ["imp-approval-packets", "imp-gentle-onboarding", "imp-mission-focus"],
    experimentIds: ["exp-gentle-restart-pilot", "exp-onboarding-audio"],
  },
];

export const SAMPLE_IMPROVEMENT_RELATIONSHIPS: ImprovementRelationship[] = [
  {
    id: "rel-obs-approval-opp",
    fromId: "obs-approval-scatter",
    toId: "imp-approval-packets",
    kind: "supports",
    reason: "Observation evidence supports approval packet opportunity.",
  },
  {
    id: "rel-exp-onboarding-rec",
    fromId: "exp-onboarding-audio",
    toId: "rec-gentle-onboarding",
    kind: "validates",
    reason: "Completed experiment validates onboarding recommendation.",
  },
  {
    id: "rel-opp-mission-exp",
    fromId: "imp-mission-focus",
    toId: "exp-listening-room-ui",
    kind: "experiment_for",
    reason: "Mission focus opportunity drives planned room experiment.",
  },
];

export const SAMPLE_IMPROVEMENT_HISTORY: ImprovementHistory[] = [
  {
    id: "hist-1",
    improvementId: "imp-approval-packets",
    event: "Identified from orchestrator waiting-on pattern.",
    occurredAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "hist-2",
    improvementId: "imp-gentle-onboarding",
    event: "Linked to institutional memory mem-lesson-welcome-first.",
    occurredAt: "2026-06-20T10:00:00.000Z",
    actor: "overnight_cycle",
  },
];

export const SAMPLE_IMPROVEMENT_OUTCOMES: ImprovementOutcome[] = [
  {
    id: "out-exp-onboarding",
    improvementId: "exp-onboarding-audio",
    whatWorked: ["Audio-first invitation", "Single choice"],
    whatDidNotWork: ["Feature tour as default"],
    lessons: ["Welcome before orientation"],
    recordedAt: "2026-06-01T12:00:00.000Z",
    institutionalMemoryId: "mem-lesson-welcome-first",
  },
];

export const SAMPLE_IMPROVEMENT_METRICS: ImprovementMetric[] = [
  {
    id: "met-approval-time",
    label: "Approval queue time",
    category: "operations",
    baseline: "72 hours average",
    target: "24 hours",
    current: "48 hours",
    unit: "hours",
  },
  {
    id: "met-onboarding-return",
    label: "48-hour return rate",
    category: "onboarding",
    baseline: "42%",
    target: "55%",
    current: "48%",
    unit: "percent",
  },
];
