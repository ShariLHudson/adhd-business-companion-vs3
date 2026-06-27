import type { EcosystemMajorSystem, EcosystemMajorSystemId } from "./types";

const VISUAL_THINKING_FUTURE = [
  "Living Canvas",
  "What-If Analysis",
  "Ripple Effects",
  "Business Simulations",
  "Board of Directors Analysis",
  "Opportunity Detection",
];

/** Major ecosystem systems — three-layer value + learning signals registry. */
export const ECOSYSTEM_MAJOR_SYSTEMS: EcosystemMajorSystem[] = [
  {
    id: "business-canvas",
    userLabel: "Business Canvas",
    threeLayer: {
      userValue: "Helps users understand how their business works.",
      intelligenceCaptures: [
        "Audience patterns",
        "Revenue patterns",
        "Offer structures",
        "Marketing approaches",
        "Business relationships",
      ],
      futureEnables: [...VISUAL_THINKING_FUTURE],
    },
    learningSignals: [
      "Business model patterns",
      "Revenue patterns",
      "Audience patterns",
      "Section completion depth",
      "Change exploration themes",
    ],
    intelligencePatterns: ["business_growth", "opportunity", "founder_decision"],
    canonicalModules: [
      "lib/visualFocus/businessCanvas/",
      "lib/visualFocus/companionIntelligence/",
      "lib/companionEntry/businessCanvasEntry.ts",
    ],
  },
  {
    id: "mind-map",
    userLabel: "Mind Map",
    threeLayer: {
      userValue: "Helps users explore scattered ideas and see the whole picture.",
      intelligenceCaptures: [
        "Idea clusters",
        "Opportunity themes",
        "Creativity patterns",
        "Branch depth and focus areas",
      ],
      futureEnables: ["Living Canvas", "Opportunity Detection"],
    },
    learningSignals: [
      "Idea clusters",
      "Opportunity themes",
      "Creativity patterns",
    ],
    intelligencePatterns: ["opportunity", "content_creation", "founder_momentum"],
    canonicalModules: ["lib/visualFocus/", "lib/visualFocus/companionIntelligence/"],
  },
  {
    id: "decision-tree",
    userLabel: "Decision Tree",
    threeLayer: {
      userValue: "Helps users explore possible paths before committing.",
      intelligenceCaptures: [
        "Risk tolerance",
        "Decision style",
        "Common decision themes",
        "Branch exploration depth",
      ],
      futureEnables: [
        "Board of Directors Analysis",
        "Predictive Business Guidance",
      ],
    },
    learningSignals: [
      "Risk tolerance",
      "Decision style",
      "Common decision themes",
    ],
    intelligencePatterns: ["founder_decision", "confidence", "execution"],
    canonicalModules: ["lib/visualFocus/", "lib/visualFocus/companionIntelligence/"],
  },
  {
    id: "decision-compass",
    userLabel: "Decision Compass",
    threeLayer: {
      userValue: "Helps users choose the best option when paths are unclear.",
      intelligenceCaptures: [
        "Decision criteria patterns",
        "Trade-off preferences",
        "Commitment timing",
      ],
      futureEnables: [
        "Board of Directors Analysis",
        "Founder Decision Patterns",
      ],
    },
    learningSignals: [
      "Decision criteria",
      "Chosen vs deferred options",
      "Confidence at decision time",
    ],
    intelligencePatterns: ["founder_decision", "confidence"],
    canonicalModules: [
      "lib/decisionCompass/",
      "components/visual-thinking/DecisionCompassExploration.tsx",
    ],
  },
  {
    id: "plan-my-day",
    userLabel: "Plan My Day",
    threeLayer: {
      userValue: "Helps users choose what fits today's reality.",
      intelligenceCaptures: [
        "Capacity patterns",
        "Productivity patterns",
        "Energy patterns",
        "Deferral and completion themes",
      ],
      futureEnables: [
        "Founder Momentum Patterns",
        "Predictive Business Guidance",
      ],
    },
    learningSignals: [
      "Capacity patterns",
      "Productivity patterns",
      "Energy patterns",
      "Theme deferral (marketing, follow-up, planning)",
    ],
    intelligencePatterns: ["planning", "energy", "execution", "founder_momentum"],
    canonicalModules: ["lib/planMyDay/planBehaviorLearning.ts"],
  },
  {
    id: "clear-my-mind",
    userLabel: "Clear My Mind",
    threeLayer: {
      userValue: "Helps users release mental load without sorting first.",
      intelligenceCaptures: [
        "Overwhelm triggers",
        "Mental load patterns",
        "Stress patterns",
        "Capture volume and themes",
      ],
      futureEnables: ["Overwhelm Patterns", "Founder Momentum Patterns"],
    },
    learningSignals: [
      "Overwhelm triggers",
      "Mental load patterns",
      "Stress patterns",
      "Capture themes",
    ],
    intelligencePatterns: ["overwhelm", "energy", "founder_momentum"],
    canonicalModules: ["lib/brainDumpCustomCategories.ts"],
  },
  {
    id: "visual-thinking",
    userLabel: "Visual Thinking",
    threeLayer: {
      userValue:
        "Helps users think visually — explore, connect, decide, and strategize.",
      intelligenceCaptures: [
        "Framework preference patterns",
        "Thinking style by situation",
        "Insight engagement",
        "Map completion depth",
      ],
      futureEnables: VISUAL_THINKING_FUTURE,
    },
    learningSignals: [
      "Framework usage by situation",
      "Generate vs abandon rates",
      "Insight panel engagement",
      "Continue Thinking momentum",
    ],
    intelligencePatterns: [
      "founder_decision",
      "opportunity",
      "business_growth",
      "planning",
    ],
    canonicalModules: ["lib/visualFocus/companionIntelligence/"],
  },
  {
    id: "projects",
    userLabel: "Projects",
    threeLayer: {
      userValue: "Helps users hold multi-step work over time.",
      intelligenceCaptures: [
        "Project scope patterns",
        "Stall and completion patterns",
        "Cross-project themes",
      ],
      futureEnables: ["Execution Patterns", "Board of Directors Analysis"],
    },
    learningSignals: ["Project velocity", "Stall themes", "Completion patterns"],
    intelligencePatterns: ["execution", "founder_momentum", "planning"],
    canonicalModules: ["lib/projectCoachHandoff.ts"],
  },
  {
    id: "goals",
    userLabel: "Goals",
    threeLayer: {
      userValue: "Helps users define measurable outcomes and stay aligned.",
      intelligenceCaptures: [
        "Goal type patterns",
        "Progress cadence",
        "Outcome vs activity drift",
      ],
      futureEnables: [
        "Business Growth Patterns",
        "Board of Directors Analysis",
      ],
    },
    learningSignals: [
      "Goal categories",
      "Self-reported progress patterns",
      "Deadline proximity behavior",
    ],
    intelligencePatterns: ["business_growth", "founder_momentum", "planning"],
    canonicalModules: [],
  },
];

export function getEcosystemMajorSystem(
  id: EcosystemMajorSystemId,
): EcosystemMajorSystem | undefined {
  return ECOSYSTEM_MAJOR_SYSTEMS.find((s) => s.id === id);
}

export function learningSignalsForSystem(id: EcosystemMajorSystemId): string[] {
  return getEcosystemMajorSystem(id)?.learningSignals ?? [];
}

export function intelligencePatternsForSystem(
  id: EcosystemMajorSystemId,
): EcosystemMajorSystem["intelligencePatterns"] {
  return getEcosystemMajorSystem(id)?.intelligencePatterns ?? [];
}
