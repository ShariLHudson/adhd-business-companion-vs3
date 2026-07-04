/**
 * Intelligent story selection — activity, emotion, and place → guide spreads.
 */

import type { RestorationTrigger } from "./types";

export type StoryChainContext =
  | "momentum"
  | "journal"
  | "business"
  | "create"
  | "focus"
  | "overwhelmed"
  | "celebrate"
  | "learn"
  | "default";

/** spreadId lists — first unread wins at selection time */
export const ESTATE_GUIDE_STORY_CHAINS: Record<StoryChainContext, readonly string[]> = {
  momentum: [
    "celebration-garden",
    "hall-of-accomplishments",
    "momentum-room",
    "evidence-vault",
  ],
  journal: ["writing-gazebo", "reading-nooks", "reflection-pond", "clear-my-mind"],
  business: ["round-table", "strategy-studio", "study-hall", "coffee-house"],
  create: ["art-studio", "writing-gazebo", "personal-library", "strategy-studio"],
  focus: ["study-hall", "observatory", "reading-nooks"],
  overwhelmed: [
    "butterfly-conservatory",
    "lakeside-hammock",
    "estate-gardens",
    "reflection-pond",
    "lakeside-verandah",
  ],
  celebrate: ["celebration-garden", "gallery-of-firsts", "hall-of-accomplishments"],
  learn: ["observatory", "personal-library", "study-hall"],
  default: [
    "butterfly-conservatory",
    "estate-gardens",
    "observatory",
    "welcome-home",
    "lakeside-hammock",
  ],
};

export const TRIGGER_STORY_CONTEXT: Partial<
  Record<RestorationTrigger, StoryChainContext>
> = {
  mental_fatigue: "overwhelmed",
  frustration: "overwhelmed",
  stuck: "overwhelmed",
  revision_loop: "overwhelmed",
  decision_fatigue: "overwhelmed",
  cognitive_overload: "overwhelmed",
  natural_pause: "default",
  extended_work: "default",
};

const WORKSPACE_CONTEXT: Record<string, StoryChainContext> = {
  projects: "momentum",
  momentum: "momentum",
  "content-generator": "create",
  "brain-dump": "journal",
  journal: "journal",
  "client-avatars": "business",
  "decision-compass": "business",
  "visual-focus": "focus",
  games: "default",
};

const PLACE_CONTEXT: Record<string, StoryChainContext> = {
  "goals-projects": "momentum",
  "momentum-builder": "momentum",
  "creative-studio": "create",
  "journal": "journal",
  "journal-gazebo": "journal",
  "round-table": "business",
  "study-hall": "focus",
  conservatory: "overwhelmed",
  "lakeside-hammock": "overwhelmed",
  "peaceful-places": "overwhelmed",
};

export function storyContextFromInput(input: {
  workspace?: string | null;
  estatePlaceId?: string | null;
  overwhelmed?: boolean;
  trigger?: RestorationTrigger;
}): StoryChainContext {
  if (input.overwhelmed) return "overwhelmed";
  if (input.trigger && TRIGGER_STORY_CONTEXT[input.trigger]) {
    return TRIGGER_STORY_CONTEXT[input.trigger]!;
  }
  if (input.estatePlaceId && PLACE_CONTEXT[input.estatePlaceId]) {
    return PLACE_CONTEXT[input.estatePlaceId]!;
  }
  if (input.workspace && WORKSPACE_CONTEXT[input.workspace]) {
    return WORKSPACE_CONTEXT[input.workspace]!;
  }
  return "default";
}

/** Related spreads when member enjoyed one story */
export const STORY_COMPANION_CHAINS: Record<string, readonly string[]> = {
  stables: ["apple-orchard", "estate-gardens"],
  "apple-orchard": ["stables", "greenhouse", "estate-gardens"],
  "butterfly-conservatory": ["greenhouse", "estate-gardens", "reflection-pond"],
  "momentum-room": ["celebration-garden", "hall-of-accomplishments"],
  observatory: ["personal-library", "study-hall"],
  "round-table": ["coffee-house", "strategy-studio"],
  "writing-gazebo": ["reading-nooks", "reflection-pond"],
};
