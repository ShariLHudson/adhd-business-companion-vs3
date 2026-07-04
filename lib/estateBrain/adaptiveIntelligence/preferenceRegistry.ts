/**
 * Preferences worth remembering — only if they change future behavior.
 */

import type {
  AdaptivePreferenceDefinition,
  AdaptivePreferenceId,
  AnticipationEvent,
} from "./types";

export const ADAPTIVE_PREFERENCE_REGISTRY: Record<
  AdaptivePreferenceId,
  AdaptivePreferenceDefinition
> = {
  conversation_over_forms: {
    id: "conversation_over_forms",
    domain: "working",
    impacts: ["discovery_skip", "coaching_intro", "create_prep"],
    profileTraitPath: "relationship.communicationStyle.action_oriented",
    memberFacingLabel: "prefers conversation over forms",
  },
  step_by_step_guidance: {
    id: "step_by_step_guidance",
    domain: "working",
    impacts: ["coaching_intro", "create_prep", "response_depth"],
    profileTraitPath: "human.learning.step_by_step_preference",
    memberFacingLabel: "likes step-by-step guidance",
  },
  brainstorm_before_writing: {
    id: "brainstorm_before_writing",
    domain: "creative",
    impacts: ["discovery_prep", "coaching_order", "create_prep"],
    memberFacingLabel: "brainstorms before writing",
  },
  visual_thinking: {
    id: "visual_thinking",
    domain: "creative",
    impacts: ["environment_choice", "discovery_prep"],
    profileTraitPath: "human.learning.visual_learner",
    memberFacingLabel: "prefer visual thinking",
  },
  templates_first: {
    id: "templates_first",
    domain: "creative",
    impacts: ["discovery_skip", "create_prep"],
    memberFacingLabel: "starts from templates",
  },
  blank_page_first: {
    id: "blank_page_first",
    domain: "creative",
    impacts: ["discovery_skip", "create_prep"],
    memberFacingLabel: "starts with a blank page",
  },
  detailed_plans: {
    id: "detailed_plans",
    domain: "communication",
    impacts: ["response_depth", "coaching_intro"],
    profileTraitPath: "relationship.communicationStyle.prefers_detailed",
    memberFacingLabel: "prefers detailed plans",
  },
  quick_summaries: {
    id: "quick_summaries",
    domain: "communication",
    impacts: ["response_depth"],
    profileTraitPath: "relationship.communicationStyle.prefers_short",
    memberFacingLabel: "prefers quick summaries",
  },
  learn_by_doing: {
    id: "learn_by_doing",
    domain: "learning",
    impacts: ["coaching_intro", "create_prep"],
    profileTraitPath: "human.learning.kinesthetic_learner",
    memberFacingLabel: "prefer learning by doing",
  },
  talk_through_creation: {
    id: "talk_through_creation",
    domain: "creative",
    impacts: ["create_prep", "discovery_prep", "coaching_intro"],
    memberFacingLabel: "talks work through before typing",
  },
  compare_options: {
    id: "compare_options",
    domain: "decision",
    impacts: ["coaching_order", "coaching_intro"],
    profileTraitPath: "human.executiveFunction.slow_decision_maker",
    memberFacingLabel: "likes to compare options",
  },
  wants_recommendations: {
    id: "wants_recommendations",
    domain: "decision",
    impacts: ["coaching_intro"],
    profileTraitPath: "human.executiveFunction.fast_decision_maker",
    memberFacingLabel: "wants clear recommendations",
  },
  morning_focus: {
    id: "morning_focus",
    domain: "productivity",
    impacts: ["environment_choice", "coaching_order"],
    profileTraitPath: "human.energy.morning_creator",
    memberFacingLabel: "focuses best in the morning",
  },
  clear_mind_for_thoughts: {
    id: "clear_mind_for_thoughts",
    domain: "productivity",
    impacts: ["coaching_order", "anticipation"],
    memberFacingLabel: "clears head before focused work",
  },
  sop_to_checklist: {
    id: "sop_to_checklist",
    domain: "productivity",
    impacts: ["anticipation", "create_prep"],
    memberFacingLabel: "turns SOPs into checklists",
  },
  newsletter_to_social: {
    id: "newsletter_to_social",
    domain: "productivity",
    impacts: ["anticipation"],
    memberFacingLabel: "schedules social posts after newsletters",
  },
  research_to_library: {
    id: "research_to_library",
    domain: "learning",
    impacts: ["anticipation", "research_prep"],
    memberFacingLabel: "saves research to the library",
  },
};

export const ANTICIPATION_CHAINS: {
  event: AnticipationEvent;
  preferenceId: AdaptivePreferenceId;
  lowConfidenceLine: string;
  highConfidenceLine: string;
}[] = [
  {
    event: "sop_completed",
    preferenceId: "sop_to_checklist",
    lowConfidenceLine:
      "You sometimes turn SOPs into checklists. Shall I create one?",
    highConfidenceLine:
      "You usually turn SOPs into checklists. Shall I create one?",
  },
  {
    event: "newsletter_completed",
    preferenceId: "newsletter_to_social",
    lowConfidenceLine:
      "You often schedule social posts after a newsletter. Would you like to do that now?",
    highConfidenceLine:
      "You normally schedule social media posts next. Would you like to do that now?",
  },
  {
    event: "research_completed",
    preferenceId: "research_to_library",
    lowConfidenceLine:
      "You often save research into your Knowledge Library. I can prepare that.",
    highConfidenceLine:
      "You often save research into your Knowledge Library. I'll prepare that.",
  },
];

export function preferenceDefinition(
  id: AdaptivePreferenceId,
): AdaptivePreferenceDefinition {
  return ADAPTIVE_PREFERENCE_REGISTRY[id];
}

export function isWorthRemembering(id: AdaptivePreferenceId): boolean {
  const def = ADAPTIVE_PREFERENCE_REGISTRY[id];
  return Boolean(def?.impacts.length);
}
