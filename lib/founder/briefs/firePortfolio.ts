import type {
  FireArchiveListItem,
  FireExecutivePortfolio,
} from "../types/fireBrief";
import {
  SAMPLE_FIRE_TODAY_PORTFOLIO,
  getSampleFirePortfolioById,
  listSampleFireArchives,
} from "../repositories/sample/fireData";

const MAX_SUMMARY_BULLETS = 6;
const MAX_PRIORITIES = 3;
const MAX_ALERTS = 3;
const MAX_DECISIONS = 3;
const MAX_DASHBOARD_PANELS = 6;

function capPortfolio(portfolio: FireExecutivePortfolio): FireExecutivePortfolio {
  return {
    ...portfolio,
    executiveSummary: portfolio.executiveSummary.slice(0, MAX_SUMMARY_BULLETS),
    priorities: portfolio.priorities.slice(0, MAX_PRIORITIES),
    alerts: portfolio.alerts.slice(0, MAX_ALERTS),
    decisions: portfolio.decisions.slice(0, MAX_DECISIONS),
    dashboardPanels: portfolio.dashboardPanels.slice(0, MAX_DASHBOARD_PANELS),
  };
}

/** FIRE™ — today's executive portfolio for the Founder office home. */
export function getFireExecutivePortfolio(): FireExecutivePortfolio {
  return capPortfolio({ ...SAMPLE_FIRE_TODAY_PORTFOLIO });
}

/** Executive Archives — previous FIRE briefs (newest first, excludes today). */
export function listExecutiveArchives(): FireArchiveListItem[] {
  return listSampleFireArchives();
}

/** Open a prior FIRE brief by archive id. */
export function getExecutiveArchive(
  id: string,
): FireExecutivePortfolio | null {
  const portfolio = getSampleFirePortfolioById(id);
  return portfolio ? capPortfolio({ ...portfolio }) : null;
}
