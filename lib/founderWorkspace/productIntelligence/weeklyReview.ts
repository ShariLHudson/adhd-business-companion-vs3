import type { FounderEvent } from "@/lib/ecosystem/events";

import type {
  AggregatedSignal,
  PrioritizedIssue,
  ProductOpportunity,
  ProductSignal,
  WeeklyProductReview,
} from "./types";
import { extractProductSignals } from "./productIntelligenceEngine";

const MS_PER_DAY = 86_400_000;

function withinDays(ts: string, days: number, now: Date): boolean {
  return now.getTime() - new Date(ts).getTime() <= days * MS_PER_DAY;
}

export function generateWeeklyProductReview(input: {
  events: FounderEvent[];
  signals: ProductSignal[];
  topFrustrations: PrioritizedIssue[];
  topRequests: AggregatedSignal[];
  opportunities: ProductOpportunity[];
  now?: Date;
}): WeeklyProductReview {
  const now = input.now ?? new Date();
  const weekEnd = now.toISOString();
  const weekStart = new Date(now.getTime() - 7 * MS_PER_DAY).toISOString();

  const weekEvents = input.events.filter((e) => withinDays(e.ts, 7, now));
  const prevWeekEvents = input.events.filter((e) => {
    const age = now.getTime() - new Date(e.ts).getTime();
    return age > 7 * MS_PER_DAY && age <= 14 * MS_PER_DAY;
  });

  const weekSignals = extractProductSignals(weekEvents);
  const prevFrictions = extractProductSignals(prevWeekEvents).filter(
    (s) => s.type === "friction",
  ).length;
  const weekFrictions = weekSignals.filter((s) => s.type === "friction").length;

  const mostImproved: string[] = [];
  if (weekFrictions < prevFrictions && prevFrictions > 0) {
    mostImproved.push(
      `Friction signals down (${prevFrictions} → ${weekFrictions} this week)`,
    );
  }
  const focusWins = weekEvents.filter((e) => e.type === "focus.completed").length;
  if (focusWins > 0) {
    mostImproved.push(`Focus sessions completed: ${focusWins}`);
  }
  const docs = weekEvents.filter((e) => e.type === "document.created").length;
  if (docs > 0) {
    mostImproved.push(`Documents created: ${docs}`);
  }
  if (!mostImproved.length) {
    mostImproved.push("Collect more signals this week to spot improvements.");
  }

  const recommendedActions: string[] = [];
  const top = input.topFrustrations[0];
  if (top) {
    recommendedActions.push(
      `Address top frustration: ${top.text} (${top.priority} priority)`,
    );
  }
  const opp = input.opportunities[0];
  if (opp) {
    recommendedActions.push(`Explore opportunity: ${opp.title}`);
  }
  const req = input.topRequests[0];
  if (req) {
    recommendedActions.push(`Review feature request: ${req.text}`);
  }
  if (!recommendedActions.length) {
    recommendedActions.push("Keep logging user friction as issues during testing.");
  }

  const summaryParts = [
    `This week: ${weekFrictions} friction signal${weekFrictions === 1 ? "" : "s"}`,
    `${input.topRequests.length} feature request pattern${input.topRequests.length === 1 ? "" : "s"}`,
    `${input.opportunities.length} opportunit${input.opportunities.length === 1 ? "y" : "ies"} identified`,
  ];

  return {
    weekStart,
    weekEnd,
    topIssues: input.topFrustrations.slice(0, 5),
    topRequests: input.topRequests,
    biggestOpportunities: input.opportunities.slice(0, 3),
    mostImproved,
    recommendedActions: recommendedActions.slice(0, 3),
    summary: summaryParts.join(" · "),
  };
}
