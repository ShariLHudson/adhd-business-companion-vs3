import type { HospitalityResponse } from "@/lib/arrivalExperience";
import type {
  CompanionMotionKind,
  RoomObject,
  RoomObjectKind,
  WelcomeWeather,
} from "@/lib/companionEnvironmentIntelligence/types";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";

export type LivingChangePriority =
  | "safety"
  | "scene_integrity"
  | "hospitality"
  | "life_continuity"
  | "relationship"
  | "time"
  | "weather"
  | "season"
  | "delight";

export type LivingChangeBucket =
  | "environmental"
  | "hospitality_preparation"
  | "relationship"
  | "hero_motion";

export type LivingVisitKind = "arrival" | "room_return" | "quiet_refresh";

export type KinseyPose =
  | "sleeping-beside-chair"
  | "watching-birds"
  | "curled-fireplace"
  | "window-gazing"
  | "doorway-greeting"
  | "hidden";

export type WildlifeSpecies =
  | "cardinal"
  | "goldfinch"
  | "hummingbird"
  | "robin"
  | "blue-jay"
  | "squirrel"
  | "butterfly";

export const LIVING_CHANGE_PRIORITY_ORDER: LivingChangePriority[] = [
  "safety",
  "scene_integrity",
  "hospitality",
  "life_continuity",
  "relationship",
  "time",
  "weather",
  "season",
  "delight",
];

export const LIVING_CHANGE_BUCKET_LIMITS: Record<LivingChangeBucket, number> = {
  environmental: 2,
  hospitality_preparation: 1,
  relationship: 1,
  hero_motion: 1,
};

export type LivingChangeItem = {
  id: string;
  bucket: LivingChangeBucket;
  priority: LivingChangePriority;
  sourceModule: string;
  /** Why this change exists — never shown in UI chrome. */
  cause: string;
  objects?: RoomObject[];
  removeObjectKinds?: RoomObjectKind[];
  motion?: {
    enable?: CompanionMotionKind[];
    disable?: CompanionMotionKind[];
  };
  heroMotion?: CompanionMotionKind;
  kinsey?: KinseyPose;
  wildlife?: WildlifeSpecies;
  aquariumVariant?: number;
  hospitality?: Partial<HospitalityResponse>;
  relationshipCue?: string;
  conversationHint?: string;
};

export type LivingChangeSet = {
  changes: LivingChangeItem[];
  visitKind: LivingVisitKind;
  elapsedSinceLastPresenceMs: number | null;
  kinsey: KinseyPose;
  wildlife: WildlifeSpecies | null;
  heroMotion: CompanionMotionKind | null;
  hospitality: HospitalityResponse;
  conversationHints: string[];
  appliedAt: string;
  restraintApplied: boolean;
};

export type LivingLifeContext = {
  visitKind?: LivingVisitKind;
  returnFromRoom?: CompanionPlaceId | null;
  hoursSinceLastVisit?: number | null;
  minutesAwayFromLivingRoom?: number | null;
  flooded?: boolean;
  grief?: boolean;
  recordToHistory?: boolean;
};

export type LivingChangeEngineInput = {
  now?: Date;
  timeOfDay: WelcomeTimeOfDay;
  season: WelcomeSeason;
  weather: WelcomeWeather;
  sessionVisitIndex: number;
  isFirstMeeting: boolean;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  birthdayToday?: boolean;
  vacationDaysAway?: number | null;
  projectRecentlyCompleted?: boolean;
  objects: RoomObject[];
  motion: { enabled: CompanionMotionKind[] };
  livingLifeContext?: LivingLifeContext;
};

export type LivingTimelineContext = {
  visitKind: LivingVisitKind;
  elapsedSinceLastPresenceMs: number | null;
  minutesAwayFromLivingRoom: number | null;
  returnFromRoom: CompanionPlaceId | null;
  notes: string[];
};

export type LivingRoomDepartureSnapshot = {
  kinsey: KinseyPose;
  wildlife: WildlifeSpecies | null;
  heroMotion: CompanionMotionKind | null;
  objectKinds: RoomObjectKind[];
};
