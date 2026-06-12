// Founder Ecosystem — Phase 19 Onboarding Journey.
// Captures business context and validates the "This understands me" moment.

import type { OnboardingCapture, OnboardingJourney } from "./experienceTypes";
import type { BusinessStage } from "../journey/journeyTypes";
import type { WorkStyle } from "../companion/companionTypes";

const VALID_STAGES: BusinessStage[] = [
  "idea",
  "building",
  "launching",
  "growing",
  "scaling",
];

const VALID_WORK: WorkStyle[] = [
  "visionary",
  "builder",
  "implementer",
  "creator",
  "strategist",
  "teacher",
  "operator",
];

export function defaultOnboardingCapture(): OnboardingCapture {
  return {
    businessStage: "idea",
    businessType: "other",
    currentGoals: [],
    biggestChallenges: [],
    currentProjects: [],
    preferredWorkStyle: "unknown",
    capturedAt: new Date().toISOString(),
  };
}

export function isOnboardingComplete(capture: OnboardingCapture): boolean {
  return (
    VALID_STAGES.includes(capture.businessStage) &&
    capture.currentGoals.length > 0 &&
    (capture.biggestChallenges.length > 0 || capture.currentProjects.length > 0)
  );
}

export function buildOnboardingJourney(capture: OnboardingCapture): OnboardingJourney {
  const complete = isOnboardingComplete(capture);
  const goal = capture.currentGoals[0] ?? "your top priority";
  const challenge = capture.biggestChallenges[0] ?? "getting unstuck";
  const project = capture.currentProjects[0];
  const workStyle =
    capture.preferredWorkStyle !== "unknown"
      ? ` I will match your ${capture.preferredWorkStyle} work style.`
      : "";

  const personalizedWelcome = complete
    ? `You're in the ${capture.businessStage} stage, focused on ${goal}. ` +
      `You named "${challenge}" as a challenge — I'll keep that in mind.${workStyle}`
    : "Tell me about your business so I can meet you where you are.";

  const passesSuccessTest =
    complete &&
    personalizedWelcome.includes(capture.businessStage) &&
    personalizedWelcome.toLowerCase().includes(goal.toLowerCase().slice(0, Math.min(8, goal.length)));

  return {
    capture,
    complete,
    reflectionPrompts: [
      "What would make this week feel successful?",
      "What's the one project that matters most right now?",
      "When do you do your best thinking?",
    ],
    personalizedWelcome,
    successTest: "This understands me.",
    passesSuccessTest,
  };
}

export function mergeOnboardingCapture(
  base: OnboardingCapture,
  patch: Partial<OnboardingCapture>,
): OnboardingCapture {
  return {
    ...base,
    ...patch,
    currentGoals: patch.currentGoals ?? base.currentGoals,
    biggestChallenges: patch.biggestChallenges ?? base.biggestChallenges,
    currentProjects: patch.currentProjects ?? base.currentProjects,
    capturedAt: new Date().toISOString(),
  };
}

export function normalizeWorkStyle(value: string): OnboardingCapture["preferredWorkStyle"] {
  const v = value.toLowerCase() as WorkStyle;
  return VALID_WORK.includes(v) ? v : "unknown";
}
