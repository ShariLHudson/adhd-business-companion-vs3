// Founder Ecosystem — Phase 19 Daily Experience Map.
// Morning → Midday → Afternoon → Evening flows.

import type { FounderEvent } from "../events";
import type { ID } from "../models";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { detectFounderJourney } from "../journey/founderJourneyEngine";
import type { DailyExperience, OnboardingCapture } from "./experienceTypes";

function hourOf(now: Date): number {
  return now.getUTCHours();
}

function inferPeriod(now: Date): DailyExperience["period"] {
  const h = hourOf(now);
  if (h < 11) return "morning";
  if (h < 14) return "midday";
  if (h < 17) return "afternoon";
  return "evening";
}

function topProject(events: FounderEvent[]): string | null {
  const created = events.filter((e) => e.type === "project.created");
  return (created[created.length - 1]?.data?.title as string) ?? null;
}

function openDecisions(events: FounderEvent[]): string[] {
  return events
    .filter((e) => e.type === "decision.created")
    .map((e) => String(e.data?.text ?? ""))
    .filter(Boolean)
    .slice(-3);
}

export function buildMorningFlow(
  events: FounderEvent[],
  founderId: ID,
  onboarding?: OnboardingCapture | null,
  now: Date = new Date(),
): DailyExperience {
  const mine = events.filter((e) => e.founderId === founderId);
  const journey = detectFounderJourney(mine, founderId, { now });
  const project = topProject(mine);
  const decisions = openDecisions(mine);
  const goal = onboarding?.currentGoals[0] ?? journey.primaryFocus ?? "today's priority";

  return {
    period: "morning",
    steps: [
      { label: "Good morning", content: "Good morning — let's make today feel doable." },
      {
        label: "Today's focus",
        content: `Focus: ${goal}`,
        workspace: "home",
      },
      {
        label: "Current project",
        content: project ? `Active project: ${project}` : "Pick one project to advance today.",
        workspace: "projects",
      },
      {
        label: "Open decisions",
        content:
          decisions.length > 0
            ? `Open: ${decisions.join(" · ")}`
            : "No open decisions — clean slate.",
        workspace: "home",
      },
      {
        label: "Recommended next step",
        content: "One small action beats a perfect plan.",
        workspace: "home",
        actionHint: "What should I work on next?",
      },
    ],
  };
}

export function buildMiddayFlow(
  events: FounderEvent[],
  founderId: ID,
  now: Date = new Date(),
): DailyExperience {
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = getFounderIntelligence(mine, founderId, now.toISOString());
  const tasksDone = mine.filter((e) => e.type === "task.completed").length;
  const stuck = intel.patterns.some((p) =>
    ["procrastination-language", "unfinished-tasks", "project-switching"].includes(p.type),
  );

  return {
    period: "midday",
    steps: [
      {
        label: "Progress check",
        content:
          tasksDone > 0
            ? `You've completed ${tasksDone} task(s) so far — momentum counts.`
            : "Midday check-in: what's one thing you can finish before the day ends?",
      },
      {
        label: "Stuck detection",
        content: stuck
          ? "I notice some friction — want to shrink the next step?"
          : "You're moving — keep the scope small.",
        workspace: stuck ? "brain-dump" : "home",
      },
      {
        label: "Recommendation update",
        content: intel.recommendations[0]?.text ?? "Pick the smallest next step on your top project.",
        workspace: "home",
        actionHint: "What's next?",
      },
    ],
  };
}

export function buildAfternoonFlow(
  events: FounderEvent[],
  founderId: ID,
): DailyExperience {
  const mine = events.filter((e) => e.founderId === founderId);
  const hasBlock = mine.some((e) => e.type === "timeblock.created");

  return {
    period: "afternoon",
    steps: [
      {
        label: "Deep work or wrap-up",
        content: hasBlock
          ? "Your time block is your anchor — protect it."
          : "Consider a 25-minute focus block before reactive work piles up.",
        workspace: hasBlock ? "time-block" : "focus-audio",
      },
      {
        label: "Energy check",
        content: "Afternoon slump? One task, not five.",
        workspace: "breathe",
      },
    ],
  };
}

export function buildEveningFlow(
  events: FounderEvent[],
  founderId: ID,
  now: Date = new Date(),
): DailyExperience {
  const mine = events.filter((e) => e.founderId === founderId);
  const today = now.toISOString().slice(0, 10);
  const wins = mine.filter(
    (e) =>
      (e.type === "task.completed" ||
        e.type === "action.completed" ||
        e.type === "focus.completed") &&
      e.ts.startsWith(today),
  );
  const carry = mine
    .filter((e) => e.type === "note.captured" && e.data?.kind === "task")
    .slice(-3)
    .map((e) => String(e.data?.text ?? ""));

  return {
    period: "evening",
    steps: [
      {
        label: "Wins",
        content:
          wins.length > 0
            ? `Today: ${wins.length} win(s) — name them.`
            : "Even a small win counts — what moved forward?",
      },
      {
        label: "Progress",
        content: "You showed up. That's the habit.",
      },
      {
        label: "Carry forward",
        content:
          carry.length > 0 ? `Still open: ${carry.join(", ")}` : "Capture anything still on your mind.",
        workspace: "brain-dump",
      },
      {
        label: "Tomorrow preparation",
        content: "Pick one priority for tomorrow — just one.",
        workspace: "home",
      },
    ],
  };
}

export function buildDailyJourney(
  events: FounderEvent[],
  founderId: ID,
  onboarding?: OnboardingCapture | null,
  now: Date = new Date(),
): DailyExperience[] {
  return [
    buildMorningFlow(events, founderId, onboarding, now),
    buildMiddayFlow(events, founderId, now),
    buildAfternoonFlow(events, founderId),
    buildEveningFlow(events, founderId, now),
  ];
}

export function currentDailyFlow(
  events: FounderEvent[],
  founderId: ID,
  onboarding?: OnboardingCapture | null,
  now: Date = new Date(),
): DailyExperience {
  const period = inferPeriod(now);
  switch (period) {
    case "morning":
      return buildMorningFlow(events, founderId, onboarding, now);
    case "midday":
      return buildMiddayFlow(events, founderId, now);
    case "afternoon":
      return buildAfternoonFlow(events, founderId);
    case "evening":
      return buildEveningFlow(events, founderId, now);
  }
}
