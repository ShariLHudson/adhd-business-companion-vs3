// Founder Ecosystem — Phase 16 Digital Twin selectors.
// Dashboard-ready views + adaptive insights derived from the twin. The insights
// turn observed behavior into HOW the ecosystem should adapt (work hours,
// workspace selection, action sizing, check-in timing). Observational framing.

import type {
  BehaviorDriver,
  ExecutionTrait,
  FounderDigitalTwin,
} from "./digitalTwinTypes";

export function selectOperatingProfile(twin: FounderDigitalTwin) {
  return {
    stage: twin.businessStage,
    focus: twin.businessFocus,
    workStyles: twin.workStyle.traits.map((t) => t.value),
    decisionStyle: twin.decisionStyle.traits[0]?.value ?? null,
    executionStyle: twin.executionStyle.traits[0]?.value ?? null,
    preferredWorkHours: twin.preferredWorkHours.bestTimeOfDay,
    maturity: twin.maturity,
  };
}

export const selectMomentumDrivers = (t: FounderDigitalTwin): BehaviorDriver[] => t.momentum.drivers;
export const selectOverwhelmTriggers = (t: FounderDigitalTwin): BehaviorDriver[] => t.overwhelm.triggers;
export const selectSuccessPatterns = (t: FounderDigitalTwin): BehaviorDriver[] => t.success.patterns;

const hasExecution = (t: FounderDigitalTwin, trait: ExecutionTrait) =>
  t.executionStyle.traits.some((x) => x.value === trait);

export type AdaptiveInsight = {
  area: "work-hours" | "workspace" | "action-size" | "decisions" | "overwhelm" | "check-in";
  insight: string; // observational ("You tend to…")
  adaptation: string; // what the ecosystem will do
};

/** Turn the twin into concrete, observational adaptations. */
export function selectAdaptiveInsights(twin: FounderDigitalTwin): AdaptiveInsight[] {
  const out: AdaptiveInsight[] = [];

  if (twin.preferredWorkHours.bestTimeOfDay === "morning" && twin.preferredWorkHours.evidence > 0)
    out.push({
      area: "work-hours",
      insight: "You tend to do your best work in the morning.",
      adaptation: "I'll suggest your most important work earlier in the day.",
    });
  else if (twin.preferredWorkHours.bestTimeOfDay === "evening" && twin.preferredWorkHours.evidence > 0)
    out.push({
      area: "work-hours",
      insight: "You often get going later in the day.",
      adaptation: "I'll time bigger suggestions for when you're warmed up.",
    });

  if (hasExecution(twin, "works-best-with-focus-sessions"))
    out.push({
      area: "workspace",
      insight: "You tend to complete more when you use Focus.",
      adaptation: "I'll suggest a Focus Session more often.",
    });
  if (hasExecution(twin, "works-best-with-time-blocks"))
    out.push({
      area: "workspace",
      insight: "Time blocking tends to help you follow through.",
      adaptation: "I'll offer to Time Block the important item.",
    });
  if (hasExecution(twin, "needs-warm-up"))
    out.push({
      area: "action-size",
      insight: "It appears you often need a warm-up before deep work.",
      adaptation: "I'll start with a small, 2-minute step first.",
    });
  if (!hasExecution(twin, "works-best-with-structured-plans"))
    out.push({
      area: "action-size",
      insight: "Shorter actions tend to land better for you than long plans.",
      adaptation: "I'll keep suggestions to one concrete next step.",
    });

  const decision = twin.decisionStyle.traits[0]?.value;
  if (decision === "slow-decision-maker")
    out.push({
      area: "decisions",
      insight: "Decisions tend to take you a little time.",
      adaptation: "I'll surface open decisions earlier so they don't linger.",
    });
  if (decision === "research-driven")
    out.push({
      area: "decisions",
      insight: "You often like information before committing.",
      adaptation: "I'll offer a quick research step before big decisions.",
    });

  const topTrigger = twin.overwhelm.triggers[0];
  if (topTrigger)
    out.push({
      area: "overwhelm",
      insight: `It appears ${topTrigger.factor.toLowerCase()} tends to slow you down.`,
      adaptation: "I'll watch for it and offer a reset before it builds.",
    });

  if (twin.predictions.procrastination.probability >= 0.5)
    out.push({
      area: "check-in",
      insight: "When a task feels avoidable, momentum can dip.",
      adaptation: "I'll break that kind of task down and check in gently.",
    });

  return out;
}

// ---- Dashboard view-model ----------------------------------------------
export type DigitalTwinDashboard = {
  founderId: string;
  generatedAt: string;
  operatingProfile: ReturnType<typeof selectOperatingProfile>;
  momentumDrivers: BehaviorDriver[];
  overwhelmTriggers: BehaviorDriver[];
  successPatterns: BehaviorDriver[];
  adaptiveInsights: AdaptiveInsight[];
  predictions: FounderDigitalTwin["predictions"];
  observations: string[];
};

export function buildDigitalTwinDashboard(twin: FounderDigitalTwin): DigitalTwinDashboard {
  return {
    founderId: twin.founderId,
    generatedAt: twin.generatedAt,
    operatingProfile: selectOperatingProfile(twin),
    momentumDrivers: selectMomentumDrivers(twin),
    overwhelmTriggers: selectOverwhelmTriggers(twin),
    successPatterns: selectSuccessPatterns(twin),
    adaptiveInsights: selectAdaptiveInsights(twin),
    predictions: twin.predictions,
    observations: twin.observations,
  };
}
