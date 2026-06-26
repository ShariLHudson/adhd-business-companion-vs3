import type { RecognitionStore } from "@/lib/recognition/recognitionStore";
import type {
  CompanionHospitalityProfile,
} from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";
import {
  mayShowPetInRoom,
  sensitiveMemoryBlockedReason,
} from "./hospitalityMemoryPermissions";
import type {
  HospitalityMemorySummary,
  HospitalityTodayContext,
  UserHospitalityMemory,
} from "./types";
import {
  normalizeFavoriteDrink,
  normalizeFavoriteSeason,
} from "./types";

function summarizeRecognized(
  profile: CompanionHospitalityProfile,
  today: HospitalityTodayContext,
): string[] {
  const lines: string[] = [];

  if (profile.favoriteDrink) {
    lines.push(`Favorite drink: ${profile.favoriteDrink}`);
  }
  if (profile.favoriteFlower) {
    lines.push(`Favorite flower: ${profile.favoriteFlower}`);
  }
  if (profile.favoriteColor) {
    lines.push(`Favorite color: ${profile.favoriteColor}`);
  }
  if (profile.favoriteSeason) {
    lines.push(`Favorite season: ${profile.favoriteSeason}`);
  }

  const loves: string[] = [];
  if (profile.lovesGardening) loves.push("gardening");
  if (profile.lovesReading) loves.push("books");
  if (profile.lovesBirds) loves.push("birds");
  if (profile.lovesDogs) loves.push("dogs");
  if (profile.lovesCats) loves.push("cats");
  if (profile.lovesTravel) loves.push("travel");
  if (profile.enjoysPuzzles) loves.push("puzzles");
  if (loves.length > 0) {
    lines.push(`Loves: ${loves.join(", ")}`);
  }

  if (profile.prefersQuiet) {
    lines.push("Prefers quiet: yes");
  }
  if (profile.chronotype === "morning") {
    lines.push("Morning person: yes");
  }
  if (profile.chronotype === "night") {
    lines.push("Night owl: yes");
  }
  if (today.birthdayToday) {
    lines.push("Birthday: today");
  }
  if (today.vacationDaysAway != null) {
    lines.push(`Vacation countdown: ${today.vacationDaysAway} days`);
  }
  if (today.projectRecentlyCompleted) {
    lines.push("Project completion: recent");
  }

  return lines;
}

function collectBlocked(memory: UserHospitalityMemory): string[] {
  const blocked: string[] = [];

  if (memory.lovesDogs && !mayShowPetInRoom(memory)) {
    blocked.push(
      sensitiveMemoryBlockedReason("petsFromPhotos") ??
        "Pets remembered — not shown without permission",
    );
  }
  if (memory.lovesCats && !mayShowPetInRoom(memory)) {
    blocked.push(
      sensitiveMemoryBlockedReason("petsFromPhotos") ??
        "Cats remembered — not shown without permission",
    );
  }

  return [...new Set(blocked)];
}

/**
 * If Shari knew this guest was coming over today, what would she naturally set out?
 * Returns the existing CompanionHospitalityProfile shape — preparation only.
 */
export function resolveHospitalityProfileFromMemory(
  userMemory: UserHospitalityMemory,
  recognition: RecognitionStore,
  todayContext: HospitalityTodayContext = {},
): {
  profile: CompanionHospitalityProfile;
  todayContext: HospitalityTodayContext;
  summary: HospitalityMemorySummary;
} {
  const now = todayContext.now ?? new Date();

  const birthdayToday =
    todayContext.birthdayToday ??
    (recognition.birthday
      ? recognition.birthday.month === now.getMonth() + 1 &&
        recognition.birthday.day === now.getDate()
      : false);

  const resolvedToday: HospitalityTodayContext = {
    ...todayContext,
    now,
    birthdayToday,
  };

  const profile: CompanionHospitalityProfile = {
    guestKey: "memory",
  };

  const drink = normalizeFavoriteDrink(userMemory.favoriteDrink);
  if (drink) profile.favoriteDrink = drink;

  if (userMemory.favoriteFlower?.trim()) {
    profile.favoriteFlower = userMemory.favoriteFlower.trim();
  }
  if (userMemory.favoriteColor?.trim()) {
    profile.favoriteColor = userMemory.favoriteColor.trim();
  }

  const season = normalizeFavoriteSeason(userMemory.favoriteSeason);
  if (season) profile.favoriteSeason = season;

  if (userMemory.lovesBirds) profile.lovesBirds = true;
  if (userMemory.lovesGardening) profile.lovesGardening = true;
  if (userMemory.lovesBooks) profile.lovesReading = true;
  if (userMemory.lovesTravel) profile.lovesTravel = true;
  if (userMemory.enjoysPuzzles) profile.enjoysPuzzles = true;
  if (userMemory.prefersQuiet) profile.prefersQuiet = true;
  if (userMemory.chronotype) profile.chronotype = userMemory.chronotype;

  if (mayShowPetInRoom(userMemory) && userMemory.lovesDogs) {
    profile.lovesDogs = true;
  }
  if (mayShowPetInRoom(userMemory) && userMemory.lovesCats) {
    profile.lovesCats = true;
  }

  const recognized = summarizeRecognized(profile, resolvedToday);
  const blocked = collectBlocked(userMemory);
  const hasMemory =
    recognized.length > 0 ||
    Object.keys(profile).some((key) => key !== "guestKey" && key in profile);

  return {
    profile,
    todayContext: resolvedToday,
    summary: {
      source: "memory",
      recognized,
      blocked,
      hasMemory,
      profile,
      todayContext: resolvedToday,
    },
  };
}

export function profileHasHospitalityMemory(
  profile: CompanionHospitalityProfile,
): boolean {
  const { guestKey: _guestKey, ...rest } = profile;
  return Object.values(rest).some(
    (value) => value !== undefined && value !== false && value !== "",
  );
}

export function emptyMemorySummary(
  source: HospitalityMemorySummary["source"],
): HospitalityMemorySummary {
  return {
    source,
    recognized: [],
    blocked: [],
    hasMemory: false,
    profile: {},
    todayContext: {},
  };
}
