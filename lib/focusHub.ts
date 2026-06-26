/**
 * Focus V2 — feelings first, tools second.
 * Emotional states are doorways; tools are organized beneath each feeling.
 */

import {
  TOOL_SECTION,
  type AppSection,
  type SidebarToolId,
} from "./companionUi";

export type FocusFeelingId = "stuck" | "need-break";

export type FocusHubAction =
  | { kind: "tool"; tool: SidebarToolId; toolId: string }
  | { kind: "section"; section: AppSection; toolId: string }
  | { kind: "activity"; activityId: string; toolId: string }
  | { kind: "strategy"; strategyId: string; toolId: string }
  | { kind: "audio"; categoryId: string; toolId: string }
  | { kind: "chat"; prompt: string; toolId: string };

export type FocusHubTool = {
  id: string;
  label: string;
  description?: string;
  action: FocusHubAction;
};

export type FocusHubToolGroup = {
  id: string;
  title: string;
  tools: FocusHubTool[];
  /** When true, group renders as an expandable dropdown in the Focus panel. */
  collapsible?: boolean;
  /** Initial open state for collapsible groups. */
  defaultOpen?: boolean;
};

export type FocusFeelingCategory = {
  id: FocusFeelingId;
  objectId: string;
  label: string;
  tagline: string;
  /** Opens chat immediately — no sub-panel. */
  immediate?: boolean;
  recommended?: FocusHubTool;
  groups: FocusHubToolGroup[];
};

function tool(
  id: string,
  label: string,
  action:
    | { kind: "tool"; tool: SidebarToolId; toolId?: string }
    | { kind: "section"; section: AppSection; toolId?: string }
    | { kind: "activity"; activityId: string; toolId?: string }
    | { kind: "strategy"; strategyId: string; toolId?: string }
    | { kind: "audio"; categoryId: string; toolId?: string }
    | { kind: "chat"; prompt: string; toolId?: string },
  description?: string,
): FocusHubTool {
  const { toolId: _drop, ...rest } = action;
  return { id, label, description, action: { ...rest, toolId: id } as FocusHubAction };
}

export const FOCUS_FEELING_CATEGORIES: FocusFeelingCategory[] = [
  {
    id: "stuck",
    objectId: "focus-my-brain",
    label: "I'm Stuck",
    tagline: "Paralysis, avoidance, and fear of starting.",
    recommended: tool(
      "next-small-step",
      "Next Small Step",
      { kind: "activity", activityId: "first-step-finder", toolId: "next-small-step" },
      "Find the easiest place to begin.",
    ),
    groups: [
      {
        id: "stuck-start",
        title: "Most People Start Here",
        tools: [
          tool(
            "next-small-step",
            "Next Small Step",
            { kind: "activity", activityId: "first-step-finder", toolId: "next-small-step" },
            "Find the easiest place to begin.",
          ),
          tool(
            "prioritize-options",
            "Prioritize My Options",
            { kind: "activity", activityId: "priority-sort", toolId: "prioritize-options" },
            "Figure out what matters most right now.",
          ),
          tool(
            "break-smaller",
            "Break It Into Smaller Pieces",
            { kind: "activity", activityId: "project-breakdown", toolId: "break-smaller" },
            "Turn a big task into manageable steps.",
          ),
        ],
      },
    ],
  },
  {
    id: "need-break",
    objectId: "breathing",
    label: "I Need A Break",
    tagline: "Regulate, reset, and come back calmer.",
    recommended: tool(
      "breathe-reset",
      "Breathe & Reset",
      { kind: "tool", tool: "breathe", toolId: "breathe-reset" },
      "Calm your nervous system before you continue.",
    ),
    groups: [
      {
        id: "break-start",
        title: "Most People Start Here",
        collapsible: true,
        defaultOpen: false,
        tools: [
          tool(
            "breathe-reset",
            "Breathe & Reset",
            { kind: "tool", tool: "breathe", toolId: "breathe-reset" },
            "Calm your nervous system before you continue.",
          ),
          tool(
            "stretch-break",
            "Stretch Break",
            { kind: "activity", activityId: "recharge-menu", toolId: "stretch-break" },
            "Physical movement and body reset.",
          ),
          tool(
            "calm-moment",
            "Calm Moment",
            { kind: "activity", activityId: "five-senses", toolId: "calm-moment" },
            "A quiet pause before returning.",
          ),
        ],
      },
      {
        id: "break-audio",
        title: "Audio",
        collapsible: true,
        defaultOpen: false,
        tools: [
          tool(
            "calm-audio",
            "Calm Audio",
            { kind: "audio", categoryId: "calm-brain", toolId: "calm-audio" },
          ),
          tool(
            "focus-audio",
            "Focus Audio",
            { kind: "audio", categoryId: "deep-work", toolId: "focus-audio" },
          ),
          tool(
            "nature-audio",
            "Nature Audio",
            { kind: "audio", categoryId: "calm-brain", toolId: "nature-audio" },
          ),
          tool(
            "sleep-audio",
            "Sleep Audio",
            { kind: "audio", categoryId: "sleep-sounds", toolId: "sleep-audio" },
          ),
        ],
      },
      {
        id: "break-recharge",
        title: "Recharge",
        collapsible: true,
        defaultOpen: false,
        tools: [
          tool(
            "brain-break-games",
            "Brain Break Games",
            { kind: "tool", tool: "games", toolId: "brain-break-games" },
          ),
          tool(
            "sensory-reset",
            "Sensory Reset",
            { kind: "activity", activityId: "lower-the-noise", toolId: "sensory-reset" },
          ),
          tool(
            "walk-reminder",
            "Walk Reminder",
            { kind: "activity", activityId: "recharge-menu", toolId: "walk-reminder" },
          ),
        ],
      },
    ],
  },
];

/** Flat list of feeling entry points for the home screen. */
export const FOCUS_FEELING_ENTRIES = FOCUS_FEELING_CATEGORIES.map((c) => ({
  id: c.id,
  objectId: c.objectId,
  label: c.label,
  tagline: c.tagline,
  immediate: c.immediate ?? false,
}));

export function focusFeelingById(id: FocusFeelingId): FocusFeelingCategory | undefined {
  return FOCUS_FEELING_CATEGORIES.find((c) => c.id === id);
}

export function recommendedToolForFeeling(
  id: FocusFeelingId,
): FocusHubTool | undefined {
  const category = focusFeelingById(id);
  return category?.recommended;
}

/** Every tool surfaced anywhere in the Focus hub. */
export function allFocusHubTools(): FocusHubTool[] {
  const seen = new Set<string>();
  const out: FocusHubTool[] = [];
  for (const category of FOCUS_FEELING_CATEGORIES) {
    if (category.recommended && !seen.has(category.recommended.id)) {
      seen.add(category.recommended.id);
      out.push(category.recommended);
    }
    for (const group of category.groups) {
      for (const t of group.tools) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        out.push(t);
      }
    }
  }
  return out;
}

export function focusHubToolIds(): string[] {
  return allFocusHubTools().map((t) => t.id);
}

/** Assets that must stay reachable after Focus V2. */
export const REQUIRED_FOCUS_ASSET_IDS = [
  "focus-audio",
  "calm-audio",
  "sleep-audio",
  "brain-break-games",
  "breathe-reset",
  "next-small-step",
] as const;

export function missingRequiredFocusAssets(): string[] {
  const ids = new Set(focusHubToolIds());
  const actionIds = new Set(
    allFocusHubTools().map((t) => t.action.toolId),
  );
  return REQUIRED_FOCUS_ASSET_IDS.filter((id) => !ids.has(id) && !actionIds.has(id));
}

export function focusHubOpensSidebarTool(tool: SidebarToolId): boolean {
  const sectionForTool = TOOL_SECTION[tool];
  return allFocusHubTools().some((t) => {
    if (t.action.kind === "tool" && t.action.tool === tool) return true;
    if (
      t.action.kind === "section" &&
      sectionForTool &&
      t.action.section === sectionForTool
    ) {
      return true;
    }
    if (t.action.kind === "audio" && t.action.toolId === tool) return true;
    return false;
  });
}

/** Each feeling should recommend a distinct primary tool. */
export function distinctRecommendedOutcomes(): boolean {
  const ids = ["stuck", "need-break"] as const;
  const recs = ids.map((id) => recommendedToolForFeeling(id)?.id).filter(Boolean);
  return new Set(recs).size === recs.length;
}
