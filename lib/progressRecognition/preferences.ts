/**
 * 101 — User control for recognition and celebration.
 */

export type CelebrationIntensityPreference =
  | "none"
  | "quiet"
  | "gentle"
  | "fuller";

export type PreferredCelebrationDestination =
  | "ask"
  | "in-place"
  | "garden"
  | "hall"
  | "private_only";

export type RecognitionPreferences = {
  suggestWinsAndAccomplishments: boolean;
  quietlySaveWins: boolean;
  alwaysAskBeforeAccomplishments: boolean;
  doNotSuggestRecognition: boolean;
  offerCelebrationSounds: boolean;
  neverAutoPlayCelebrationSounds: boolean;
  preferredCelebrationIntensity: CelebrationIntensityPreference;
  preferredCelebrationDestination: PreferredCelebrationDestination;
  privateCelebrationOnly: boolean;
  quietHoursEnabled: boolean;
};

export const DEFAULT_RECOGNITION_PREFERENCES: RecognitionPreferences = {
  suggestWinsAndAccomplishments: true,
  quietlySaveWins: false,
  alwaysAskBeforeAccomplishments: true,
  doNotSuggestRecognition: false,
  offerCelebrationSounds: true,
  neverAutoPlayCelebrationSounds: true,
  preferredCelebrationIntensity: "gentle",
  preferredCelebrationDestination: "ask",
  privateCelebrationOnly: true,
  quietHoursEnabled: false,
};

const STORAGE_KEY = "companion-recognition-preferences-v1";

let memoryPrefs: RecognitionPreferences | null = null;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getRecognitionPreferences(): RecognitionPreferences {
  if (memoryPrefs) return { ...memoryPrefs };
  if (!canUseStorage()) return { ...DEFAULT_RECOGNITION_PREFERENCES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_RECOGNITION_PREFERENCES };
    return {
      ...DEFAULT_RECOGNITION_PREFERENCES,
      ...(JSON.parse(raw) as Partial<RecognitionPreferences>),
    };
  } catch {
    return { ...DEFAULT_RECOGNITION_PREFERENCES };
  }
}

export function setRecognitionPreferences(
  patch: Partial<RecognitionPreferences>,
): RecognitionPreferences {
  const next = { ...getRecognitionPreferences(), ...patch };
  memoryPrefs = next;
  if (canUseStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function resetRecognitionPreferencesForTests(): void {
  memoryPrefs = null;
  if (canUseStorage()) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }
}

export function maySuggestRecognition(
  prefs: RecognitionPreferences = getRecognitionPreferences(),
): boolean {
  if (prefs.doNotSuggestRecognition) return false;
  return prefs.suggestWinsAndAccomplishments;
}

export function mayAutoPlayCelebrationSound(
  prefs: RecognitionPreferences = getRecognitionPreferences(),
): boolean {
  if (prefs.neverAutoPlayCelebrationSounds) return false;
  if (prefs.quietHoursEnabled) return false;
  if (prefs.preferredCelebrationIntensity === "none") return false;
  return false; // default: never auto-play
}
