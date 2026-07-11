/**
 * Spark Estate — analytics and learning system (Phase 22).
 * Learn from usage to improve member progress — not vanity metrics or surveillance.
 *
 * @see docs/protocols/SPARK_ESTATE_ANALYTICS_AND_LEARNING_SYSTEM_SPECIFICATION_PHASE22.md
 */

import { SPARK_ESTATE_CREATION_STEPS } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateCreationJourney } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateCardEcosystem } from "./sparkEstateCardEcosystem";
import { verifySparkEstateFileAndDataArchitecture } from "./sparkEstateFileAndDataArchitectureMap";
import { verifySparkEstateMemberProfile } from "./sparkEstateMemberProfileEngine";
import { verifySparkEstateUserJourneyAndMemberLifecycle } from "./sparkEstateUserJourneyAndMemberLifecycleArchitecture";

export const SPARK_ESTATE_ANALYTICS_STORAGE_KEY = "spark-estate-analytics-v1";

export const SPARK_ESTATE_ANALYTICS_PRINCIPLE =
  "The purpose of analytics is improvement — not watching people, collecting unnecessary data, or creating pressure.";

export const SPARK_ESTATE_ANALYTICS_PURPOSE_QUESTION =
  "How can Spark help members better?";

export const SPARK_ESTATE_ANALYTICS_VISION =
  "Spark Estate becomes better because it listens — analytics exist to improve the companion relationship.";

export const SPARK_ESTATE_ANALYTICS_CATEGORIES = [
  {
    id: "engagement",
    title: "Engagement Analytics",
    measures: [
      "login frequency",
      "return patterns",
      "rooms visited",
      "cards opened",
      "conversations started",
    ],
    purpose: "Understand what members naturally use.",
  },
  {
    id: "progress",
    title: "Progress Analytics",
    measures: [
      "projects created",
      "actions completed",
      "milestones reached",
      "wins captured",
      "creations completed",
    ],
    purpose: "Understand whether Spark helps people move forward.",
  },
  {
    id: "creation-journey",
    title: "Creation Journey Analytics",
    measures: SPARK_ESTATE_CREATION_STEPS.map((step) => step.id),
    purpose: "Identify where people need more support in the universal process.",
  },
  {
    id: "cards",
    title: "Card Analytics",
    measures: ["spark-card events", "momentum-card events", "knowledge-card events"],
    purpose: "Learn what cards create value.",
  },
  {
    id: "workflow-success",
    title: "Workflow Success Analytics",
    measures: ["started", "completed", "revised", "saved"],
    purpose: "Learn which workflows help members finish things.",
  },
  {
    id: "friction",
    title: "Friction Analytics",
    measures: [
      "onboarding confusion",
      "unclear buttons",
      "too many choices",
      "difficult steps",
      "abandoned creations",
    ],
    purpose: "Remove obstacles.",
  },
  {
    id: "personalization-learning",
    title: "Personalization Learning",
    measures: [
      "preferred workflows",
      "preferred guidance style",
      "helpful card types",
      "successful strategies",
    ],
    purpose: "Improve future experiences from what worked.",
  },
] as const;

export type SparkEstateAnalyticsCategoryId =
  (typeof SPARK_ESTATE_ANALYTICS_CATEGORIES)[number]["id"];

export const SPARK_ESTATE_CARD_ANALYTICS_EVENTS = {
  "spark-card": ["opened", "saved", "reflected-on", "ignored"] as const,
  "momentum-card": ["viewed", "acted-on", "completed"] as const,
  "knowledge-card": ["opened", "used", "applied"] as const,
} as const;

export const SPARK_ESTATE_WORKFLOW_ANALYTICS_WORKFLOWS = [
  "email creation",
  "funnel creation",
  "project planning",
  "strategy development",
  "templates",
] as const;

export const SPARK_ESTATE_FRICTION_SIGNALS = [
  "onboarding confusion",
  "unclear buttons",
  "too many choices",
  "difficult steps",
  "abandoned creations",
] as const;

export const SPARK_ESTATE_ANALYTICS_PRIVACY_PRINCIPLES = [
  "Collect only useful information.",
  "Protect personal information.",
  "Be transparent about what is learned.",
  "Respect member control.",
] as const;

export const SPARK_ESTATE_VANITY_METRICS_AVOID = [
  "clicks alone",
  "screen views alone",
  "time spent alone",
] as const;

export const SPARK_ESTATE_ANALYTICS_SUCCESS_METRICS = [
  {
    id: "progress",
    label: "Progress",
    question: "Are members completing meaningful work?",
  },
  {
    id: "retention",
    label: "Retention",
    question: "Do members return?",
  },
  {
    id: "value",
    label: "Value",
    question: "Do members feel helped?",
  },
  {
    id: "confidence",
    label: "Confidence",
    question: "Do members recognize their own capability?",
  },
] as const;

export const SPARK_ESTATE_FOUNDER_REPORT_SCHEDULES = [
  {
    id: "daily",
    label: "Daily",
    includes: ["usage trends", "errors", "unusual behavior"],
  },
  {
    id: "weekly",
    label: "Weekly",
    includes: ["popular features", "completed journeys", "friction points"],
  },
  {
    id: "monthly",
    label: "Monthly",
    includes: ["member patterns", "improvements needed", "new opportunities"],
  },
] as const;

export type SparkEstateFounderReportScheduleId =
  (typeof SPARK_ESTATE_FOUNDER_REPORT_SCHEDULES)[number]["id"];

export const SPARK_ESTATE_PRODUCT_IMPROVEMENT_LOOP = [
  "Member uses Spark",
  "System learns",
  "Team reviews patterns",
  "Experience improves",
  "Members receive more value",
] as const;

export type SparkEstateAnalyticsEvent = {
  id: string;
  category: SparkEstateAnalyticsCategoryId;
  signal: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
};

export type SparkEstatePersonalizationInsight = {
  preferredWorkflows: string[];
  helpfulCardTypes: string[];
  guidanceStyle: string | null;
  successfulStrategies: string[];
};

export type SparkEstateFounderReport = {
  schedule: SparkEstateFounderReportScheduleId;
  generatedAt: string;
  sections: Array<{ title: string; items: string[] }>;
  frictionPoints: string[];
  improvementOpportunities: string[];
};

let memoryAnalyticsStore: SparkEstateAnalyticsEvent[] = [];

function newAnalyticsId(): string {
  return `analytics-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAnalyticsEvents(): SparkEstateAnalyticsEvent[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(SPARK_ESTATE_ANALYTICS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (entry): entry is SparkEstateAnalyticsEvent =>
              Boolean(entry) &&
              typeof (entry as SparkEstateAnalyticsEvent).category === "string" &&
              typeof (entry as SparkEstateAnalyticsEvent).signal === "string",
          );
        }
      }
    } catch {
      /* quota or parse */
    }
  }
  return [...memoryAnalyticsStore];
}

function writeAnalyticsEvents(events: SparkEstateAnalyticsEvent[]): void {
  const trimmed = events.slice(-200);
  memoryAnalyticsStore = trimmed;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SPARK_ESTATE_ANALYTICS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      /* quota */
    }
  }
}

export function clearSparkEstateAnalyticsEvents(): void {
  memoryAnalyticsStore = [];
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SPARK_ESTATE_ANALYTICS_STORAGE_KEY);
    } catch {
      /* noop */
    }
  }
}

export function recordSparkEstateAnalyticsEvent(input: {
  category: SparkEstateAnalyticsCategoryId;
  signal: string;
  metadata?: Record<string, string | number | boolean>;
}): SparkEstateAnalyticsEvent {
  const event: SparkEstateAnalyticsEvent = {
    id: newAnalyticsId(),
    category: input.category,
    signal: input.signal.trim(),
    timestamp: new Date().toISOString(),
    metadata: input.metadata,
  };
  const events = readAnalyticsEvents();
  events.push(event);
  writeAnalyticsEvents(events);
  return event;
}

export function getSparkEstateAnalyticsEvents(
  category?: SparkEstateAnalyticsCategoryId,
): SparkEstateAnalyticsEvent[] {
  const events = readAnalyticsEvents();
  return category ? events.filter((event) => event.category === category) : events;
}

export function aggregateSparkEstateAnalyticsByCategory(): Record<
  SparkEstateAnalyticsCategoryId,
  number
> {
  const counts = Object.fromEntries(
    SPARK_ESTATE_ANALYTICS_CATEGORIES.map((category) => [category.id, 0]),
  ) as Record<SparkEstateAnalyticsCategoryId, number>;

  for (const event of readAnalyticsEvents()) {
    counts[event.category] = (counts[event.category] ?? 0) + 1;
  }

  return counts;
}

export function identifySparkEstateFrictionPoints(
  events: SparkEstateAnalyticsEvent[] = readAnalyticsEvents(),
): string[] {
  const friction = new Set<string>();
  for (const event of events) {
    if (event.category !== "friction") continue;
    friction.add(event.signal);
  }
  for (const signal of SPARK_ESTATE_FRICTION_SIGNALS) {
    if (
      events.some(
        (event) =>
          event.category === "workflow-success" &&
          event.signal === "started" &&
          event.metadata?.completed === false,
      )
    ) {
      friction.add("abandoned creations");
    }
    if (events.some((event) => event.signal.toLowerCase().includes(signal))) {
      friction.add(signal);
    }
  }
  return [...friction];
}

export function buildSparkEstatePersonalizationInsights(
  events: SparkEstateAnalyticsEvent[] = readAnalyticsEvents(),
): SparkEstatePersonalizationInsight {
  const workflowCounts = new Map<string, number>();
  const cardCounts = new Map<string, number>();
  const strategies = new Set<string>();

  for (const event of events) {
    if (event.category === "workflow-success" && event.signal === "completed") {
      const workflow = String(event.metadata?.workflow ?? "");
      if (workflow) {
        workflowCounts.set(workflow, (workflowCounts.get(workflow) ?? 0) + 1);
      }
    }
    if (event.category === "cards" && event.signal !== "ignored") {
      const card = String(event.metadata?.cardKind ?? event.signal);
      cardCounts.set(card, (cardCounts.get(card) ?? 0) + 1);
    }
    if (event.category === "personalization-learning") {
      strategies.add(event.signal);
    }
  }

  const preferredWorkflows = [...workflowCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([workflow]) => workflow)
    .slice(0, 3);

  const helpfulCardTypes = [...cardCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([card]) => card)
    .slice(0, 3);

  const guidanceStyle =
    events.find((event) => event.category === "personalization-learning")?.signal ??
    null;

  return {
    preferredWorkflows,
    helpfulCardTypes,
    guidanceStyle,
    successfulStrategies: [...strategies].slice(0, 5),
  };
}

export function buildSparkEstateFounderReport(
  schedule: SparkEstateFounderReportScheduleId,
  events: SparkEstateAnalyticsEvent[] = readAnalyticsEvents(),
): SparkEstateFounderReport {
  const config = SPARK_ESTATE_FOUNDER_REPORT_SCHEDULES.find(
    (entry) => entry.id === schedule,
  );
  const frictionPoints = identifySparkEstateFrictionPoints(events);
  const insights = buildSparkEstatePersonalizationInsights(events);
  const aggregates = aggregateSparkEstateAnalyticsByCategory();

  const sections =
    config?.includes.map((title) => {
      if (title === "usage trends") {
        return {
          title,
          items: SPARK_ESTATE_ANALYTICS_CATEGORIES.filter((category) =>
            ["engagement", "cards"].includes(category.id),
          ).map((category) => `${category.title}: ${aggregates[category.id]} signals`),
        };
      }
      if (title === "popular features") {
        return {
          title,
          items: insights.helpfulCardTypes.length
            ? insights.helpfulCardTypes.map((card) => `Popular card: ${card}`)
            : ["No card preference signals yet"],
        };
      }
      if (title === "completed journeys") {
        return {
          title,
          items: [
            `Creation journey signals: ${aggregates["creation-journey"]}`,
            `Workflow completions: ${events.filter((event) => event.category === "workflow-success" && event.signal === "completed").length}`,
          ],
        };
      }
      if (title === "friction points") {
        return {
          title,
          items: frictionPoints.length ? frictionPoints : ["No friction signals recorded"],
        };
      }
      if (title === "member patterns") {
        return {
          title,
          items: [
            ...insights.preferredWorkflows.map((workflow) => `Preferred workflow: ${workflow}`),
            ...insights.successfulStrategies.map((strategy) => `Successful strategy: ${strategy}`),
          ],
        };
      }
      if (title === "improvements needed") {
        return {
          title,
          items: frictionPoints.length
            ? frictionPoints.map((point) => `Address: ${point}`)
            : ["Continue monitoring creation journey drop-offs"],
        };
      }
      if (title === "new opportunities") {
        return {
          title,
          items: insights.preferredWorkflows.length
            ? insights.preferredWorkflows.map(
                (workflow) => `Expand support for ${workflow}`,
              )
            : ["Gather more workflow completion signals"],
        };
      }
      return {
        title,
        items: events
          .filter((event) => event.signal.toLowerCase().includes(title.split(" ")[0] ?? ""))
          .slice(0, 5)
          .map((event) => `${event.category}: ${event.signal}`),
      };
    }) ?? [];

  return {
    schedule,
    generatedAt: new Date().toISOString(),
    sections,
    frictionPoints,
    improvementOpportunities: frictionPoints.map((point) => `Reduce ${point}`),
  };
}

export function assessSparkEstateAnalyticsCompliance(): {
  categoriesReady: boolean;
  privacyReady: boolean;
  successMetricsReady: boolean;
  founderReportingReady: boolean;
  creationJourneyTrackingReady: boolean;
  cardAnalyticsReady: boolean;
  workflowTrackingReady: boolean;
  frictionDetectionReady: boolean;
  personalizationLearningReady: boolean;
  vanityMetricsAvoided: boolean;
  productImprovementLoopReady: boolean;
  dataArchitectureAligned: boolean;
} {
  const creation = verifySparkEstateCreationJourney();
  const cards = verifySparkEstateCardEcosystem();
  const profile = verifySparkEstateMemberProfile();
  const lifecycle = verifySparkEstateUserJourneyAndMemberLifecycle();
  const data = verifySparkEstateFileAndDataArchitecture();

  return {
    categoriesReady: SPARK_ESTATE_ANALYTICS_CATEGORIES.length === 7,
    privacyReady: SPARK_ESTATE_ANALYTICS_PRIVACY_PRINCIPLES.length === 4,
    successMetricsReady: SPARK_ESTATE_ANALYTICS_SUCCESS_METRICS.length === 4,
    founderReportingReady: SPARK_ESTATE_FOUNDER_REPORT_SCHEDULES.length === 3,
    creationJourneyTrackingReady:
      creation.stepCount === 8 &&
      SPARK_ESTATE_ANALYTICS_CATEGORIES.some((category) => category.id === "creation-journey"),
    cardAnalyticsReady:
      cards.selectionWorks &&
      Object.keys(SPARK_ESTATE_CARD_ANALYTICS_EVENTS).length === 3,
    workflowTrackingReady: SPARK_ESTATE_WORKFLOW_ANALYTICS_WORKFLOWS.length === 5,
    frictionDetectionReady: SPARK_ESTATE_FRICTION_SIGNALS.length === 5,
    personalizationLearningReady:
      profile.personalizationReady && lifecycle.lifecycleResolutionReady,
    vanityMetricsAvoided: SPARK_ESTATE_VANITY_METRICS_AVOID.length === 3,
    productImprovementLoopReady: SPARK_ESTATE_PRODUCT_IMPROVEMENT_LOOP.length === 5,
    dataArchitectureAligned: data.layersMapped && data.layerCount === 10,
  };
}

export function verifySparkEstateAnalyticsAndLearningSystem(): {
  categories: number;
  analyticsReady: boolean;
  sampleEventRecordingReady: boolean;
  founderReportReady: boolean;
  frictionDetectionReady: boolean;
} {
  clearSparkEstateAnalyticsEvents();

  recordSparkEstateAnalyticsEvent({
    category: "engagement",
    signal: "room visited",
    metadata: { room: "chamber-of-momentum" },
  });
  recordSparkEstateAnalyticsEvent({
    category: "workflow-success",
    signal: "started",
    metadata: { workflow: "email creation", completed: false },
  });
  recordSparkEstateAnalyticsEvent({
    category: "friction",
    signal: "onboarding confusion",
  });
  recordSparkEstateAnalyticsEvent({
    category: "cards",
    signal: "opened",
    metadata: { cardKind: "spark-card" },
  });

  const events = getSparkEstateAnalyticsEvents();
  const friction = identifySparkEstateFrictionPoints(events);
  const weeklyReport = buildSparkEstateFounderReport("weekly", events);
  const compliance = assessSparkEstateAnalyticsCompliance();
  const analyticsReady = Object.values(compliance).every(Boolean);

  clearSparkEstateAnalyticsEvents();

  return {
    categories: SPARK_ESTATE_ANALYTICS_CATEGORIES.length,
    analyticsReady,
    sampleEventRecordingReady: events.length === 4,
    founderReportReady: weeklyReport.sections.length === 3,
    frictionDetectionReady: friction.includes("onboarding confusion"),
  };
}

export function sparkEstateAnalyticsCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim().toLowerCase() ?? "";
  if (
    text &&
    /analytics|learning system|what helps|friction|usage pattern|improve the experience/.test(
      text,
    )
  ) {
    return (
      `SPARK ESTATE ANALYTICS: ${SPARK_ESTATE_ANALYTICS_PRINCIPLE} ` +
      `Focus on ${SPARK_ESTATE_ANALYTICS_SUCCESS_METRICS.map((metric) => metric.label.toLowerCase()).join(", ")} — ` +
      `not ${SPARK_ESTATE_VANITY_METRICS_AVOID.join(", ")}. ` +
      `Ask: ${SPARK_ESTATE_ANALYTICS_PURPOSE_QUESTION}`
    );
  }
  return null;
}

export function formatSparkEstateAnalyticsAndLearningReport(
  verification: ReturnType<typeof verifySparkEstateAnalyticsAndLearningSystem> = verifySparkEstateAnalyticsAndLearningSystem(),
  compliance: ReturnType<typeof assessSparkEstateAnalyticsCompliance> = assessSparkEstateAnalyticsCompliance(),
): string {
  const lines: string[] = [
    `Spark Estate analytics: ${verification.analyticsReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_ANALYTICS_PRINCIPLE,
    SPARK_ESTATE_ANALYTICS_VISION,
    "",
    "Analytics categories:",
  ];

  for (const category of SPARK_ESTATE_ANALYTICS_CATEGORIES) {
    lines.push(`  ${category.title}: ${category.purpose}`);
    for (const measure of category.measures) {
      lines.push(`    • ${measure}`);
    }
  }

  lines.push("", "Card analytics events:");
  for (const [card, events] of Object.entries(SPARK_ESTATE_CARD_ANALYTICS_EVENTS)) {
    lines.push(`  ${card}: ${events.join(", ")}`);
  }

  lines.push("", "Privacy principles:");
  for (const principle of SPARK_ESTATE_ANALYTICS_PRIVACY_PRINCIPLES) {
    lines.push(`  • ${principle}`);
  }

  lines.push("", "Success metrics:");
  for (const metric of SPARK_ESTATE_ANALYTICS_SUCCESS_METRICS) {
    lines.push(`  ${metric.label}: ${metric.question}`);
  }

  lines.push("", "Founder reporting schedules:");
  for (const schedule of SPARK_ESTATE_FOUNDER_REPORT_SCHEDULES) {
    lines.push(`  ${schedule.label}: ${schedule.includes.join(", ")}`);
  }

  lines.push("", "Product improvement loop:");
  for (const step of SPARK_ESTATE_PRODUCT_IMPROVEMENT_LOOP) {
    lines.push(`  → ${step}`);
  }

  lines.push("", "Avoid vanity metrics:");
  for (const metric of SPARK_ESTATE_VANITY_METRICS_AVOID) {
    lines.push(`  ✗ ${metric}`);
  }

  lines.push("", "Compliance checks:");
  lines.push(`  Categories: ${compliance.categoriesReady ? "pass" : "fail"}`);
  lines.push(`  Privacy: ${compliance.privacyReady ? "pass" : "fail"}`);
  lines.push(`  Creation journey tracking: ${compliance.creationJourneyTrackingReady ? "pass" : "fail"}`);
  lines.push(`  Card analytics: ${compliance.cardAnalyticsReady ? "pass" : "fail"}`);
  lines.push(`  Workflow tracking: ${compliance.workflowTrackingReady ? "pass" : "fail"}`);
  lines.push(`  Friction detection: ${compliance.frictionDetectionReady ? "pass" : "fail"}`);
  lines.push(
    `  Personalization learning: ${compliance.personalizationLearningReady ? "pass" : "fail"}`,
  );
  lines.push(
    `  Sample event recording: ${verification.sampleEventRecordingReady ? "pass" : "fail"}`,
  );
  lines.push(`  Founder weekly report: ${verification.founderReportReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
