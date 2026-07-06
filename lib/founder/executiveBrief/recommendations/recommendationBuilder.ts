import type {
  ExecutiveBriefItemCore,
  ExecutiveOpportunity,
  ExecutiveRecommendation,
  ExecutiveRisk,
} from "../types";
import { buildExecutiveExplanation } from "../explanations/explanationBuilder";
import { buildExecutiveLearning } from "../explanations/explanationBuilder";
import { evidenceForMission, evidenceForResearch } from "../explanations/evidenceHelpers";
import { priorityFromScore } from "../presentation/priorityPresentation";
import { timeSensitivityFromUrgency } from "../presentation/timeSensitivity";

function baseItem(
  partial: Omit<ExecutiveBriefItemCore, "explanation"> & {
    explanation?: ExecutiveBriefItemCore["explanation"];
  },
): ExecutiveBriefItemCore {
  return {
    ...partial,
    explanation:
      partial.explanation ??
      buildExecutiveExplanation({
        title: partial.title,
        whatHappened: partial.simpleExplanation,
        whyItMatters: partial.whyItMatters,
        recommendedAction: partial.recommendedAction,
        actionKind: "keep-watching",
        connections: ["founder", "spark"],
        sparkEffect: partial.howItAffectsSpark,
        businessEffect: partial.businessExplanation,
      }),
  };
}

export const SAMPLE_EXECUTIVE_OPPORTUNITIES: ExecutiveOpportunity[] = [
  {
    kind: "opportunity",
    ...baseItem({
      id: "eo-listening-rooms",
      title: "Own calm restart for ADHD entrepreneurs",
      simpleExplanation: "Nobody else offers an estate re-entry that feels like home.",
      businessExplanation: "Category leadership before competitors copy calm planners.",
      whyItMatters: "This is the story members repeat to friends.",
      howItAffectsSpark: "Listening Rooms proves Spark is a place, not an app.",
      recommendedAction: "Build now — protect mission time this week.",
      priority: priorityFromScore(91),
      estimatedImpact: "High retention and word of mouth",
      timeSensitivity: timeSensitivityFromUrgency(88),
      relatedMissionIds: ["listening-rooms"],
      relatedResearchIds: ["res-adhd-restart"],
      evidence: [evidenceForResearch("res-adhd-restart", "Restart research", "Shame-free return wins.")],
      explanation: buildExecutiveExplanation({
        title: "Listening Rooms",
        whatHappened: "Research and member voice align on restart pain.",
        whyItMatters: "First return is the make-or-break moment.",
        recommendedAction: "Continue building Listening Rooms.",
        actionKind: "build-now",
        connections: ["companion", "member-experience", "revenue", "marketing"],
        sparkEffect: "Estate beauty carries the emotional load.",
        businessEffect: "Retention improves every downstream offer.",
      }),
    }),
  },
  {
    kind: "opportunity",
    ...baseItem({
      id: "eo-workshop-fatigue",
      title: "Decision Fatigue Workshop demand",
      simpleExplanation: "Members keep asking for help choosing without shame.",
      businessExplanation: "Workshop revenue plus content pipeline for PostCraft.",
      whyItMatters: "Chooses the next offer ladder step after restart.",
      howItAffectsSpark: "Shows Spark helps decisions, not just feelings.",
      recommendedAction: "Add to roadmap — outline after restart scene ships.",
      priority: priorityFromScore(78),
      estimatedImpact: "Medium revenue; high trust",
      timeSensitivity: timeSensitivityFromUrgency(55),
      relatedMissionIds: ["workshop-series"],
      relatedResearchIds: [],
      evidence: [
        {
          id: "ev-customer-workshop",
          kind: "customer-request",
          title: "Workshop interest forms",
          plainSummary: "Decision fatigue mentioned in recent interest forms.",
        },
      ],
      explanation: buildExecutiveExplanation({
        title: "Workshop",
        whatHappened: "Repeated requests for choosing support.",
        whyItMatters: "Members ready to act once restart feels safe.",
        recommendedAction: "Create a workshop outline in Strategy Center.",
        actionKind: "create-workshop",
        connections: ["revenue", "marketing", "member-experience"],
        sparkEffect: "Live transformation deepens belonging.",
        businessEffect: "Workshop feeds courses and nurture.",
      }),
    }),
  },
];

export const SAMPLE_EXECUTIVE_RISKS: ExecutiveRisk[] = [
  {
    kind: "risk",
    severity: "medium",
    ...baseItem({
      id: "er-mobile-perf",
      title: "Mobile estate scenes need discipline",
      simpleExplanation: "Beautiful full-bleed rooms can feel slow on older phones.",
      businessExplanation: "First impression on mobile must stay calm, not sluggish.",
      whyItMatters: "Many members live on phones during overwhelm.",
      howItAffectsSpark: "Performance is part of hospitality.",
      recommendedAction: "Research further — one lazy-load review this month.",
      priority: priorityFromScore(62),
      estimatedImpact: "Medium — affects first return experience",
      timeSensitivity: timeSensitivityFromUrgency(50),
      relatedMissionIds: ["listening-rooms", "estate"],
      relatedResearchIds: [],
      evidence: [
        {
          id: "ev-tech-mobile",
          kind: "technology",
          title: "Estate mobile review",
          plainSummary: "Multiple scenes need lazy load checklist.",
        },
      ],
      explanation: buildExecutiveExplanation({
        title: "Mobile performance",
        whatHappened: "Tech review flagged scene weight on mobile.",
        whyItMatters: "Slow loads feel like failure to ADHD members.",
        recommendedAction: "Keep watching — schedule architecture review.",
        actionKind: "research-further",
        connections: ["companion", "member-experience", "product-development"],
        sparkEffect: "Calm must include speed.",
        businessEffect: "Protects conversion on nurture clicks.",
      }),
    }),
  },
];

export const SAMPLE_EXECUTIVE_RECOMMENDATIONS: ExecutiveRecommendation[] = [
  {
    kind: "recommendation",
    ...baseItem({
      id: "rec-ghl-automation",
      title: "Automate GHL logistics, not belonging",
      simpleExplanation: "Let GoHighLevel handle timing; Spark handles relationship.",
      businessExplanation: "Could save several hours weekly on manual nurture steps.",
      whyItMatters: "Frees you for mission work without harming voice.",
      howItAffectsSpark: "Spec 118 — hidden work stays invisible.",
      recommendedAction: "Approve nurture when scene screenshots exist.",
      priority: priorityFromScore(71),
      estimatedImpact: "3–5 hours saved weekly",
      timeSensitivity: timeSensitivityFromUrgency(45),
      relatedMissionIds: ["marketing-launch"],
      relatedResearchIds: [],
      evidence: [
        {
          id: "ev-ghl-auto",
          kind: "analytics",
          title: "GHL draft ready",
          plainSummary: "Sequence awaits content approval gate.",
          refId: "gentle-restart",
        },
      ],
      learning: buildExecutiveLearning({
        title: "Automation boundary",
        simple: "Automate logistics, not love.",
        detail: "Members should never feel processed by funnels.",
        why: "Trust is the product.",
        sparkUse: "Silent organization behind conversation.",
        problem: "Manual nurture steals founder hours.",
      }),
    }),
  },
];

export function listSampleOpportunities(): ExecutiveOpportunity[] {
  return [...SAMPLE_EXECUTIVE_OPPORTUNITIES];
}

export function listSampleRisks(): ExecutiveRisk[] {
  return [...SAMPLE_EXECUTIVE_RISKS];
}

export function listSampleRecommendations(): ExecutiveRecommendation[] {
  return [...SAMPLE_EXECUTIVE_RECOMMENDATIONS];
}
