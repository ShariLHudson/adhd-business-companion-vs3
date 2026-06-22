/**
 * Maps raw signal categories to intelligence trait paths.
 * path format: "human.emotional.often_overwhelmed" | "adhd.resistance.overwhelm"
 */

export type TraitPath = string;

export type SignalTraitMapping = {
  paths: TraitPath[];
  /** Base score shift when valence is positive/negative; neutral uses half */
  weight?: number;
};

const MAP: Record<string, SignalTraitMapping> = {
  // Executive function / struggles
  overwhelm: {
    paths: [
      "human.emotional.often_overwhelmed",
      "human.executiveFunction.avoider",
      "adhd.resistance.overwhelm",
    ],
    weight: 12,
  },
  prioritization: {
    paths: [
      "human.executiveFunction.weak_prioritizer",
      "relationship.supportStyle.strategic_planning",
    ],
    weight: 8,
  },
  focus: {
    paths: [
      "human.executiveFunction.avoider",
      "adhd.resistance.unclear_tasks",
    ],
    weight: 8,
  },
  follow_through: {
    paths: [
      "human.executiveFunction.finisher",
      "human.executiveFunction.starter",
    ],
    weight: 8,
  },
  decision_making: {
    paths: ["human.executiveFunction.slow_decision_maker"],
    weight: 8,
  },
  perfectionism: {
    paths: [
      "human.executiveFunction.perfectionist",
      "adhd.resistance.perfectionism",
    ],
    weight: 10,
  },

  // Questions → support preferences
  what_should_i_work_on: {
    paths: [
      "relationship.communicationStyle.action_oriented",
      "relationship.supportStyle.accountability",
    ],
    weight: 6,
  },
  help_me_prioritize: {
    paths: [
      "relationship.supportStyle.strategic_planning",
      "relationship.communicationStyle.strategy_oriented",
    ],
    weight: 8,
  },
  im_overwhelmed: {
    paths: [
      "human.emotional.often_overwhelmed",
      "relationship.supportStyle.encouragement",
      "adhd.resistance.overwhelm",
    ],
    weight: 12,
  },
  dont_know_where_to_start: {
    paths: [
      "human.executiveFunction.starter",
      "adhd.momentum.smaller_pieces",
      "relationship.supportStyle.brainstorming",
    ],
    weight: 10,
  },

  // Emotions
  frustrated: {
    paths: ["human.emotional.often_frustrated"],
    weight: 10,
  },
  stuck: {
    paths: [
      "human.emotional.often_discouraged",
      "adhd.resistance.unclear_tasks",
    ],
    weight: 8,
  },
  confused: {
    paths: ["human.learning.step_by_step_preference"],
    weight: 6,
  },
  excited: {
    paths: ["human.emotional.often_excited", "human.emotional.often_motivated"],
    weight: 10,
  },
  hopeful: {
    paths: ["human.emotional.often_motivated", "human.emotional.confidence_rising"],
    weight: 8,
  },

  // Energy signals
  high_energy: {
    paths: ["human.energy.hyperfocus_tendency"],
    weight: 8,
  },
  low_energy: {
    paths: ["human.energy.recovery_sensitive", "human.energy.low_energy_mornings"],
    weight: 8,
  },
  morning_productive: {
    paths: ["human.energy.morning_creator"],
    weight: 10,
  },
  afternoon_productive: {
    paths: ["human.energy.afternoon_strategist"],
    weight: 10,
  },
  evening_productive: {
    paths: ["human.energy.evening_thinker"],
    weight: 10,
  },

  // Business activity (patterns only — no financial data)
  content_created: {
    paths: [
      "business.visibility.consistent_creator",
      "business.identity.creator",
    ],
    weight: 8,
  },
  marketing_activity: {
    paths: ["business.visibility.marketing_active"],
    weight: 8,
  },
  offer_work: {
    paths: ["business.revenueActivity.offer_builder"],
    weight: 8,
  },
  lead_generation: {
    paths: ["business.revenueActivity.lead_generation_active"],
    weight: 8,
  },
  sales_activity: {
    paths: ["business.revenueActivity.sales_activity"],
    weight: 8,
  },
  client_acquisition: {
    paths: ["business.revenueActivity.client_acquisition_focus"],
    weight: 8,
  },

  // ADHD momentum / recovery
  task_completed: {
    paths: ["adhd.momentum.small_wins", "human.executiveFunction.finisher"],
    weight: 10,
  },
  brain_dump: {
    paths: ["adhd.momentum.brain_dumps", "adhd.recovery.brain_dump"],
    weight: 8,
  },
  accountability_engaged: {
    paths: [
      "adhd.momentum.accountability",
      "relationship.supportStyle.accountability",
    ],
    weight: 10,
  },
  voice_used: {
    paths: ["adhd.momentum.voice_conversations"],
    weight: 8,
  },
  task_broken_down: {
    paths: ["adhd.momentum.smaller_pieces"],
    weight: 10,
  },
  recovery_rest: {
    paths: ["adhd.recovery.rest"],
    weight: 8,
  },
  recovery_walk: {
    paths: ["adhd.recovery.walking"],
    weight: 8,
  },

  // Trust / relationship
  suggestion_accepted: {
    paths: [
      "relationship.trust.responds_to_suggestions",
      "relationship.trust.momentum_from_interventions",
    ],
    weight: 10,
  },
  suggestion_dismissed: {
    paths: ["relationship.trust.disengages_from_nagging"],
    weight: 10,
  },
  suggestion_ignored: {
    paths: ["relationship.trust.ignores_generic_suggestions"],
    weight: 8,
  },
  intervention_completed: {
    paths: ["relationship.trust.momentum_from_interventions"],
    weight: 10,
  },
  intervention_started: {
    paths: [],
    weight: 0,
  },
  intervention_abandoned: {
    paths: [],
    weight: 0,
  },
  offer_rendered: {
    paths: [],
    weight: 0,
  },
  offer_suppressed: {
    paths: [],
    weight: 0,
  },
  offer_blocked: {
    paths: [],
    weight: 0,
  },

  // Learning
  asked_for_example: {
    paths: ["human.learning.example_driven"],
    weight: 8,
  },
  asked_for_steps: {
    paths: ["human.learning.step_by_step_preference"],
    weight: 8,
  },

  // Workspace / project
  workspace_opened: {
    paths: ["human.executiveFunction.starter"],
    weight: 4,
  },
  project_progress: {
    paths: ["human.executiveFunction.finisher"],
    weight: 6,
  },
};

export function resolveSignalTraitMapping(
  category: string,
): SignalTraitMapping | null {
  return MAP[category] ?? null;
}

export function listMappedSignalCategories(): string[] {
  return Object.keys(MAP);
}
