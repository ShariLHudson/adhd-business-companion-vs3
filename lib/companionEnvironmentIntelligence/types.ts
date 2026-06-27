import type { WelcomePresenceIntelligence } from "@/lib/welcomePresenceIntelligence";
import type { GuestPreparation } from "@/lib/companionHospitalityProfile";
import type { CompanionHospitalityProfile } from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";
import type { VisitEnergy } from "@/lib/companionHospitalityProfile";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";

export type WelcomeWeather = "clear" | "rain" | "snow" | "cloudy";

export type WelcomeRoomPrototypeDiscovery =
  | "auto"
  | "none"
  | "cookies"
  | "tea"
  | "quote"
  | "project-complete"
  | "birthday"
  | "vacation";

export type WelcomeRoomPrototypeOverrides = {
  season?: WelcomeSeason | "auto";
  weather?: WelcomeWeather | "auto";
  discovery?: WelcomeRoomPrototypeDiscovery;
  timeOfDay?: WelcomeTimeOfDay | "auto";
  favoriteDrink?: "auto" | "coffee" | "tea";
  visitEnergy?: "auto" | "recovery" | "gentle" | "high" | "steady";
};

export type PersonalRoomPermission =
  | "pets"
  | "family-photos"
  | "child-drawings"
  | "memorial"
  | "personal-dates"
  | "health"
  | "grief";

export type RoomPermissionContext = {
  birthdayEntered?: boolean;
  vacationCountdownCreated?: boolean;
  teaCoffeePreferenceKnown?: boolean;
  granted: Partial<Record<PersonalRoomPermission, boolean>>;
};

export type RoomObjectKind =
  | "book"
  | "cookies"
  | "flowers"
  | "tulips"
  | "cake"
  | "tea"
  | "tea-set"
  | "coffee"
  | "travel-guide"
  | "suitcase"
  | "gift"
  | "fruit"
  | "notebook"
  | "journal"
  | "wrapped-journal"
  | "keepsake"
  | "holiday-decor"
  | "balloons"
  | "pumpkins"
  | "blanket"
  | "cider"
  | "postcard";

export type RoomObjectPlacement = "shelf" | "table" | "floor" | "window";

export type RoomObject = {
  kind: RoomObjectKind;
  placement: RoomObjectPlacement;
  /** Book spine label or discovery hint — never announced in UI chrome. */
  label?: string;
};

export type CompanionMotionKind =
  | "candle"
  | "steam"
  | "foliage"
  | "sunlight"
  | "lamplight"
  | "rain"
  | "snow"
  | "fireflies"
  | "butterflies"
  | "curtains"
  | "holiday-lights";

export type CompanionMotionProfile = {
  enabled: CompanionMotionKind[];
};

export type DailyDiscoveryKind =
  | "holiday"
  | "book-feature"
  | "tea"
  | "coffee"
  | "quote"
  | "encouragement"
  | "flower"
  | "project-complete"
  | "vacation"
  | "birthday";

export type DailyDiscovery = {
  kind: DailyDiscoveryKind;
  /** Internal — surfaces as objects, not popups. */
  label: string;
};

export type LivingCompanionRoomPhotograph = {
  id: string;
  reason: string;
};

export type CompanionEnvironmentIntelligence = {
  photograph: LivingCompanionRoomPhotograph;
  objects: RoomObject[];
  motion: CompanionMotionProfile;
  dailyDiscovery: DailyDiscovery | null;
  atmosphere: {
    timeOfDay: WelcomeTimeOfDay;
    season: WelcomeSeason;
    weather: WelcomeWeather;
  };
  /** What Shari prepared — host voice, not UI customization. */
  guestPreparation: GuestPreparation | null;
  /** Living Change Engine output — room speaks before dialogue. */
  livingChangeSet?: import("@/lib/livingLifeEngine").LivingChangeSet | null;
  /** Environmental Truth — every detail traces to a believable cause. */
  environmentalTruth?: import("@/lib/environmentalTruth").EnvironmentalTruth | null;
  /** Homestead Time — the house lives in the guest's day. */
  homesteadTime?: import("@/lib/homesteadTime").HomesteadTime | null;
  /** Quiet Moments — ambient life between conversations (when idle state known). */
  quietMoments?: import("@/lib/quietMoments").QuietMomentsIntelligence | null;
};

/** Four-layer Living Companion Room */
export type LivingCompanionRoom = {
  layer1: LivingCompanionRoomPhotograph;
  layer2: RoomObject[];
  layer3: CompanionMotionProfile;
  layer4: WelcomePresenceIntelligence;
  dailyDiscovery: DailyDiscovery | null;
  atmosphere: CompanionEnvironmentIntelligence["atmosphere"];
  guestPreparation: GuestPreparation | null;
  livingChangeSet?: import("@/lib/livingLifeEngine").LivingChangeSet | null;
  environmentalTruth?: import("@/lib/environmentalTruth").EnvironmentalTruth | null;
  homesteadTime?: import("@/lib/homesteadTime").HomesteadTime | null;
  quietMoments?: import("@/lib/quietMoments").QuietMomentsIntelligence | null;
};

export type CompanionEnvironmentInput = {
  now?: Date;
  timeOfDay: WelcomeTimeOfDay;
  season: WelcomeSeason;
  weather?: WelcomeWeather;
  sessionVisitIndex: number;
  isFirstMeeting: boolean;
  birthdayToday?: boolean;
  celebrationActive?: boolean;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  vacationDaysAway?: number | null;
  businessFocus?: boolean;
  gentleDay?: boolean;
  greetingCategory?: string;
  prototypeDiscovery?: WelcomeRoomPrototypeDiscovery;
  permissions?: RoomPermissionContext;
  hospitalityProfile?: CompanionHospitalityProfile;
  visitEnergy?: VisitEnergy;
  projectRecentlyCompleted?: boolean;
  /** When false, skips Living Change Engine (prototype / tests). Default true. */
  useLivingChangeEngine?: boolean;
  livingLifeContext?: import("@/lib/livingLifeEngine").LivingLifeContext;
  homesteadTime?: import("@/lib/homesteadTime").HomesteadTime;
  /** When set, evaluates Quiet Moments and merges ambient motion. */
  quietMoments?: import("@/lib/quietMoments").QuietMomentsInput;
  /** Optional pre-resolved relationship verdict */
  companionRelationship?: import("@/lib/companionRelationship").CompanionRelationshipVerdict;
  /** Arrival message for Dynamic Visit Awareness */
  arrivalUserText?: string | null;
};
