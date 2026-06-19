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
  | "need-break"
  | "need-shari";

export type FocusHubAction =
  | { kind: "tool"; tool: SidebarToolId; toolId: string }
  | { kind: "section"; section: AppSection; toolId: string }
  | { kind: "activity"; activityId: string; toolId: string }
  | { kind: "strategy"; strategyId: string; toolId: string }
  | { kind: "audio"; categoryId: string; toolId: string }
  | { kind: "chat"; prompt: string; toolId: string }
  | { kind: "need-shari"; toolId: "need-shari" };

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
    | { kind: "chat"; prompt: string; toolId?: string }
    | { kind: "need-shari"; toolId?: string },
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
    tagline: "Overwhelm, clutter, and too many thoughts at once.",
    recommended: tool(
      "clear-my-mind",
      "Clear My Mind",
      { kind: "section", section: "brain-dump", toolId: "clear-my-mind" },
      "Capture, sort, and find what matters.",
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
            "Capture, sort, and find what matters.",
          ),
          tool(
            "brain-dump",
            "Brain Dump",
            { kind: "tool", tool: "brain-dump", toolId: "brain-dump" },
            "Get everything out of your head fast.",
          ),
          tool(
            "mind-map",
            "Mind Map My Thoughts",
            { kind: "activity", activityId: "decision-compass", toolId: "mind-map" },
            "See options and connections visually.",
          ),
        ],
      },
      {
        id: "crowded-other",
        title: "Other Ways To Help",
        tools: [
          tool(
            "talk-crowded",
            "Talk It Through With Shari",
            {
              kind: "chat",
              prompt:
                "My brain feels crowded — can you help me sort through what's on my mind?",
              toolId: "talk-crowded",
            },
          ),
          tool(
            "decision-compass-crowded",
            "Decision Compass",
            { kind: "activity", activityId: "decision-compass", toolId: "decision-compass-crowded" },
          ),
          tool(
            "organize-thoughts",
            "Organize My Thoughts",
            {
              kind: "activity",
              activityId: "clear-my-mind-priority",
              toolId: "organize-thoughts",
            },
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
      "get-unstuck",
      "Get Unstuck",
      {
        kind: "chat",
        prompt:
          "I'm feeling stuck — can you help me find the smallest next step?",
        toolId: "get-unstuck",
      },
      "Talk through the block with Shari.",
    ),
    groups: [
      {
        id: "stuck-start",
        title: "Most People Start Here",
        tools: [
          tool(
            "get-unstuck",
            "Get Unstuck",
            {
              kind: "chat",
              prompt:
                "I'm feeling stuck — can you help me find the smallest next step?",
              toolId: "get-unstuck",
            },
          ),
          tool(
            "next-small-step",
            "Next Small Step",
            { kind: "activity", activityId: "first-step-finder", toolId: "next-small-step" },
          ),
          tool(
            "decision-compass-stuck",
            "Decision Compass",
            { kind: "activity", activityId: "decision-compass", toolId: "decision-compass-stuck" },
          ),
        ],
      },
      {
        id: "stuck-other",
        title: "Other Ways To Help",
        tools: [
          tool(
            "talk-stuck",
            "Talk It Through With Shari",
            {
              kind: "chat",
              prompt: "I'm stuck and not sure where to start — can we talk it through?",
              toolId: "talk-stuck",
            },
          ),
          tool(
            "prioritize-options",
            "Prioritize My Options",
            { kind: "activity", activityId: "priority-sort", toolId: "prioritize-options" },
          ),
          tool(
            "break-smaller",
            "Break It Into Smaller Pieces",
            { kind: "activity", activityId: "project-breakdown", toolId: "break-smaller" },
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
      "focus-session",
      "Focus Session",
      { kind: "activity", activityId: "focus-session", toolId: "focus-session" },
      "Name the task, set a block, and start.",
    ),
    groups: [
      {
        id: "work-start",
        title: "Most People Start Here",
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
        id: "work-focus-support",
        title: "Focus Support",
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
        id: "work-planning",
        title: "Planning",
        tools: [
          tool(
            "open-active-project",
            "Open Active Project",
            { kind: "section", section: "projects", toolId: "open-active-project" },
          ),
          tool(
            "work-on-project",
            "Work On A Project",
            { kind: "section", section: "projects", toolId: "work-on-project" },
          ),
          tool(
            "pick-next-task",
            "Pick My Next Task",
            { kind: "tool", tool: "spin-wheel", toolId: "pick-next-task" },
          ),
        ],
      },
      {
        id: "work-refocus",
        title: "When Attention Drifts",
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
        tools: [
          tool(
            "breathe-reset",
            "Breathe & Reset",
            { kind: "tool", tool: "breathe", toolId: "breathe-reset" },
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
  {
    id: "need-shari",
    emoji: "💬",
    label: "I Just Need Shari",
    tagline: "Not sure what you need — talk first.",
    immediate: true,
    groups: [],
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
  "brain-dump",
  "decision-compass-crowded",
  "get-unstuck",
  "breathe-reset",
  "need-shari",
] as const;

export function missingRequiredFocusAssets(): string[] {
  const ids = new Set(focusHubToolIds());
  ids.add("need-shari");
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
