/**
 * Estate Audio Settings — member controls for Layer 1 ambience + Layer 2 soundscapes.
 * 133–135: all sound is opt-in; autoplayAllowed defaults false.
 */

const STORAGE_KEY = "spark:estate:audio-settings:v2";
export const ESTATE_AUDIO_SETTINGS_STORAGE_KEY = STORAGE_KEY;
const SETTINGS_CHANGE_EVENT = "spark:estate:audio-settings-change";

export type EstateAudioSettings = {
  /**
   * When false (default), place entry / login / navigation never starts audio.
   * Explicit Play / Sound on still works when ambience is enabled and not silenced.
   */
  autoplayAllowed: boolean;
  /** Layer 1 — place identity sound (default off — opt-in). */
  ambienceEnabled: boolean;
  /** Layer 2 — optional soundscape overlay (default off). */
  soundscapeOverlayEnabled: boolean;
  /** Master volume 0–1 — scales both layers. */
  masterVolume: number;
  /** Silence Estate / globalMuted — disables environmental audio. */
  silenced: boolean;
  /**
   * Welcome greeting audio preference (default off).
   * Does not block the one-time first-login gate autoplay — that path is
   * eligible once unless Estate is silenced (see isWelcomeGreetingAudioEnabled).
   * After welcome completion, this toggle gates any returning / general replay.
   */
  welcomeGreetingAudioEnabled: boolean;
};

const DEFAULT_SETTINGS: EstateAudioSettings = {
  autoplayAllowed: false,
  ambienceEnabled: false,
  soundscapeOverlayEnabled: false,
  masterVolume: 0.85,
  silenced: false,
  welcomeGreetingAudioEnabled: false,
};

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

function readRaw(): EstateAudioSettings {
  if (typeof localStorage === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<EstateAudioSettings>;
    return {
      autoplayAllowed:
        parsed.autoplayAllowed ?? DEFAULT_SETTINGS.autoplayAllowed,
      ambienceEnabled:
        parsed.ambienceEnabled ?? DEFAULT_SETTINGS.ambienceEnabled,
      soundscapeOverlayEnabled:
        parsed.soundscapeOverlayEnabled ??
        DEFAULT_SETTINGS.soundscapeOverlayEnabled,
      masterVolume: clampVolume(
        parsed.masterVolume ?? DEFAULT_SETTINGS.masterVolume,
      ),
      silenced: parsed.silenced ?? DEFAULT_SETTINGS.silenced,
      welcomeGreetingAudioEnabled:
        parsed.welcomeGreetingAudioEnabled ??
        DEFAULT_SETTINGS.welcomeGreetingAudioEnabled,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function write(settings: EstateAudioSettings): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));
    }
  } catch {
    /* ignore */
  }
}

/** Listen for Layer 1 / master audio preference changes (same tab + cross-tab). */
export function subscribeEstateAudioSettings(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onChange = () => listener();
  window.addEventListener(SETTINGS_CHANGE_EVENT, onChange);
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) onChange();
  });
  return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, onChange);
}

export function getEstateAudioSettings(): EstateAudioSettings {
  return readRaw();
}

export function patchEstateAudioSettings(
  patch: Partial<EstateAudioSettings>,
): EstateAudioSettings {
  const next = { ...readRaw(), ...patch };
  if (patch.masterVolume != null) {
    next.masterVolume = clampVolume(patch.masterVolume);
  }
  write(next);
  return next;
}

export function isEstateSilenced(): boolean {
  return readRaw().silenced;
}

export type WelcomeGreetingAudioOptions = {
  /**
   * When true, the member is on the unfinished first-login welcome gate.
   * Eligible for one autoplay / Play offer even when the Settings default is off.
   * Still blocked when Estate is silenced.
   */
  firstLoginWelcomeIncomplete?: boolean;
};

/**
 * Whether welcome greeting audio may be offered / played.
 * First unfinished login gate: allowed unless silenced (Settings default ignored).
 * Returning / general paths: require welcomeGreetingAudioEnabled and not silenced.
 */
export function isWelcomeGreetingAudioEnabled(
  options?: WelcomeGreetingAudioOptions,
): boolean {
  const s = readRaw();
  if (s.silenced) return false;
  if (options?.firstLoginWelcomeIncomplete) return true;
  return s.welcomeGreetingAudioEnabled;
}

/** True when automatic starts (room entry, login) are allowed. Default false. */
export function isEstateAutoplayAllowed(): boolean {
  const s = readRaw();
  return s.autoplayAllowed && !s.silenced;
}

export function setEstateSilenced(silenced: boolean): EstateAudioSettings {
  return patchEstateAudioSettings({ silenced });
}

export function isEstateAmbienceLayerEnabled(): boolean {
  const s = readRaw();
  return s.ambienceEnabled && !s.silenced;
}

export function isEstateSoundscapeOverlayEnabled(): boolean {
  const s = readRaw();
  return s.soundscapeOverlayEnabled && !s.silenced;
}

export function getEstateMasterVolume(): number {
  const s = readRaw();
  if (s.silenced) return 0;
  return s.masterVolume;
}

/** Scales a place profile base volume by master slider. */
export function effectiveEstateLayerVolume(baseVolume: number): number {
  return baseVolume * getEstateMasterVolume();
}

/** Package 133 AudioPreference view over stored settings. */
export function toAudioPreference(settings?: EstateAudioSettings): {
  autoplayAllowed: boolean;
  globalMuted: boolean;
  volume: number;
} {
  const s = settings ?? readRaw();
  return {
    autoplayAllowed: s.autoplayAllowed,
    globalMuted: s.silenced,
    volume: s.masterVolume,
  };
}
