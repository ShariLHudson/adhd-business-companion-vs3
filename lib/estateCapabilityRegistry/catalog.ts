/**
 * Estate Capability Catalog — unified inventory composed from estateBrain + creation plugins.
 */

import { ESTATE_CAPABILITIES } from "@/lib/estateBrain/capabilityRegistry";
import { UNIVERSAL_DOCUMENT_PLUGINS } from "@/lib/universalCreation/documentRegistry";
import type { EstateCapability } from "@/lib/estateBrain/intelligenceTypes";
import type { AppSection } from "@/lib/companionUi";
import type { EstateCapabilityEntry, EstateCapabilityKind } from "./types";

type Overlay = Partial<
  Pick<
    EstateCapabilityEntry,
    | "description"
    | "purpose"
    | "bestUsedWhen"
    | "relatedCapabilityIds"
    | "requiredRoomId"
    | "alternativeRoomIds"
    | "canLaunchDirectly"
    | "canRecommend"
    | "requiresDiscovery"
    | "requiredUserInput"
    | "completionWorkflowId"
    | "category"
    | "aliases"
  >
>;

function brainCategoryToKind(cat: EstateCapability["category"]): EstateCapabilityKind {
  const map: Record<EstateCapability["category"], EstateCapabilityKind> = {
    research: "research",
    create: "creation",
    momentum: "momentum",
    focus: "focus",
    restore: "restore",
    journal: "journal",
    learn: "learn",
    grow: "business",
    business: "business",
    play: "game",
    explore: "conversation",
  };
  return map[cat] ?? "conversation";
}

function fromBrain(cap: EstateCapability, overlay: Overlay = {}): EstateCapabilityEntry {
  return {
    id: cap.id,
    name: cap.name,
    aliases: overlay.aliases ?? [],
    description: overlay.description ?? `${cap.name} in the Estate.`,
    purpose: overlay.purpose ?? `Help the member with ${cap.name.toLowerCase()}.`,
    bestUsedWhen: overlay.bestUsedWhen ?? [],
    category: overlay.category ?? brainCategoryToKind(cap.category),
    brainCategory: cap.category,
    relatedCapabilityIds: overlay.relatedCapabilityIds ?? [],
    requiredRoomId: overlay.requiredRoomId ?? cap.spaceId,
    alternativeRoomIds: overlay.alternativeRoomIds ?? [],
    primarySection: (cap.toolId as AppSection | undefined) ?? null,
    canLaunchDirectly: overlay.canLaunchDirectly ?? false,
    canRecommend: overlay.canRecommend ?? true,
    requiresDiscovery: overlay.requiresDiscovery ?? cap.category === "create",
    requiredUserInput: overlay.requiredUserInput ?? [],
    completionWorkflowId:
      overlay.completionWorkflowId ??
      (cap.category === "create" ? "standard_creation" : "none"),
    triggers: [...cap.triggers],
    expertIds: [...cap.expertIds],
  };
}

const OVERLAYS: Record<string, Overlay> = {
  "create.sop": {
    description: "Standard operating procedure — repeatable steps your team can follow.",
    purpose: "Turn how you work into a clear, shareable process.",
    bestUsedWhen: [
      "You need consistency across a team or VA",
      "A task keeps getting explained from scratch",
      "You are documenting a repeatable workflow",
    ],
    relatedCapabilityIds: [
      "create.template",
      "research.current",
      "create.email",
      "create.newsletter",
      "create.proposal",
    ],
    requiredRoomId: "creative-studio",
    alternativeRoomIds: ["study-hall", "round-table"],
    requiresDiscovery: true,
    requiredUserInput: ["goal", "audience", "process steps"],
    aliases: ["standard operating procedure", "procedure", "process doc"],
  },
  "create.newsletter": {
    description: "Email newsletter your audience will actually want to open.",
    purpose: "Connect with your list in your voice.",
    bestUsedWhen: [
      "You have something to share with subscribers",
      "You want a rhythm of staying in touch",
    ],
    relatedCapabilityIds: [
      "create.email",
      "create.social",
      "research.current",
      "create.sop",
    ],
    requiresDiscovery: true,
    requiredUserInput: ["topic", "audience", "call to action"],
  },
  "create.email": {
    requiresDiscovery: true,
    relatedCapabilityIds: ["create.newsletter", "create.proposal"],
    requiredUserInput: ["recipient context", "goal", "tone"],
  },
  "create.presentation": {
    requiresDiscovery: true,
    relatedCapabilityIds: ["research.current", "create.sop", "visual.model"],
    requiredUserInput: ["audience", "key message", "length"],
  },
  "research.current": {
    category: "research",
    description: "Focused research on a topic — tools, trends, or decisions.",
    purpose: "Gather clarity before you act.",
    bestUsedWhen: [
      "You need to compare options",
      "You are exploring a market or tool",
      "You want a calm summary, not a rabbit hole",
    ],
    relatedCapabilityIds: ["create.sop", "create.presentation", "business.strategy"],
    requiredRoomId: "library",
    alternativeRoomIds: ["study-hall", "round-table"],
    canLaunchDirectly: true,
    completionWorkflowId: "research_summary",
  },
  "restore.clearmind": {
    aliases: ["brain dump", "clear my head", "unload thoughts"],
    bestUsedWhen: [
      "Your mind feels crowded",
      "You need to unload without organizing yet",
    ],
    relatedCapabilityIds: [
      "focus.breathing",
      "place.garden",
      "journal.reflect",
      "focus.timer",
    ],
    requiredRoomId: "clear-my-mind",
    canRecommend: true,
    canLaunchDirectly: true,
    requiresDiscovery: false,
  },
  "momentum.projects": {
    bestUsedWhen: [
      "You want to see what is in motion",
      "You need to pick up a project again",
    ],
    relatedCapabilityIds: ["momentum.plan", "create.sop"],
    requiredRoomId: "goals-projects",
    canLaunchDirectly: true,
  },
  "journal.reflect": {
    completionWorkflowId: "journal_entry",
    requiresDiscovery: false,
    relatedCapabilityIds: ["restore.clearmind", "place.garden"],
    requiredRoomId: "journal",
  },
};

const EXTRA_CAPABILITIES: readonly EstateCapabilityEntry[] = [
  {
    id: "focus.timer",
    name: "Time Block",
    aliases: ["pomodoro", "timer", "time block", "focus timer"],
    description: "A gentle timer to hold one task at a time.",
    purpose: "Create a bounded pocket of focus without pressure.",
    bestUsedWhen: [
      "You know what to work on but keep drifting",
      "You want a short, defined work sprint",
    ],
    category: "focus",
    relatedCapabilityIds: [
      "focus.music",
      "restore.clearmind",
      "place.coffee-house",
      "momentum.plan",
    ],
    requiredRoomId: "focus-timer",
    alternativeRoomIds: ["study-hall", "creative-studio"],
    primarySection: "focus-timer",
    canLaunchDirectly: true,
    canRecommend: true,
    requiresDiscovery: false,
    requiredUserInput: [],
    completionWorkflowId: "focus_session",
    triggers: ["time block", "timer", "pomodoro", "focus for"],
    expertIds: [],
  },
  {
    id: "focus.music",
    name: "Quiet Music",
    aliases: ["focus music", "ambient", "background music", "soundscape"],
    description: "Calm audio to help you settle into work or rest.",
    purpose: "Reduce noise without adding more decisions.",
    bestUsedWhen: [
      "Silence feels too sharp",
      "You want atmosphere while you think or create",
    ],
    category: "audio",
    relatedCapabilityIds: [
      "focus.timer",
      "place.coffee-house",
      "place.music-room",
      "focus.breathing",
    ],
    requiredRoomId: "music-room",
    alternativeRoomIds: ["coffee-house", "garden"],
    primarySection: null,
    canLaunchDirectly: true,
    canRecommend: true,
    requiresDiscovery: false,
    requiredUserInput: [],
    completionWorkflowId: "none",
    triggers: ["quiet music", "focus music", "play music", "ambient"],
    expertIds: [],
  },
  {
    id: "focus.breathing",
    name: "Breathing",
    aliases: ["breathe", "breath", "calm down", "grounding"],
    description: "A short breathing pause to settle your nervous system.",
    purpose: "Restore calm before deciding what is next.",
    bestUsedWhen: [
      "You feel keyed up or scattered",
      "You need a minute before diving in",
    ],
    category: "restore",
    relatedCapabilityIds: [
      "restore.clearmind",
      "place.garden",
      "place.pool",
      "focus.timer",
    ],
    requiredRoomId: null,
    alternativeRoomIds: ["garden", "peaceful-places"],
    primarySection: null,
    canLaunchDirectly: true,
    canRecommend: true,
    requiresDiscovery: false,
    requiredUserInput: [],
    completionWorkflowId: "none",
    triggers: ["breathing", "breathe", "ground me", "calm me"],
    expertIds: [],
  },
  {
    id: "place.pool",
    name: "Pool",
    aliases: ["swim", "by the pool"],
    description: "Open air and water — a restorative pause.",
    purpose: "Change atmosphere when you need softness, not more output.",
    bestUsedWhen: ["You need a mental reset", "Warm weather calm sounds right"],
    category: "conversation",
    relatedCapabilityIds: ["place.garden", "focus.breathing", "restore.clearmind"],
    requiredRoomId: "pool",
    alternativeRoomIds: ["garden", "peaceful-places"],
    primarySection: null,
    canLaunchDirectly: true,
    canRecommend: true,
    requiresDiscovery: false,
    requiredUserInput: [],
    completionWorkflowId: "none",
    triggers: ["pool", "by the pool"],
    expertIds: [],
  },
  {
    id: "place.coffee-house",
    name: "Coffee House",
    aliases: ["coffee shop", "cafe", "espresso"],
    description: "Warm café energy — gentle bustle without leaving home.",
    purpose: "A cozy place to think, write, or simply sit.",
    bestUsedWhen: [
      "You want company without conversation",
      "A café mood helps you focus or create",
    ],
    category: "conversation",
    relatedCapabilityIds: [
      "focus.music",
      "focus.timer",
      "create.email",
      "journal.reflect",
    ],
    requiredRoomId: "coffee-house",
    alternativeRoomIds: ["music-room", "creative-studio"],
    primarySection: null,
    canLaunchDirectly: true,
    canRecommend: true,
    requiresDiscovery: false,
    requiredUserInput: [],
    completionWorkflowId: "none",
    triggers: ["coffee house", "coffee shop", "cafe", "espresso"],
    expertIds: [],
  },
  {
    id: "place.garden",
    name: "Garden",
    aliases: ["outside", "greenhouse", "flowers"],
    description: "Green, quiet, and unhurried.",
    purpose: "Restore before you return to work.",
    bestUsedWhen: [
      "You need nature without a trip",
      "Overwhelm calls for softness first",
    ],
    category: "restore",
    relatedCapabilityIds: [
      "focus.breathing",
      "restore.clearmind",
      "journal.reflect",
      "place.pool",
    ],
    requiredRoomId: "garden",
    alternativeRoomIds: ["greenhouse", "peaceful-places"],
    primarySection: null,
    canLaunchDirectly: true,
    canRecommend: true,
    requiresDiscovery: false,
    requiredUserInput: [],
    completionWorkflowId: "none",
    triggers: ["garden", "greenhouse", "outside", "flowers"],
    expertIds: [],
  },
  {
    id: "momentum.plan",
    name: "Momentum",
    aliases: ["plan my day", "priorities", "what should I do"],
    description: "Sort what matters and pick a humane next step.",
    purpose: "Turn a crowded day into one clear move.",
    bestUsedWhen: [
      "Too many tasks and no clear start",
      "You want partnership choosing priorities",
    ],
    category: "momentum",
    relatedCapabilityIds: [
      "momentum.projects",
      "focus.timer",
      "restore.clearmind",
    ],
    requiredRoomId: "momentum-institute",
    alternativeRoomIds: ["round-table", "study-hall"],
    primarySection: "plan-my-day",
    canLaunchDirectly: true,
    canRecommend: true,
    requiresDiscovery: false,
    requiredUserInput: [],
    completionWorkflowId: "none",
    triggers: ["momentum", "plan my day", "priorities", "what first"],
    expertIds: [],
  },
  {
    id: "visual.model",
    name: "Visual Model",
    aliases: ["diagram", "framework visual", "model", "canvas"],
    description: "See your thinking — frameworks, maps, and models.",
    purpose: "Make abstract ideas tangible.",
    bestUsedWhen: [
      "You are explaining something complex",
      "You need to see relationships at a glance",
    ],
    category: "visual",
    relatedCapabilityIds: [
      "create.presentation",
      "create.mindmap",
      "research.current",
    ],
    requiredRoomId: "art-studio",
    alternativeRoomIds: ["creative-studio", "round-table"],
    primarySection: null,
    canLaunchDirectly: false,
    canRecommend: true,
    requiresDiscovery: true,
    requiredUserInput: ["concept", "audience", "format"],
    completionWorkflowId: "standard_creation",
    triggers: ["visual model", "diagram", "framework", "business model canvas"],
    expertIds: [],
  },
  {
    id: "create.business-plan",
    name: "Business Plan",
    aliases: ["business plan", "plan my business"],
    description: "A living plan for where you are going and how.",
    purpose: "Clarify direction without a corporate binder.",
    bestUsedWhen: [
      "You are shaping or reshaping the business",
      "Investors or partners need clarity",
    ],
    category: "creation",
    relatedCapabilityIds: [
      "research.current",
      "create.presentation",
      "momentum.projects",
    ],
    requiredRoomId: "round-table",
    alternativeRoomIds: ["study-hall", "creative-studio"],
    primarySection: "content-generator",
    canLaunchDirectly: false,
    canRecommend: true,
    requiresDiscovery: true,
    requiredUserInput: ["stage", "audience", "horizon"],
    completionWorkflowId: "standard_creation",
    triggers: ["business plan", "plan my business"],
    expertIds: ["business-strategist"],
  },
  {
    id: "create.book",
    name: "Book",
    aliases: ["write a book", "manuscript", "chapter"],
    description: "Long-form book or manuscript development.",
    purpose: "Hold the arc of a bigger work over time.",
    bestUsedWhen: [
      "You are writing something book-length",
      "Chapters need structure and continuity",
    ],
    category: "creation",
    relatedCapabilityIds: ["journal.reflect", "create.presentation", "research.current"],
    requiredRoomId: "decision-compass",
    alternativeRoomIds: ["library", "creative-studio"],
    primarySection: "content-generator",
    canLaunchDirectly: false,
    canRecommend: true,
    requiresDiscovery: true,
    requiredUserInput: ["topic", "reader", "scope"],
    completionWorkflowId: "standard_creation",
    triggers: ["book", "manuscript", "write a book", "chapter"],
    expertIds: ["writing-coach"],
  },
];

function fromUniversalPlugin(
  plugin: (typeof UNIVERSAL_DOCUMENT_PLUGINS)[number],
): EstateCapabilityEntry {
  const capId = `create.${plugin.id}`;
  const overlay = OVERLAYS[capId];
  return {
    id: capId,
    name: plugin.label,
    aliases: overlay?.aliases ?? [],
    description: overlay?.description ?? `${plugin.label} creation.`,
    purpose: overlay?.purpose ?? `Create a ${plugin.label.toLowerCase()} together.`,
    bestUsedWhen: overlay?.bestUsedWhen ?? [],
    category: "creation",
    brainCategory: "create",
    relatedCapabilityIds: overlay?.relatedCapabilityIds ?? [],
    requiredRoomId: overlay?.requiredRoomId ?? "creative-studio",
    alternativeRoomIds: overlay?.alternativeRoomIds ?? ["study-hall"],
    primarySection: "content-generator",
    canLaunchDirectly: overlay?.canLaunchDirectly ?? false,
    canRecommend: overlay?.canRecommend ?? true,
    requiresDiscovery: overlay?.requiresDiscovery ?? true,
    requiredUserInput: overlay?.requiredUserInput ?? ["goal", "audience"],
    completionWorkflowId: "standard_creation",
    triggers: plugin.detectPatterns.map((re) => re.source),
    expertIds: [],
  };
}

function buildCatalog(): readonly EstateCapabilityEntry[] {
  const byId = new Map<string, EstateCapabilityEntry>();

  for (const cap of ESTATE_CAPABILITIES) {
    byId.set(cap.id, fromBrain(cap, OVERLAYS[cap.id]));
  }

  for (const plugin of UNIVERSAL_DOCUMENT_PLUGINS) {
    const id = `create.${plugin.id}`;
    if (!byId.has(id)) {
      byId.set(id, fromUniversalPlugin(plugin));
    }
  }

  for (const extra of EXTRA_CAPABILITIES) {
    byId.set(extra.id, extra);
  }

  return [...byId.values()];
}

export const ESTATE_CAPABILITY_CATALOG: readonly EstateCapabilityEntry[] =
  buildCatalog();

export function capabilityById(id: string): EstateCapabilityEntry | null {
  return ESTATE_CAPABILITY_CATALOG.find((c) => c.id === id) ?? null;
}

export function capabilitiesForRoom(roomId: string): EstateCapabilityEntry[] {
  const normalized = roomId.toLowerCase();
  return ESTATE_CAPABILITY_CATALOG.filter(
    (c) =>
      c.requiredRoomId === normalized ||
      c.alternativeRoomIds.some((r) => r === normalized),
  );
}

export function relatedCapabilities(
  capabilityId: string,
): EstateCapabilityEntry[] {
  const entry = capabilityById(capabilityId);
  if (!entry) return [];
  return entry.relatedCapabilityIds
    .map((id) => capabilityById(id))
    .filter((c): c is EstateCapabilityEntry => c !== null);
}
