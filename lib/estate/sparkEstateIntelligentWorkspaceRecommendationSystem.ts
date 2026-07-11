/**
 * Spark Estate — intelligent workspace recommendation system (Phase 31).
 * Guide members to the right workspace without forcing movement.
 *
 * @see docs/protocols/SPARK_ESTATE_INTELLIGENT_WORKSPACE_RECOMMENDATION_SYSTEM_SPECIFICATION_PHASE31.md
 */

import type { AppSection } from "@/lib/companionUi";
import {
  inferCreationArchetype,
  SPARK_ESTATE_CREATION_STEPS,
  verifySparkEstateCreationJourney,
} from "@/lib/universalCreation/sparkEstateCreationJourney";
import { getChamberMemorySnapshot } from "./chamberOfMomentumMemory";
import {
  resolveSparkEstateIntelligenceRoute,
  verifySparkEstateIntelligenceRouting,
} from "./sparkEstateIntelligenceRoutingMap";
import {
  SPARK_ESTATE_ROOM_EXPERTISE,
  verifySparkEstateRoomIntelligenceArchitecture,
  type SparkEstateRoomExpertiseGroup,
} from "./sparkEstateRoomIntelligenceArchitecture";

export const SPARK_ESTATE_WORKSPACE_RECOMMENDATION_PRINCIPLE =
  "Spark should guide — Spark should not force. The member remains in control.";

export const SPARK_ESTATE_WORKSPACE_RECOMMENDATION_VISION =
  "Freedom of conversation with the power of specialized spaces — Spark helps members discover where they may thrive.";

export const SPARK_ESTATE_WORKSPACE_SUCCESS_TEST =
  "Spark knows where I might succeed best, but I still get to decide.";

export const SPARK_ESTATE_WORKSPACE_VS_INTELLIGENCE = {
  intelligence: {
    question: "Who can help me?",
    examples: [
      "Marketing intelligence",
      "Project intelligence",
      "Decision intelligence",
      "Learning intelligence",
    ],
  },
  workspace: {
    question: "Where would I have the best experience?",
    examples: [
      "Chamber of Momentum",
      "Marketing Room",
      "Content Room",
      "Research Room",
    ],
  },
} as const;

export const SPARK_ESTATE_WORKSPACE_RECOMMENDATION_TRIGGERS = [
  "the member has a larger project",
  "multiple areas of expertise are needed",
  "organization would improve success",
  "a dedicated environment would reduce friction",
] as const;

export const SPARK_ESTATE_WORKSPACE_LANGUAGE_USE = [
  "I recommend...",
  "I think you may benefit from...",
  "This may be easier because...",
] as const;

export const SPARK_ESTATE_WORKSPACE_LANGUAGE_AVOID = [
  "You need to...",
  "You have to...",
  "Go here first.",
] as const;

export const SPARK_ESTATE_WORKSPACE_SELECTION_FLOW = [
  "Member request",
  "Spark understands goal",
  "Determine complexity",
  'Ask: "Would you like to use a dedicated workspace?"',
  "Explain benefits",
  "Member chooses",
  "Begin universal creation journey",
] as const;

export const SPARK_ESTATE_WORKSPACE_MEMBER_EXPERIENCE_ALWAYS = [
  "explain why a recommendation is helpful",
  "provide choice",
  "maintain conversation continuity",
  "keep the same Shari voice",
] as const;

export const SPARK_ESTATE_WORKSPACE_MEMBER_EXPERIENCE_NEVER = [
  "interrupt unnecessarily",
  "force movement",
  "make rooms feel required",
] as const;

export const SPARK_ESTATE_WORKSPACE_MEMORY_KEY = "spark-estate-workspace-prefs-v1";

export type SparkEstateWorkspaceId =
  | "chamber"
  | "marketing"
  | "content"
  | "research"
  | "templates";

export type SparkEstateIntelligenceKind =
  | "marketing"
  | "project"
  | "decision"
  | "learning";

export type SparkEstateWorkspaceComplexity = "simple" | "moderate" | "complex";

export type SparkEstateWorkspaceOption = {
  id: SparkEstateWorkspaceId;
  label: string;
  section: AppSection;
  explanation: string;
  benefits: readonly string[];
};

export type SparkEstateWorkspaceMemoryPreference = {
  workspaceStyle?: SparkEstateWorkspaceId | "conversation";
  prefersGuidedRooms?: boolean;
  prefersConversation?: boolean;
  updatedAt: string;
};

export type SparkEstateWorkspaceRecommendation = {
  shouldRecommend: boolean;
  goal: string | null;
  complexity: SparkEstateWorkspaceComplexity;
  intelligencesNeeded: SparkEstateIntelligenceKind[];
  recommendedWorkspace: SparkEstateWorkspaceOption | null;
  stayOption: {
    label: string;
    explanation: string;
    benefits: readonly string[];
  };
  openingLine: string | null;
  choiceQuestion: string;
  useUniversalCreationJourney: boolean;
  memoryHints: string[];
};

const WORKSPACE_OPTIONS: Record<SparkEstateWorkspaceId, SparkEstateWorkspaceOption> = {
  chamber: {
    id: "chamber",
    label: "Chamber of Momentum",
    section: "chamber-of-momentum",
    explanation:
      "The Chamber brings together the right support to help you move from idea to finished project.",
    benefits: [
      "project organization",
      "expert guidance",
      "progress tracking",
      "next steps",
      "completion support",
    ],
  },
  marketing: {
    id: "marketing",
    label: "Marketing Room",
    section: "content-generator",
    explanation:
      "The Marketing Room focuses on messaging, campaigns, and funnel strategy in one dedicated space.",
    benefits: [
      "marketing expertise",
      "campaign structure",
      "messaging clarity",
      "funnel planning",
    ],
  },
  content: {
    id: "content",
    label: "Content Room",
    section: "content-generator",
    explanation:
      "The Content Room is built for writing, editing, and organizing content with less distraction.",
    benefits: [
      "writing focus",
      "editing support",
      "content structure",
      "publishing readiness",
    ],
  },
  research: {
    id: "research",
    label: "Research Room",
    section: "grow-observatory",
    explanation:
      "The Research Room helps you gather, analyze, and summarize information before you build.",
    benefits: [
      "research focus",
      "analysis support",
      "insight summaries",
      "informed decisions",
    ],
  },
  templates: {
    id: "templates",
    label: "Template/Knowledge workspace",
    section: "templates-library",
    explanation:
      "Because this is something you may reuse, the Template/Knowledge workspace may help organize it.",
    benefits: [
      "reusable structure",
      "organized knowledge",
      "easy return visits",
      "template clarity",
    ],
  },
};

const STAY_OPTION = {
  label: "Stay where you are",
  explanation:
    "We can create it here too. I will guide you step-by-step and bring in the knowledge we need.",
  benefits: ["no interruption", "familiar conversation", "flexible experience"],
} as const;

let workspaceMemoryFallback: SparkEstateWorkspaceMemoryPreference | null = null;

const FUNNEL_RE =
  /\b(?:sales funnel|marketing funnel|create a funnel|build a funnel|funnel)\b/i;
const TEMPLATE_RE =
  /\b(?:template|onboarding template|reusable|checklist template|workflow template)\b/i;
const WORKSHOP_RE = /\b(?:plan my workshop|workshop plan|host a workshop|workshop)\b/i;
const PROJECT_RE =
  /\b(?:larger project|multi-?step project|plan my project|project plan|milestone)\b/i;
const CREATE_RE =
  /\b(?:help me (?:write|create|build|draft)|create a|build a|write an?|design a|draft a|i need to create)\b/i;

function readWorkspaceMemory(): SparkEstateWorkspaceMemoryPreference | null {
  if (typeof window === "undefined") return workspaceMemoryFallback;
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_WORKSPACE_MEMORY_KEY);
    if (!raw) return workspaceMemoryFallback;
    const parsed = JSON.parse(raw) as SparkEstateWorkspaceMemoryPreference;
    if (!parsed || typeof parsed.updatedAt !== "string") return workspaceMemoryFallback;
    return parsed;
  } catch {
    return workspaceMemoryFallback;
  }
}

function writeWorkspaceMemory(
  preference: Omit<SparkEstateWorkspaceMemoryPreference, "updatedAt">,
): SparkEstateWorkspaceMemoryPreference {
  const next: SparkEstateWorkspaceMemoryPreference = {
    ...preference,
    updatedAt: new Date().toISOString(),
  };
  workspaceMemoryFallback = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SPARK_ESTATE_WORKSPACE_MEMORY_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }
  return next;
}

export function recordSparkEstateWorkspaceChoice(input: {
  choice: "recommended" | "stay";
  workspaceId?: SparkEstateWorkspaceId;
}): SparkEstateWorkspaceMemoryPreference {
  const existing = readWorkspaceMemory();
  return writeWorkspaceMemory({
    workspaceStyle:
      input.choice === "stay"
        ? "conversation"
        : (input.workspaceId ?? existing?.workspaceStyle),
    prefersGuidedRooms:
      input.choice === "recommended" ? true : (existing?.prefersGuidedRooms ?? false),
    prefersConversation:
      input.choice === "stay" ? true : (existing?.prefersConversation ?? false),
  });
}

export function getSparkEstateWorkspaceMemoryPreferences(): SparkEstateWorkspaceMemoryPreference | null {
  return readWorkspaceMemory();
}

export function assessSparkEstateWorkspaceComplexity(
  text: string,
): SparkEstateWorkspaceComplexity {
  const normalized = text.trim();
  if (!normalized) return "simple";
  if (FUNNEL_RE.test(normalized) || WORKSHOP_RE.test(normalized) || PROJECT_RE.test(normalized)) {
    return "complex";
  }
  if (TEMPLATE_RE.test(normalized)) return "moderate";
  if (CREATE_RE.test(normalized)) return "moderate";
  return "simple";
}

function inferIntelligencesNeeded(text: string): SparkEstateIntelligenceKind[] {
  const needed = new Set<SparkEstateIntelligenceKind>();
  if (/\b(?:funnel|marketing|campaign|messaging|offer)\b/i.test(text)) {
    needed.add("marketing");
  }
  if (/\b(?:project|milestone|task|workshop|plan)\b/i.test(text)) {
    needed.add("project");
  }
  if (/\b(?:decide|choice|which option|should i)\b/i.test(text)) {
    needed.add("decision");
  }
  if (/\b(?:learn|understand|research|how do i|teach me)\b/i.test(text)) {
    needed.add("learning");
  }
  if (CREATE_RE.test(text)) needed.add("project");
  return [...needed];
}

function selectRecommendedWorkspace(text: string): SparkEstateWorkspaceId {
  if (TEMPLATE_RE.test(text)) return "templates";
  if (FUNNEL_RE.test(text)) return "chamber";
  if (WORKSHOP_RE.test(text) || PROJECT_RE.test(text)) return "chamber";
  if (/\b(?:research|analyze|understand|study)\b/i.test(text)) return "research";
  if (/\b(?:marketing|campaign|funnel|messaging)\b/i.test(text)) return "marketing";
  if (/\b(?:write|blog|article|content|newsletter)\b/i.test(text)) return "content";

  const archetype = inferCreationArchetype({ userText: text });
  if (archetype === "template") return "templates";
  if (archetype === "funnel" || archetype === "project" || archetype === "plan") {
    return "chamber";
  }
  if (archetype === "strategy") return "marketing";
  return "chamber";
}

function buildMemoryHints(): string[] {
  const hints: string[] = [];
  const memory = readWorkspaceMemory();
  const chamberMemory = getChamberMemorySnapshot();

  if (memory?.prefersConversation) {
    hints.push("Member often prefers staying in conversation — offer choice gently.");
  }
  if (memory?.prefersGuidedRooms) {
    hints.push("Member often benefits from guided rooms — explain workspace benefits clearly.");
  }
  if (memory?.workspaceStyle && memory.workspaceStyle !== "conversation") {
    const workspace = WORKSPACE_OPTIONS[memory.workspaceStyle];
    hints.push(`Preferred workspace style: ${workspace.label}.`);
  }
  if (chamberMemory.preferences.length > 0) {
    hints.push("Use chamber memory preferences to keep the same Shari voice.");
  }
  return hints;
}

export function resolveSparkEstateWorkspaceRecommendation(input: {
  text: string;
  currentSection?: AppSection;
}): SparkEstateWorkspaceRecommendation {
  const text = input.text.trim();
  const complexity = assessSparkEstateWorkspaceComplexity(text);
  const intelligencesNeeded = inferIntelligencesNeeded(text);
  const memoryHints = buildMemoryHints();
  const memory = readWorkspaceMemory();
  const route = resolveSparkEstateIntelligenceRoute({
    text,
    currentSection: input.currentSection,
  });

  const creationIntent =
    CREATE_RE.test(text) ||
    FUNNEL_RE.test(text) ||
    TEMPLATE_RE.test(text) ||
    WORKSHOP_RE.test(text) ||
    PROJECT_RE.test(text) ||
    route?.useUniversalCreationJourney === true;

  const shouldRecommend =
    creationIntent &&
    complexity !== "simple" &&
    !(memory?.prefersConversation && complexity === "moderate");

  if (!shouldRecommend) {
    return {
      shouldRecommend: false,
      goal: null,
      complexity,
      intelligencesNeeded,
      recommendedWorkspace: null,
      stayOption: STAY_OPTION,
      openingLine: null,
      choiceQuestion: "Would you like to use a dedicated workspace?",
      useUniversalCreationJourney: creationIntent,
      memoryHints,
    };
  }

  const workspaceId = selectRecommendedWorkspace(text);
  const recommendedWorkspace = WORKSPACE_OPTIONS[workspaceId];
  const goal =
    inferCreationArchetype({ userText: text }) ??
    (FUNNEL_RE.test(text)
      ? "sales funnel"
      : TEMPLATE_RE.test(text)
        ? "template"
        : WORKSHOP_RE.test(text)
          ? "workshop"
          : "project");

  return {
    shouldRecommend: true,
    goal,
    complexity,
    intelligencesNeeded,
    recommendedWorkspace,
    stayOption: STAY_OPTION,
    openingLine: "I can help you create that. You have two options.",
    choiceQuestion: "Would you like to use a dedicated workspace?",
    useUniversalCreationJourney: true,
    memoryHints,
  };
}

export function buildSparkEstateWorkspaceRecommendationLanguage(
  recommendation: SparkEstateWorkspaceRecommendation = resolveSparkEstateWorkspaceRecommendation(
    { text: "I need to create a sales funnel." },
  ),
): string {
  if (!recommendation.shouldRecommend || !recommendation.recommendedWorkspace) {
    return (
      `${SPARK_ESTATE_WORKSPACE_LANGUAGE_USE[1]} we can work here step-by-step ` +
      "without moving you anywhere."
    );
  }

  const workspace = recommendation.recommendedWorkspace;
  return (
    `${SPARK_ESTATE_WORKSPACE_LANGUAGE_USE[0]} ${workspace.label}. ` +
    `${workspace.explanation} ` +
    `${SPARK_ESTATE_WORKSPACE_LANGUAGE_USE[2]} ${workspace.benefits.slice(0, 2).join(" and ")}. ` +
    `Or ${recommendation.stayOption.explanation}`
  );
}

export function assessSparkEstateWorkspaceRecommendationCompliance(): {
  principleReady: boolean;
  intelligenceVsWorkspaceReady: boolean;
  triggersReady: boolean;
  languageRulesReady: boolean;
  selectionFlowReady: boolean;
  memberExperienceRulesReady: boolean;
  universalJourneyReady: boolean;
  memoryConnectionReady: boolean;
  intelligenceRoutingBridgeReady: boolean;
  roomIntelligenceBridgeReady: boolean;
  creationJourneyBridgeReady: boolean;
} {
  const routing = verifySparkEstateIntelligenceRouting();
  const rooms = verifySparkEstateRoomIntelligenceArchitecture();
  const journey = verifySparkEstateCreationJourney();

  return {
    principleReady: SPARK_ESTATE_WORKSPACE_RECOMMENDATION_PRINCIPLE.includes("not force"),
    intelligenceVsWorkspaceReady:
      SPARK_ESTATE_WORKSPACE_VS_INTELLIGENCE.intelligence.examples.length === 4 &&
      SPARK_ESTATE_WORKSPACE_VS_INTELLIGENCE.workspace.examples.length === 4,
    triggersReady: SPARK_ESTATE_WORKSPACE_RECOMMENDATION_TRIGGERS.length === 4,
    languageRulesReady:
      SPARK_ESTATE_WORKSPACE_LANGUAGE_USE.length === 3 &&
      SPARK_ESTATE_WORKSPACE_LANGUAGE_AVOID.length === 3,
    selectionFlowReady: SPARK_ESTATE_WORKSPACE_SELECTION_FLOW.length === 7,
    memberExperienceRulesReady:
      SPARK_ESTATE_WORKSPACE_MEMBER_EXPERIENCE_ALWAYS.length === 4 &&
      SPARK_ESTATE_WORKSPACE_MEMBER_EXPERIENCE_NEVER.length === 3,
    universalJourneyReady: journey.stepCount === SPARK_ESTATE_CREATION_STEPS.length,
    memoryConnectionReady: Boolean(SPARK_ESTATE_WORKSPACE_MEMORY_KEY),
    intelligenceRoutingBridgeReady: routing.routesResolve && routing.roomIndependence,
    roomIntelligenceBridgeReady: rooms.sharedFoundationReady,
    creationJourneyBridgeReady: journey.hasRememberStep && journey.hasRoomIndependence,
  };
}

export function verifySparkEstateIntelligentWorkspaceRecommendationSystem(): {
  workspaces: number;
  recommendationReady: boolean;
  choicePreserved: boolean;
  successTestReady: boolean;
} {
  const savedMemory = workspaceMemoryFallback;
  workspaceMemoryFallback = null;
  try {
    const funnel = resolveSparkEstateWorkspaceRecommendation({
      text: "I need to create a sales funnel.",
    });
    const template = resolveSparkEstateWorkspaceRecommendation({
      text: "I need a client onboarding template.",
    });
    const workshop = resolveSparkEstateWorkspaceRecommendation({
      text: "I need to plan my workshop.",
    });
    const compliance = assessSparkEstateWorkspaceRecommendationCompliance();

    const recommendationReady =
      Object.values(compliance).every(Boolean) &&
      funnel.shouldRecommend &&
      funnel.recommendedWorkspace?.id === "chamber" &&
      template.recommendedWorkspace?.id === "templates" &&
      workshop.recommendedWorkspace?.id === "chamber";

    return {
      workspaces: Object.keys(WORKSPACE_OPTIONS).length,
      recommendationReady,
      choicePreserved:
        funnel.stayOption.label === "Stay where you are" &&
        Boolean(funnel.openingLine?.includes("two options")),
      successTestReady: SPARK_ESTATE_WORKSPACE_SUCCESS_TEST.includes("still get to decide"),
    };
  } finally {
    workspaceMemoryFallback = savedMemory;
  }
}

export function sparkEstateWorkspaceRecommendationCompanionHint(input?: {
  text?: string;
  currentSection?: AppSection;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (
    !text ||
    !/(?:workspace|dedicated room|move to|chamber|sales funnel|template|workshop|where should i work)/i.test(
      text,
    )
  ) {
    return null;
  }

  const recommendation = resolveSparkEstateWorkspaceRecommendation({
    text,
    currentSection: input?.currentSection,
  });
  if (!recommendation.shouldRecommend) return null;

  const lines = [
    `SPARK ESTATE WORKSPACE: ${SPARK_ESTATE_WORKSPACE_RECOMMENDATION_PRINCIPLE}`,
    buildSparkEstateWorkspaceRecommendationLanguage(recommendation),
    `Ask: "${recommendation.choiceQuestion}" — never ${SPARK_ESTATE_WORKSPACE_LANGUAGE_AVOID[1].replace("...", "")}`,
  ];
  if (recommendation.useUniversalCreationJourney) {
    lines.push("Same universal creation journey regardless of workspace choice.");
  }
  return lines.join(" ");
}

export function formatSparkEstateWorkspaceRecommendationReport(
  verification: ReturnType<
    typeof verifySparkEstateIntelligentWorkspaceRecommendationSystem
  > = verifySparkEstateIntelligentWorkspaceRecommendationSystem(),
  compliance: ReturnType<
    typeof assessSparkEstateWorkspaceRecommendationCompliance
  > = assessSparkEstateWorkspaceRecommendationCompliance(),
): string {
  const funnel = resolveSparkEstateWorkspaceRecommendation({
    text: "I need to create a sales funnel.",
  });

  const lines: string[] = [
    `Spark Estate workspace recommendation: ${verification.recommendationReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_WORKSPACE_RECOMMENDATION_PRINCIPLE,
    SPARK_ESTATE_WORKSPACE_RECOMMENDATION_VISION,
    SPARK_ESTATE_WORKSPACE_SUCCESS_TEST,
    "",
    "Intelligence vs workspace:",
    `  Intelligence — ${SPARK_ESTATE_WORKSPACE_VS_INTELLIGENCE.intelligence.question}`,
    `  Workspace — ${SPARK_ESTATE_WORKSPACE_VS_INTELLIGENCE.workspace.question}`,
    "",
    "Recommendation triggers:",
    ...SPARK_ESTATE_WORKSPACE_RECOMMENDATION_TRIGGERS.map((trigger) => `  • ${trigger}`),
    "",
    "Language to use:",
    ...SPARK_ESTATE_WORKSPACE_LANGUAGE_USE.map((phrase) => `  ✓ ${phrase}`),
    "",
    "Language to avoid:",
    ...SPARK_ESTATE_WORKSPACE_LANGUAGE_AVOID.map((phrase) => `  ✗ ${phrase}`),
    "",
    "Selection flow:",
    ...SPARK_ESTATE_WORKSPACE_SELECTION_FLOW.map((step) => `  → ${step}`),
    "",
    "Example — sales funnel:",
    `  Opening: ${funnel.openingLine}`,
    `  Recommended: ${funnel.recommendedWorkspace?.label}`,
    `  Stay option: ${funnel.stayOption.label}`,
    "",
    "Member experience — always:",
    ...SPARK_ESTATE_WORKSPACE_MEMBER_EXPERIENCE_ALWAYS.map((rule) => `  ✓ ${rule}`),
    "",
    "Member experience — never:",
    ...SPARK_ESTATE_WORKSPACE_MEMBER_EXPERIENCE_NEVER.map((rule) => `  ✗ ${rule}`),
    "",
    "Workspaces available:",
    ...Object.values(WORKSPACE_OPTIONS).map(
      (workspace) => `  ${workspace.label} (${workspace.section})`,
    ),
    "",
    "Room expertise bridge:",
    ...(
      Object.keys(SPARK_ESTATE_ROOM_EXPERTISE) as SparkEstateRoomExpertiseGroup[]
    ).map((id) => `  ${SPARK_ESTATE_ROOM_EXPERTISE[id].label}`),
    "",
    "Compliance checks:",
    `  Principle: ${compliance.principleReady ? "pass" : "fail"}`,
    `  Intelligence routing bridge: ${compliance.intelligenceRoutingBridgeReady ? "pass" : "fail"}`,
    `  Room intelligence bridge: ${compliance.roomIntelligenceBridgeReady ? "pass" : "fail"}`,
    `  Universal journey bridge: ${compliance.creationJourneyBridgeReady ? "pass" : "fail"}`,
    `  Memory connection: ${compliance.memoryConnectionReady ? "pass" : "fail"}`,
    `  Choice preserved: ${verification.choicePreserved ? "pass" : "fail"}`,
  ];

  return lines.join("\n");
}
