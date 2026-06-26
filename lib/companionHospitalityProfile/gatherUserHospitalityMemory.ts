import { getDiscoveryStore } from "@/lib/companionDiscovery";
import type { RecognitionStore } from "@/lib/recognition/recognitionStore";
import { getHospitalityProfile } from "./hospitalityProfileStore";
import type { UserHospitalityMemory } from "./types";
import type { Chronotype } from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";

function chronotypeFromDiscovery(answer: string | undefined): Chronotype | undefined {
  if (!answer) return undefined;
  if (/morning/i.test(answer)) return "morning";
  if (/evening|night/i.test(answer)) return "night";
  return undefined;
}

/**
 * Gather safe hospitality facts from Companion Memory on this device.
 * Sensitive items stay out unless explicitly granted in permissions.
 */
export function gatherUserHospitalityMemory(
  recognition?: RecognitionStore,
): UserHospitalityMemory {
  const saved = getHospitalityProfile();
  const discovery = getDiscoveryStore();
  const bestWorkTime = discovery.answers["best-work-time"];

  const memory: UserHospitalityMemory = {
    favoriteDrink: saved.favoriteDrink,
    favoriteFlower: saved.favoriteFlower,
    favoriteColor: saved.favoriteColor,
    favoriteSeason: saved.favoriteSeason,
    lovesBirds: saved.lovesBirds,
    lovesDogs: saved.lovesDogs,
    lovesCats: saved.lovesCats,
    lovesGardening: saved.lovesGardening,
    lovesBooks: saved.lovesReading,
    lovesTravel: saved.lovesTravel,
    enjoysPuzzles: saved.enjoysPuzzles,
    prefersQuiet: saved.prefersQuiet,
    chronotype: saved.chronotype ?? chronotypeFromDiscovery(bestWorkTime),
    permissions: {},
  };

  if (recognition?.celebrationMode === "off") {
    memory.prefersQuiet = memory.prefersQuiet ?? true;
  }

  return memory;
}
