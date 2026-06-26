import type { RecognitionStore } from "@/lib/recognition/recognitionStore";
import { EXAMPLE_HOSPITALITY_PROFILES } from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";
import type { CompanionHospitalityProfile } from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";
import { gatherUserHospitalityMemory } from "./gatherUserHospitalityMemory";
import { getHospitalityProfile } from "./hospitalityProfileStore";
import {
  emptyMemorySummary,
  profileHasHospitalityMemory,
  resolveHospitalityProfileFromMemory,
} from "./resolveHospitalityProfileFromMemory";
import { resolveTodayContextFromRecognition } from "./resolveTodayContext";
import type {
  HospitalityProfileSource,
  HospitalityTodayContext,
  ResolvedHospitalityProfile,
  UserHospitalityMemory,
} from "./types";

export function resolveEffectiveHospitalityProfile(input: {
  source: HospitalityProfileSource;
  demoKey?: string;
  manualProfile?: Partial<CompanionHospitalityProfile>;
  userMemory?: UserHospitalityMemory;
  recognition?: RecognitionStore;
  todayContext?: Partial<HospitalityTodayContext>;
  now?: Date;
}): ResolvedHospitalityProfile {
  const now = input.now ?? input.todayContext?.now ?? new Date();
  const recognition = input.recognition ?? {
    celebrationMode: "full",
    birthday: null,
    personalDates: [],
    businessMilestones: {},
    dismissed: {},
    sentLog: [],
    firstConversationAt: null,
    conversationStarts: 0,
    lastConversationStartAt: null,
  };

  const todayContext = resolveTodayContextFromRecognition(
    recognition,
    now,
    input.todayContext ?? {},
  );

  if (input.source === "demo") {
    const key = input.demoKey ?? "tea-gardener";
    const profile =
      EXAMPLE_HOSPITALITY_PROFILES[key] ??
      EXAMPLE_HOSPITALITY_PROFILES["tea-gardener"];
    return {
      profile,
      todayContext,
      summary: {
        source: "demo",
        recognized: [`Demo profile: ${key}`],
        blocked: [],
        hasMemory: true,
        profile,
        todayContext,
      },
    };
  }

  if (input.source === "manual") {
    const profile: CompanionHospitalityProfile = {
      guestKey: "manual",
      ...getHospitalityProfile(),
      ...input.manualProfile,
    };
    const recognized = profileHasHospitalityMemory(profile)
      ? ["Manual hospitality profile (saved on device)"]
      : [];
    return {
      profile,
      todayContext,
      summary: {
        source: "manual",
        recognized,
        blocked: [],
        hasMemory: profileHasHospitalityMemory(profile),
        profile,
        todayContext,
      },
    };
  }

  const userMemory =
    input.userMemory ?? gatherUserHospitalityMemory(recognition);
  const resolved = resolveHospitalityProfileFromMemory(
    userMemory,
    recognition,
    todayContext,
  );

  return {
    profile: resolved.profile,
    todayContext: resolved.todayContext,
    summary: resolved.summary,
  };
}

export { emptyMemorySummary };
