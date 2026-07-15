/**
 * Experience Controls preferences — appearance / accessibility / conversation visibility.
 * Separate from destination navigation. Never navigates.
 */

const STORAGE_KEY = "spark:estate:experience-controls:v1";
const CHANGE_EVENT = "spark:estate:experience-controls-change";

export type ConversationVisibility = "showing" | "hidden";
export type EstateBackgroundMode = "show" | "soften" | "focus";
export type EstateTextSize = "standard" | "large" | "extra-large";

export type ExperienceControlPrefs = {
  conversationVisibility: ConversationVisibility;
  estateSoundsEnabled: boolean;
  musicEnabled: boolean;
  shariVoiceEnabled: boolean;
  volume: number;
  backgroundMode: EstateBackgroundMode;
  textSize: EstateTextSize;
  reduceMotion: boolean;
};

const DEFAULTS: ExperienceControlPrefs = {
  conversationVisibility: "showing",
  estateSoundsEnabled: true,
  musicEnabled: true,
  shariVoiceEnabled: true,
  volume: 0.85,
  backgroundMode: "show",
  textSize: "standard",
  reduceMotion: false,
};

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

function read(): ExperienceControlPrefs {
  if (typeof localStorage === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ExperienceControlPrefs>;
    return {
      conversationVisibility:
        parsed.conversationVisibility === "hidden" ? "hidden" : "showing",
      estateSoundsEnabled:
        parsed.estateSoundsEnabled ?? DEFAULTS.estateSoundsEnabled,
      musicEnabled: parsed.musicEnabled ?? DEFAULTS.musicEnabled,
      shariVoiceEnabled: parsed.shariVoiceEnabled ?? DEFAULTS.shariVoiceEnabled,
      volume: clampVolume(parsed.volume ?? DEFAULTS.volume),
      backgroundMode:
        parsed.backgroundMode === "soften" || parsed.backgroundMode === "focus"
          ? parsed.backgroundMode
          : "show",
      textSize:
        parsed.textSize === "large" || parsed.textSize === "extra-large"
          ? parsed.textSize
          : "standard",
      reduceMotion: Boolean(parsed.reduceMotion),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(prefs: ExperienceControlPrefs): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.estateTextSize = prefs.textSize;
      document.documentElement.dataset.estateBackgroundMode =
        prefs.backgroundMode;
      document.documentElement.dataset.estateReduceMotion = prefs.reduceMotion
        ? "true"
        : "false";
    }
  } catch {
    /* ignore */
  }
}

export function getExperienceControlPrefs(): ExperienceControlPrefs {
  return read();
}

export function patchExperienceControlPrefs(
  patch: Partial<ExperienceControlPrefs>,
): ExperienceControlPrefs {
  const next = { ...read(), ...patch };
  if (typeof patch.volume === "number") {
    next.volume = clampVolume(patch.volume);
  }
  write(next);
  return next;
}

export function subscribeExperienceControlPrefs(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const onChange = () => listener();
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Apply document-level presentation classes without navigation. */
export function applyExperienceControlPresentation(
  prefs: ExperienceControlPrefs = read(),
): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.estateTextSize = prefs.textSize;
  document.documentElement.dataset.estateBackgroundMode = prefs.backgroundMode;
  document.documentElement.dataset.estateReduceMotion = prefs.reduceMotion
    ? "true"
    : "false";
}
