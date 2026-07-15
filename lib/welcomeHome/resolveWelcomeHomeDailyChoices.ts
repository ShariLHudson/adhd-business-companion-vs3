/**
 * ARCH-018 — thin Welcome Home daily choice resolver.
 *
 * Selects at most three approved companion choices. Does not expose
 * WELCOME_HOME_INVITATIONS (know/tour/surprise) or the Phase-24 seven-option set.
 */

import type { ArrivalIntelligence } from "@/lib/arrivalIntelligence";
import {
  resolveCompanionContinue,
  type CompanionContinueResolution,
} from "@/lib/companionLedContinue";
import { getPrefs } from "@/lib/companionStore";
import type { ExperienceVisitorKind } from "@/lib/sparkExperienceEngine/evaluateWelcomeHomeExperience";
import { getApprovedFieldValue } from "@/lib/profile/businessEstateProfile";

export type WelcomeHomeChoiceVisitorKind = "new" | "returning" | "absence";

export type WelcomeHomeDailyChoiceId =
  | "tell-spark-about-me"
  | "clear-my-mind"
  | "explore-spark-estate"
  | "continue-where-left-off"
  | "check-my-day"
  | "help-me-restart";

export type WelcomeHomeDailyChoice = {
  id: WelcomeHomeDailyChoiceId;
  label: string;
};

export type WelcomeHomeDiscoveryInvitation = {
  show: boolean;
  line: string;
};

export type WelcomeHomeDailyChoicesResult = {
  visitorKind: WelcomeHomeChoiceVisitorKind;
  /** ARCH-aligned welcome line when the live greeting is empty or too thin. */
  preferredWelcomeMessage: string | null;
  choices: WelcomeHomeDailyChoice[];
  discoveryInvitation: WelcomeHomeDiscoveryInvitation;
  continueAvailable: boolean;
};

export type ResolveWelcomeHomeDailyChoicesInput = {
  arrival?: ArrivalIntelligence | null;
  experienceVisitorKind?: ExperienceVisitorKind;
  hasSeenWelcomeIntro?: boolean;
  continueResolution?: CompanionContinueResolution;
  /** Existing frosted-panel greeting — kept when already personalized. */
  existingGreeting?: string | null;
};

const DISCOVERY_INVITE_LINE =
  "I also have a new discovery waiting whenever you would like to learn more about Spark.";

const LABELS: Record<WelcomeHomeDailyChoiceId, string> = {
  "tell-spark-about-me": "Tell Spark About Me",
  "clear-my-mind": "Clear My Mind",
  "explore-spark-estate": "Explore Spark Estate",
  "continue-where-left-off": "Continue Where I Left Off",
  "check-my-day": "Check My Day",
  "help-me-restart": "Help Me Restart",
};

function choice(id: WelcomeHomeDailyChoiceId): WelcomeHomeDailyChoice {
  return { id, label: LABELS[id] };
}

export function continueDestinationAvailable(
  resolution: CompanionContinueResolution,
): boolean {
  return resolution.mode === "single" || resolution.mode === "choose";
}

function resolveMemberFirstName(): string | null {
  const founder = getApprovedFieldValue("identity.founderName")?.trim();
  if (founder) return founder.split(/\s+/)[0] ?? founder;
  const prefsName = getPrefs().name?.trim();
  if (prefsName) return prefsName.split(/\s+/)[0] ?? prefsName;
  return null;
}

function resolveVisitorKind(
  input: ResolveWelcomeHomeDailyChoicesInput,
): WelcomeHomeChoiceVisitorKind {
  const arrival = input.arrival ?? null;

  if (
    input.experienceVisitorKind === "first_visit" ||
    arrival?.homeState === "FIRST_VISIT" ||
    arrival?.isFirstMeeting
  ) {
    return "new";
  }

  if (
    arrival?.visitorKind === "long_absence" ||
    (arrival?.returnIntervalDays != null && arrival.returnIntervalDays >= 3)
  ) {
    return "absence";
  }

  return "returning";
}

function buildPreferredMessage(
  visitorKind: WelcomeHomeChoiceVisitorKind,
  arrival: ArrivalIntelligence | null | undefined,
  existingGreeting: string | null | undefined,
): string | null {
  const existing = existingGreeting?.trim() ?? "";
  if (existing.length > 0) return existing;

  const name = resolveMemberFirstName();
  const continuity =
    arrival?.continue?.mode === "single"
      ? arrival.continue.option.title
      : arrival?.continue?.mode === "choose"
        ? arrival.continue.options[0]?.title
        : null;

  if (visitorKind === "new") {
    return [
      "Welcome to Spark Estate. I'm glad you're here.",
      "",
      "You do not need to figure everything out today. We will build this together, and Spark will learn what helps you along the way.",
      "",
      "What would help most right now?",
    ].join("\n");
  }

  if (visitorKind === "absence") {
    return name
      ? `Welcome back, ${name}. I'm glad you're here. We don't need to catch up on everything that happened while you were away. Let's look at what matters now.`
      : "Welcome back. I'm glad you're here. We don't need to catch up on everything that happened while you were away. Let's look at what matters now.";
  }

  if (continuity) {
    return name
      ? `Welcome back, ${name}. Last time we were working on ${continuity}. Would you like to continue there, clear your mind, or look at what matters today?`
      : `Welcome back. Last time we were working on ${continuity}. Would you like to continue there, clear your mind, or look at what matters today?`;
  }

  return name
    ? `Welcome back, ${name}. I'm glad you're here. What would help most today?`
    : "Welcome back. I'm glad you're here. What would help most today?";
}

function buildChoices(
  visitorKind: WelcomeHomeChoiceVisitorKind,
  continueAvailable: boolean,
): WelcomeHomeDailyChoice[] {
  if (visitorKind === "new") {
    return [
      choice("tell-spark-about-me"),
      choice("clear-my-mind"),
      choice("explore-spark-estate"),
    ];
  }

  if (visitorKind === "absence") {
    return [
      choice("help-me-restart"),
      choice("clear-my-mind"),
      choice("check-my-day"),
    ];
  }

  if (continueAvailable) {
    return [
      choice("continue-where-left-off"),
      choice("clear-my-mind"),
      choice("check-my-day"),
    ];
  }

  // Returning without a valid resume destination — never show Continue.
  return [
    choice("clear-my-mind"),
    choice("check-my-day"),
    choice("explore-spark-estate"),
  ];
}

/**
 * Resolve ARCH-018 Welcome Home choices from live arrival / continue context.
 */
export function resolveWelcomeHomeDailyChoices(
  input: ResolveWelcomeHomeDailyChoicesInput = {},
): WelcomeHomeDailyChoicesResult {
  const continueResolution =
    input.continueResolution ?? resolveCompanionContinue();
  const continueAvailable = continueDestinationAvailable(continueResolution);
  const visitorKind = resolveVisitorKind(input);
  const choices = buildChoices(visitorKind, continueAvailable).slice(0, 3);

  // Choices retired — Today's Welcome Card owns the three-choice opening.
  // Keep preferredWelcomeMessage for soft greeting fallback only.
  void choices;
  void DISCOVERY_INVITE_LINE;

  return {
    visitorKind,
    preferredWelcomeMessage: buildPreferredMessage(
      visitorKind,
      input.arrival,
      input.existingGreeting,
    ),
    choices: [],
    discoveryInvitation: {
      show: false,
      line: DISCOVERY_INVITE_LINE,
    },
    continueAvailable,
  };
}
