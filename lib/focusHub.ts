/**
 * Focus V2 — feelings first, tools second.
 * Emotional states are doorways; tools are organized beneath each feeling.
 */

import {
  TOOL_SECTION,
  type AppSection,
  type SidebarToolId,
} from "./companionUi";

export type FocusFeelingId =
  | "crowded"
  | "stuck"
  | "need-work"
  | "need-break";

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
  emoji: string;
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
    id: "crowded",
    emoji: "🧠",
    label: "My Brain Feels Crowded",
    tagline: "Too many thoughts at once.",
    recommended: tool(
      "clear-my-mind",
      "Clear My Mind",
      { kind: "section", section: "brain-dump", toolId: "clear-my-mind" },
      "Get thoughts out of your head — capture, sort, then pick how to view.",
    ),
    groups: [
      {
        id: "crowded-start",
        title: "Most People Start Here",
        tools: [
          tool(
            "clear-my-mind",
            "Clear My Mind",
            { kind: "section", section: "brain-dump", toolId: "clear-my-mind" },
            "Get thoughts out of your head — capture, sort, then pick how to view.",
          ),
          tool(
            "decision-compass-crowded",
            "Decision Compass",
            {
              kind: "activity",
              activityId: "decision-compass",
              toolId: "decision-compass-crowded",
            },
            "Work through competing options and priorities.",
          ),
          tool(
            "visual-focus-crowded",
            "Visual Focus",
            { kind: "section", section: "visual-focus", toolId: "visual-focus-crowded" },
            "Think spatially — mind maps, decisions, and connections.",
          ),
        ],
      },
    ],
  },
  {
    id: "stuck",
    emoji: "🚶",
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
            "visual-focus-stuck",
            "Visual Focus",
            { kind: "section", section: "visual-focus", toolId: "visual-focus-stuck" },
            "Map ideas and decisions visually.",
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
    id: "need-work",
    emoji: "🎯",
    label: "I Need To Work",
    tagline: "Execution, productivity, and momentum.",
    recommended: tool(
      "continue-active-project",
      "Continue Active Project",
      { kind: "section", section: "projects", toolId: "continue-active-project" },
    ),
    groups: [
      {
        id: "work-start",
        title: "Most People Start Here",
        collapsible: true,
        defaultOpen: false,
        tools: [
          tool(
            "continue-active-project",
            "Continue Active Project",
            { kind: "section", section: "projects", toolId: "continue-active-project" },
          ),
          tool(
            "start-new-project",
            "Start A New Project",
            { kind: "section", section: "projects", toolId: "start-new-project" },
          ),
          tool(
            "choose-something-fun",
            "Choose Something Fun For Me",
            { kind: "tool", tool: "spin-wheel", toolId: "choose-something-fun" },
          ),
        ],
      },
      {
        id: "work-focus",
        title: "Work Focus",
        collapsible: true,
        defaultOpen: false,
        tools: [
          tool(
            "focus-session",
            "Focus Session",
            { kind: "activity", activityId: "focus-session", toolId: "focus-session" },
          ),
          tool(
            "body-double",
            "Body Double",
            { kind: "strategy", strategyId: "body-double", toolId: "body-double" },
          ),
          tool(
            "block-time",
            "Block Out Time",
            { kind: "tool", tool: "time-block", toolId: "block-time" },
          ),
        ],
      },
      {
        id: "work-more",
        title: "More Focus Support",
        collapsible: true,
        defaultOpen: false,
        tools: [
          tool(
            "focus-audio",
            "Focus Audio",
            { kind: "audio", categoryId: "deep-work", toolId: "focus-audio" },
          ),
          tool(
            "energize-audio",
            "Energize Audio",
            { kind: "audio", categoryId: "motivation-boost", toolId: "energize-audio" },
          ),
          tool(
            "pomodoro",
            "Pomodoro Timer",
            { kind: "tool", tool: "focus-timer", toolId: "pomodoro" },
          ),
        ],
      },
      {
        id: "work-refocus",
        title: "When Attention Drifts",
        collapsible: true,
        defaultOpen: false,
        tools: [
          tool(
            "distraction-shield",
            "Distraction Shield",
            { kind: "activity", activityId: "distraction-shield", toolId: "distraction-shield" },
          ),
          tool(
            "one-thing-only",
            "One Thing Only",
            { kind: "activity", activityId: "one-thing-only", toolId: "one-thing-only" },
          ),
          tool(
            "momentum-restart",
            "Momentum Restart",
            { kind: "activity", activityId: "momentum-restart", toolId: "momentum-restart" },
          ),
        ],
      },
    ],
  },
  {
    id: "need-break",
    emoji: "🌿",
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
            "quick-reset",
            "Quick Reset",
            { kind: "tool", tool: "breathe", toolId: "quick-reset" },
            "A short breathing reset.",
          ),
          tool(
            "stretch-break",
            "Stretch Break",
            { kind: "activity", activityId: "recharge-menu", toolId: "stretch-break" },
          ),
          tool(
            "calm-moment",
            "Calm Moment",
            { kind: "activity", activityId: "five-senses", toolId: "calm-moment" },
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
  emoji: c.emoji,
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
  "energize-audio",
  "sleep-audio",
  "brain-break-games",
  "body-double",
  "pomodoro",
  "block-time",
  "clear-my-mind",
  "decision-compass-crowded",
  "next-small-step",
  "breathe-reset",
] as const;

export function missingRequiredFocusAssets(): string[] {
  const ids = new Set(focusHubToolIds());
  return REQUIRED_FOCUS_ASSET_IDS.filter((id) => !ids.has(id));
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
    if (t.action.kind === "audio" && tool === "focus-audio") return true;
    return false;
  });
}

/** Each feeling should recommend a distinct primary tool. */
export function distinctRecommendedOutcomes(): boolean {
  const ids = ["crowded", "stuck", "need-work", "need-break"] as const;
  const recs = ids.map((id) => recommendedToolForFeeling(id)?.id).filter(Boolean);
  return new Set(recs).size === recs.length;
}
