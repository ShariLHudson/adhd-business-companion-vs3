/**
 * Minimal daily FIRE portfolio composer — bridge slice only.
 *
 * Data sources are existing Founder bridges and sample adapters.
 * This is NOT live company-state SPARK→FIRE intelligence and does NOT imply
 * an overnight job ran. Composition happens on first open when no stored
 * portfolio exists for the date.
 */

import { prepareFounderExecutiveJudgmentEngine } from "@/lib/founder/services/executiveJudgmentBridge";
import {
  prepareFounderMorningBrief,
  prepareFounderMorningSummary,
  prepareFounderRecommendations,
} from "@/lib/founder/services/overnightExecutiveCycleBridge";
import { SAMPLE_FIRE_TODAY_PORTFOLIO } from "@/lib/founder/repositories/sample/fireData";
import { sampleBriefRepository } from "@/lib/founder/repositories";
import type { FireExecutivePortfolio } from "@/lib/founder/types/fireBrief";
import { withExecutiveBriefDetail } from "./buildExecutiveBriefDetail";
import {
  firePortfolioIdForDateKey,
  formatFounderLocalDateDisplay,
  founderLocalDateFromKey,
  stableFireIssueNumberForDateKey,
  toFounderLocalDateKey,
} from "./founderLocalDate";

const PREPARED_FOR = "Shari Hudson";

export type ComposeTodayFirePortfolioInput = {
  /** Override clock for tests — local calendar of this Date. */
  now?: Date;
  /** Explicit date key; wins over `now` when both provided. */
  dateKey?: string;
};

function textOrFallback(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Compose a dated FIRE portfolio from Founder bridges + sample adapters.
 * Deterministic for a given dateKey — same logical report unless storage is cleared.
 */
export function composeTodayFirePortfolio(
  input: ComposeTodayFirePortfolioInput = {},
): FireExecutivePortfolio {
  const dateKey = input.dateKey ?? toFounderLocalDateKey(input.now ?? new Date());
  const localDate = founderLocalDateFromKey(dateKey);
  const dateDisplay = formatFounderLocalDateDisplay(localDate);
  const id = firePortfolioIdForDateKey(dateKey);
  const issueNumber = stableFireIssueNumberForDateKey(dateKey);

  // --- Bridged / sample sources (not live SPARK→FIRE) ---
  let missionFocus =
    "Protect calm progress on the active Founder mission today.";
  let recommendedAction =
    "Open your Mission Workspace and take the next clear step.";
  const summaryLines: string[] = [];
  const priorityRows: {
    title: string;
    why: string;
    impact: string;
    action: string;
  }[] = [];
  const decisionRows: { title: string; summary: string }[] = [];
  let opportunities = { ...SAMPLE_FIRE_TODAY_PORTFOLIO.opportunities };

  try {
    const morningBrief = prepareFounderMorningBrief();
    missionFocus = textOrFallback(morningBrief.missionFocus, missionFocus);
    recommendedAction = textOrFallback(
      morningBrief.recommendedFirstAction,
      recommendedAction,
    );
    for (const line of morningBrief.highlights.slice(0, 3)) {
      summaryLines.push(line);
    }
    for (const line of morningBrief.narrative.slice(0, 2)) {
      summaryLines.push(line);
    }
  } catch {
    /* overnight bridge unavailable — continue with fallbacks */
  }

  try {
    const morning = prepareFounderMorningSummary();
    for (const line of morning.whileYouWereAway.slice(0, 3)) {
      summaryLines.push(line);
    }
  } catch {
    /* morning summary unavailable */
  }

  try {
    const judgment = prepareFounderExecutiveJudgmentEngine();
    const primary = judgment.view.pyramid.primary;
    if (primary) {
      missionFocus = textOrFallback(primary.headline, missionFocus);
      priorityRows.push({
        title: primary.headline,
        why: textOrFallback(primary.whyThis, primary.summary),
        impact: "High",
        action: textOrFallback(primary.whyNow, recommendedAction),
      });
      for (const item of judgment.view.pyramid.supporting.slice(0, 2)) {
        priorityRows.push({
          title: item.headline,
          why: textOrFallback(item.whyThis, item.summary),
          impact: "Medium",
          action: textOrFallback(item.whyNow, "Review when ready."),
        });
      }
    }
  } catch {
    /* judgment bridge unavailable */
  }

  try {
    const recommendations = prepareFounderRecommendations(3);
    for (const item of recommendations) {
      if (priorityRows.length >= 3) break;
      priorityRows.push({
        title: item.title,
        why: item.summary,
        impact: "Medium",
        action: textOrFallback(item.suggestedAction, recommendedAction),
      });
      decisionRows.push({
        title: item.title,
        summary: item.summary,
      });
    }
  } catch {
    /* recommendations unavailable */
  }

  try {
    // Sample FounderDailyBrief adapter — still bridged/sample, not live SPARK.
    const founderBrief = sampleBriefRepository.getTodayBrief();
    if (priorityRows.length < 3) {
      for (const p of founderBrief.priorities) {
        if (priorityRows.length >= 3) break;
        priorityRows.push({
          title: p.title,
          why: textOrFallback(p.note, p.title),
          impact: "Medium",
          action: recommendedAction,
        });
      }
    }
    if (founderBrief.revenueOpportunity?.summary) {
      opportunities = {
        ...opportunities,
        revenue: founderBrief.revenueOpportunity.summary,
      };
    }
    if (founderBrief.bestIdea?.summary) {
      opportunities = {
        ...opportunities,
        top: founderBrief.bestIdea.summary,
      };
    }
  } catch {
    /* founder sample brief unavailable */
  }

  if (summaryLines.length === 0) {
    // Sample-adapter fallback content — not live company intelligence.
    for (const bullet of SAMPLE_FIRE_TODAY_PORTFOLIO.executiveSummary.slice(
      0,
      4,
    )) {
      summaryLines.push(bullet.whatChanged);
    }
  }

  if (priorityRows.length === 0) {
    for (const p of SAMPLE_FIRE_TODAY_PORTFOLIO.priorities) {
      priorityRows.push({
        title: p.title,
        why: p.whyItMatters,
        impact: p.estimatedImpact,
        action: p.recommendedAction,
      });
    }
  }

  if (decisionRows.length === 0) {
    for (const d of SAMPLE_FIRE_TODAY_PORTFOLIO.decisions) {
      decisionRows.push({ title: d.title, summary: d.summary });
    }
  }

  const uniqueSummary = [...new Set(summaryLines)].slice(0, 6);
  const preparedAt = (input.now ?? new Date()).toISOString();

  const base: FireExecutivePortfolio = {
    id,
    issueNumber,
    date: dateKey,
    dateDisplay,
    preparedFor: PREPARED_FOR,
    preparedAt,
    // Draft = composed on demand from bridges; not a reviewed overnight FIRE run.
    status: "draft",
    readingTimeMinutes: 12,
    primaryFocus: missionFocus.startsWith("Today")
      ? missionFocus
      : `Today's focus is ${missionFocus.replace(/^Today'?s focus is\s+/i, "")}`,
    executiveSummary: uniqueSummary.map((line, index) => ({
      id: `es-${dateKey}-${index + 1}`,
      whatChanged: line,
      whyItMatters:
        "Drawn from your current Founder Workspace intelligence — prepare calmly, then choose one next step.",
    })),
    priorities: priorityRows.slice(0, 3).map((row, index) => ({
      id: `fp-${dateKey}-${index + 1}`,
      title: row.title,
      whyItMatters: row.why,
      estimatedImpact: row.impact,
      recommendedAction: row.action,
    })),
    alerts: [
      {
        id: `fa-${dateKey}-1`,
        priorityLevel: "noted",
        title: "Prepared from available Founder intelligence",
        explanation:
          "This briefing was assembled from the intelligence currently available in your Founder Workspace — not a full overnight company report.",
        recommendedAction: "Skim today's focus, then choose one next step.",
      },
      {
        id: `fa-${dateKey}-2`,
        priorityLevel: "awareness",
        title: "One clear next step",
        explanation: recommendedAction,
        recommendedAction: "Open Mission Workspace when you're ready.",
      },
      {
        id: `fa-${dateKey}-3`,
        priorityLevel: "noted",
        title: "Architecture freeze holds",
        explanation:
          "Conversation specs remain in Observation Mode — evolve from evidence only.",
        recommendedAction: "No action required today.",
      },
    ],
    opportunities,
    decisions: decisionRows.slice(0, 3).map((row, index) => ({
      id: `fd-${dateKey}-${index + 1}`,
      title: row.title,
      summary: row.summary,
    })),
    // Structure reused from the sample portfolio adapter (panel layout only).
    dashboardPanels: SAMPLE_FIRE_TODAY_PORTFOLIO.dashboardPanels.map(
      (panel, index) => ({
        ...panel,
        id: `dp-${dateKey}-${index + 1}`,
      }),
    ),
  };

  return withExecutiveBriefDetail(base);
}
