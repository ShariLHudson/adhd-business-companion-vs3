/**
 * Morning Greeting Intelligence — first greeting of the day feels like arriving home.
 */

import { shortTopicLabel } from "@/lib/shariVoiceBible/interpolate";
import { pickVariedEntry, recordGreetingShown } from "./greetingVariety";
import { applyNameNaturally, evaluateNameIntelligence } from "./nameIntelligence";
import type { MorningGreetingInput, MorningGreetingVerdict } from "./types";
import { PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE } from "./types";
import { violatesVagueCarryForward } from "./vagueCarryForward";

export const MORNING_GREETING_PRINCIPLE =
  "Morning Greeting Intelligence — warm, relaxed, personal. Never generic. Rotate naturally.";

type MorningGreetingEntry = {
  id: string;
  withName: string;
  withoutName: string;
  followUp?: string;
};

const FRESH_START_LIBRARY: MorningGreetingEntry[] = [
  {
    id: "mg-01",
    withName: "Good morning, {name}. I'm really glad you're here.",
    withoutName: "Good morning. I'm really glad you're here.",
  },
  {
    id: "mg-02",
    withName: "Morning, {name}. Today gets a fresh start.",
    withoutName: "Morning. Today gets a fresh start.",
  },
  {
    id: "mg-03",
    withName: "Good morning, {name}. Let's see where today takes us.",
    withoutName: "Good morning. Let's see where today takes us.",
  },
  {
    id: "mg-04",
    withName: "Morning, {name}. Ready whenever you are.",
    withoutName: "Morning. Ready whenever you are.",
  },
  {
    id: "mg-05",
    withName: "Good morning, {name}.",
    withoutName: "Good morning.",
    followUp: "I'm glad you're here.",
  },
  {
    id: "mg-06",
    withName: "Morning, {name}.",
    withoutName: "Morning.",
    followUp: "What would help most today?",
  },
  {
    id: "mg-07",
    withName: "Good morning, {name}. Come in.",
    withoutName: "Good morning. Come in.",
  },
  {
    id: "mg-08",
    withName: "Morning, {name}. Coffee's ready when you are.",
    withoutName: "Morning. Coffee's ready when you are.",
  },
];

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function composeSpecificMemoryGreeting(
  input: MorningGreetingInput,
): MorningGreetingVerdict | null {
  const topic = input.previousTopic?.trim();
  const accomplishment = input.recentAccomplishment?.trim();
  const nameDecision = evaluateNameIntelligence({
    firstName: input.firstName,
    scenario: "first_greeting_of_day",
    lineContext: "greeting",
    isFirstGreetingOfDay: true,
    returnIntervalDays: input.returnIntervalDays,
    celebrationActive: input.celebrationActive,
    projectRecentlyCompleted: input.projectRecentlyCompleted,
    recoveryGentle: input.recoveryGentle,
  });

  const name = input.firstName?.trim();
  const namePrefix =
    name && nameDecision.useName ? `Good morning, ${name}.` : "Good morning.";

  if (accomplishment) {
    const greeting = `${namePrefix} Yesterday you made great progress on ${shortTopicLabel(accomplishment)}.`;
    const followUp = "Want to continue, or does today need something different?";
    return {
      greeting,
      followUp,
      entryId: "mg-memory-accomplishment",
      usedSpecificMemory: true,
      usedName: nameDecision.useName,
      principle: MORNING_GREETING_PRINCIPLE,
    };
  }

  if (topic) {
    const label = shortTopicLabel(topic);
    const variants = [
      {
        id: "mg-memory-topic-01",
        greeting: `${namePrefix} Last time we talked, you were working on ${label}.`,
        followUp: "We can pick up there or start somewhere completely new.",
      },
      {
        id: "mg-memory-topic-02",
        greeting: `${namePrefix} ${label} was still on your mind when we last talked.`,
        followUp: "Want to keep going, or shift to something else?",
      },
    ];
    const now = input.now ?? new Date();
    const pick = pickVariedEntry(
      variants,
      `${dayKey(now)}:${input.sessionVisitIndex ?? 0}:memory`,
    );
    return {
      greeting: pick.greeting,
      followUp: pick.followUp,
      entryId: pick.id,
      usedSpecificMemory: true,
      usedName: nameDecision.useName,
      principle: MORNING_GREETING_PRINCIPLE,
    };
  }

  if (input.projectRecentlyCompleted) {
    const greeting = `${namePrefix} Yesterday ended on a good note after you finished something that mattered.`;
    return {
      greeting,
      followUp: "Ready to build on it, or take today slower?",
      entryId: "mg-memory-win",
      usedSpecificMemory: true,
      usedName: nameDecision.useName,
      principle: MORNING_GREETING_PRINCIPLE,
    };
  }

  return null;
}

/**
 * Morning Greeting Intelligence — constitutional first greeting of the day.
 */
export function evaluateMorningGreeting(
  input: MorningGreetingInput,
): MorningGreetingVerdict {
  if (input.isFirstMeeting) {
    return {
      greeting: "Come in.",
      followUp: null,
      entryId: "mg-first-meeting",
      usedSpecificMemory: false,
      usedName: false,
      principle: MORNING_GREETING_PRINCIPLE,
    };
  }

  const specific = composeSpecificMemoryGreeting(input);
  if (specific) {
    recordGreetingShown(specific.entryId, specific.greeting);
    return specific;
  }

  const now = input.now ?? new Date();
  const nameDecision = evaluateNameIntelligence({
    firstName: input.firstName,
    scenario: "first_greeting_of_day",
    lineContext: "greeting",
    isFirstGreetingOfDay: true,
    returnIntervalDays: input.returnIntervalDays,
    celebrationActive: input.celebrationActive,
    projectRecentlyCompleted: input.projectRecentlyCompleted,
    recoveryGentle: input.recoveryGentle,
  });

  const entry = pickVariedEntry(
    FRESH_START_LIBRARY,
    `${dayKey(now)}:${input.sessionVisitIndex ?? 0}:morning`,
  );

  const template = nameDecision.useName ? entry.withName : entry.withoutName;
  const greeting = applyNameNaturally(template, input.firstName, nameDecision.useName);

  if (violatesVagueCarryForward(greeting)) {
    return {
      greeting: nameDecision.useName && input.firstName?.trim()
        ? `Good morning, ${input.firstName.trim()}.`
        : "Good morning.",
      followUp: "I'm glad you're here.",
      entryId: "mg-fallback",
      usedSpecificMemory: false,
      usedName: nameDecision.useName,
      principle: MORNING_GREETING_PRINCIPLE,
    };
  }

  recordGreetingShown(entry.id, greeting);

  return {
    greeting,
    followUp: entry.followUp ?? null,
    entryId: entry.id,
    usedSpecificMemory: false,
    usedName: nameDecision.useName,
    principle: MORNING_GREETING_PRINCIPLE,
  };
}

export function formatMorningGreeting(verdict: MorningGreetingVerdict): string {
  if (!verdict.followUp) return verdict.greeting;
  return `${verdict.greeting} ${verdict.followUp}`;
}

export function morningGreetingHintForChat(): string {
  return [
    MORNING_GREETING_PRINCIPLE,
    PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
    "First greeting of the day: warm, relaxed, personal — like arriving at Shari's home.",
    "Carry Forward only when referencing something specific the guest will recognize.",
    "Never: 'Still carrying a similar feeling?' or vague yesterday comparisons.",
    "Fresh start when no meaningful memory — simple warmth, no forced recall.",
  ].join("\n");
}
