import type { ExecutiveInitiative, ExecutiveOutcome, ExecutiveReview } from "../types";
import { remember } from "@/lib/institutionalMemory";

export function reviewInitiative(initiative: ExecutiveInitiative): ExecutiveReview {
  if (initiative.review) return initiative.review;

  return {
    initiativeId: initiative.id,
    worked: initiative.outcome?.succeeded ?? "partial",
    surprised: initiative.outcome?.surprises ?? ["Review pending."],
    wouldRepeat: initiative.outcome ? initiative.outcome.succeeded === true : "partial",
    adaptNextTime: ["Complete monitoring before review."],
    narrative: [
      "Did it work? Awaiting full outcome.",
      "What surprised us? Capture during review.",
      "Would we repeat? Decide after metrics.",
      "What to adapt? Document scope and priority learnings.",
    ],
    reviewedAt: new Date().toISOString(),
  };
}

export function rememberInitiativeOutcome(initiative: ExecutiveInitiative) {
  const review = reviewInitiative(initiative);
  const memory = remember({
    kind: "decision",
    title: initiative.title,
    description: initiative.expectedOutcome,
    context: initiative.purpose,
    whyThisHappened: initiative.businessValue,
    problemSolved: initiative.goal,
    decidedBy: "Shari Hudson",
    alternativesConsidered: initiative.founderPromise?.options ?? [],
    expectedOutcome: initiative.expectedOutcome,
    actualOutcome: initiative.outcome?.summary ?? "Orchestration in progress.",
    lessonsLearned: review.adaptNextTime,
    wouldDoAgain: review.wouldRepeat,
    relatedMissions: initiative.missionId ? [initiative.missionId] : [],
    relatedProducts: initiative.productId ? [initiative.productId] : [],
    relatedResearch: [],
    relatedCustomers: [],
    relatedContent: [],
    relatedWorkshops: initiative.category === "workshop" ? [initiative.id] : [],
    relatedCampaigns: initiative.category === "marketing" ? [initiative.id] : [],
    relatedRevenue: [],
    evidence: [],
    graphNodeIds: initiative.graphNodeIds,
  });

  const outcome: ExecutiveOutcome = {
    initiativeId: initiative.id,
    succeeded: review.worked,
    summary: `Stored in Institutional Memory: ${memory.title}`,
    surprises: review.surprised,
    lessons: review.adaptNextTime,
    recordedAt: new Date().toISOString(),
  };

  return { outcome, institutionalMemoryId: memory.id };
}
