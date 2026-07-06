import type { FounderAlert, FounderAlertDomain } from "../types";
import { buildExecutiveExplanation } from "../explanations/explanationBuilder";
import { evidenceForMission, evidenceForResearch } from "../explanations/evidenceHelpers";
import { priorityFromScore } from "../presentation/priorityPresentation";
import { buildExecutiveLearning } from "../explanations/explanationBuilder";

export const SAMPLE_FOUNDER_ALERTS: FounderAlert[] = [
  {
    kind: "founder-alert",
    appearsFirst: true,
    domains: ["member-success", "companion", "spark"],
    id: "fa-listening-rooms-restart",
    title: "Members need a shame-free way back after absence",
    simpleExplanation:
      "People are returning overwhelmed. They do not want a lecture or a to-do list — they want to feel welcome again.",
    businessExplanation:
      "Retention and nurture convert better when restart feels human. This is the heart of the Gentle Restart story.",
    whyItMatters:
      "If we get restart wrong, members leave before they see Spark's value.",
    howItAffectsSpark:
      "Listening Rooms becomes the proof that Spark is a companion, not software.",
    recommendedAction: "Continue Listening Rooms — review today's estate scene.",
    priority: priorityFromScore(94),
    estimatedImpact: "High trust and retention across the member journey",
    timeSensitivity: "today",
    relatedMissionIds: ["listening-rooms"],
    relatedResearchIds: ["res-adhd-restart"],
    evidence: [
      evidenceForResearch(
        "res-adhd-restart",
        "ADHD restart research",
        "124 items reviewed; shame-free return beats streak recovery.",
      ),
      evidenceForMission("listening-rooms", "Listening Rooms mission"),
    ],
    explanation: buildExecutiveExplanation({
      title: "Restart pain",
      whatHappened:
        "Members describe guilt and paralysis when they come back after time away.",
      whyItMatters: "This is the emotional door to everything else we build.",
      recommendedAction: "Keep Listening Rooms as today's primary mission.",
      actionKind: "build-now",
      connections: ["companion", "member-experience", "marketing", "revenue"],
      sparkEffect: "Estate re-entry shows belonging before productivity.",
      businessEffect: "Better returns improve nurture and workshop conversion.",
    }),
    learning: buildExecutiveLearning({
      title: "Restart",
      simple: "People need welcome before work.",
      detail: "ADHD entrepreneurs often abandon tools that make them feel behind.",
      why: "Belonging restores the courage to plan again.",
      sparkUse: "A calm room with Spark present — no tasks on arrival.",
      problem: "Shame after absence kills momentum.",
    }),
  },
  {
    kind: "founder-alert",
    appearsFirst: true,
    domains: ["revenue", "marketing", "operations"],
    id: "fa-ghl-nurture-ready",
    title: "Gentle Restart nurture is ready — waiting on one visual proof",
    simpleExplanation:
      "The email sequence is drafted. It should not send until Listening Rooms looks real in a screenshot.",
    businessExplanation:
      "Launching nurture before the scene is ready breaks trust with both members and your own story.",
    whyItMatters: "Marketing promises must match what members experience.",
    howItAffectsSpark: "Protects the companion relationship from feeling like a funnel.",
    recommendedAction: "Hold GHL send until Photograph Test passes.",
    priority: priorityFromScore(82),
    estimatedImpact: "Protects conversion quality; saves rework",
    timeSensitivity: "this-week",
    relatedMissionIds: ["marketing-launch", "listening-rooms"],
    relatedResearchIds: [],
    evidence: [
      {
        id: "ev-ghl-gentle-restart",
        kind: "analytics",
        title: "GHL draft status",
        plainSummary: "Sequence drafted; approval gate not met.",
        refId: "gentle-restart",
      },
    ],
    explanation: buildExecutiveExplanation({
      title: "Nurture timing",
      whatHappened: "Automation prep finished while estate art is still in QA.",
      whyItMatters: "Members should never feel processed before welcomed.",
      recommendedAction: "Approve sends only when scene assets exist.",
      actionKind: "keep-watching",
      connections: ["gohighlevel", "marketing", "revenue"],
      sparkEffect: "Hidden work stays invisible; surface stays calm.",
      businessEffect: "Higher quality leads when visuals match promise.",
    }),
  },
];

export function listFounderAlerts(): FounderAlert[] {
  return [...SAMPLE_FOUNDER_ALERTS];
}

export function founderAlertsForDomains(domains: FounderAlertDomain[]): FounderAlert[] {
  return SAMPLE_FOUNDER_ALERTS.filter((a) =>
    a.domains.some((d) => domains.includes(d)),
  );
}

export function sortFounderAlertsFirst<T extends { kind?: string }>(
  items: T[],
  founderAlerts: FounderAlert[],
): (FounderAlert | T)[] {
  return [...founderAlerts, ...items];
}
