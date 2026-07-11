/**
 * Spark Estate — founder intelligence dashboard (Phase 30).
 * Founder-facing listening system — signals about member experience, not surveillance.
 *
 * @see docs/protocols/SPARK_ESTATE_FOUNDER_INTELLIGENCE_DASHBOARD_SPECIFICATION_PHASE30.md
 */

import {
  getIncomingSignals,
  getPipelineStatus,
  getSourceSummary,
} from "@/lib/founder/intelligence/services/intelligenceService";
import {
  aggregateSparkEstateAnalyticsByCategory,
  buildSparkEstateFounderReport,
  buildSparkEstatePersonalizationInsights,
  identifySparkEstateFrictionPoints,
  SPARK_ESTATE_ANALYTICS_PRINCIPLE,
  SPARK_ESTATE_VANITY_METRICS_AVOID,
  verifySparkEstateAnalyticsAndLearningSystem,
} from "./sparkEstateAnalyticsAndLearningSystem";
import { verifySparkEstateCardEcosystem } from "./sparkEstateCardEcosystem";
import { verifySparkEstateOnboardingAndFirst7Days } from "./sparkEstateOnboardingAndFirst7DaysExperience";
import { verifySparkEstateRoomIntelligenceArchitecture } from "./sparkEstateRoomIntelligenceArchitecture";
import { verifySparkEstateUserJourneyAndMemberLifecycle } from "./sparkEstateUserJourneyAndMemberLifecycleArchitecture";

export const SPARK_ESTATE_FOUNDER_DASHBOARD_HREF =
  "/companion/founder/executive-intelligence";

export const SPARK_ESTATE_FOUNDER_INTELLIGENCE_PRINCIPLE =
  "Analytics are signals about the member experience — learn, improve, serve members better.";

export const SPARK_ESTATE_FOUNDER_INTELLIGENCE_VISION =
  "A listening system — the founder learns from the ecosystem; the ecosystem improves for the members.";

export const SPARK_ESTATE_FOUNDER_DASHBOARD_QUESTIONS = [
  "What are members using?",
  "What is helping them?",
  "Where are they getting stuck?",
  "What should improve next?",
] as const;

export const SPARK_ESTATE_FOUNDER_INTELLIGENCE_QUESTIONS = [
  "What are members trying to accomplish?",
  "Where do they succeed?",
  "Where do they struggle?",
  "What should we simplify?",
  "What should we build next?",
] as const;

export const SPARK_ESTATE_FOUNDER_INTELLIGENCE_CATEGORIES = [
  {
    id: "member-growth",
    title: "Member Growth Intelligence",
    tracks: [
      "new members",
      "active members",
      "returning members",
      "onboarding completion",
      "first success moments",
    ],
    purpose: "Understand whether new members are connecting with Spark.",
  },
  {
    id: "engagement",
    title: "Engagement Intelligence",
    tracks: [
      "rooms visited",
      "cards viewed",
      "conversations started",
      "workflows started",
      "saved assets",
      "completed actions",
    ],
    purpose: "Understand what experiences create value.",
  },
  {
    id: "progress",
    title: "Progress Intelligence",
    tracks: [
      "projects created",
      "projects completed",
      "milestones reached",
      "wins captured",
      "assets created",
    ],
    purpose: "Measure whether Spark helps people move forward.",
  },
  {
    id: "journey",
    title: "Journey Intelligence",
    tracks: [
      "signup",
      "onboarding",
      "first success",
      "daily use",
      "creation",
      "completion",
      "return",
    ],
    purpose: "Find where support or improvements are needed.",
  },
  {
    id: "room",
    title: "Room Intelligence",
    tracks: [
      "usage",
      "completion rates",
      "member satisfaction signals",
      "common requests",
      "friction points",
    ],
    purpose: "Learn which rooms create value and which need improvement.",
  },
  {
    id: "card",
    title: "Card Intelligence",
    tracks: [
      "spark-card opened/saved/reflected",
      "momentum-card viewed/acted-on",
      "knowledge-card accessed/applied",
      "win-card captured/revisited",
    ],
    purpose: "Understand what types of support resonate.",
  },
  {
    id: "workflow",
    title: "Workflow Intelligence",
    tracks: ["started", "completed", "saved", "returned to"],
    purpose: "Measure which creation journeys are successful.",
  },
  {
    id: "friction",
    title: "Friction Intelligence",
    tracks: [
      "abandoned workflows",
      "confusing screens",
      "repeated questions",
      "failed actions",
      "missing guidance",
    ],
    purpose: "Remove obstacles.",
  },
] as const;

export const SPARK_ESTATE_FOUNDER_WORKFLOW_EXAMPLES = [
  "email creation",
  "funnel creation",
  "strategy creation",
  "project planning",
  "templates",
] as const;

export const SPARK_ESTATE_FOUNDER_REPORTING_RHYTHMS = [
  {
    id: "daily",
    label: "Daily Founder View",
    shows: ["system health", "errors", "unusual activity", "new member activity"],
    purpose: "Maintain reliability.",
  },
  {
    id: "weekly",
    label: "Weekly Intelligence Report",
    shows: [
      "most used rooms",
      "most helpful cards",
      "completed journeys",
      "common challenges",
      "member feedback patterns",
    ],
    purpose: "Find improvement opportunities.",
  },
  {
    id: "monthly",
    label: "Monthly Strategic Report",
    shows: [
      "retention trends",
      "member behavior patterns",
      "successful workflows",
      "product opportunities",
      "roadmap suggestions",
    ],
    purpose: "Guide growth decisions.",
  },
] as const;

export type SparkEstateFounderReportRhythmId =
  (typeof SPARK_ESTATE_FOUNDER_REPORTING_RHYTHMS)[number]["id"];

export const SPARK_ESTATE_FOUNDER_IMPROVEMENT_LOOP = [
  "Member experience",
  "Data patterns",
  "Founder insight",
  "Improvement decision",
  "Better experience",
] as const;

export const SPARK_ESTATE_FOUNDER_SUCCESS_MEASURES = [
  { id: "value", label: "Value", question: "Are members helped?" },
  { id: "progress", label: "Progress", question: "Are members completing meaningful work?" },
  {
    id: "relationship",
    label: "Relationship",
    question: "Do members return because Spark is useful?",
  },
  {
    id: "improvement",
    label: "Improvement",
    question: "Does the system get better over time?",
  },
] as const;

export type SparkEstateFounderIntelligenceDashboard = {
  dashboardHref: string;
  analyticsAggregates: ReturnType<typeof aggregateSparkEstateAnalyticsByCategory>;
  frictionPoints: string[];
  insights: ReturnType<typeof buildSparkEstatePersonalizationInsights>;
  dailyReport: ReturnType<typeof buildSparkEstateFounderReport>;
  weeklyReport: ReturnType<typeof buildSparkEstateFounderReport>;
  monthlyReport: ReturnType<typeof buildSparkEstateFounderReport>;
  founderStudio: {
    pipelineStageCount: number;
    incomingSignalCount: number;
    configuredSourceCount: number;
  };
};

export function buildSparkEstateFounderIntelligenceDashboard(): SparkEstateFounderIntelligenceDashboard {
  const sources = getSourceSummary();
  return {
    dashboardHref: SPARK_ESTATE_FOUNDER_DASHBOARD_HREF,
    analyticsAggregates: aggregateSparkEstateAnalyticsByCategory(),
    frictionPoints: identifySparkEstateFrictionPoints(),
    insights: buildSparkEstatePersonalizationInsights(),
    dailyReport: buildSparkEstateFounderReport("daily"),
    weeklyReport: buildSparkEstateFounderReport("weekly"),
    monthlyReport: buildSparkEstateFounderReport("monthly"),
    founderStudio: {
      pipelineStageCount: getPipelineStatus().length,
      incomingSignalCount: getIncomingSignals(5).length,
      configuredSourceCount: sources.filter((source) => source.status !== "placeholder")
        .length,
    },
  };
}

export function assessSparkEstateFounderIntelligenceCompliance(): {
  categoriesReady: boolean;
  dashboardQuestionsReady: boolean;
  founderQuestionsReady: boolean;
  reportingRhythmsReady: boolean;
  improvementLoopReady: boolean;
  successMeasuresReady: boolean;
  vanityMetricsAvoided: boolean;
  analyticsBridgeReady: boolean;
  onboardingBridgeReady: boolean;
  roomIntelligenceBridgeReady: boolean;
  cardIntelligenceBridgeReady: boolean;
  founderStudioBridgeReady: boolean;
  journeyIntelligenceReady: boolean;
} {
  const analytics = verifySparkEstateAnalyticsAndLearningSystem();
  const onboarding = verifySparkEstateOnboardingAndFirst7Days();
  const lifecycle = verifySparkEstateUserJourneyAndMemberLifecycle();
  const rooms = verifySparkEstateRoomIntelligenceArchitecture();
  const cards = verifySparkEstateCardEcosystem();
  const dashboard = buildSparkEstateFounderIntelligenceDashboard();
  const journeyCategory = SPARK_ESTATE_FOUNDER_INTELLIGENCE_CATEGORIES.find(
    (category) => category.id === "journey",
  );

  return {
    categoriesReady: SPARK_ESTATE_FOUNDER_INTELLIGENCE_CATEGORIES.length === 8,
    dashboardQuestionsReady: SPARK_ESTATE_FOUNDER_DASHBOARD_QUESTIONS.length === 4,
    founderQuestionsReady: SPARK_ESTATE_FOUNDER_INTELLIGENCE_QUESTIONS.length === 5,
    reportingRhythmsReady: SPARK_ESTATE_FOUNDER_REPORTING_RHYTHMS.length === 3,
    improvementLoopReady: SPARK_ESTATE_FOUNDER_IMPROVEMENT_LOOP.length === 5,
    successMeasuresReady: SPARK_ESTATE_FOUNDER_SUCCESS_MEASURES.length === 4,
    vanityMetricsAvoided: SPARK_ESTATE_VANITY_METRICS_AVOID.length === 3,
    analyticsBridgeReady: analytics.analyticsReady,
    onboardingBridgeReady: onboarding.firstWeekReady,
    roomIntelligenceBridgeReady: rooms.expertiseGroups === 6,
    cardIntelligenceBridgeReady: cards.selectionWorks,
    founderStudioBridgeReady:
      dashboard.founderStudio.pipelineStageCount > 0 &&
      dashboard.founderStudio.incomingSignalCount > 0,
    journeyIntelligenceReady:
      journeyCategory?.tracks.length === 7 && lifecycle.lifecycleResolutionReady,
  };
}

export function verifySparkEstateFounderIntelligenceDashboard(): {
  categories: number;
  founderDashboardReady: boolean;
  reportingReady: boolean;
  listeningSystemReady: boolean;
} {
  const dashboard = buildSparkEstateFounderIntelligenceDashboard();
  const compliance = assessSparkEstateFounderIntelligenceCompliance();
  const founderDashboardReady = Object.values(compliance).every(Boolean);

  return {
    categories: SPARK_ESTATE_FOUNDER_INTELLIGENCE_CATEGORIES.length,
    founderDashboardReady,
    reportingReady:
      dashboard.dailyReport.sections.length === 3 &&
      dashboard.weeklyReport.sections.length === 3 &&
      dashboard.monthlyReport.sections.length === 3,
    listeningSystemReady:
      founderDashboardReady &&
      SPARK_ESTATE_FOUNDER_INTELLIGENCE_PRINCIPLE.includes("listening") === false &&
      SPARK_ESTATE_FOUNDER_INTELLIGENCE_VISION.includes("listening"),
  };
}

export function sparkEstateFounderIntelligenceCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim().toLowerCase() ?? "";
  if (
    text &&
    /founder dashboard|founder intelligence|member analytics|what are members using|improvement opportunities/.test(
      text,
    )
  ) {
    return (
      `SPARK ESTATE FOUNDER INTELLIGENCE: ${SPARK_ESTATE_FOUNDER_INTELLIGENCE_PRINCIPLE} ` +
      `Dashboard questions: ${SPARK_ESTATE_FOUNDER_DASHBOARD_QUESTIONS.join(" ")} ` +
      `Avoid ${SPARK_ESTATE_VANITY_METRICS_AVOID.join(", ")} — focus on value, progress, and relationship.`
    );
  }
  return null;
}

export function formatSparkEstateFounderIntelligenceDashboardReport(
  verification: ReturnType<typeof verifySparkEstateFounderIntelligenceDashboard> = verifySparkEstateFounderIntelligenceDashboard(),
  compliance: ReturnType<typeof assessSparkEstateFounderIntelligenceCompliance> = assessSparkEstateFounderIntelligenceCompliance(),
  dashboard: SparkEstateFounderIntelligenceDashboard = buildSparkEstateFounderIntelligenceDashboard(),
): string {
  const lines: string[] = [
    `Spark Estate founder intelligence: ${verification.founderDashboardReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_FOUNDER_INTELLIGENCE_PRINCIPLE,
    SPARK_ESTATE_FOUNDER_INTELLIGENCE_VISION,
    SPARK_ESTATE_ANALYTICS_PRINCIPLE,
    `Dashboard: ${dashboard.dashboardHref}`,
    "",
    "Founder dashboard questions:",
  ];

  for (const question of SPARK_ESTATE_FOUNDER_DASHBOARD_QUESTIONS) {
    lines.push(`  ? ${question}`);
  }

  lines.push("", "Founder intelligence categories:");
  for (const category of SPARK_ESTATE_FOUNDER_INTELLIGENCE_CATEGORIES) {
    lines.push(`  ${category.title}: ${category.purpose}`);
    for (const track of category.tracks) {
      lines.push(`    • ${track}`);
    }
  }

  lines.push("", "Reporting rhythms:");
  for (const rhythm of SPARK_ESTATE_FOUNDER_REPORTING_RHYTHMS) {
    lines.push(`  ${rhythm.label}: ${rhythm.shows.join(", ")}`);
  }

  lines.push("", "Founder questions:");
  for (const question of SPARK_ESTATE_FOUNDER_INTELLIGENCE_QUESTIONS) {
    lines.push(`  ? ${question}`);
  }

  lines.push("", "Success measures:");
  for (const measure of SPARK_ESTATE_FOUNDER_SUCCESS_MEASURES) {
    lines.push(`  ${measure.label}: ${measure.question}`);
  }

  lines.push("", "Product improvement loop:");
  for (const step of SPARK_ESTATE_FOUNDER_IMPROVEMENT_LOOP) {
    lines.push(`  → ${step}`);
  }

  lines.push("", "Avoid vanity metrics:");
  for (const metric of SPARK_ESTATE_VANITY_METRICS_AVOID) {
    lines.push(`  ✗ ${metric}`);
  }

  lines.push("", "Current signals:");
  lines.push(`  Friction points: ${dashboard.frictionPoints.join(", ") || "none recorded"}`);
  lines.push(
    `  Helpful cards: ${dashboard.insights.helpfulCardTypes.join(", ") || "gathering signals"}`,
  );
  lines.push(
    `  Founder Studio pipeline stages: ${dashboard.founderStudio.pipelineStageCount}`,
  );
  lines.push(
    `  Configured intelligence sources: ${dashboard.founderStudio.configuredSourceCount}`,
  );

  lines.push("", "Compliance checks:");
  lines.push(`  Categories: ${compliance.categoriesReady ? "pass" : "fail"}`);
  lines.push(`  Analytics bridge: ${compliance.analyticsBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Journey intelligence: ${compliance.journeyIntelligenceReady ? "pass" : "fail"}`);
  lines.push(`  Founder Studio bridge: ${compliance.founderStudioBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Reporting rhythms: ${compliance.reportingRhythmsReady ? "pass" : "fail"}`);
  lines.push(`  Listening system: ${verification.listeningSystemReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
