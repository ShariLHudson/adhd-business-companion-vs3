/** FIRE™ — Founder Intelligence Report Engine™ executive briefing types */

import type { FounderWorkspaceId } from "./workspace";

export type FireBriefStatus = "draft" | "reviewed" | "archived";

export type FireAlertPriority = "attention" | "awareness" | "noted";

export type FireExecutiveBullet = {
  id: string;
  whatChanged: string;
  whyItMatters: string;
};

export type FireExecutivePriority = {
  id: string;
  title: string;
  whyItMatters: string;
  estimatedImpact: string;
  recommendedAction: string;
};

export type FireFounderAlert = {
  id: string;
  priorityLevel: FireAlertPriority;
  title: string;
  explanation: string;
  recommendedAction: string;
};

export type FireOpportunities = {
  top: string;
  revenue: string;
  product: string;
  relationship: string;
  learning: string;
};

export type FireExecutiveDecision = {
  id: string;
  title: string;
  summary: string;
};

export type FireDashboardPanel = {
  id: string;
  title: string;
  summary: string;
  detailWorkspaceId: FounderWorkspaceId;
};

export type FireExecutivePortfolio = {
  id: string;
  issueNumber: number;
  date: string;
  dateDisplay: string;
  preparedFor: string;
  status: FireBriefStatus;
  readingTimeMinutes: number;
  primaryFocus: string;
  executiveSummary: readonly FireExecutiveBullet[];
  priorities: readonly FireExecutivePriority[];
  alerts: readonly FireFounderAlert[];
  opportunities: FireOpportunities;
  decisions: readonly FireExecutiveDecision[];
  dashboardPanels: readonly FireDashboardPanel[];
};

export type FireArchiveListItem = {
  id: string;
  issueNumber: number;
  date: string;
  dateDisplay: string;
  primaryFocus: string;
  executiveSummary: readonly string[];
  status: FireBriefStatus;
};
