import type { LivingHomeTimeProfile, LivingHomeWeather } from "@/lib/livingHome";
import type { ArrivalGreetingResult, EvaluateArrivalGreetingInput } from "./types";

const FORBIDDEN_GREETING_RE =
  /\b(detected|loading|processing|thinking|based on|it sounds like|it appears)\b/i;

function withName(base: string, firstName: string | null): string {
  if (!firstName) return base;
  if (base.includes(firstName)) return base;
  return base.replace(/\.$/, `, ${firstName}.`);
}

function timeHeadline(
  profile: LivingHomeTimeProfile,
  firstName: string | null,
  returning: boolean,
): string {
  switch (profile) {
    case "early-morning":
    case "morning":
      return withName("Good morning.", firstName);
    case "afternoon":
      return returning
        ? withName("Welcome back.", firstName)
        : withName("Good afternoon.", firstName);
    case "golden-hour":
      return withName("Welcome back.", firstName);
    case "evening":
    case "night":
      return withName("Good evening.", firstName);
    default:
      return returning
        ? withName("Welcome back.", firstName)
        : withName("I'm glad you're here.", firstName);
  }
}

function sceneBody(
  profile: LivingHomeTimeProfile,
  weather: LivingHomeWeather,
  lifeEvent: string | undefined,
): string {
  if (weather === "rain") {
    return "Looks like a rainy day. Come inside where it's warm.";
  }
  if (weather === "snow") {
    return "It's chilly outside today. I'm glad you're here.";
  }
  if (weather === "fog") {
    return "A soft mist is hanging over the porch. Come on in.";
  }

  if (lifeEvent === "christmas") {
    return "A little holiday warmth is on the porch today.";
  }
  if (lifeEvent === "halloween") {
    return "The porch has a gentle autumn glow tonight.";
  }

  switch (profile) {
    case "early-morning":
    case "morning":
      return "Soft morning light is settling across the porch.";
    case "afternoon":
      return "I'm glad you're here.";
    case "golden-hour":
      return "The afternoon light is beautiful today.";
    case "evening":
      return "Come on in. The porch lights are on.";
    case "night":
      return "The porch light is still on for you.";
    default:
      return "I'm glad you're here.";
  }
}

function memoryBody(topic: string): string {
  return `It's good to see you again. Last time we were working on ${topic}. We can continue there whenever you're ready, or start somewhere completely new.`;
}

function longAbsenceBody(firstName: string | null): string {
  return firstName
    ? `${firstName}, it's good to see you. We can take today at your pace.`
    : "It's good to see you. We can take today at your pace.";
}

function inviteForContext(input: EvaluateArrivalGreetingInput): string | null {
  if (input.homeState === "FIRST_VISIT") {
    return "What brought you in today?";
  }
  if (input.visitorKind === "long_absence") {
    return "What's present for you today?";
  }
  if (input.continue.mode === "choose") {
    return "What feels most alive to continue?";
  }
  if (
    input.continue.mode === "single" &&
    input.continue.option.kind === "conversation"
  ) {
    return "Would you like to keep talking about that?";
  }
  if (input.livingHome.timeProfile === "morning") {
    return "How is the morning feeling?";
  }
  if (
    input.livingHome.timeProfile === "evening" ||
    input.livingHome.timeProfile === "night"
  ) {
    return "How has your day been?";
  }
  return "What's on your mind today?";
}

/**
 * Arrival Greeting Intelligence — scene-consistent, complete-sentence welcomes.
 */
export function composeArrivalGreeting(
  input: EvaluateArrivalGreetingInput,
): ArrivalGreetingResult {
  const { livingHome, firstName } = input;
  const lifeEvent = livingHome.dataAttributes["data-living-home-event"] as
    | string
    | undefined;
  const returning = !input.isFirstMeeting;

  if (input.birthdayToday) {
    return {
      headline: withName("Happy birthday.", firstName),
      body: "I'm really glad you're here today.",
      inviteQuestion: "What would make today feel special?",
    };
  }

  if (input.isFirstMeeting || input.homeState === "FIRST_VISIT") {
    return {
      headline: withName("Welcome.", firstName),
      body: "I'm glad you're here.",
      inviteQuestion: inviteForContext(input),
    };
  }

  if (input.visitorKind === "long_absence") {
    return {
      headline: withName("Welcome back.", firstName),
      body: longAbsenceBody(firstName),
      inviteQuestion: inviteForContext(input),
    };
  }

  const headline = timeHeadline(
    livingHome.timeProfile,
    firstName,
    returning,
  );

  let body = sceneBody(
    livingHome.timeProfile,
    livingHome.weather,
    lifeEvent,
  );

  if (
    input.homeState === "RETURNING_ACTIVE" &&
    input.continue.mode === "single" &&
    input.continue.option.kind === "conversation"
  ) {
    body = memoryBody(input.continue.option.title);
  } else if (
    input.homeState === "RETURNING_ACTIVE" &&
    input.previousTopic &&
    input.continue.mode === "empty"
  ) {
    body = memoryBody(input.previousTopic);
  } else if (input.returnDays != null && input.returnDays >= 2) {
    body = "It's good to see you again.";
  }

  const result: ArrivalGreetingResult = {
    headline,
    body,
    inviteQuestion: inviteForContext(input),
  };

  assertArrivalGreeting(result);
  return result;
}

export function assertArrivalGreeting(greeting: ArrivalGreetingResult): void {
  for (const line of [greeting.headline, greeting.body, greeting.inviteQuestion]) {
    if (!line) continue;
    if (FORBIDDEN_GREETING_RE.test(line)) {
      throw new Error(`Arrival greeting violates natural language: ${line}`);
    }
    if (/^[^.!?]+ — [^.!?]+$/.test(line)) {
      throw new Error(`Arrival greeting uses headline fragment: ${line}`);
    }
    if (!/[.!?]$/.test(line.trim())) {
      throw new Error(`Arrival greeting is not a complete sentence: ${line}`);
    }
  }
}
