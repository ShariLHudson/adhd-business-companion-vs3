import {
  WELCOME_CHAT_PLACEHOLDER_LIBRARY,
  WELCOME_GREETING_LIBRARY,
  WELCOME_INVITE_LIBRARY,
} from "./greetingLibrary";
import type {
  WelcomeGreetingCategory,
  WelcomeMood,
  WelcomePresenceInput,
  WelcomePresenceIntelligence,
  WelcomeRelationshipTier,
} from "./types";

function stablePick<T>(items: readonly T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return items[Math.abs(hash) % items.length]!;
}

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function relationshipTier(input: WelcomePresenceInput): WelcomeRelationshipTier {
  if (input.isFirstMeeting || input.homeState === "FIRST_VISIT") {
    return "day_one";
  }
  const visits = input.sessionVisitIndex;
  if (visits >= 180) return "years";
  if (visits >= 90) return "six_months";
  if (visits >= 30) return "month";
  return "early";
}

function timeGreetingCategory(
  timeOfDay: WelcomePresenceInput["timeOfDay"],
): WelcomeGreetingCategory {
  switch (timeOfDay) {
    case "morning":
      return "morning";
    case "afternoon":
      return "afternoon";
    case "evening":
      return "evening";
    case "night":
      return "late_night";
  }
}

function resolveCategory(input: WelcomePresenceInput): WelcomeGreetingCategory {
  if (input.isFirstMeeting || input.homeState === "FIRST_VISIT") {
    return "day_one";
  }
  if (input.birthdayToday) return "birthday";
  if (input.celebrationActive) return "celebration";
  if (input.recoveryGentle) return "recovery";
  if (input.lowEnergy) return "low_energy";
  if (input.vacationDaysAway != null && input.vacationDaysAway <= 7) {
    return "vacation";
  }

  const tier = relationshipTier(input);
  if (tier === "years") return "relationship_years";
  if (tier === "six_months") return "relationship_six_months";
  if (tier === "month") return "relationship_month";

  if (
    input.returnIntervalHours != null &&
    input.returnIntervalHours < 6 &&
    input.sessionVisitIndex > 1
  ) {
    return timeGreetingCategory(input.timeOfDay);
  }

  return timeGreetingCategory(input.timeOfDay);
}

function resolveMood(category: WelcomeGreetingCategory): WelcomeMood {
  switch (category) {
    case "birthday":
    case "celebration":
      return "celebratory";
    case "recovery":
    case "late_night":
    case "evening":
      return "gentle";
    case "low_energy":
      return "honest";
    case "relationship_years":
      return "warm";
    default:
      return "warm";
  }
}

function personalizeGreeting(
  line: string,
  firstName: string | null | undefined,
): string {
  const trimmed = firstName?.trim();
  if (!trimmed) return line;
  if (line.endsWith(".") && !line.includes(",")) {
    const base = line.slice(0, -1);
    return `${base}, ${trimmed}.`;
  }
  return line;
}

/**
 * Welcome Presence Intelligence™ — the companion's first conversation of the day.
 * Chooses naturally, never randomly. Relationship earns intimacy.
 */
export function evaluateWelcomePresenceIntelligence(
  input: WelcomePresenceInput,
): WelcomePresenceIntelligence {
  const now = input.now ?? new Date();
  const category = resolveCategory(input);
  const seed = `${dayKey(now)}:${input.sessionVisitIndex}:${category}`;
  const greeting = personalizeGreeting(
    stablePick(WELCOME_GREETING_LIBRARY[category], seed),
    input.firstName,
  );
  const invite = stablePick(
    WELCOME_INVITE_LIBRARY[category],
    `${seed}:invite`,
  );

  return {
    greeting,
    invite,
    openingSentence: greeting,
    mood: resolveMood(category),
    animationProfile: "living",
    greetingCategory: category,
    chatPlaceholder: WELCOME_CHAT_PLACEHOLDER_LIBRARY[category],
  };
}
