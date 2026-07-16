/**
 * Estate Audio Settings — member controls for Layer 1 ambience + Layer 2 soundscapes.
 * Environmental simulation — not a media player.
 */

const STORAGE_KEY = "spark:estate:audio-settings:v2";
export const ESTATE_AUDIO_SETTINGS_STORAGE_KEY = STORAGE_KEY;
const SETTINGS_CHANGE_EVENT = "spark:estate:audio-settings-change";

export type EstateAudioSettings = {
  /** Layer 1 — place identity sound (default on). */
  ambienceEnabled: boolean;
  /** Layer 2 — optional soundscape overlay (default off). */
  soundscapeOverlayEnabled: boolean;
  /** Master volume 0–1 — scales both layers. */
  masterVolume: number;
  /** Silence Estate — disables all environmental audio. */
  silenced: boolean;
  /**
   * First-login Shari welcome greeting audio (default on).
   * Off = skip autoplay and do not offer Play on the first-login gate.
   * Welcome audio never plays again after the first login either way.
   */
  welcomeGreetingAudioEnabled: boolean;
};

const DEFAULT_SETTINGS: EstateAudioSettings = {
  ambienceEnabled: true,
  soundscapeOverlayEnabled: false,
  masterVolume: 0.85,
  silenced: false,
  welcomeGreetingAudioEnabled: true,
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

/** Whether the one-time first-login welcome greeting may play. */
export function isWelcomeGreetingAudioEnabled(): boolean {
  const s = readRaw();
  return s.welcomeGreetingAudioEnabled && !s.silenced;
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
