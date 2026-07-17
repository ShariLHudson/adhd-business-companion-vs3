/**
 * Spark Experience Engine — V1 scaffold (behavior, not screens).
 */

import { resolveWelcomeHomeDailyGreeting } from "@/lib/welcomeHome/dailyGreeting";
import { isCompanionDevFastPath } from "@/lib/companionAuthBypass";
import {
  WELCOME_HOME_DISCOVERY_KEY_DELAY_MS,
  WELCOME_HOME_ESTATE_GUIDE_DELAY_MS,
} from "@/lib/welcomeHome/introTiming";

export type ExperienceVisitorKind = "first_visit" | "returning" | "replay";

export type ExperienceDiscoveryKind =
  | "room"
  | "momentum_builder"
  | "peaceful_place"
  | "gallery"
  | "estate_guide"
  | "spark_card";

export type ExperienceDiscoverySuggestion = {
  kind: ExperienceDiscoveryKind;
  line: string;
  targetId: string;
  reason: string;
};

export type WelcomeHomeExperiencePlan = {
  visitorKind: ExperienceVisitorKind;
  greeting: string | null;
  showIntro: boolean;
  discoveryKeyDelayMs: number;
  estateGuideDelayMs: number;
  discoverySuggestion: ExperienceDiscoverySuggestion | null;
};

export type ExperienceEngineInput = {
  hasSeenWelcomeIntro: boolean;
  replayRequested?: boolean;
  /** Second or later login — intro plays once ever, not every sign-in. */
  isRepeatLogin?: boolean;
  isReturningSameDay?: boolean;
  now?: Date;
};

export function evaluateWelcomeHomeExperience(
  input: ExperienceEngineInput,
): WelcomeHomeExperiencePlan {
  const repeatLogin = Boolean(input.isRepeatLogin);
  /** Completion or a later login — never auto-open Shari's welcome again. */
  const introAlreadySeen = input.hasSeenWelcomeIntro || repeatLogin;

  /**
   * Explicit Replay Welcome — silent Welcome Home cinematic only.
   * Spoken first-login audio stays account-once (FirstLoginWelcomeGate).
   * Replay must not clear welcome_completed_at.
   */
  if (input.replayRequested && !isCompanionDevFastPath()) {
    return {
      visitorKind: "replay",
      greeting: null,
      showIntro: true,
      discoveryKeyDelayMs: WELCOME_HOME_DISCOVERY_KEY_DELAY_MS,
      estateGuideDelayMs: WELCOME_HOME_ESTATE_GUIDE_DELAY_MS,
      discoverySuggestion: null,
    };
  }

  const visitorKind: ExperienceVisitorKind = introAlreadySeen
    ? "returning"
    : "first_visit";

  /** Visual Estate intro only on the true first visit — not on later logins. */
  const showIntro =
    !isCompanionDevFastPath() && !introAlreadySeen && !repeatLogin;

  const greeting =
    visitorKind === "first_visit"
      ? null
      : resolveWelcomeHomeDailyGreeting({
          isFirstVisit: false,
          isReturningSameDay: input.isReturningSameDay,
          now: input.now,
        });

  return {
    visitorKind,
    greeting,
    showIntro,
    discoveryKeyDelayMs: WELCOME_HOME_DISCOVERY_KEY_DELAY_MS,
    estateGuideDelayMs: WELCOME_HOME_ESTATE_GUIDE_DELAY_MS,
    discoverySuggestion: null,
  };
}
