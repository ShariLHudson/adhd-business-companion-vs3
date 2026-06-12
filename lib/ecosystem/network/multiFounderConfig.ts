// Founder Ecosystem — Phase 17 Multi-Founder Intelligence Network configuration.
// Cursor-ready workflow spec as a typed, importable config object.

export const MULTI_FOUNDER_CONFIG = {
  phase: "17",
  name: "Multi-Founder Intelligence Network",
  goal: "Use anonymized, aggregated founder patterns to improve recommendations, benchmarks, and adaptive guidance.",
  privacyRules: {
    removePersonalIdentifiers: true,
    removeBusinessNames: true,
    removeDocumentContent: true,
    removeExactMessages: true,
    useAggregatedPatternsOnly: true,
    minimumCohortSize: 10,
    neverExposeIndividualFounderData: true,
  },
  dataInputs: {
    digitalTwinSignals: [
      "workStyle",
      "decisionStyle",
      "executionStyle",
      "momentumDrivers",
      "overwhelmTriggers",
      "successfulWorkflows",
      "ignoredRecommendations",
      "completedActions",
      "stage",
      "businessFocus",
    ],
    eventSignals: [
      "tasksCompleted",
      "projectsAdvanced",
      "focusSessionsCompleted",
      "timeBlocksCompleted",
      "documentsCreated",
      "recommendationsAccepted",
      "recommendationsDismissed",
    ],
  },
  networkModels: {
    aggregationEngine: {
      purpose: "Group anonymized founder signals into pattern clusters.",
    },
    benchmarkModel: {
      purpose: "Generate stage-aware and focus-aware benchmarks.",
    },
    networkInsightEngine: {
      purpose:
        "Identify common success patterns, friction patterns, and emerging opportunities.",
    },
    recommendationOptimizer: {
      purpose: "Improve individual recommendations using aggregate trends.",
    },
  },
  benchmarkTypes: [
    "tasksCompletedPerWeek",
    "focusSessionsPerWeek",
    "projectsAdvancedPerWeek",
    "timeBlocksCompletedPerWeek",
    "recommendationAcceptanceRate",
    "documentCompletionRate",
    "projectStallRate",
  ],
  insightTypes: [
    "commonMomentumDrivers",
    "commonOverwhelmTriggers",
    "successfulWorkflowPatterns",
    "stageSpecificRisks",
    "stageSpecificOpportunities",
    "highCompletionBehaviors",
    "lowCompletionWarningSigns",
  ],
  recommendationRules: {
    useNetworkInsightsAsSupport: true,
    neverOverrideFounderDigitalTwin: true,
    frameAsTrendsNotCertainty: true,
    explainWhyRecommendationAppears: true,
  },
  userFacingLanguage: {
    allowed: [
      "Founders at a similar stage often benefit from...",
      "One pattern we see is...",
      "This may be worth trying because...",
      "Based on similar workflows, you might consider...",
    ],
    forbidden: [
      "Everyone does this",
      "You should definitely",
      "This guarantees",
      "Other founders like you did exactly...",
    ],
  },
  dashboardOutputs: {
    networkBenchmarks: true,
    stageTrends: true,
    commonPatterns: true,
    recommendedExperiments: true,
  },
  filesToBuild: [
    "multiFounderIntelligence.ts",
    "aggregationEngine.ts",
    "benchmarkModel.ts",
    "networkInsights.ts",
    "recommendationOptimizer.ts",
    "privacyGuard.ts",
    "multiFounderSelectors.ts",
    "multiFounderTests.ts",
  ],
  successCriteria: [
    "Founder data is anonymized before aggregation.",
    "No individual founder data is exposed.",
    "Benchmarks only appear when minimum cohort size is met.",
    "Recommendations are improved by aggregate patterns but remain personalized.",
    "Insights are framed as trends, not guarantees.",
  ],
} as const;

export const MINIMUM_COHORT_SIZE = MULTI_FOUNDER_CONFIG.privacyRules.minimumCohortSize;

export const COHORT_TOO_SMALL_MESSAGE = "Not enough comparison data yet.";
