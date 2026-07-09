/**
 * Spark Estate™ — room intelligence architecture (Phase 18).
 * Specialized room expertise with one unified Spark companion experience.
 *
 * @see docs/protocols/SPARK_ESTATE_ROOM_INTELLIGENCE_ARCHITECTURE_SPECIFICATION_PHASE18.md
 */

import type { AppSection } from "@/lib/companionUi";
import { SPARK_ESTATE_CREATION_STEPS } from "@/lib/universalCreation/sparkEstateCreationJourney";
import {
  getSparkEstateMemberProfile,
  type SparkEstateMemberProfile,
} from "./sparkEstateMemberProfileEngine";
import {
  SPARK_ESTATE_SHARI_TRAITS,
  verifySparkEstateConversationEngine,
} from "./sparkEstateConversationEngine";
import {
  resolveSparkEstateIntelligenceRoute,
  SPARK_ESTATE_ROOM_INDEPENDENCE_RULE,
  type SparkEstateImmediateNeed,
  type SparkEstateIntelligenceRoute,
} from "./sparkEstateIntelligenceRoutingMap";
import type { SparkEstateCardKind } from "./sparkEstateCardEcosystem";

export const SPARK_ESTATE_ROOM_INTELLIGENCE_PRINCIPLE =
  "Rooms are areas of expertise — not separate personalities. The member always works with Spark.";

export const SPARK_ESTATE_ROOM_INTELLIGENCE_VISION =
  "One companion. Many rooms. Specialized expertise. Shared memory. One consistent journey.";

export const SPARK_ESTATE_ROOM_ARCHITECTURE_LAYERS = [
  {
    id: "identity",
    title: "Identity",
    defines: ["purpose", "audience", "problems solved", "expertise"],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    defines: ["knowledge", "frameworks", "workflows", "templates", "examples"],
  },
  {
    id: "experience",
    title: "Experience",
    defines: ["room appearance", "cards shown", "tools available", "actions supported"],
  },
  {
    id: "connection",
    title: "Connection",
    defines: [
      "when the room is activated",
      "what information it shares",
      "what it sends back to memory",
    ],
  },
] as const;

export const SPARK_ESTATE_SHARED_FOUNDATION = {
  shariVoice: {
    label: "Shari voice",
    traits: SPARK_ESTATE_SHARI_TRAITS,
    rule: "Same warmth, encouragement, and practical guidance in every room.",
  },
  universalCreationJourney: {
    label: "Universal creation journey",
    steps: SPARK_ESTATE_CREATION_STEPS.map((step) => step.id),
  },
  memberContext: {
    label: "Member context",
    fields: [
      "profile",
      "goals",
      "preferences",
      "history",
      "projects",
      "wins",
    ] as const,
  },
} as const;

export type SparkEstateRoomExpertiseGroup =
  | "chamber"
  | "marketing"
  | "content"
  | "events"
  | "research"
  | "project";

export type SparkEstateRoomExpertise = {
  id: SparkEstateRoomExpertiseGroup;
  label: string;
  purpose: string;
  specialties: readonly string[];
  primarySections: readonly AppSection[];
  entryPrompt: string;
  memoryWrites: readonly string[];
  doesNotOwn: readonly string[];
};

export const SPARK_ESTATE_ROOM_EXPERTISE: Record<
  SparkEstateRoomExpertiseGroup,
  SparkEstateRoomExpertise
> = {
  chamber: {
    id: "chamber",
    label: "Chamber of Momentum™",
    purpose: "Help members move forward.",
    specialties: ["clarity", "next steps", "progress", "overcoming blockers"],
    primarySections: [
      "chamber-of-momentum",
      "momentum-institute",
      "chamber-project-entry",
    ],
    entryPrompt: "What would help you move forward today?",
    memoryWrites: ["momentum patterns", "blocker observations", "next-step choices"],
    doesNotOwn: ["full marketing campaigns", "deep research reports"],
  },
  marketing: {
    id: "marketing",
    label: "Marketing Room",
    purpose: "Help members communicate and grow.",
    specialties: ["offers", "messaging", "campaigns", "funnels"],
    primarySections: ["content-generator", "templates-library"],
    entryPrompt: "What are you working on?",
    memoryWrites: ["offer language", "campaign drafts", "messaging preferences"],
    doesNotOwn: ["project milestone tracking", "momentum coaching"],
  },
  content: {
    id: "content",
    label: "Content Room",
    purpose: "Help create content.",
    specialties: ["writing", "planning", "editing", "publishing"],
    primarySections: ["content-generator", "saved-work"],
    entryPrompt: "What would you like to create?",
    memoryWrites: ["content drafts", "formats that worked", "publishing choices"],
    doesNotOwn: ["entrepreneurial curriculum depth", "decision facilitation"],
  },
  events: {
    id: "events",
    label: "Events Room",
    purpose: "Help create and manage events.",
    specialties: ["planning", "timelines", "promotion", "execution"],
    primarySections: ["content-generator", "momentum-builder"],
    entryPrompt: "What event are you planning?",
    memoryWrites: ["event plans", "promotion assets", "timeline checkpoints"],
    doesNotOwn: ["ongoing project operations", "Institute learning paths"],
  },
  research: {
    id: "research",
    label: "Research Room",
    purpose: "Help understand information.",
    specialties: ["research", "analysis", "summaries", "insights"],
    primarySections: ["grow-observatory", "how-do-i"],
    entryPrompt: "What would you like to understand?",
    memoryWrites: ["research notes", "insights", "sources worth revisiting"],
    doesNotOwn: ["execution task lists", "marketing copy drafting"],
  },
  project: {
    id: "project",
    label: "Project Room",
    purpose: "Help execute.",
    specialties: ["projects", "tasks", "milestones", "completion"],
    primarySections: ["momentum-builder", "goals-projects", "chamber-project-entry"],
    entryPrompt: "What project needs your attention?",
    memoryWrites: ["project state", "milestones", "next actions", "wins"],
    doesNotOwn: ["marketing funnel strategy", "Institute teaching depth"],
  },
};

export const SPARK_ESTATE_ROOM_ENTRY_RULES = [
  "Do not immediately show every feature on entry.",
  'Start with "What are you working on?" or "What would help you today?"',
  "Offer one gentle next step — not a dashboard.",
  "Use member context the system already knows.",
] as const;

export const SPARK_ESTATE_ROOM_INDEPENDENCE_RULES = [
  SPARK_ESTATE_ROOM_INDEPENDENCE_RULE,
  "Project planning belongs in project workflows.",
  "Marketing knowledge belongs in marketing.",
  "Momentum helps decide and move forward.",
  "Rooms must not duplicate the same intelligence.",
] as const;

export const SPARK_ESTATE_SHARED_DATA_FLOWS = [
  {
    id: "marketing-to-project",
    label: "Marketing → Project → Momentum → Memory",
    steps: [
      "Marketing Room creates funnel",
      "Project Room tracks execution",
      "Momentum captures progress",
      "Memory stores successful patterns",
    ],
  },
  {
    id: "research-to-decide",
    label: "Research → Decision → Create",
    steps: [
      "Research Room gathers insight",
      "Decision Compass clarifies choice",
      "Create room builds the deliverable",
    ],
  },
  {
    id: "chamber-to-execute",
    label: "Chamber → Project → Win",
    steps: [
      "Chamber finds next step",
      "Project Room holds tasks",
      "Win Card celebrates completion",
    ],
  },
] as const;

export const SPARK_ESTATE_ROOM_COMPLETION_FLOW = [
  "create",
  "review",
  "improve",
  "finalize",
  "save",
  "remember",
] as const;

export const SPARK_ESTATE_ROOM_DESIGN_STANDARDS = [
  "correct image",
  "correct name",
  "clear purpose",
  "matching navigation",
  "appropriate cards",
] as const;

export const SPARK_ESTATE_LANGUAGE_SUPPORT_RULES = [
  "Every room supports translated text.",
  "Prompts preserve meaning and Shari tone.",
  "Routing works regardless of language.",
  "Room expertise stays consistent across locales.",
] as const;

const NEED_TO_EXPERTISE: Record<SparkEstateImmediateNeed, SparkEstateRoomExpertiseGroup> = {
  "clear-mind": "chamber",
  "move-forward": "chamber",
  learn: "chamber",
  create: "content",
  execute: "project",
  decide: "chamber",
  review: "project",
};

const SECTION_TO_EXPERTISE: Partial<Record<AppSection, SparkEstateRoomExpertiseGroup>> = {
  "chamber-of-momentum": "chamber",
  "momentum-institute": "chamber",
  "chamber-project-entry": "project",
  "content-generator": "content",
  "templates-library": "marketing",
  "saved-work": "content",
  "momentum-builder": "project",
  "goals-projects": "project",
  "grow-momentum-builders": "project",
  "decision-compass": "chamber",
  "brain-dump": "chamber",
  "grow-observatory": "research",
  "how-do-i": "research",
  "evidence-bank": "project",
};

export function resolveSparkEstateRoomExpertiseGroup(
  section?: AppSection | null,
): SparkEstateRoomExpertiseGroup {
  if (!section) return "chamber";
  return SECTION_TO_EXPERTISE[section] ?? "chamber";
}

export function getSparkEstateRoomExpertise(
  group: SparkEstateRoomExpertiseGroup = "chamber",
): SparkEstateRoomExpertise {
  return SPARK_ESTATE_ROOM_EXPERTISE[group];
}

export function getSparkEstateRoomEntryPrompt(
  section?: AppSection | null,
): string {
  const group = resolveSparkEstateRoomExpertiseGroup(section);
  return SPARK_ESTATE_ROOM_EXPERTISE[group].entryPrompt;
}

export type SparkEstateRoomIntelligenceContext = {
  expertiseGroup: SparkEstateRoomExpertiseGroup;
  expertise: SparkEstateRoomExpertise;
  entryPrompt: string;
  memberContextAvailable: boolean;
  shariVoiceConsistent: boolean;
  usesUniversalJourney: boolean;
  recommendedCard: SparkEstateCardKind | null;
  route: SparkEstateIntelligenceRoute | null;
};

export function buildSparkEstateRoomIntelligenceContext(input?: {
  section?: AppSection;
  text?: string;
  profile?: SparkEstateMemberProfile;
}): SparkEstateRoomIntelligenceContext {
  const expertiseGroup = resolveSparkEstateRoomExpertiseGroup(input?.section);
  const expertise = getSparkEstateRoomExpertise(expertiseGroup);
  const profile = input?.profile ?? getSparkEstateMemberProfile();
  const route = input?.text?.trim()
    ? resolveSparkEstateIntelligenceRoute({
        text: input.text,
        currentSection: input?.section,
      })
    : null;

  const memberContextAvailable =
    Boolean(profile.identity.preferredName || profile.identity.name) ||
    profile.progressHistory.length > 0 ||
    profile.goalsVision.currentPriorities.length > 0;

  return {
    expertiseGroup,
    expertise,
    entryPrompt: expertise.entryPrompt,
    memberContextAvailable,
    shariVoiceConsistent: SPARK_ESTATE_SHARI_TRAITS.length >= 5,
    usesUniversalJourney: route?.useUniversalCreationJourney ?? false,
    recommendedCard: route?.recommendedCard ?? null,
    route,
  };
}

export type SparkEstateCrossRoomSupport = {
  currentExpertise: SparkEstateRoomExpertiseGroup;
  supportingExpertise: SparkEstateRoomExpertiseGroup | null;
  stayInRoom: boolean;
  supportingRoute: SparkEstateIntelligenceRoute | null;
  guidance: string | null;
};

const CROSS_ROOM_STAY_PATTERNS: Partial<
  Record<SparkEstateRoomExpertiseGroup, readonly SparkEstateImmediateNeed[]>
> = {
  marketing: ["move-forward", "decide"],
  content: ["move-forward", "decide", "execute"],
  research: ["create", "execute"],
  events: ["move-forward", "execute"],
};

export function resolveSparkEstateCrossRoomSupport(input?: {
  section?: AppSection;
  text?: string;
}): SparkEstateCrossRoomSupport {
  const text = input?.text?.trim() ?? "";
  const currentExpertise = resolveSparkEstateRoomExpertiseGroup(input?.section);
  const supportingRoute = text
    ? resolveSparkEstateIntelligenceRoute({
        text,
        currentSection: input?.section,
      })
    : null;

  if (!supportingRoute || !text) {
    return {
      currentExpertise,
      supportingExpertise: null,
      stayInRoom: true,
      supportingRoute: null,
      guidance: null,
    };
  }

  const supportingExpertise = NEED_TO_EXPERTISE[supportingRoute.need];
  if (supportingExpertise === currentExpertise) {
    return {
      currentExpertise,
      supportingExpertise,
      stayInRoom: true,
      supportingRoute,
      guidance: null,
    };
  }

  const stayNeeds = CROSS_ROOM_STAY_PATTERNS[currentExpertise] ?? [];
  const stayInRoom = stayNeeds.includes(supportingRoute.need);

  const supportingLabel = SPARK_ESTATE_ROOM_EXPERTISE[supportingExpertise].label;
  const guidance = stayInRoom
    ? `Bring in ${supportingRoute.intelligence} (${supportingLabel}) without forcing the member to leave ${SPARK_ESTATE_ROOM_EXPERTISE[currentExpertise].label}.`
    : `When ready, route to ${supportingRoute.intelligence} — ${supportingRoute.section ?? "companion"} — for ${supportingLabel} expertise.`;

  return {
    currentExpertise,
    supportingExpertise,
    stayInRoom,
    supportingRoute,
    guidance,
  };
}

export function assessSparkEstateRoomIndependence(
  group: SparkEstateRoomExpertiseGroup,
): { independent: boolean; overlaps: string[] } {
  const expertise = SPARK_ESTATE_ROOM_EXPERTISE[group];
  const overlaps: string[] = [];

  for (const other of Object.values(SPARK_ESTATE_ROOM_EXPERTISE)) {
    if (other.id === group) continue;
    for (const specialty of expertise.specialties) {
      if (other.specialties.includes(specialty)) {
        overlaps.push(`${specialty} shared with ${other.label}`);
      }
    }
  }

  return { independent: overlaps.length === 0, overlaps };
}

export function sparkEstateRoomIntelligenceCompanionHint(input?: {
  section?: AppSection;
  text?: string;
}): string | null {
  const text = input?.text?.trim() ?? "";
  const context = buildSparkEstateRoomIntelligenceContext({
    section: input?.section,
    text,
  });

  if (text) {
    const crossRoom = resolveSparkEstateCrossRoomSupport({
      section: input?.section,
      text,
    });
    if (crossRoom.guidance) {
      return `SPARK ESTATE ROOM INTELLIGENCE: ${crossRoom.guidance} ${SPARK_ESTATE_ROOM_INTELLIGENCE_PRINCIPLE}`;
    }
  }

  if (!input?.section) return null;

  return (
    `SPARK ESTATE ROOM (${context.expertise.label}): ${context.expertise.purpose} ` +
    `Ask: "${context.entryPrompt}" ` +
    `Specialties: ${context.expertise.specialties.join(", ")}. ` +
    `Same Spark companion — not a different app.`
  );
}

export function verifySparkEstateRoomIntelligenceArchitecture(): {
  architectureLayers: number;
  expertiseGroups: number;
  sharedFoundationReady: boolean;
  entryRulesReady: boolean;
  crossRoomSupportReady: boolean;
  independenceRulesReady: boolean;
  dataFlowsReady: boolean;
  completionFlowReady: boolean;
  languageSupportReady: boolean;
  conversationAligned: boolean;
} {
  const stuckInMarketing = resolveSparkEstateCrossRoomSupport({
    section: "content-generator",
    text: "I don't know where to start",
  });
  const conversation = verifySparkEstateConversationEngine();

  return {
    architectureLayers: SPARK_ESTATE_ROOM_ARCHITECTURE_LAYERS.length,
    expertiseGroups: Object.keys(SPARK_ESTATE_ROOM_EXPERTISE).length,
    sharedFoundationReady:
      SPARK_ESTATE_SHARED_FOUNDATION.memberContext.fields.length === 6 &&
      SPARK_ESTATE_SHARED_FOUNDATION.universalCreationJourney.steps.length === 8,
    entryRulesReady: SPARK_ESTATE_ROOM_ENTRY_RULES.length >= 3,
    crossRoomSupportReady:
      stuckInMarketing.stayInRoom === true &&
      stuckInMarketing.supportingExpertise === "chamber",
    independenceRulesReady: SPARK_ESTATE_ROOM_INDEPENDENCE_RULES.length >= 4,
    dataFlowsReady: SPARK_ESTATE_SHARED_DATA_FLOWS.length >= 3,
    completionFlowReady: SPARK_ESTATE_ROOM_COMPLETION_FLOW.length === 6,
    languageSupportReady: SPARK_ESTATE_LANGUAGE_SUPPORT_RULES.length >= 3,
    conversationAligned: conversation.voiceConsistent,
  };
}

export function formatSparkEstateRoomIntelligenceArchitectureReport(
  verification: ReturnType<typeof verifySparkEstateRoomIntelligenceArchitecture> = verifySparkEstateRoomIntelligenceArchitecture(),
): string {
  const lines: string[] = [
    `Spark Estate™ room intelligence: ${verification.sharedFoundationReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_ROOM_INTELLIGENCE_PRINCIPLE,
    SPARK_ESTATE_ROOM_INTELLIGENCE_VISION,
    "",
    "Room architecture layers:",
  ];

  for (const layer of SPARK_ESTATE_ROOM_ARCHITECTURE_LAYERS) {
    lines.push(`  ${layer.title} — ${layer.defines.join(", ")}`);
  }

  lines.push("", "Shared foundation:");
  lines.push(`  ${SPARK_ESTATE_SHARED_FOUNDATION.shariVoice.label}: ${SPARK_ESTATE_SHARED_FOUNDATION.shariVoice.rule}`);
  lines.push(
    `  ${SPARK_ESTATE_SHARED_FOUNDATION.universalCreationJourney.label}: ${SPARK_ESTATE_SHARED_FOUNDATION.universalCreationJourney.steps.join(" → ")}`,
  );
  lines.push(
    `  ${SPARK_ESTATE_SHARED_FOUNDATION.memberContext.label}: ${SPARK_ESTATE_SHARED_FOUNDATION.memberContext.fields.join(", ")}`,
  );

  lines.push("", "Room expertise:");
  for (const expertise of Object.values(SPARK_ESTATE_ROOM_EXPERTISE)) {
    lines.push(
      `  ${expertise.label} — ${expertise.purpose}`,
      `    Specialties: ${expertise.specialties.join(", ")}`,
      `    Entry: "${expertise.entryPrompt}"`,
    );
  }

  lines.push("", "Shared data flows:");
  for (const flow of SPARK_ESTATE_SHARED_DATA_FLOWS) {
    lines.push(`  ${flow.label}: ${flow.steps.join(" → ")}`);
  }

  lines.push("", "Room independence rules:");
  for (const rule of SPARK_ESTATE_ROOM_INDEPENDENCE_RULES) {
    lines.push(`  • ${rule}`);
  }

  lines.push("", "Integration checks:");
  lines.push(`  Architecture layers: ${verification.architectureLayers}`);
  lines.push(`  Expertise groups: ${verification.expertiseGroups}`);
  lines.push(`  Shared foundation: ${verification.sharedFoundationReady ? "pass" : "fail"}`);
  lines.push(`  Cross-room support: ${verification.crossRoomSupportReady ? "pass" : "fail"}`);
  lines.push(`  Independence rules: ${verification.independenceRulesReady ? "pass" : "fail"}`);
  lines.push(`  Data flows: ${verification.dataFlowsReady ? "pass" : "fail"}`);
  lines.push(`  Completion flow: ${verification.completionFlowReady ? "pass" : "fail"}`);
  lines.push(`  Language support: ${verification.languageSupportReady ? "pass" : "fail"}`);
  lines.push(`  Conversation aligned: ${verification.conversationAligned ? "pass" : "fail"}`);

  return lines.join("\n");
}
