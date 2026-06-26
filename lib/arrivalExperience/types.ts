import type { CompanionHomeState } from "@/lib/arrivalIntelligence/homeState";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { AppSection } from "@/lib/companionUi";
import type { DayState } from "@/lib/companionStore";

/** First Production Experience™ — arrival beat sequence. */
export type ArrivalBeat =
  | "settle"
  | "greet"
  | "sit"
  | "reality"
  | "echo"
  | "respond"
  | "invite"
  | "walk"
  | "complete"
  | "staying";

export type RealityEmotionalTone =
  | "flooded"
  | "heavy"
  | "low"
  | "okay"
  | "spark"
  | "celebration"
  | "grief";

export type ConversationalRealityResult = {
  echo: string;
  tone: RealityEmotionalTone;
  dayState: DayState;
  needsClarify: boolean;
  clarifyQuestion: string | null;
  rawNote: string;
};

export type ArrivalRecommendation = {
  placeId: CompanionPlaceId;
  section: AppSection;
  line: string;
  buttonLabel: string;
  walkingLine: string;
  stayInLivingRoom: boolean;
};

export type HospitalityResponse = {
  showBlanket: boolean;
  showMugSteam: boolean;
  warmLamp: boolean;
  closeCurtains: boolean;
};

export type ArrivalExperienceConfig = {
  homeState: CompanionHomeState;
  realityFreshToday: boolean;
  hasCachedReality: boolean;
  returnAfterLongAbsence: boolean;
};
