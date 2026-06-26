import type { DirectorSceneState, HospitalityScenePreset } from "./types";
import { HOSPITALITY_SCENE_PRESETS } from "./scenePresets";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

export const DIRECTOR_STORAGE_KEY = "companion-directors-studio-v1";
export const DIRECTOR_COMPARE_A_KEY = "companion-directors-compare-a";
export const DIRECTOR_COMPARE_B_KEY = "companion-directors-compare-b";

export function presetToDirectorState(
  preset: HospitalityScenePreset,
): DirectorSceneState {
  return {
    presetId: preset.id,
    season: preset.season,
    weather: preset.weather,
    lighting: preset.lighting,
    timeOfDay: preset.timeOfDay,
    atmosphere: preset.atmosphere,
    hospitality: [...preset.hospitality],
    books: [...preset.books],
    motion: [...preset.motion],
    audio: [...preset.audio],
    greeting: preset.greeting,
    invite: preset.invite,
    companionImageId: preset.companionImageId,
    reduceMotion: false,
    warmth: preset.warmth,
    audioEnabled: true,
  };
}

export const DEFAULT_DIRECTOR_STATE: DirectorSceneState = presetToDirectorState(
  HOSPITALITY_SCENE_PRESETS[0]!,
);

export function surpriseDirectorState(): DirectorSceneState {
  const preset =
    HOSPITALITY_SCENE_PRESETS[
      Math.floor(Math.random() * HOSPITALITY_SCENE_PRESETS.length)
    ]!;
  return {
    ...presetToDirectorState(preset),
    presetId: null,
    atmosphere: "Surprise — something quietly prepared",
  };
}

const SEASON_CYCLE: WelcomeSeason[] = [
  "spring",
  "summer",
  "autumn",
  "winter",
];

export function nextSeasonInCycle(current: WelcomeSeason): WelcomeSeason {
  const index = SEASON_CYCLE.indexOf(
    current === "holiday" ? "winter" : current,
  );
  return SEASON_CYCLE[(index + 1) % SEASON_CYCLE.length]!;
}

export function loadSavedDirectorState(): DirectorSceneState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIRECTOR_STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_DIRECTOR_STATE, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveDirectorState(state: DirectorSceneState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DIRECTOR_STORAGE_KEY, JSON.stringify(state));
}

export function loadCompareSlot(
  slot: "a" | "b",
): DirectorSceneState | null {
  if (typeof window === "undefined") return null;
  const key = slot === "a" ? DIRECTOR_COMPARE_A_KEY : DIRECTOR_COMPARE_B_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as DirectorSceneState;
  } catch {
    return null;
  }
}

export function saveCompareSlot(
  slot: "a" | "b",
  state: DirectorSceneState,
): void {
  if (typeof window === "undefined") return;
  const key = slot === "a" ? DIRECTOR_COMPARE_A_KEY : DIRECTOR_COMPARE_B_KEY;
  localStorage.setItem(key, JSON.stringify(state));
}
