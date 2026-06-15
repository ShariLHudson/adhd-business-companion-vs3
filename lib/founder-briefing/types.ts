/** Founder Morning Briefing 2.0 — ecosystem health in under 60 seconds. */

export type BriefingOverallStatus =
  | "healthy"
  | "watch"
  | "needs_attention"
  | "urgent";

export type BriefingItem = {
  id: string;
  title: string;
  reason: string;
  weight: number;
  source: string;
};

export type FounderBriefing = {
  date: string;
  overallStatus: BriefingOverallStatus;
  topPriorities: BriefingItem[];
  opportunities: BriefingItem[];
  risks: BriefingItem[];
  wins: BriefingItem[];
  recommendations: string[];
  greeting: string;
  summaryLines: string[];
  createdAt: string;
};

export type BriefingAggregateInput = {
  now?: Date;
};
