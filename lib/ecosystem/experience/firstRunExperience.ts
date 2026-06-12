// Founder Ecosystem — Phase 19 First Run Experience (Day 1).
// What the founder sees, feels, and accomplishes on first login.

import type { AppSection } from "@/lib/companionUi";
import type { OnboardingCapture } from "./experienceTypes";
import type { FirstRunExperience } from "./experienceTypes";

export function buildFirstRunExperience(
  onboarding?: OnboardingCapture | null,
): FirstRunExperience {
  const stage = onboarding?.businessStage ?? "idea";
  const name = onboarding?.businessName?.trim();
  const greeting = name
    ? `Welcome — let's make ${name} feel lighter to run.`
    : "Welcome — let's make your business feel lighter to run.";

  const primaryWorkspace: AppSection = "home";

  const see = [
    "A calm chat with Shari — not a dashboard of widgets.",
    "One clear question: What should I work on next?",
    "Space to talk with Shari on the left, workspace on the right.",
    onboarding?.currentGoals[0]
      ? `Your stated goal surfaced: ${onboarding.currentGoals[0]}`
      : "A short onboarding path to capture what matters right now.",
  ];

  const feel = [
    "Seen — not judged.",
    "Oriented — not overwhelmed.",
    "Capable — one small next step is enough.",
  ];

  const accomplish = [
    "Share business context (stage, goals, challenges).",
    "Pick or name one current project.",
    "Complete one tiny win (capture a task, open a project, or start a 15-minute block).",
    stage === "idea"
      ? "Leave with one clarified priority for the week."
      : "Leave with today's focus chosen.",
  ];

  return {
    phase: "first-day",
    see,
    feel,
    accomplish,
    greeting,
    primaryWorkspace,
    successTest: "This understands me.",
  };
}

export function firstRunWorkspace(): AppSection {
  return "home";
}
