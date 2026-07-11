/**

 * Focus V2 — feelings first, tools second.

 * Hub shows two emotional doorways; tools live in expandable dropdowns.

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

  icon?: string;

  action: FocusHubAction;

};



export type FocusHubToolGroup = {

  id: string;

  title: string;

  tools: FocusHubTool[];

  collapsible?: boolean;

  defaultOpen?: boolean;

};



export type FocusFeelingCategory = {

  id: FocusFeelingId;

  objectId: string;

  label: string;

  tagline: string;

  hubDescription: string;

  hubIcon: string;

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

  icon?: string,

): FocusHubTool {

  const { toolId: _drop, ...rest } = action;

  return {

    id,

    label,

    description,

    icon,

    action: { ...rest, toolId: id } as FocusHubAction,

  };

}



export const FOCUS_FEELING_CATEGORIES: FocusFeelingCategory[] = [

  {

    id: "stuck",

    objectId: "focus-my-brain",

    label: "I'm Stuck",

    hubIcon: "🌱",

    hubDescription: "Paralyzed, avoiding, or afraid to start.",

    tagline: "Let's make this easier together.",

    recommended: tool(

      "next-small-step",

      "First Step Finder",

      { kind: "activity", activityId: "first-step-finder", toolId: "next-small-step" },

      "Find the easiest place to begin.",

      "⭐",

    ),

    groups: [

      {

        id: "stuck-start",

        title: "",

        tools: [

          tool(

            "next-small-step",

            "First Step Finder",

            { kind: "activity", activityId: "first-step-finder", toolId: "next-small-step" },

            "Find the easiest place to begin.",

            "⭐",

          ),

          tool(

            "break-smaller",

            "Break It Into Smaller Pieces",

            { kind: "activity", activityId: "break-into-pieces", toolId: "break-smaller" },

            "Shrink what's in front of you until you can start.",

            "🧩",

          ),

          tool(

            "prioritize-options",

            "Prioritize My Options",

            { kind: "activity", activityId: "priority-sort", toolId: "prioritize-options" },

            "Figure out what matters most right now.",

            "📋",

          ),

        ],

      },

    ],

  },

  {

    id: "need-break",

    objectId: "breathing",

    label: "I Need A Break",

    hubIcon: "🌿",

    hubDescription: "Regulate, reset, and come back calmer.",

    tagline: "Your nervous system comes first.",

    recommended: tool(

      "focus-audio",

      "Peaceful Places",

      { kind: "audio", categoryId: "soundscapes", toolId: "focus-audio" },

      "Most people start here — choose a calming place.",

      "🌳",

    ),

    groups: [

      {

        id: "break-main",

        title: "",

        tools: [

          tool(

            "focus-audio",

            "Peaceful Places",

            { kind: "audio", categoryId: "soundscapes", toolId: "focus-audio" },

            "Most people start here — choose a calming place.",

            "🌳",

          ),

          tool(

            "quick-recharge",

            "Quick Recharge",

            { kind: "section", section: "quick-recharge", toolId: "quick-recharge" },

            "Simple resets for when your brain needs a break.",

            "🌿",

          ),

          tool(

            "calm-moment",

            "Take a Quiet Moment",

            { kind: "section", section: "guided-exercises", toolId: "calm-moment" },

            "A softer pace when your mind needs space.",

            "🍃",

          ),

        ],

      },

    ],

  },

];



export const FOCUS_FEELING_ENTRIES = FOCUS_FEELING_CATEGORIES.map((c) => ({

  id: c.id,

  objectId: c.objectId,

  label: c.label,

  tagline: c.tagline,

  hubDescription: c.hubDescription,

  hubIcon: c.hubIcon,

  immediate: c.immediate ?? false,

}));



export function focusFeelingById(

  id: FocusFeelingId,

): FocusFeelingCategory | undefined {

  return FOCUS_FEELING_CATEGORIES.find((c) => c.id === id);

}



export function recommendedToolForFeeling(

  id: FocusFeelingId,

): FocusHubTool | undefined {

  return focusFeelingById(id)?.recommended;

}



/** Tools shown in the hub dropdown for a feeling — primary group only. */

export function focusHubDropdownTools(

  category: FocusFeelingCategory,

): FocusHubTool[] {

  const primary = category.groups.find((g) => !g.collapsible);

  return primary?.tools ?? focusCategoryTools(category);

}



export function focusCategoryTools(

  category: FocusFeelingCategory,

): FocusHubTool[] {

  const seen = new Set<string>();

  const out: FocusHubTool[] = [];

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

  return out;

}



export function allFocusHubTools(): FocusHubTool[] {

  const seen = new Set<string>();

  const out: FocusHubTool[] = [];

  for (const category of FOCUS_FEELING_CATEGORIES) {

    for (const t of focusCategoryTools(category)) {

      if (seen.has(t.id)) continue;

      seen.add(t.id);

      out.push(t);

    }

    for (const group of category.groups) {

      if (!group.collapsible) continue;

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



export const REQUIRED_FOCUS_ASSET_IDS = [

  "focus-audio",

  "next-small-step",

  "quick-recharge",

] as const;



export function missingRequiredFocusAssets(): string[] {

  const ids = new Set(focusHubToolIds());

  const actionIds = new Set(allFocusHubTools().map((t) => t.action.toolId));

  return REQUIRED_FOCUS_ASSET_IDS.filter(

    (id) => !ids.has(id) && !actionIds.has(id),

  );

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



export function distinctRecommendedOutcomes(): boolean {

  const recs = FOCUS_FEELING_CATEGORIES.map(

    (c) => c.recommended?.id,

  ).filter(Boolean);

  return new Set(recs).size === recs.length;

}


