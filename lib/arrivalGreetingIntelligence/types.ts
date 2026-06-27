import type { CompanionContinueResolution } from "@/lib/companionLedContinue";
import type { LivingHomeEvaluation } from "@/lib/livingHome";
import type { ArrivalVisitorKind } from "@/lib/arrivalIntelligence/arrivalTypes";
import type { CompanionHomeState } from "@/lib/arrivalIntelligence/homeState";

export type ArrivalGreetingResult = {
  /** One complete sentence — primary welcome headline. */
  headline: string;
  /** Smaller supporting copy — scene-consistent, relationship-first. */
  body: string | null;
  /** Optional question for the reality / invite beat. */
  inviteQuestion: string | null;
};

export type EvaluateArrivalGreetingInput = {
  livingHome: LivingHomeEvaluation;
  homeState: CompanionHomeState;
  visitorKind: ArrivalVisitorKind;
  firstName: string | null;
  continue: CompanionContinueResolution;
  returnDays: number | null;
  isFirstMeeting: boolean;
  isFirstVisitOfDay: boolean;
  previousTopic: string | null;
  birthdayToday: boolean;
};
