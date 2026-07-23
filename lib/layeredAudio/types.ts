/**
 * Layered Audio Experience — Voice (1) + Environment (0–3) + Music (1).
 * Playback instances live in the engine, never in React state.
 */

export type LayeredAudioLayer = "voice" | "environment" | "music";

export type LayerLoadState = "idle" | "loading" | "ready" | "error";

export type SensoryIntensity = "soft" | "moderate" | "rich";

export type EnvironmentCategory =
  | "Weather"
  | "Water"
  | "Nature"
  | "Cozy Spaces"
  | "Community Spaces"
  | "Noise Colors";

export type LayeredCatalogTrack = {
  id: string;
  title: string;
  layer: LayeredAudioLayer;
  category?: EnvironmentCategory | "Music" | "Voice";
  source: string;
  defaultVolume: number;
  loop: boolean;
  compatibilityTags?: readonly string[];
  sensoryIntensity?: SensoryIntensity;
  recommendedPairings?: readonly string[];
};

/** Active environment entry — serializable snapshot (no HTMLAudioElement). */
export type EnvironmentLayerTrack = {
  trackId: string;
  title: string;
  source: string;
  /** Member-selected volume preference (0–1). */
  selectedVolume: number;
  /** Derived: selected × environment master × ducking. */
  effectiveVolume: number;
  playing: boolean;
  loop: boolean;
  loadState: LayerLoadState;
  errorMessage?: string;
  position?: number;
};

export type SingleLayerTrackState = {
  trackId: string;
  title: string;
  source: string;
  selectedVolume: number;
  effectiveVolume: number;
  playing: boolean;
  loop: boolean;
  loadState: LayerLoadState;
  errorMessage?: string;
  position?: number;
};

export type LayeredAudioSnapshot = {
  voice: SingleLayerTrackState | null;
  music: SingleLayerTrackState | null;
  environmentTracks: EnvironmentLayerTrack[];
  environmentMasterVolume: number;
  /** 1 = full; &lt;1 while Voice or higher-priority speech is active. */
  environmentDuckingMultiplier: number;
  musicDuckingMultiplier: number;
  customized: boolean;
  activePresetId: string | null;
  environmentLimitMessage: string | null;
  higherPrioritySpeechActive: boolean;
};

export type AddEnvironmentResult =
  | { ok: true; trackId: string }
  | {
      ok: false;
      reason: "duplicate" | "limit" | "unknown_track" | "play_rejected";
      message: string;
    };

export type LayerPlayResult =
  | { ok: true; trackId: string }
  | {
      ok: false;
      trackId: string;
      reason: "unknown_track" | "play_rejected" | "invalid_url";
      message: string;
    };

export type LayeredAudioPreset = {
  id: string;
  title: string;
  description: string;
  environmentTrackIds: readonly string[];
  musicTrackId: string | null;
  voiceTrackId: string | null;
};

export type ApplyPresetResult = {
  ok: boolean;
  appliedEnvironmentIds: string[];
  skippedTrackIds: string[];
  musicApplied: boolean;
  voiceApplied: boolean;
};
