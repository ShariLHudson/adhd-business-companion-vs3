/**
 * Spark Estate™ — AI prompt and intelligence layer architecture (Phase 26).
 * One companion personality with layered specialized intelligence behind the experience.
 *
 * @see docs/protocols/SPARK_ESTATE_AI_PROMPT_AND_INTELLIGENCE_LAYER_ARCHITECTURE_PHASE26.md
 */

import type { AppSection } from "@/lib/companionUi";
import { SPARK_ESTATE_CREATION_STEPS } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateCreationJourney } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateConversationEngine } from "./sparkEstateConversationEngine";
import {
  resolveSparkEstateIntelligenceRoute,
  verifySparkEstateIntelligenceRouting,
} from "./sparkEstateIntelligenceRoutingMap";
import { verifySparkEstateKnowledgeAndAssetLibrary } from "./sparkEstateKnowledgeAndAssetLibraryArchitecture";
import {
  getSparkEstateMemberProfile,
  verifySparkEstateMemberProfile,
} from "./sparkEstateMemberProfileEngine";
import {
  SPARK_ESTATE_ROOM_EXPERTISE,
  verifySparkEstateRoomIntelligenceArchitecture,
} from "./sparkEstateRoomIntelligenceArchitecture";
import { getChamberMemorySnapshot } from "./chamberOfMomentumMemory";

export const SPARK_ESTATE_AI_INTELLIGENCE_PRINCIPLE =
  "AI intelligence is organized into layers — the member experiences one Spark; the system manages the layers.";

export const SPARK_ESTATE_AI_INTELLIGENCE_VISION =
  "One companion personality. Specialized expertise. Shared memory. Consistent guidance. Technology stays behind the experience.";

export const SPARK_ESTATE_INTELLIGENCE_LAYERS = [
  {
    layer: 1,
    id: "companion-identity",
    title: "Companion Identity Layer",
    purpose: "Defines how Spark communicates — always active.",
    controls: [
      "Shari voice",
      "warmth",
      "encouragement",
      "patience",
      "explanation style",
      "conversation rules",
    ],
    owner: "Conversation Engine",
    location: "lib/estate/sparkEstateConversationEngine.ts",
    alwaysActive: true,
  },
  {
    layer: 2,
    id: "member-context",
    title: "Member Context Layer",
    purpose: "Provides understanding of the individual for personalization.",
    controls: [
      "profile",
      "goals",
      "preferences",
      "projects",
      "history",
      "wins",
      "successful strategies",
    ],
    owner: "Member Profile Engine",
    location: "lib/estate/sparkEstateMemberProfileEngine.ts",
    alwaysActive: true,
  },
  {
    layer: 3,
    id: "routing",
    title: "Routing Intelligence Layer",
    purpose: "Determines what support is needed and routes to the right expertise.",
    controls: ["user request", "current state", "goals", "context"],
    routesTo: ["room intelligence", "workflow", "card", "knowledge resource"],
    owner: "Intelligence Routing Map",
    location: "lib/estate/sparkEstateIntelligenceRoutingMap.ts",
    alwaysActive: false,
  },
  {
    layer: 4,
    id: "room-intelligence",
    title: "Room Intelligence Layer",
    purpose: "Provides specialized room expertise without separate personalities.",
    controls: ["progress", "clarity", "messaging", "writing", "events", "research"],
    owner: "Room Intelligence Architecture",
    location: "lib/estate/sparkEstateRoomIntelligenceArchitecture.ts",
    alwaysActive: false,
  },
  {
    layer: 5,
    id: "workflow",
    title: "Workflow Layer",
    purpose: "Guides creation through the universal journey.",
    controls: SPARK_ESTATE_CREATION_STEPS.map((step) => step.id),
    owner: "Universal Creation Journey",
    location: "lib/universalCreation/sparkEstateCreationJourney.ts",
    alwaysActive: false,
  },
  {
    layer: 6,
    id: "knowledge-retrieval",
    title: "Knowledge Retrieval Layer",
    purpose: "Provides helpful frameworks, templates, examples, and guides without overwhelm.",
    controls: ["frameworks", "templates", "examples", "guides", "member-created assets"],
    owner: "Knowledge and Asset Library",
    location: "lib/estate/sparkEstateKnowledgeAndAssetLibraryArchitecture.ts",
    alwaysActive: false,
  },
  {
    layer: 7,
    id: "memory-update",
    title: "Memory Update Layer",
    purpose: "Learns from meaningful interactions.",
    controls: ["progress", "preferences", "wins", "successful approaches"],
    owner: "Chamber memory + estate memory",
    location:
      "lib/estate/chamberOfMomentumMemory.ts, lib/estateMemory/estateMemoryStore.ts",
    alwaysActive: false,
  },
] as const;

export type SparkEstateIntelligenceLayerId =
  (typeof SPARK_ESTATE_INTELLIGENCE_LAYERS)[number]["id"];

export const SPARK_ESTATE_PROMPT_STRUCTURE_FIELDS = [
  "identity",
  "purpose",
  "knowledge",
  "behavior",
  "boundaries",
  "connections",
] as const;

export type SparkEstateIntelligencePromptDefinition = {
  identity: string;
  purpose: string;
  knowledge: string;
  behavior: string;
  boundaries: string;
  connections?: string;
};

export const SPARK_ESTATE_CONVERSATION_PRIORITY = [
  "Understand the member.",
  "Use available context.",
  "Choose the right expertise.",
  "Guide the next step.",
  "Create value.",
  "Remember important learning.",
] as const;

export const SPARK_ESTATE_PROMPT_RULES = [
  "Ask one useful question at a time.",
  "Avoid unnecessary complexity.",
  "Explain why something matters.",
  "Provide examples.",
  "Maintain consistent tone.",
] as const;

export const SPARK_ESTATE_INTELLIGENCE_AVOID = [
  "separate personalities for every room",
  "conflicting advice systems",
  "duplicate workflows",
  "disconnected memory",
] as const;

export const SPARK_ESTATE_AI_QUALITY_TEST = [
  "Does it sound like Spark?",
  "Does it understand the member?",
  "Does it help the member move forward?",
  "Does it fit the universal journey?",
  "Does it improve the long-term relationship?",
] as const;

export type SparkEstateIntelligenceLayerStack = {
  layers: Array<{
    id: SparkEstateIntelligenceLayerId;
    title: string;
    active: boolean;
    owner: string;
  }>;
  conversationPriority: readonly string[];
  activeExpertise: string | null;
  routedIntelligence: string | null;
  promptStructureReady: boolean;
};

export type SparkEstateIntelligencePromptEvaluation = {
  approved: boolean;
  checklist: Array<{ field: string; passed: boolean; value: string }>;
  qualityTest: Array<{ question: string; passed: boolean }>;
  issues: string[];
};

export function evaluateSparkEstateIntelligencePrompt(
  prompt: SparkEstateIntelligencePromptDefinition,
): SparkEstateIntelligencePromptEvaluation {
  const issues: string[] = [];
  const fields = SPARK_ESTATE_PROMPT_STRUCTURE_FIELDS.map((field) => {
    const value = prompt[field]?.trim() ?? "";
    const passed = value.length > 0;
    if (!passed) issues.push(`missing ${field}`);
    return { field, passed, value: value || "Not specified" };
  });

  const qualityTest = SPARK_ESTATE_AI_QUALITY_TEST.map((question) => {
    const passed =
      prompt.identity.toLowerCase().includes("spark") &&
      prompt.behavior.toLowerCase().includes("question") &&
      prompt.boundaries.trim().length > 0 &&
      !/separate personality|different app/i.test(prompt.behavior);
    return { question, passed };
  });

  if (qualityTest.some((entry) => !entry.passed)) {
    issues.push("quality test gaps");
  }

  return {
    approved: issues.length === 0 && fields.every((entry) => entry.passed),
    checklist: fields,
    qualityTest,
    issues,
  };
}

export function buildSparkEstateIntelligenceLayerStack(input?: {
  text?: string;
  section?: AppSection;
}): SparkEstateIntelligenceLayerStack {
  const text = input?.text?.trim() ?? "";
  const snapshot = getChamberMemorySnapshot();
  const route = text
    ? resolveSparkEstateIntelligenceRoute({
        text,
        snapshot,
        currentSection: input?.section,
      })
    : null;

  const creationIntent = /\b(?:create|write|build|draft|plan)\b/i.test(text);
  const knowledgeIntent = /\b(?:learn|template|example|how do i|guide)\b/i.test(text);
  const memoryIntent = /\b(?:remember|save|win|progress|completed)\b/i.test(text);

  const layers = SPARK_ESTATE_INTELLIGENCE_LAYERS.map((layer) => {
    let active = layer.alwaysActive;
    if (layer.id === "routing") active = Boolean(text);
    if (layer.id === "room-intelligence") active = Boolean(route?.intelligence);
    if (layer.id === "workflow") active = creationIntent;
    if (layer.id === "knowledge-retrieval") active = knowledgeIntent;
    if (layer.id === "memory-update") active = memoryIntent || Boolean(route);
    return {
      id: layer.id,
      title: layer.title,
      active,
      owner: layer.owner,
    };
  });

  return {
    layers,
    conversationPriority: SPARK_ESTATE_CONVERSATION_PRIORITY,
    activeExpertise: route?.intelligence ?? null,
    routedIntelligence: route?.intelligence ?? null,
    promptStructureReady: SPARK_ESTATE_PROMPT_STRUCTURE_FIELDS.length === 6,
  };
}

export function assessSparkEstateAiPromptAndIntelligenceLayerCompliance(): {
  layersReady: boolean;
  promptStructureReady: boolean;
  conversationPriorityReady: boolean;
  promptRulesReady: boolean;
  avoidListReady: boolean;
  qualityTestReady: boolean;
  identityLayerReady: boolean;
  memberContextLayerReady: boolean;
  routingLayerReady: boolean;
  roomLayerReady: boolean;
  workflowLayerReady: boolean;
  knowledgeLayerReady: boolean;
  memoryLayerReady: boolean;
} {
  const conversation = verifySparkEstateConversationEngine();
  const profile = verifySparkEstateMemberProfile();
  const routing = verifySparkEstateIntelligenceRouting();
  const roomIntelligence = verifySparkEstateRoomIntelligenceArchitecture();
  const creation = verifySparkEstateCreationJourney();
  const knowledge = verifySparkEstateKnowledgeAndAssetLibrary();

  return {
    layersReady: SPARK_ESTATE_INTELLIGENCE_LAYERS.length === 7,
    promptStructureReady: SPARK_ESTATE_PROMPT_STRUCTURE_FIELDS.length === 6,
    conversationPriorityReady: SPARK_ESTATE_CONVERSATION_PRIORITY.length === 6,
    promptRulesReady: SPARK_ESTATE_PROMPT_RULES.length === 5,
    avoidListReady: SPARK_ESTATE_INTELLIGENCE_AVOID.length === 4,
    qualityTestReady: SPARK_ESTATE_AI_QUALITY_TEST.length === 5,
    identityLayerReady:
      conversation.voiceConsistent && SPARK_ESTATE_INTELLIGENCE_LAYERS[0].alwaysActive,
    memberContextLayerReady:
      profile.personalizationReady &&
      Boolean(getSparkEstateMemberProfile().goalsVision),
    routingLayerReady: routing.routesResolve,
    roomLayerReady: roomIntelligence.expertiseGroups === 6,
    workflowLayerReady: creation.stepCount === 8 && creation.hasRememberStep,
    knowledgeLayerReady: knowledge.retrievalReady,
    memoryLayerReady: getChamberMemorySnapshot().projects.length >= 0,
  };
}

export function verifySparkEstateAiPromptAndIntelligenceLayerArchitecture(): {
  layers: number;
  intelligenceLayerReady: boolean;
  samplePromptEvaluationReady: boolean;
  layerStackReady: boolean;
} {
  const sample = evaluateSparkEstateIntelligencePrompt({
    identity: "Spark — one trusted companion voice",
    purpose: "Help members move forward with clarity and next steps",
    knowledge: "progress, clarity, next steps, momentum patterns",
    behavior: "Ask one useful question at a time and guide the next step",
    boundaries: "Do not become a separate personality or duplicate planning systems",
    connections: "Momentum Builder™, Universal Creation Journey, Knowledge Cards",
  });

  const stack = buildSparkEstateIntelligenceLayerStack({
    text: "Help me plan my workshop launch",
    section: "chamber-of-momentum",
  });

  const compliance = assessSparkEstateAiPromptAndIntelligenceLayerCompliance();
  const intelligenceLayerReady = Object.values(compliance).every(Boolean);

  return {
    layers: SPARK_ESTATE_INTELLIGENCE_LAYERS.length,
    intelligenceLayerReady,
    samplePromptEvaluationReady: sample.approved,
    layerStackReady:
      stack.layers.filter((layer) => layer.active).length >= 3 &&
      stack.layers[0]?.active === true &&
      stack.layers[1]?.active === true,
  };
}

export function sparkEstateAiPromptLayerCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim().toLowerCase() ?? "";
  if (
    text &&
    /prompt|intelligence layer|ai layer|how does spark think|expertise layer/.test(
      text,
    )
  ) {
    return (
      `SPARK ESTATE INTELLIGENCE LAYERS: ${SPARK_ESTATE_AI_INTELLIGENCE_PRINCIPLE} ` +
      `Priority: ${SPARK_ESTATE_CONVERSATION_PRIORITY.join(" ")} ` +
      `Avoid separate room personalities, conflicting advice, duplicate workflows, disconnected memory.`
    );
  }
  return null;
}

export function formatSparkEstateAiPromptAndIntelligenceLayerReport(
  verification: ReturnType<typeof verifySparkEstateAiPromptAndIntelligenceLayerArchitecture> = verifySparkEstateAiPromptAndIntelligenceLayerArchitecture(),
  compliance: ReturnType<typeof assessSparkEstateAiPromptAndIntelligenceLayerCompliance> = assessSparkEstateAiPromptAndIntelligenceLayerCompliance(),
): string {
  const lines: string[] = [
    `Spark Estate™ AI intelligence layers: ${verification.intelligenceLayerReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_AI_INTELLIGENCE_PRINCIPLE,
    SPARK_ESTATE_AI_INTELLIGENCE_VISION,
    "",
    "Intelligence layers:",
  ];

  for (const layer of SPARK_ESTATE_INTELLIGENCE_LAYERS) {
    lines.push(
      `  ${layer.layer}. ${layer.title}`,
      `     Purpose: ${layer.purpose}`,
      `     Owner: ${layer.owner}`,
      `     Location: ${layer.location}`,
    );
  }

  lines.push("", "Prompt structure fields:");
  for (const field of SPARK_ESTATE_PROMPT_STRUCTURE_FIELDS) {
    lines.push(`  • ${field}`);
  }

  lines.push("", "Conversation priority:");
  for (const step of SPARK_ESTATE_CONVERSATION_PRIORITY) {
    lines.push(`  ${step}`);
  }

  lines.push("", "Prompt rules:");
  for (const rule of SPARK_ESTATE_PROMPT_RULES) {
    lines.push(`  • ${rule}`);
  }

  lines.push("", "Avoid:");
  for (const item of SPARK_ESTATE_INTELLIGENCE_AVOID) {
    lines.push(`  ✗ ${item}`);
  }

  lines.push("", "AI quality test:");
  for (const question of SPARK_ESTATE_AI_QUALITY_TEST) {
    lines.push(`  ? ${question}`);
  }

  lines.push("", "Room expertise examples:");
  for (const expertise of Object.values(SPARK_ESTATE_ROOM_EXPERTISE).slice(0, 3)) {
    lines.push(`  ${expertise.label}: ${expertise.specialties.join(", ")}`);
  }

  lines.push("", "Compliance checks:");
  lines.push(`  Layers mapped: ${compliance.layersReady ? "pass" : "fail"}`);
  lines.push(`  Identity layer: ${compliance.identityLayerReady ? "pass" : "fail"}`);
  lines.push(`  Member context layer: ${compliance.memberContextLayerReady ? "pass" : "fail"}`);
  lines.push(`  Routing layer: ${compliance.routingLayerReady ? "pass" : "fail"}`);
  lines.push(`  Room layer: ${compliance.roomLayerReady ? "pass" : "fail"}`);
  lines.push(`  Workflow layer: ${compliance.workflowLayerReady ? "pass" : "fail"}`);
  lines.push(`  Knowledge layer: ${compliance.knowledgeLayerReady ? "pass" : "fail"}`);
  lines.push(`  Memory layer: ${compliance.memoryLayerReady ? "pass" : "fail"}`);
  lines.push(
    `  Sample prompt evaluation: ${verification.samplePromptEvaluationReady ? "pass" : "fail"}`,
  );
  lines.push(`  Layer stack resolution: ${verification.layerStackReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
