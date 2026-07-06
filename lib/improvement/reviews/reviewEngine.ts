import type { ImprovementExperiment, ImprovementReview, ImprovementReviewInput, ImprovementReviewKind } from "../types";
import { improvementSampleRepository } from "../repositories/sample";
import { recommendImprovements } from "../recommendations/recommendationEngine";
import { prioritizeImprovements } from "../priorities/priorityEngine";

const REVIEW_TITLES: Record<ImprovementReviewKind, string> = {
  daily: "Daily Improvement Review",
  weekly: "Weekly Improvement Review",
  monthly: "Monthly Improvement Review",
  quarterly: "Quarterly Improvement Review",
  annual: "Annual Improvement Review",
  mission: "Mission Improvement Review",
  product: "Product Improvement Review",
  launch: "Launch Improvement Review",
  workshop: "Workshop Improvement Review",
  marketing: "Marketing Improvement Review",
  founder: "Founder Improvement Review",
};

function defaultPeriod(kind: ImprovementReviewKind): string {
  const now = new Date();
  if (kind === "weekly") return `Week ${getWeekNumber(now)} · ${now.getFullYear()}`;
  if (kind === "monthly") return now.toLocaleString("en-US", { month: "long", year: "numeric" });
  if (kind === "quarterly") return `Q${Math.floor(now.getMonth() / 3) + 1} · ${now.getFullYear()}`;
  if (kind === "annual") return `${now.getFullYear()}`;
  return now.toISOString().slice(0, 10);
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

export function review(input: ImprovementReviewInput): ImprovementReview {
  const sample = improvementSampleRepository.reviews().find((r) => r.kind === input.kind);
  const opportunities = input.missionId
    ? improvementSampleRepository.forMission(input.missionId)
    : improvementSampleRepository.opportunities();
  const prioritized = prioritizeImprovements(opportunities);
  const recs = recommendImprovements(input.missionId);
  const experiments = improvementSampleRepository.experiments();

  if (sample && !input.missionId) {
    return { ...sample, generatedAt: new Date().toISOString() };
  }

  return {
    id: `rev-${input.kind}-${Date.now()}`,
    kind: input.kind,
    title: REVIEW_TITLES[input.kind],
    periodLabel: input.periodLabel ?? defaultPeriod(input.kind),
    generatedAt: new Date().toISOString(),
    whatWorked: sample?.whatWorked ?? ["Morning strategy blocks", "Evidence-based decisions"],
    whatDidNotWork: sample?.whatDidNotWork ?? ["Scattered approvals", "Afternoon writing stalls"],
    slowingDown: prioritized.map((o) => o.slowingDown).filter(Boolean) as string[],
    simplify: prioritized.map((o) => o.shouldSimplify).filter(Boolean) as string[],
    eliminate: prioritized.map((o) => o.shouldEliminate).filter(Boolean) as string[],
    automate: prioritized.map((o) => o.shouldAutomate).filter(Boolean) as string[],
    delegate: prioritized.map((o) => o.shouldDelegate).filter(Boolean) as string[],
    improve: recs.slice(0, 3).map((r) => r.title),
    opportunityIds: prioritized.slice(0, 5).map((o) => o.id),
    experimentIds: experiments.slice(0, 3).map((e) => e.id),
    missionId: input.missionId,
  };
}

export function findExperiments(filter?: { missionId?: string; status?: ImprovementExperiment["status"] }) {
  let items = improvementSampleRepository.experiments();
  if (filter?.missionId) items = items.filter((e) => e.missionId === filter.missionId);
  if (filter?.status) items = items.filter((e) => e.status === filter.status);
  return items;
}
