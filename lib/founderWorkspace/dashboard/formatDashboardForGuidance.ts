import type { FounderAnalyticsReport } from "../analytics/types";
import type { FounderDailyBriefing } from "../briefing/founderBriefingEngine";
import { formatBriefingForGuidance } from "../briefing/founderBriefingEngine";
import type { BusinessHealthReport } from "../businessHealth/types";
import { HEALTH_LABELS } from "../businessHealth/types";
import type { ExperimentMetricsReport } from "../experimentMetrics/types";
import {
  formatActionCenterForGuidance,
} from "../actionCenter/actionCenterEngine";
import type { FounderRecommendedTask } from "../actionCenter/types";
import type { ProductIntelligenceReport } from "../productIntelligence/types";

export type DashboardGuidanceInput = {
  briefing: FounderDailyBriefing;
  businessHealth: BusinessHealthReport;
  productIntelligence: ProductIntelligenceReport;
  analytics: FounderAnalyticsReport;
  experimentMetrics: ExperimentMetricsReport;
  recentNotes: { id: string; title: string; updatedAt: string }[];
  recommendedTask?: FounderRecommendedTask;
};

export function formatDashboardForGuidance(input: DashboardGuidanceInput): string {
  const {
    briefing,
    businessHealth,
    productIntelligence,
    analytics,
    experimentMetrics,
    recentNotes,
    recommendedTask,
  } = input;

  const lines = [
    "FOUNDER DASHBOARD (home view — use this first for founder questions):",
    "",
    "Answer from dashboard:",
    "- What should I work on? → Today's focus + suggested action",
    "- What is broken? → Open issues + product frustrations",
    "- What is being tested? → Active experiments",
    "- What needs attention? → Projects needing attention + alerts",
    "- What can wait? → Can wait list",
    "",
    formatBriefingForGuidance(briefing),
    "",
  ];

  if (recommendedTask) {
    lines.push(formatActionCenterForGuidance(recommendedTask), "");
  }

  lines.push(
    "BUSINESS HEALTH:",
    `Overall: ${HEALTH_LABELS[businessHealth.overall]} — ${businessHealth.overallHeadline}`,
    `- User: ${businessHealth.user.headline}`,
    `- Product: ${businessHealth.product.headline}`,
    `- Engagement: ${businessHealth.engagement.headline}`,
    `- Revenue: ${businessHealth.revenue.headline}`,
    "",
    "PRODUCT INTELLIGENCE:",
  );

  if (productIntelligence.topFrustrations[0]) {
    lines.push(
      `- Top friction: ${productIntelligence.topFrustrations[0].text}`,
    );
  }
  if (productIntelligence.opportunities[0]) {
    lines.push(
      `- Top opportunity: ${productIntelligence.opportunities[0].title}`,
    );
  }
  if (productIntelligence.quickWins[0]) {
    lines.push(`- Quick win: ${productIntelligence.quickWins[0].title}`);
  }
  lines.push("");

  const s = analytics.summary;
  lines.push(
    "ECOSYSTEM & ANALYTICS:",
    `- Projects: ${s.projectsCompleted}/${s.projectsTotal} complete (${s.completionRate}%)`,
    `- Experiments: ${s.experimentsSuccessful} won, ${s.experimentsFailed} failed`,
    `- Engagement: ${s.focusMinutes} focus min, ${s.apiCalls} API calls`,
  );
  if (analytics.workspaceUsage.length) {
    lines.push(
      "- Workspace opens:",
      ...analytics.workspaceUsage
        .slice(0, 5)
        .map((w) => `  · ${w.label}: ${w.value}`),
    );
  }
  if (analytics.alerts.length) {
    lines.push(
      "- Analytics alerts:",
      ...analytics.alerts.slice(0, 4).map((a) => `  · ${a.message}`),
    );
  }
  lines.push("");

  const agg = experimentMetrics.aggregate;
  lines.push(
    "EXPERIMENT METRICS:",
    `- ${agg.inProgress} in progress · ${agg.successRate}% success rate`,
    `- Avg completion ${agg.avgCompletionRate}% · ${agg.totalApiTokens} tokens`,
  );
  if (experimentMetrics.alerts.length) {
    lines.push(
      ...experimentMetrics.alerts
        .slice(0, 3)
        .map((a) => `- Alert: ${a.message}`),
    );
  }
  lines.push("");

  const sys = businessHealth.metrics.system;
  lines.push(
    "SYSTEM STATUS:",
    `- OpenAI: ${HEALTH_LABELS[sys.openAiStatus]}`,
    `- Claude: ${HEALTH_LABELS[sys.claudeStatus]}`,
    `- Google: ${HEALTH_LABELS[sys.googleIntegration]}`,
    `- GHL: ${HEALTH_LABELS[sys.ghlIntegration]}`,
    `- Error log entries: ${sys.errorLogCount}`,
    `- System health: ${businessHealth.system.headline}`,
    "",
  );

  if (analytics.recentActivity.length) {
    lines.push("RECENT ACTIVITY:");
    for (const item of analytics.recentActivity.slice(0, 8)) {
      lines.push(`- ${item.title}${item.detail ? `: ${item.detail}` : ""}`);
    }
    lines.push("");
  }

  if (recentNotes.length) {
    lines.push("RECENT NOTES:");
    for (const note of recentNotes.slice(0, 5)) {
      lines.push(`- [${note.id}] ${note.title}`);
    }
  }

  return lines.join("\n");
}
