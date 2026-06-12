import type { ProductIntelligenceReport } from "../productIntelligence/types";
import type {
  BusinessHealthMetrics,
  EngagementHealthMetrics,
  HealthDimensionScore,
  HealthLevel,
  HealthMetricsBundle,
  ProductHealthMetrics,
  SystemHealthMetrics,
  UserHealthMetrics,
} from "./types";

function scoreUser(m: UserHealthMetrics): HealthDimensionScore {
  if (m.activeUsers === 0) {
    return {
      level: "needs_attention",
      headline: "Needs Attention",
      detail: "No active users this week — collect more usage signals.",
    };
  }
  if (m.retentionTrend === "down" && m.retentionRate < 30) {
    return {
      level: "at_risk",
      headline: "At Risk",
      detail: "User retention is dropping — fewer people are coming back.",
    };
  }
  if (m.retentionRate >= 40 || m.retentionTrend === "up") {
    return {
      level: "healthy",
      headline: "Healthy",
      detail: "Users returning consistently.",
    };
  }
  return {
    level: "needs_attention",
    headline: "Needs Attention",
    detail: "Retention is moderate — watch whether users find ongoing value.",
  };
}

function scoreProduct(
  m: ProductHealthMetrics,
  productReport: ProductIntelligenceReport,
): HealthDimensionScore {
  const highFrictions = productReport.topFrustrations.filter(
    (f) => f.priority === "high",
  ).length;

  if (highFrictions >= 2 || m.errorSignals >= 3) {
    return {
      level: "at_risk",
      headline: "At Risk",
      detail: m.topFriction
        ? `${m.topFriction.slice(0, 80)} is driving confusion.`
        : "Multiple product friction signals need fixes.",
    };
  }
  if (m.topFriction || m.abandonedWorkflows >= 3) {
    return {
      level: "needs_attention",
      headline: "Needs Attention",
      detail: m.topFriction
        ? `Document/workflow friction: ${m.topFriction.slice(0, 72)}…`
        : "Some workflows are started but not completed.",
    };
  }
  return {
    level: "healthy",
    headline: "Healthy",
    detail: m.topFeature
      ? `${m.topFeature} is getting steady use.`
      : "Product usage looks steady.",
  };
}

function scoreEngagement(m: EngagementHealthMetrics): HealthDimensionScore {
  if (m.trend === "down" && m.focusSessions + m.documentsCreated < 2) {
    return {
      level: "at_risk",
      headline: "At Risk",
      detail: "Engagement is declining — fewer focus sessions and creations.",
    };
  }
  if (m.trend === "up" || m.focusSessions >= 3 || m.documentsCreated >= 2) {
    return {
      level: "healthy",
      headline: "Healthy",
      detail:
        m.trend === "up"
          ? "Focus usage and action-taking are increasing."
          : "Users are taking meaningful action in the app.",
    };
  }
  return {
    level: "needs_attention",
    headline: "Needs Attention",
    detail: "Engagement is quiet — nudge users toward one small win.",
  };
}

function scoreRevenue(m: BusinessHealthMetrics): HealthDimensionScore {
  if (!m.dataConnected) {
    return {
      level: "needs_attention",
      headline: "Needs Attention",
      detail: "Revenue data not connected — connect GHL or add metrics when ready.",
    };
  }
  if (m.churnRate >= 10 || m.revenueTrend === "down") {
    return {
      level: "at_risk",
      headline: "At Risk",
      detail: "Churn or revenue trend needs a closer look.",
    };
  }
  if (m.payingUsers > 0 && m.conversions > 0) {
    return {
      level: "healthy",
      headline: "Healthy",
      detail: "Paying users and conversions are tracking.",
    };
  }
  return {
    level: "needs_attention",
    headline: "Needs Attention",
    detail: "Trial activity exists — focus on conversion next.",
  };
}

function worstLevel(a: HealthLevel, b: HealthLevel): HealthLevel {
  const rank = { healthy: 1, needs_attention: 2, at_risk: 3 };
  return rank[a] >= rank[b] ? a : b;
}

function scoreSystem(m: SystemHealthMetrics): HealthDimensionScore {
  const level = [
    m.openAiStatus,
    m.claudeStatus,
    m.googleIntegration,
    m.ghlIntegration,
  ].reduce(worstLevel, "healthy" as HealthLevel);

  if (level === "at_risk") {
    return {
      level,
      headline: "At Risk",
      detail: "Integration or error signals need immediate review.",
    };
  }
  if (level === "needs_attention") {
    return {
      level,
      headline: "Needs Attention",
      detail: "One or more integrations may need monitoring.",
    };
  }
  return {
    level: "healthy",
    headline: "Healthy",
    detail: "All integrations appear operational.",
  };
}

export function scoreBusinessHealth(
  metrics: HealthMetricsBundle,
  productReport: ProductIntelligenceReport,
): {
  user: HealthDimensionScore;
  product: HealthDimensionScore;
  engagement: HealthDimensionScore;
  revenue: HealthDimensionScore;
  system: HealthDimensionScore;
} {
  return {
    user: scoreUser(metrics.user),
    product: scoreProduct(metrics.product, productReport),
    engagement: scoreEngagement(metrics.engagement),
    revenue: scoreRevenue(metrics.business),
    system: scoreSystem(metrics.system),
  };
}
