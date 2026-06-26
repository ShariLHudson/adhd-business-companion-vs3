import type { WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import type {
  CompanionHospitalityProfile,
  FavoriteDrink,
} from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";

export type VisitEnergy = "recovery" | "gentle" | "steady" | "high";

export type GuestPreparation = {
  drink: FavoriteDrink;
  objectKind: "coffee" | "tea-set";
  vesselLabel: string;
  /** Host voice — never app personalization voice. */
  line: string;
  blanket: boolean;
  brightMorning: boolean;
  visitEnergy: VisitEnergy;
};

export function resolveVisitEnergy(input: {
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  timeOfDay?: WelcomeTimeOfDay;
  weather?: WelcomeWeather;
}): VisitEnergy {
  if (input.recoveryGentle) return "recovery";
  if (input.lowEnergy) return "gentle";
  if (
    input.timeOfDay === "morning" &&
    (input.weather === "clear" || input.weather === undefined)
  ) {
    return "high";
  }
  return "steady";
}

function teaPreparation(input: {
  line: string;
  blanket?: boolean;
  brightMorning?: boolean;
  visitEnergy: VisitEnergy;
}): GuestPreparation {
  return {
    drink: "tea",
    objectKind: "tea-set",
    vesselLabel: "tea cup",
    line: input.line,
    blanket: input.blanket ?? false,
    brightMorning: input.brightMorning ?? false,
    visitEnergy: input.visitEnergy,
  };
}

function coffeePreparation(input: {
  line: string;
  brightMorning?: boolean;
  visitEnergy: VisitEnergy;
}): GuestPreparation {
  return {
    drink: "coffee",
    objectKind: "coffee",
    vesselLabel: "Spark mug",
    line: input.line,
    blanket: false,
    brightMorning: input.brightMorning ?? false,
    visitEnergy: input.visitEnergy,
  };
}

/**
 * Layer 2 + 5 — what Shari prepares before arrival.
 * Same Living Room™. Same home. Different welcome.
 */
export function resolveGuestPreparation(input: {
  profile: CompanionHospitalityProfile;
  visitEnergy: VisitEnergy;
}): GuestPreparation {
  const { profile, visitEnergy } = input;

  if (visitEnergy === "recovery") {
    return teaPreparation({
      visitEnergy,
      blanket: true,
      line: "Tea and a blanket — take your time settling in.",
    });
  }

  if (visitEnergy === "gentle") {
    return teaPreparation({
      visitEnergy,
      line: "I put the kettle on — tea when you're ready.",
    });
  }

  if (visitEnergy === "high") {
    if (profile.favoriteDrink === "tea") {
      return teaPreparation({
        visitEnergy,
        brightMorning: true,
        line: "Tea and a bright morning — ready when you are.",
      });
    }
    return coffeePreparation({
      visitEnergy,
      brightMorning: true,
      line: "Coffee's waiting in the Spark mug — bright morning outside.",
    });
  }

  if (profile.favoriteDrink === "tea") {
    return teaPreparation({
      visitEnergy,
      line: "I remembered you love tea — it's ready when you are.",
    });
  }

  if (profile.favoriteDrink === "coffee") {
    return coffeePreparation({
      visitEnergy,
      line: "Coffee's waiting in the Spark mug.",
    });
  }

  return teaPreparation({
    visitEnergy,
    line: "The room is ready whenever you are.",
  });
}
