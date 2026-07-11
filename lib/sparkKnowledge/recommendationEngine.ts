/**
 * Shari Recommendation Engine — connect capabilities after member actions.
 * Complements Adaptive Intelligence anticipation chains.
 */

import { ANTICIPATION_CHAINS } from "@/lib/estateBrain/adaptiveIntelligence/preferenceRegistry";

export type RecommendationEvent =
  | "sop_completed"
  | "newsletter_completed"
  | "research_completed"
  | "launch_plan_completed"
  | "proposal_completed"
  | "course_completed"
  | "focus_session_completed"
  | "journal_entry_completed";

export type CapabilityRecommendation = {
  id: string;
  label: string;
  reason: string;
  relatedCapabilityIds: readonly string[];
};

const STATIC_CHAINS: Record<
  RecommendationEvent,
  readonly CapabilityRecommendation[]
> = {
  sop_completed: [
    {
      id: "sop-checklist",
      label: "Checklist",
      reason: "A printable checklist makes the SOP easy to follow day to day.",
      relatedCapabilityIds: ["create.checklist", "create.sop"],
    },
    {
      id: "sop-training",
      label: "Training Guide",
      reason: "If someone else will run this process, a training guide helps.",
      relatedCapabilityIds: ["create.training_manual", "create.guide"],
    },
    {
      id: "sop-operations",
      label: "Operations Manual",
      reason: "Multiple SOPs often belong in one operations manual.",
      relatedCapabilityIds: ["create.guide", "momentum.projects"],
    },
    {
      id: "sop-template",
      label: "Save as Template",
      reason: "Reuse this structure for similar processes later.",
      relatedCapabilityIds: ["create.template"],
    },
  ],
  newsletter_completed: [
    {
      id: "newsletter-subject",
      label: "Subject lines",
      reason: "Strong subject lines determine whether anyone opens it.",
      relatedCapabilityIds: ["create.email"],
    },
    {
      id: "newsletter-social",
      label: "Social posts",
      reason: "Pull quotes from the newsletter for social media.",
      relatedCapabilityIds: ["create.social_post"],
    },
    {
      id: "newsletter-cta",
      label: "Call to action",
      reason: "One clear next step increases replies and clicks.",
      relatedCapabilityIds: ["create.email", "business.marketing"],
    },
  ],
  research_completed: [
    {
      id: "research-mindmap",
      label: "Mind Map",
      reason: "Organize what you learned visually before acting on it.",
      relatedCapabilityIds: ["think.mind_map", "framework.mind-map"],
    },
    {
      id: "research-library",
      label: "Knowledge Library",
      reason: "Save findings so you never hunt for this research again.",
      relatedCapabilityIds: ["learn.library", "research.current"],
    },
    {
      id: "research-journal",
      label: "Journal reflection",
      reason: "Capture what this research means for your business.",
      relatedCapabilityIds: ["journal.reflect"],
    },
    {
      id: "research-project",
      label: "Project",
      reason: "Turn insights into a tracked initiative in Momentum.",
      relatedCapabilityIds: ["momentum.projects"],
    },
  ],
  launch_plan_completed: [
    {
      id: "launch-calendar",
      label: "Marketing Calendar",
      reason: "A calendar turns the plan into dated actions.",
      relatedCapabilityIds: ["momentum.marketing", "create.content_plan"],
    },
    {
      id: "launch-timeline",
      label: "Project Timeline",
      reason: "See dependencies and milestones at a glance.",
      relatedCapabilityIds: ["framework.roadmap", "momentum.projects"],
    },
    {
      id: "launch-content",
      label: "Content Plan",
      reason: "Map what to publish and when around the launch.",
      relatedCapabilityIds: ["create.content_plan", "create.social_post"],
    },
  ],
  proposal_completed: [
    {
      id: "proposal-cover",
      label: "Cover letter",
      reason: "A warm cover letter sets tone before the details.",
      relatedCapabilityIds: ["create.email", "create.proposal"],
    },
    {
      id: "proposal-timeline",
      label: "Timeline",
      reason: "Clients want to see when work happens.",
      relatedCapabilityIds: ["framework.roadmap"],
    },
    {
      id: "proposal-pricing",
      label: "Pricing summary",
      reason: "Clear pricing reduces back-and-forth.",
      relatedCapabilityIds: ["business.pricing", "create.proposal"],
    },
  ],
  course_completed: [
    {
      id: "course-workbook",
      label: "Workbook",
      reason: "Learners retain more with exercises and worksheets.",
      relatedCapabilityIds: ["create.workbook"],
    },
    {
      id: "course-slides",
      label: "Slides",
      reason: "Presentation slides support live or recorded delivery.",
      relatedCapabilityIds: ["create.presentation"],
    },
    {
      id: "course-checklist",
      label: "Learner checklist",
      reason: "A simple checklist keeps students on track.",
      relatedCapabilityIds: ["create.checklist"],
    },
  ],
  focus_session_completed: [
    {
      id: "focus-momentum",
      label: "Capture in Momentum",
      reason: "Turn what you accomplished into a next action.",
      relatedCapabilityIds: ["momentum.projects"],
    },
    {
      id: "focus-journal",
      label: "Quick journal note",
      reason: "Note what worked while it's fresh.",
      relatedCapabilityIds: ["journal.reflect"],
    },
  ],
  journal_entry_completed: [
    {
      id: "journal-project",
      label: "Start a project",
      reason: "Insights from reflection often become real work.",
      relatedCapabilityIds: ["momentum.projects"],
    },
    {
      id: "journal-create",
      label: "Create from insight",
      reason: "Turn a reflection into something shareable.",
      relatedCapabilityIds: ["create.document"],
    },
  ],
};

export function recommendationsForEvent(
  event: RecommendationEvent,
  limit = 3,
): CapabilityRecommendation[] {
  return [...(STATIC_CHAINS[event] ?? [])].slice(0, limit);
}

/** Adaptive anticipation line when preference confidence is known */
export function adaptiveAnticipationLine(
  event: RecommendationEvent,
  confidence: "low" | "medium" | "high",
): string | null {
  const chain = ANTICIPATION_CHAINS.find((c) => c.event === event);
  if (!chain) return null;
  return confidence === "high"
    ? chain.highConfidenceLine
    : chain.lowConfidenceLine;
}

export function formatRecommendationsForHint(
  event: RecommendationEvent,
): string | null {
  const recs = recommendationsForEvent(event, 3);
  if (recs.length === 0) return null;
  const lines = recs.map((r) => `• ${r.label} — ${r.reason}`);
  return [
    "SHARI RECOMMENDATIONS (offer at most ONE — permission first):",
    ...lines,
  ].join("\n");
}
