import type {
  FireArchiveListItem,
  FireExecutivePortfolio,
} from "../types/fireBrief";
import {
  getSampleFirePortfolioById,
  listSampleFireArchives,
} from "../repositories/sample/fireData";
import { withExecutiveBriefDetail } from "./buildExecutiveBriefDetail";
import { composeTodayFirePortfolio } from "./composeTodayFirePortfolio";
import {
  getStoredFirePortfolioForDate,
  storeFirePortfolioForDate,
} from "./firePortfolioStorage";
import { toFounderLocalDateKey } from "./founderLocalDate";

const MAX_SUMMARY_BULLETS = 6;
const MAX_PRIORITIES = 3;
const MAX_ALERTS = 3;
const MAX_DECISIONS = 3;
const MAX_DASHBOARD_PANELS = 6;

function previousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const prev = new Date(y, m - 1, d - 1, 12, 0, 0, 0);
  const yy = prev.getFullYear();
  const mm = String(prev.getMonth() + 1).padStart(2, "0");
  const dd = String(prev.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function capPortfolio(portfolio: FireExecutivePortfolio): FireExecutivePortfolio {
  const capped: FireExecutivePortfolio = {
    ...portfolio,
    executiveSummary: portfolio.executiveSummary.slice(0, MAX_SUMMARY_BULLETS),
    priorities: portfolio.priorities.slice(0, MAX_PRIORITIES),
    alerts: portfolio.alerts.slice(0, MAX_ALERTS),
    decisions: portfolio.decisions.slice(0, MAX_DECISIONS),
    dashboardPanels: portfolio.dashboardPanels.slice(0, MAX_DASHBOARD_PANELS),
  };
  // Preserve full brief detail when present; never truncate section trees here.
  if (portfolio.executiveBriefDetail) {
    capped.executiveBriefDetail = portfolio.executiveBriefDetail;
  }
  return capped;
}

function ensureDetail(
  portfolio: FireExecutivePortfolio,
): FireExecutivePortfolio {
  if (
    portfolio.executiveBriefDetail &&
    portfolio.executiveBriefDetail.sections.length >= 16
  ) {
    return portfolio;
  }
  const yesterday = getStoredFirePortfolioForDate(
    previousDateKey(portfolio.date),
  );
  return withExecutiveBriefDetail(portfolio, yesterday);
}

/**
 * FIRE — today's executive portfolio for the Founder office home.
 *
 * Load stored daily portfolio when present; otherwise compose once from Founder
 * bridges, persist best-effort, and return the capped result. Does not regenerate
 * on every FounderHome render when a valid today record already exists.
 */
export function getFireExecutivePortfolio(input?: {
  now?: Date;
}): FireExecutivePortfolio {
  const now = input?.now ?? new Date();
  const dateKey = toFounderLocalDateKey(now);

  const stored = getStoredFirePortfolioForDate(dateKey);
  if (stored && stored.date === dateKey) {
    return ensureDetail(capPortfolio(stored));
  }

  const composed = composeTodayFirePortfolio({ now, dateKey });
  storeFirePortfolioForDate(composed);
  return ensureDetail(capPortfolio(composed));
}

/** Executive Archives — previous FIRE briefs (newest first, excludes sample “today”). */
export function listExecutiveArchives(): FireArchiveListItem[] {
  return listSampleFireArchives();
}

/** Open a prior FIRE brief by archive id. */
export function getExecutiveArchive(
  id: string,
): FireExecutivePortfolio | null {
  const portfolio = getSampleFirePortfolioById(id);
  return portfolio ? ensureDetail(capPortfolio({ ...portfolio })) : null;
}
