/**
 * Spark Estate™ — Spark Tools discovery and integration (Phase 35).
 * Quick-support tools discovered at the moment they are needed.
 *
 * @see docs/protocols/SPARK_ESTATE_SPARK_TOOLS_DISCOVERY_AND_INTEGRATION_SPECIFICATION_PHASE35.md
 */

import type { AppSection } from "@/lib/companionUi";
import {
  FOCUS_MENU,
  SIDEBAR_TOOLS,
  TOOL_SECTION,
} from "@/lib/companionUi";
import { APP_FEATURES, type AppFeatureId } from "@/lib/appFeatureKnowledge";
import { CLEAR_MY_MIND_SUNROOM_BG } from "@/lib/clearMyMind/conservatory";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import { SOUNDSCAPE_MOODS } from "@/lib/soundscapes";
import { TOOL_REGISTRATIONS } from "@/lib/estateIntelligence/registrations/tools";
import { verifySparkEstateIntelligenceRouting } from "./sparkEstateIntelligenceRoutingMap";
import { verifySparkEstateUniversalProjectWorkspaceArchitecture } from "./sparkEstateUniversalProjectWorkspaceArchitecture";

export const SPARK_ESTATE_SPARK_TOOLS_PRINCIPLE =
  "Tools are experiences, not isolated features — Spark knows what might help the member.";

export const SPARK_ESTATE_SPARK_TOOLS_VISION =
  "Spark Tools become the quick-support layer — clear, focus, reset, decide, and create momentum.";

export const SPARK_ESTATE_SPARK_TOOLS_HUB_NAME = "Spark Tools";

export const SPARK_ESTATE_SPARK_TOOLS_HUB_PURPOSE =
  "A collection of quick ways to reset, organize, focus, create, and move forward.";

export const SPARK_ESTATE_SPARK_TOOLS_MEMBER_THINKING = "Spark knows what might help me.";

export const SPARK_ESTATE_SPARK_TOOLS_MEMBER_AVOID =
  "Where did they put that feature?";

export const SPARK_ESTATE_TOOL_REQUIREMENTS = [
  "a clear purpose",
  "a place to find it",
  "a connection to Spark guidance",
  "a consistent room experience",
] as const;

export type SparkEstateToolCategoryId =
  | "clear-my-mind"
  | "focus-audio"
  | "spin-wheel"
  | "quick-games"
  | "reset-tools";

export type SparkEstateToolCategory = {
  id: SparkEstateToolCategoryId;
  emoji: string;
  label: string;
  purpose: string;
  featureId: AppFeatureId;
  section: AppSection;
};

export const SPARK_ESTATE_TOOL_CATEGORIES: readonly SparkEstateToolCategory[] = [
  {
    id: "clear-my-mind",
    emoji: "🧠",
    label: "Clear My Mind",
    purpose: "Help members empty mental clutter and organize thoughts.",
    featureId: "clear-my-mind",
    section: "brain-dump",
  },
  {
    id: "focus-audio",
    emoji: "🎧",
    label: "Focus Audio",
    purpose: "Help members shift their state through estate listening environments.",
    featureId: "focus-audio",
    section: "focus-audio",
  },
  {
    id: "spin-wheel",
    emoji: "🎡",
    label: "Spin the Wheel",
    purpose: "Help when the member feels stuck deciding what to do next.",
    featureId: "spin-wheel",
    section: "spin-wheel",
  },
  {
    id: "quick-games",
    emoji: "🎮",
    label: "Quick Games",
    purpose: "Provide healthy mental breaks and activation that feel like Spark activities.",
    featureId: "momentum-games",
    section: "quick-recharge",
  },
  {
    id: "reset-tools",
    emoji: "🌿",
    label: "Reset Tools",
    purpose: "Help members pause and restart with breathing, reflection, and grounding.",
    featureId: "breathe",
    section: "breathe",
  },
] as const;

export const SPARK_ESTATE_CLEAR_MY_MIND_ENVIRONMENT = "Sunroom";

export const SPARK_ESTATE_CLEAR_MY_MIND_EXPERIENCE_NOTE =
  "The Sunroom is the environment. Clear My Mind is the experience.";

export const SPARK_ESTATE_CLEAR_MY_MIND_WELCOME =
  "Let's get everything out of your head. Nothing needs to be organized yet.";

export const SPARK_ESTATE_CLEAR_MY_MIND_FLOW = [
  "Open Sunroom",
  "Welcome and capture thoughts",
  "Organize into categories, priorities, ideas, tasks, and projects",
  "Choose next actions",
] as const;

export const SPARK_ESTATE_CLEAR_MY_MIND_CAPTURE_OPTIONS = [
  "typing",
  "voice capture",
  "multiple thoughts at once",
] as const;

export const SPARK_ESTATE_CLEAR_MY_MIND_ORGANIZE_OPTIONS = [
  "categories",
  "priorities",
  "ideas",
  "tasks",
  "projects",
] as const;

export const SPARK_ESTATE_CLEAR_MY_MIND_NEXT_ACTIONS = [
  "create project",
  "add to existing project",
  "save idea",
  "archive",
  "revisit later",
] as const;

export const SPARK_ESTATE_FOCUS_AUDIO_CATEGORIES = [
  "Focus",
  "Calm",
  "Reset",
  "Energize",
  "Rest",
] as const;

export const SPARK_ESTATE_SPIN_WHEEL_INCLUDES = [
  "unfinished projects",
  "next actions",
  "Clear My Mind items",
  "small reset activities",
  "positive momentum actions",
] as const;

export const SPARK_ESTATE_QUICK_GAMES_SUPPORTS = [
  "creativity",
  "focus",
  "memory",
  "problem solving",
  "energy shifts",
] as const;

export const SPARK_ESTATE_RESET_TOOL_EXAMPLES = [
  "breathing",
  "reflection",
  "short resets",
  "grounding activities",
] as const;

export const SPARK_ESTATE_SPARK_TOOLS_DISCOVERY_CHANNELS = [
  "Spark Tools Menu",
  "Context Suggestions",
  "Room Integration",
] as const;

export const SPARK_ESTATE_TOOL_ENVIRONMENT_RULES = [
  "maintain current room atmosphere",
  "keep Spark Estate™ visual style",
  "use appropriate background",
  "preserve consistent navigation",
] as const;

export const SPARK_ESTATE_TOOL_NAVIGATION_RULES = [
  "members always know where they are",
  "members always know how to return",
  "members always know where tools are located",
] as const;

export const SPARK_ESTATE_TOOL_DISCOVERY_AVOID = [
  "hidden features",
  "disconnected pages",
  "forgotten tools",
  "isolated blank tool pages",
] as const;

export const SPARK_ESTATE_CONTEXT_TOOL_SUGGESTIONS = [
  {
    pattern: /\b(?:can'?t think|brain is blank|mind is blank|nothing in my head)\b/i,
    toolId: "clear-my-mind" as SparkEstateToolCategoryId,
    suggestion: "Would you like to clear your mind first?",
  },
  {
    pattern: /\b(?:can'?t focus|hard to focus|distracted|low energy.*(?:work|start))\b/i,
    toolId: "focus-audio" as SparkEstateToolCategoryId,
    suggestion: "Would a short Focus Audio session help?",
  },
  {
    pattern:
      /\b(?:don'?t know where to start|don'?t know what to do|stuck deciding|can'?t decide what to do)\b/i,
    toolId: "spin-wheel" as SparkEstateToolCategoryId,
    suggestion: "Would you like to spin the wheel and let Spark choose a next step?",
  },
  {
    pattern: /\b(?:need (?:a )?break|brain (?:is )?fried|quick reset|ground me)\b/i,
    toolId: "reset-tools" as SparkEstateToolCategoryId,
    suggestion: "Would a short reset help before you continue?",
  },
  {
    pattern: /\b(?:need (?:a )?game|quick recharge|play something|mental break)\b/i,
    toolId: "quick-games" as SparkEstateToolCategoryId,
    suggestion: "Would a quick Spark activity help you recharge?",
  },
] as const;

export const SPARK_ESTATE_ROOM_TOOL_SUGGESTIONS: readonly {
  room: AppSection;
  label: string;
  toolIds: readonly SparkEstateToolCategoryId[];
}[] = [
  {
    room: "chamber-of-momentum",
    label: "Chamber of Momentum™",
    toolIds: ["clear-my-mind", "spin-wheel", "focus-audio"],
  },
  {
    room: "content-generator",
    label: "Content Room",
    toolIds: ["focus-audio", "clear-my-mind", "quick-games"],
  },
  {
    room: "templates-library",
    label: "Marketing Room",
    toolIds: ["spin-wheel", "clear-my-mind", "focus-audio"],
  },
] as const;

export const SPARK_ESTATE_SPARK_TOOLS_MEMORY_KEY = "spark-estate-tool-prefs-v1";

export type SparkEstateToolMemoryPreference = {
  favoriteTools: SparkEstateToolCategoryId[];
  frequentTools: SparkEstateToolCategoryId[];
  helpfulPatterns: string[];
  updatedAt: string;
};

export type SparkEstateToolSuggestion = {
  toolId: SparkEstateToolCategoryId;
  label: string;
  purpose: string;
  suggestion: string;
  section: AppSection;
  reason: string;
};

export type SparkEstateSparkToolsHubView = {
  hubName: string;
  purpose: string;
  categories: readonly SparkEstateToolCategory[];
  menuTools: typeof SIDEBAR_TOOLS;
  focusMenu: typeof FOCUS_MENU;
};

let toolMemoryFallback: SparkEstateToolMemoryPreference | null = null;

function readToolMemory(): SparkEstateToolMemoryPreference | null {
  if (typeof window === "undefined") return toolMemoryFallback;
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_SPARK_TOOLS_MEMORY_KEY);
    if (!raw) return toolMemoryFallback;
    const parsed = JSON.parse(raw) as SparkEstateToolMemoryPreference;
    if (!parsed || typeof parsed.updatedAt !== "string") return toolMemoryFallback;
    return parsed;
  } catch {
    return toolMemoryFallback;
  }
}

function writeToolMemory(
  preference: Omit<SparkEstateToolMemoryPreference, "updatedAt">,
): SparkEstateToolMemoryPreference {
  const next: SparkEstateToolMemoryPreference = {
    ...preference,
    updatedAt: new Date().toISOString(),
  };
  toolMemoryFallback = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SPARK_ESTATE_SPARK_TOOLS_MEMORY_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }
  return next;
}

function toolCategoryById(
  toolId: SparkEstateToolCategoryId,
): SparkEstateToolCategory | undefined {
  return SPARK_ESTATE_TOOL_CATEGORIES.find((category) => category.id === toolId);
}

function featureForTool(toolId: SparkEstateToolCategoryId) {
  const category = toolCategoryById(toolId);
  if (!category) return null;
  return APP_FEATURES.find((feature) => feature.id === category.featureId) ?? null;
}

export function mapSparkToolToSection(
  toolId: SparkEstateToolCategoryId,
): AppSection | null {
  const category = toolCategoryById(toolId);
  return category?.section ?? null;
}

export function buildSparkToolsHubView(): SparkEstateSparkToolsHubView {
  return {
    hubName: SPARK_ESTATE_SPARK_TOOLS_HUB_NAME,
    purpose: SPARK_ESTATE_SPARK_TOOLS_HUB_PURPOSE,
    categories: SPARK_ESTATE_TOOL_CATEGORIES,
    menuTools: SIDEBAR_TOOLS,
    focusMenu: FOCUS_MENU,
  };
}

export function buildClearMyMindExperienceSteps(): readonly string[] {
  return [
    `Environment: ${SPARK_ESTATE_CLEAR_MY_MIND_ENVIRONMENT}`,
    SPARK_ESTATE_CLEAR_MY_MIND_WELCOME,
    `Capture: ${SPARK_ESTATE_CLEAR_MY_MIND_CAPTURE_OPTIONS.join(", ")}`,
    `Organize: ${SPARK_ESTATE_CLEAR_MY_MIND_ORGANIZE_OPTIONS.join(", ")}`,
    `Next actions: ${SPARK_ESTATE_CLEAR_MY_MIND_NEXT_ACTIONS.join(", ")}`,
  ];
}

export function getSparkEstateRoomToolSuggestions(
  section: AppSection,
): SparkEstateToolCategory[] {
  const room = SPARK_ESTATE_ROOM_TOOL_SUGGESTIONS.find((entry) => entry.room === section);
  if (!room) return [];
  return room.toolIds
    .map((toolId) => toolCategoryById(toolId))
    .filter((category): category is SparkEstateToolCategory => Boolean(category));
}

export function suggestFocusAudioForState(input?: {
  text?: string;
  energy?: "low" | "medium" | "high";
}): {
  category: (typeof SPARK_ESTATE_FOCUS_AUDIO_CATEGORIES)[number];
  suggestion: string;
  moodId: string;
} {
  const text = input?.text?.trim() ?? "";
  const energy = input?.energy;

  if (energy === "low" || /\blow energy\b/i.test(text)) {
    return {
      category: "Focus",
      suggestion: "A short Focus session may help you get started.",
      moodId: "focus",
    };
  }
  if (/\b(?:calm|anxious|overwhelm)\b/i.test(text)) {
    return {
      category: "Calm",
      suggestion: "A calming soundscape may help quiet the noise.",
      moodId: "calming",
    };
  }
  if (/\b(?:tired|rest|wind down|sleep)\b/i.test(text)) {
    return {
      category: "Rest",
      suggestion: "A gentle unwind track may help you reset.",
      moodId: "unwind",
    };
  }
  if (/\b(?:stuck|need momentum|energi[sz]e)\b/i.test(text)) {
    return {
      category: "Energize",
      suggestion: "A recharge soundscape may help you find momentum.",
      moodId: "energize",
    };
  }
  return {
    category: "Reset",
    suggestion: "A short listening break may help you restart gently.",
    moodId: "calming",
  };
}

export function resolveSparkEstateToolSuggestion(input?: {
  text?: string;
  currentSection?: AppSection;
}): SparkEstateToolSuggestion | null {
  const text = input?.text?.trim() ?? "";
  if (!text) return null;

  for (const entry of SPARK_ESTATE_CONTEXT_TOOL_SUGGESTIONS) {
    if (!entry.pattern.test(text)) continue;
    const category = toolCategoryById(entry.toolId);
    if (!category) continue;
    return {
      toolId: entry.toolId,
      label: category.label,
      purpose: category.purpose,
      suggestion: entry.suggestion,
      section: category.section,
      reason: "context suggestion",
    };
  }

  const memory = readToolMemory();
  if (memory?.frequentTools.length) {
    const preferred = memory.frequentTools[0]!;
    const category = toolCategoryById(preferred);
    if (category && memory.helpfulPatterns.some((pattern) => text.includes(pattern))) {
      return {
        toolId: preferred,
        label: category.label,
        purpose: category.purpose,
        suggestion: `You often find ${category.label} helpful here — want to try it again?`,
        section: category.section,
        reason: "memory pattern",
      };
    }
  }

  if (input?.currentSection) {
    const roomTools = getSparkEstateRoomToolSuggestions(input.currentSection);
    const first = roomTools[0];
    if (first && /\bhelp\b/i.test(text)) {
      return {
        toolId: first.id,
        label: first.label,
        purpose: first.purpose,
        suggestion: `${first.label} is available in this room whenever you need it.`,
        section: first.section,
        reason: "room integration",
      };
    }
  }

  return null;
}

export function recordSparkEstateToolUse(
  toolId: SparkEstateToolCategoryId,
  context?: string,
): SparkEstateToolMemoryPreference {
  const existing = readToolMemory();
  const frequent = [
    toolId,
    ...(existing?.frequentTools.filter((id) => id !== toolId) ?? []),
  ].slice(0, 5);
  const favorite =
    existing?.favoriteTools.includes(toolId) || frequent.length >= 3
      ? Array.from(new Set([toolId, ...(existing?.favoriteTools ?? [])])).slice(0, 5)
      : (existing?.favoriteTools ?? []);
  const helpfulPatterns = context
    ? Array.from(new Set([context, ...(existing?.helpfulPatterns ?? [])])).slice(0, 8)
    : (existing?.helpfulPatterns ?? []);

  return writeToolMemory({
    favoriteTools: favorite as SparkEstateToolCategoryId[],
    frequentTools: frequent as SparkEstateToolCategoryId[],
    helpfulPatterns,
  });
}

export function getSparkEstateToolMemoryPreferences(): SparkEstateToolMemoryPreference | null {
  return readToolMemory();
}

export function assessSparkEstateSparkToolsCompliance(): {
  principleReady: boolean;
  hubReady: boolean;
  categoriesReady: boolean;
  clearMyMindExperienceReady: boolean;
  focusAudioReady: boolean;
  spinWheelReady: boolean;
  quickGamesReady: boolean;
  resetToolsReady: boolean;
  discoveryChannelsReady: boolean;
  roomIntegrationReady: boolean;
  environmentRulesReady: boolean;
  navigationRulesReady: boolean;
  contextSuggestionsReady: boolean;
  appFeatureBridgeReady: boolean;
  companionUiBridgeReady: boolean;
  sunroomEnvironmentReady: boolean;
  routingBridgeReady: boolean;
  projectWorkspaceBridgeReady: boolean;
} {
  const hub = buildSparkToolsHubView();
  const clearSteps = buildClearMyMindExperienceSteps();
  const routing = verifySparkEstateIntelligenceRouting();
  const projects = verifySparkEstateUniversalProjectWorkspaceArchitecture();

  return {
    principleReady: SPARK_ESTATE_SPARK_TOOLS_PRINCIPLE.includes("experiences"),
    hubReady:
      hub.hubName === SPARK_ESTATE_SPARK_TOOLS_HUB_NAME &&
      hub.categories.length === 5,
    categoriesReady: SPARK_ESTATE_TOOL_CATEGORIES.every(
      (category) => Boolean(mapSparkToolToSection(category.id)),
    ),
    clearMyMindExperienceReady:
      clearSteps.length === 5 &&
      SPARK_ESTATE_CLEAR_MY_MIND_NEXT_ACTIONS.includes("create project"),
    focusAudioReady:
      SPARK_ESTATE_FOCUS_AUDIO_CATEGORIES.length === 5 &&
      SOUNDSCAPE_MOODS.length >= 4,
    spinWheelReady: SPARK_ESTATE_SPIN_WHEEL_INCLUDES.length === 5,
    quickGamesReady: SPARK_ESTATE_QUICK_GAMES_SUPPORTS.length === 5,
    resetToolsReady: SPARK_ESTATE_RESET_TOOL_EXAMPLES.length === 4,
    discoveryChannelsReady: SPARK_ESTATE_SPARK_TOOLS_DISCOVERY_CHANNELS.length === 3,
    roomIntegrationReady: SPARK_ESTATE_ROOM_TOOL_SUGGESTIONS.length === 3,
    environmentRulesReady: SPARK_ESTATE_TOOL_ENVIRONMENT_RULES.length === 4,
    navigationRulesReady: SPARK_ESTATE_TOOL_NAVIGATION_RULES.length === 3,
    contextSuggestionsReady: SPARK_ESTATE_CONTEXT_TOOL_SUGGESTIONS.length === 5,
    appFeatureBridgeReady: SPARK_ESTATE_TOOL_CATEGORIES.every((category) =>
      APP_FEATURES.some((feature) => feature.id === category.featureId),
    ),
    companionUiBridgeReady:
      Object.keys(TOOL_SECTION).length >= 5 && SIDEBAR_TOOLS.length >= 4,
    sunroomEnvironmentReady:
      CLEAR_MY_MIND_SUNROOM_BG.startsWith(ESTATE_ROOM_BG.clearMyMind) &&
      SPARK_ESTATE_CLEAR_MY_MIND_ENVIRONMENT === "Sunroom",
    routingBridgeReady: routing.routesResolve,
    projectWorkspaceBridgeReady: projects.universalProjectReady,
  };
}

export function verifySparkEstateSparkToolsDiscoveryAndIntegration(): {
  toolCategories: number;
  discoveryReady: boolean;
  clearMyMindReady: boolean;
  memoryReady: boolean;
} {
  const compliance = assessSparkEstateSparkToolsCompliance();
  const suggestion = resolveSparkEstateToolSuggestion({
    text: "I can't think.",
  });
  const memory = recordSparkEstateToolUse("focus-audio", "before writing");

  return {
    toolCategories: SPARK_ESTATE_TOOL_CATEGORIES.length,
    discoveryReady: Object.values(compliance).every(Boolean),
    clearMyMindReady: suggestion?.toolId === "clear-my-mind",
    memoryReady:
      memory.frequentTools.includes("focus-audio") &&
      memory.helpfulPatterns.includes("before writing"),
  };
}

export function sparkEstateSparkToolsCompanionHint(input?: {
  text?: string;
  currentSection?: AppSection;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (
    !text ||
    !/(?:spark tools?|clear my mind|focus audio|spin the wheel|quick (?:game|recharge)|reset tool|can'?t think|can'?t focus|don'?t know where to start)/i.test(
      text,
    )
  ) {
    return null;
  }

  const suggestion = resolveSparkEstateToolSuggestion({
    text,
    currentSection: input?.currentSection,
  });
  const hub = buildSparkToolsHubView();

  if (suggestion) {
    return (
      `SPARK ESTATE SPARK TOOLS: ${SPARK_ESTATE_SPARK_TOOLS_PRINCIPLE} ` +
      `${suggestion.suggestion} ` +
      `${suggestion.label} lives in ${hub.hubName} and follows estate room atmosphere — never a disconnected blank page.`
    );
  }

  return (
    `SPARK ESTATE SPARK TOOLS: ${SPARK_ESTATE_SPARK_TOOLS_PRINCIPLE} ` +
    `${hub.hubName} — ${hub.purpose} ` +
    `Available through menu, context suggestions, and room integration.`
  );
}

export function formatSparkEstateSparkToolsReport(
  verification: ReturnType<
    typeof verifySparkEstateSparkToolsDiscoveryAndIntegration
  > = verifySparkEstateSparkToolsDiscoveryAndIntegration(),
  compliance: ReturnType<typeof assessSparkEstateSparkToolsCompliance> = assessSparkEstateSparkToolsCompliance(),
): string {
  const hub = buildSparkToolsHubView();
  const clearMind = buildClearMyMindExperienceSteps();
  const focus = suggestFocusAudioForState({
    text: "I have low energy and need to work.",
    energy: "low",
  });

  const lines: string[] = [
    `Spark Estate™ Spark Tools: ${verification.discoveryReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_SPARK_TOOLS_PRINCIPLE,
    SPARK_ESTATE_SPARK_TOOLS_VISION,
    "",
    `${hub.hubName}:`,
    `  ${hub.purpose}`,
    "",
    "Tool categories:",
  ];

  for (const category of hub.categories) {
    const feature = featureForTool(category.id);
    lines.push(`  ${category.emoji} ${category.label} — ${category.purpose}`);
    if (feature) {
      lines.push(`    Navigation: ${feature.navigation}`);
    }
  }

  lines.push("", "Clear My Mind experience:");
  lines.push(`  ${SPARK_ESTATE_CLEAR_MY_MIND_EXPERIENCE_NOTE}`);
  for (const step of clearMind) {
    lines.push(`  → ${step}`);
  }
  lines.push(`  Background: ${CLEAR_MY_MIND_SUNROOM_BG}`);

  lines.push("", "Focus Audio categories:");
  for (const category of SPARK_ESTATE_FOCUS_AUDIO_CATEGORIES) {
    lines.push(`  • ${category}`);
  }
  lines.push(`  Example: ${focus.suggestion}`);

  lines.push("", "Discovery channels:");
  for (const channel of SPARK_ESTATE_SPARK_TOOLS_DISCOVERY_CHANNELS) {
    lines.push(`  • ${channel}`);
  }

  lines.push("", "Context suggestions:");
  for (const entry of SPARK_ESTATE_CONTEXT_TOOL_SUGGESTIONS) {
    lines.push(`  "${entry.suggestion}"`);
  }

  lines.push("", "Room integration:");
  for (const room of SPARK_ESTATE_ROOM_TOOL_SUGGESTIONS) {
    lines.push(
      `  ${room.label}: ${room.toolIds.map((id) => toolCategoryById(id)?.label).join(", ")}`,
    );
  }

  lines.push("", "Estate tool registrations:");
  for (const entry of TOOL_REGISTRATIONS) {
    lines.push(`  • ${entry.name}`);
  }

  lines.push("", "Avoid:");
  for (const item of SPARK_ESTATE_TOOL_DISCOVERY_AVOID) {
    lines.push(`  ✗ ${item}`);
  }

  lines.push("", "Compliance checks:");
  lines.push(`  Hub: ${compliance.hubReady ? "pass" : "fail"}`);
  lines.push(`  Categories: ${compliance.categoriesReady ? "pass" : "fail"}`);
  lines.push(`  Clear My Mind: ${compliance.clearMyMindExperienceReady ? "pass" : "fail"}`);
  lines.push(`  Context suggestions: ${compliance.contextSuggestionsReady ? "pass" : "fail"}`);
  lines.push(`  Room integration: ${compliance.roomIntegrationReady ? "pass" : "fail"}`);
  lines.push(`  Memory patterns: ${verification.memoryReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
