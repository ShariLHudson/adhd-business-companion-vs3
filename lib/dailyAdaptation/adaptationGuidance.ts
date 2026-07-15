import type {
  DailyAdaptationEnergyLevel,
  DailyAdaptationMotivationLevel,
  AdaptedDayProposal,
} from "./types";

export type AdaptationPosture = AdaptedDayProposal["posture"];

function isLowEnergy(level: DailyAdaptationEnergyLevel): boolean {
  return level === "very-low" || level === "low";
}

function isHighEnergy(level: DailyAdaptationEnergyLevel): boolean {
  return level === "good" || level === "high";
}

function isLowMotivation(level: DailyAdaptationMotivationLevel): boolean {
  return level === "none" || level === "a-little";
}

function isHighMotivation(level: DailyAdaptationMotivationLevel): boolean {
  return (
    level === "motivated" ||
    level === "very-motivated" ||
    level === "enough-to-start"
  );
}

export function resolveAdaptationPosture(
  energy: DailyAdaptationEnergyLevel,
  motivation: DailyAdaptationMotivationLevel,
): AdaptationPosture {
  if (isLowEnergy(energy) && isLowMotivation(motivation)) {
    return "low-energy-low-motivation";
  }
  if (isLowEnergy(energy) && isHighMotivation(motivation)) {
    return "low-energy-high-motivation";
  }
  if (isHighEnergy(energy) && isLowMotivation(motivation)) {
    return "high-energy-low-motivation";
  }
  if (isHighEnergy(energy) && isHighMotivation(motivation)) {
    return "high-energy-high-motivation";
  }
  if (energy === "steady" || motivation === "enough-to-start") {
    return "steady";
  }
  return "mixed";
}

export function guidanceForPosture(posture: AdaptationPosture): string {
  switch (posture) {
    case "low-energy-low-motivation":
      return "Your energy and motivation are both low right now. Let's make today lighter. We'll protect one important item, choose one easy starting step, and let the rest wait.";
    case "low-energy-high-motivation":
      return "You want to make progress, but your energy is limited. Let's choose one meaningful task and break it into short, manageable steps.";
    case "high-energy-low-motivation":
      return "You have energy available, but starting feels difficult. Let's choose the easiest meaningful entry point and build momentum from there.";
    case "high-energy-high-motivation":
      return "You have strong energy and motivation today. Let's use it well without filling every open space.";
    case "steady":
      return "You're in a steady place. We'll keep the plan balanced, protect what matters, and clarify the next action.";
    case "mixed":
    default:
      return "Thanks for telling me where you are. I'll reshape today's plan around your energy and motivation without adding pressure.";
  }
}

export function recoveryBreakMinutesForPosture(
  posture: AdaptationPosture,
): number {
  switch (posture) {
    case "low-energy-low-motivation":
      return 20;
    case "low-energy-high-motivation":
      return 15;
    case "high-energy-low-motivation":
      return 10;
    case "high-energy-high-motivation":
      return 10;
    case "steady":
      return 10;
    default:
      return 15;
  }
}

/** Whether the optional "What changed?" question helps. */
export function shouldAskWhatChanged(
  energy: DailyAdaptationEnergyLevel,
  motivation: DailyAdaptationMotivationLevel,
  hasPriorCheckInToday: boolean,
): boolean {
  if (hasPriorCheckInToday) return true;
  if (energy === "variable" || energy === "unsure") return true;
  if (motivation === "task-dependent" || motivation === "unsure") return true;
  return false;
}
