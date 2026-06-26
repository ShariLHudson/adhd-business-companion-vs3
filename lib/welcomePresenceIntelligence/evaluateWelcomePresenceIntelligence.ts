import { evaluateGreetingIntelligence } from "@/lib/greetingIntelligence";
import { evaluatePresenceIntelligence } from "@/lib/presenceIntelligence";
import {
  evaluateCarryForward,
  formatCarryForwardGreeting,
  isFirstVisitOfDay,
} from "@/lib/carryForward";
import { evaluateWelcomeRestraint } from "@/lib/wisdomOfRestraint";
import { evaluateWelcomeCharacter } from "@/lib/characterOfShari";
import type {
  WelcomeGreetingCategory,
  WelcomeMood,
  WelcomePresenceInput,
  WelcomePresenceIntelligence,
} from "./types";

function mapCategory(category: string): WelcomeGreetingCategory {
  switch (category) {
    case "first_visit":
      return "day_one";
    case "birthday":
      return "birthday";
    case "celebration":
      return "celebration";
    case "recovery":
      return "recovery";
    case "low_energy":
      return "low_energy";
    case "long_absence":
      return "relationship_six_months";
    case "morning":
      return "morning";
    case "afternoon":
      return "afternoon";
    case "evening":
      return "evening";
    case "night":
      return "late_night";
    default:
      return "ordinary";
  }
}

/**
 * Welcome Presence Intelligence™ — hospitality before words.
 * Greetings from Voice Bible™; preparation from Presence Intelligence™.
 */
export function evaluateWelcomePresenceIntelligence(
  input: WelcomePresenceInput,
): WelcomePresenceIntelligence {
  const presence = evaluatePresenceIntelligence({
    now: input.now,
    sessionVisitIndex: input.sessionVisitIndex,
    returnIntervalHours: input.returnIntervalHours,
    returnIntervalDays: input.returnIntervalDays,
    timeOfDay: input.timeOfDay,
    isFirstMeeting: input.isFirstMeeting,
    recoveryGentle: input.recoveryGentle,
    lowEnergy: input.lowEnergy,
    projectRecentlyCompleted: input.projectRecentlyCompleted,
    previousTopic: input.previousTopic,
  });

  const composed = evaluateGreetingIntelligence({
    now: input.now,
    homeState: input.homeState,
    timeOfDay: input.timeOfDay,
    season: input.season,
    isWeekend: input.isWeekend,
    sessionVisitIndex: input.sessionVisitIndex,
    returnIntervalHours: input.returnIntervalHours,
    returnIntervalDays: input.returnIntervalDays,
    isFirstMeeting: input.isFirstMeeting,
    firstName: input.firstName,
    birthdayToday: input.birthdayToday,
    celebrationActive: input.celebrationActive,
    recoveryGentle: input.recoveryGentle,
    lowEnergy: input.lowEnergy,
    vacationDaysAway: input.vacationDaysAway,
    projectRecentlyCompleted: input.projectRecentlyCompleted,
    previousTopic: input.previousTopic,
    recentAccomplishment: input.recentAccomplishment,
    emotionalNote: input.emotionalNote,
    prefersConversation: input.prefersConversation,
    presencePreferSilence: presence.posture.preferSilence,
  });

  const restraint = evaluateWelcomeRestraint({
    greeting: composed.greeting,
    invite: composed.reconnectionQuestion,
    context: {
      returnIntervalDays: input.returnIntervalDays,
      presencePreferSilence: presence.posture.preferSilence,
      recoveryGentle: input.recoveryGentle,
      lowEnergy: input.lowEnergy,
      isFirstMeeting: input.isFirstMeeting,
    },
  });

  const character = evaluateWelcomeCharacter({
    greeting: restraint.greeting.content ?? composed.greeting,
    invite: restraint.invite.content,
    context: {
      presencePreferSilence: presence.posture.preferSilence,
      recoveryGentle: input.recoveryGentle,
    },
  });

  const carryForward = evaluateCarryForward({
    now: input.now,
    sessionVisitIndex: input.sessionVisitIndex,
    isFirstMeeting: input.isFirstMeeting,
    isFirstVisitOfDay: isFirstVisitOfDay(input.now),
    projectRecentlyCompleted: input.projectRecentlyCompleted,
    recoveryGentle: input.recoveryGentle,
    lowEnergy: input.lowEnergy,
    birthdayToday: input.birthdayToday,
    celebrationActive: input.celebrationActive,
  });

  const baseGreeting =
    character.greeting.content ?? restraint.greeting.content ?? composed.greeting;
  const greeting =
    carryForward.active && formatCarryForwardGreeting(carryForward)
      ? formatCarryForwardGreeting(carryForward)!
      : baseGreeting;

  return {
    greeting,
    invite: character.invite.content,
    openingSentence: greeting,
    mood: composed.mood as WelcomeMood,
    animationProfile: "living",
    greetingCategory: mapCategory(composed.greetingCategory),
    chatPlaceholder: composed.chatPlaceholder,
    presence,
    restraint,
    character,
  };
}
