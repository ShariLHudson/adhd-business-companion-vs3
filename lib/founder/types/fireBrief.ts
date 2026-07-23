/** FIRE — Founder Intelligence Report Engine executive briefing types */

import type { FounderWorkspaceId } from "./workspace";
import type { FireExecutiveBriefDetail } from "./fireBriefDetail";

export type {
  FireActionHorizon,
  FireActionPlanItem,
  FireAlertLevel,
  FireBriefSection,
  FireBriefSectionColor,
  FireBriefSectionId,
  FireBriefUrgency,
  FireDetailedAlert,
  FireExecutiveBriefDetail,
  FireExecutiveOverview,
  FireIntelligenceItem,
  FireIznaAssignment,
} from "./fireBriefDetail";

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
  /**
   * Optional complete brief detail (all 16 report sections).
   * Backwards compatible — older local daily records omit this field;
   * reading UI resolves detail via `buildExecutiveBriefDetail` when absent.
   */
  executiveBriefDetail?: FireExecutiveBriefDetail | null;
  /** ISO timestamp when this daily report was first composed (optional, BC). */
  preparedAt?: string | null;
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
