import type {
  FireArchiveListItem,
  FireExecutivePortfolio,
} from "../../types/fireBrief";

const PREPARED_FOR = "Shari Hudson";

export const SAMPLE_FIRE_TODAY_PORTFOLIO: FireExecutivePortfolio = {
  id: "fire-2026-07-05",
  issueNumber: 148,
  date: "2026-07-05",
  dateDisplay: "Saturday, July 5, 2026",
  preparedFor: PREPARED_FOR,
  status: "reviewed",
  readingTimeMinutes: 3,
  primaryFocus:
    "Today's focus is improving user re-entry after interruptions.",
  executiveSummary: [
    {
      id: "es-1",
      whatChanged: "Members returning mid-task pause longer before speaking.",
      whyItMatters:
        "Re-entry friction quietly erodes trust — calm continuity matters more than new features.",
    },
    {
      id: "es-2",
      whatChanged: "Spark Alpha conversation tests trend ahead of generic chat.",
      whyItMatters:
        "Relationship quality is becoming the measurable differentiator.",
    },
    {
      id: "es-3",
      whatChanged: "Ocean Conservatory dwell time rose after living-scene polish.",
      whyItMatters:
        "Atmosphere supports thinking — subtle motion is working without distraction.",
    },
    {
      id: "es-4",
      whatChanged: "Founder Intelligence OS Phase 2 foundation is in place.",
      whyItMatters:
        "FIRE™, FLAME™, and SPARK™ can plug in without another structural refactor.",
    },
    {
      id: "es-5",
      whatChanged: "Team Hub approvals queue holds two marketing items for Shari.",
      whyItMatters:
        "Execution is waiting on quiet founder decisions — not new strategy.",
    },
    {
      id: "es-6",
      whatChanged: "Listening Rooms curiosity increased in estate wander patterns.",
      whyItMatters:
        "Members explore when places feel alive — continuity beats explanation.",
    },
  ],
  priorities: [
    {
      id: "fp-1",
      title: "Polish calm re-entry after interruption",
      whyItMatters:
        "Members should feel welcomed back — never behind or re-oriented by software.",
      estimatedImpact: "Very High",
      recommendedAction:
        "Review Discover research on return patterns, then approve one re-entry copy pass.",
    },
    {
      id: "fp-2",
      title: "Continue improving Listening Rooms",
      whyItMatters:
        "Atmosphere and conversation continuity are driving quiet exploration.",
      estimatedImpact: "High",
      recommendedAction:
        "Open Build workspace — validate mobile atmosphere and one continuity edge case.",
    },
    {
      id: "fp-3",
      title: "Approve March newsletter theme",
      whyItMatters:
        "Izna's lane is ready — delay creates unnecessary execution drag.",
      estimatedImpact: "Medium",
      recommendedAction:
        "Open Team workspace — review approval and release with one sentence of direction.",
    },
  ],
  alerts: [
    {
      id: "fa-1",
      priorityLevel: "attention",
      title: "Two approvals waiting",
      explanation:
        "Newsletter theme and social post are queued — both need a calm yes or gentle redirect.",
      recommendedAction: "Team workspace → Approvals",
    },
    {
      id: "fa-2",
      priorityLevel: "awareness",
      title: "FIRE executive portfolio live",
      explanation:
        "Phase 3 briefing experience ships on sample data — ready for your morning rhythm.",
      recommendedAction: "Skim today's portfolio, then choose one workspace.",
    },
    {
      id: "fa-3",
      priorityLevel: "noted",
      title: "Architecture freeze holds",
      explanation:
        "Conversation specs remain in Observation Mode — evolve from evidence only.",
      recommendedAction: "No action required today.",
    },
  ],
  opportunities: {
    top: "Premium Estate cohort — twelve founders, conversation-first onboarding.",
    revenue:
      "ADHD planner bundle paired with Spark Card™ — test with three trusted founders.",
    product:
      "Member welcome video — sixty seconds, Shari voice, no product tour.",
    relationship:
      "Quiet check-in copy for long returns — belonging without surveillance.",
    learning:
      "FIRE morning rhythm as executive portfolio — Shari's daily decision surface.",
  },
  decisions: [
    {
      id: "fd-1",
      title: "Approve workshop outline",
      summary: "ADHD Business Clarity — ninety-minute live structure ready for review.",
    },
    {
      id: "fd-2",
      title: "Review Q3 roadmap emphasis",
      summary: "Companion-first vs estate discovery — one positioning choice to confirm.",
    },
    {
      id: "fd-3",
      title: "Approve LinkedIn campaign theme",
      summary: "Conversation is the product — three-line estate warmth post for Izna.",
    },
  ],
  dashboardPanels: [
    {
      id: "dp-1",
      title: "Business Momentum",
      summary:
        "Steady member returns; calm re-entry copy outperforming task-first language.",
      detailWorkspaceId: "start",
    },
    {
      id: "dp-2",
      title: "Research Activity",
      summary:
        "ADHD interruption patterns and estate wander signals updated this week.",
      detailWorkspaceId: "discover",
    },
    {
      id: "dp-3",
      title: "Customer Signals",
      summary:
        "Overwhelm on return, conversation quality up, conservatory curiosity high.",
      detailWorkspaceId: "discover",
    },
    {
      id: "dp-4",
      title: "Development Progress",
      summary:
        "Founder Intelligence OS wired; Listening Rooms and re-entry polish in flight.",
      detailWorkspaceId: "build",
    },
    {
      id: "dp-5",
      title: "Marketing Momentum",
      summary:
        "Newsletter theme drafted; social queue holds two warm estate posts.",
      detailWorkspaceId: "grow",
    },
    {
      id: "dp-6",
      title: "Team Activity",
      summary:
        "Izna on Pinterest batch; Cursor queued on access guard tests.",
      detailWorkspaceId: "team",
    },
  ],
};

const ARCHIVE_147: FireExecutivePortfolio = {
  ...SAMPLE_FIRE_TODAY_PORTFOLIO,
  id: "fire-2026-07-04",
  issueNumber: 147,
  date: "2026-07-04",
  dateDisplay: "Friday, July 4, 2026",
  status: "archived",
  primaryFocus:
    "Yesterday's focus was shipping Founder Studio Phase 1 without member exposure.",
  executiveSummary: [
    {
      id: "es-147-1",
      whatChanged: "Founder Studio Phase 1 reached production.",
      whyItMatters: "Private executive office exists — strategy stays off the member path.",
    },
    {
      id: "es-147-2",
      whatChanged: "Ocean Conservatory living scene shipped.",
      whyItMatters: "Estate atmosphere continues to reward curiosity.",
    },
    {
      id: "es-147-3",
      whatChanged: "Account menu simplified to five calm choices.",
      whyItMatters: "Executive function wins when navigation stays quiet.",
    },
    {
      id: "es-147-4",
      whatChanged: "Workspace Orchestrator spec approved for UX refactor.",
      whyItMatters: "Intention-based workspaces prepare for FIRE automation later.",
    },
  ],
  priorities: [
    {
      id: "fp-147-1",
      title: "Validate founder access guard",
      whyItMatters: "Shari-only boundary must hold before any intelligence wiring.",
      estimatedImpact: "Very High",
      recommendedAction: "Confirm allowlist and dev bypass behave as expected.",
    },
    {
      id: "fp-147-2",
      title: "Plan Phase 2 services layer",
      whyItMatters: "Repositories first — UI reads services, never hardcoded arrays.",
      estimatedImpact: "High",
      recommendedAction: "Sketch brief, memory, and team hub service contracts.",
    },
  ],
  alerts: [
    {
      id: "fa-147-1",
      priorityLevel: "awareness",
      title: "Phase 2 kickoff",
      explanation: "Intelligence OS foundation begins — sample data only.",
      recommendedAction: "Review architecture map before first service PR.",
    },
  ],
  opportunities: {
    top: "Founder private office as daily executive habit.",
    revenue: "Premium cohort waitlist language — invitation, not funnel.",
    product: "Conservatory polish — mobile flicker validation.",
    relationship: "Return greeting warmth — no day-count surveillance.",
    learning: "FIRE daily brief schema — one page, three decisions max.",
  },
  decisions: [
    {
      id: "fd-147-1",
      title: "Approve Phase 2 scope",
      summary: "Services + repositories before any external API.",
    },
  ],
  dashboardPanels: SAMPLE_FIRE_TODAY_PORTFOLIO.dashboardPanels.slice(0, 4),
};

const ARCHIVE_146: FireExecutivePortfolio = {
  ...SAMPLE_FIRE_TODAY_PORTFOLIO,
  id: "fire-2026-07-03",
  issueNumber: 146,
  date: "2026-07-03",
  dateDisplay: "Thursday, July 3, 2026",
  status: "archived",
  primaryFocus: "Focus was Spark Alpha conversation quality versus generic chat.",
  executiveSummary: [
    {
      id: "es-146-1",
      whatChanged: "CT-11 tests ran clean on hospitality and relief.",
      whyItMatters: "Conversation remains the product — quality is defensible.",
    },
    {
      id: "es-146-2",
      whatChanged: "Clear My Mind sunroom restoration queued.",
      whyItMatters: "Capture and organize stay separate — members need both calm.",
    },
  ],
  priorities: [
    {
      id: "fp-146-1",
      title: "Run Spark Alpha comparison session",
      whyItMatters: "Immediate yes vs ChatGPT is the bar.",
      estimatedImpact: "High",
      recommendedAction: "Twenty-minute live test — note one warmth gap only.",
    },
  ],
  alerts: [],
  opportunities: {
    top: "Spark Alpha as daily companion proof point.",
    revenue: "Deferred — conversation quality first.",
    product: "Frosted workspace typography minimums validated.",
    relationship: "Permission-before-draft pattern holding trust.",
    learning: "Observation Mode logging active — Rule of Three holds.",
  },
  decisions: [],
  dashboardPanels: SAMPLE_FIRE_TODAY_PORTFOLIO.dashboardPanels.slice(0, 3),
};

export const SAMPLE_FIRE_ARCHIVE_PORTFOLIOS: readonly FireExecutivePortfolio[] = [
  SAMPLE_FIRE_TODAY_PORTFOLIO,
  ARCHIVE_147,
  ARCHIVE_146,
];

function toArchiveListItem(portfolio: FireExecutivePortfolio): FireArchiveListItem {
  return {
    id: portfolio.id,
    issueNumber: portfolio.issueNumber,
    date: portfolio.date,
    dateDisplay: portfolio.dateDisplay,
    primaryFocus: portfolio.primaryFocus,
    executiveSummary: portfolio.executiveSummary.map(
      (b) => `${b.whatChanged} ${b.whyItMatters}`,
    ),
    status: portfolio.status,
  };
}

export function listSampleFireArchives(): FireArchiveListItem[] {
  return SAMPLE_FIRE_ARCHIVE_PORTFOLIOS.filter((p) => p.id !== SAMPLE_FIRE_TODAY_PORTFOLIO.id)
    .map(toArchiveListItem)
    .sort((a, b) => b.issueNumber - a.issueNumber);
}

export function getSampleFirePortfolioById(
  id: string,
): FireExecutivePortfolio | null {
  return (
    SAMPLE_FIRE_ARCHIVE_PORTFOLIOS.find((portfolio) => portfolio.id === id) ?? null
  );
}
