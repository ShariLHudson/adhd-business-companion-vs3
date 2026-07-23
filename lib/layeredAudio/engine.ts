/**
 * Layered Audio Engine — module singleton.
 * One Voice · up to three Environment · one Music.
 */

import {
  DEFAULT_ENVIRONMENT_MASTER,
  LAYERED_AUDIO_COPY,
  MAX_ENVIRONMENT_TRACKS,
} from "./constants";
import { layeredCatalogTrackById } from "./catalog";
import { layeredAudioPresetById } from "./presets";
import {
  browserPlaybackPort,
  type PlaybackHandle,
  type PlaybackPort,
} from "./playbackPort";
import type {
  AddEnvironmentResult,
  ApplyPresetResult,
  EnvironmentLayerTrack,
  LayeredAudioSnapshot,
  LayerPlayResult,
  SingleLayerTrackState,
} from "./types";
import {
  duckingMultipliersForVoiceActive,
  effectiveEnvironmentVolume,
  effectiveMusicVolume,
  effectiveVoiceVolume,
  clampVolume,
} from "./volumes";

type EnvInternal = {
  trackId: string;
  title: string;
  source: string;
  selectedVolume: number;
  playing: boolean;
  loop: boolean;
  loadState: EnvironmentLayerTrack["loadState"];
  errorMessage?: string;
};

type SingleInternal = {
  trackId: string;
  title: string;
  source: string;
  selectedVolume: number;
  playing: boolean;
  loop: boolean;
  loadState: SingleLayerTrackState["loadState"];
  errorMessage?: string;
};

function envKey(trackId: string): string {
  return `env:${trackId}`;
}

const MUSIC_KEY = "music";
const VOICE_KEY = "voice";

export class LayeredAudioEngine {
  private port: PlaybackPort;
  private handles = new Map<string, PlaybackHandle>();
  private environment: EnvInternal[] = [];
  private music: SingleInternal | null = null;
  private voice: SingleInternal | null = null;
  private environmentMasterVolume = DEFAULT_ENVIRONMENT_MASTER;
  private environmentDuckingMultiplier = 1;
  private musicDuckingMultiplier = 1;
  private higherPrioritySpeechActive = false;
  private customized = false;
  private activePresetId: string | null = null;
  private environmentLimitMessage: string | null = null;
  private applyingPreset = false;
  private listeners = new Set<() => void>();
  /** Stable reference for useSyncExternalStore — rebuilt only on notify. */
  private cachedSnapshot: LayeredAudioSnapshot;

  constructor(port: PlaybackPort = browserPlaybackPort) {
    this.port = port;
    this.cachedSnapshot = this.buildSnapshot();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.cachedSnapshot = this.buildSnapshot();
    for (const listener of [...this.listeners]) {
      try {
        listener();
      } catch {
        /* ignore */
      }
    }
  }

  getSnapshot(): LayeredAudioSnapshot {
    return this.cachedSnapshot;
  }

  private buildSnapshot(): LayeredAudioSnapshot {
    return {
      voice: this.voice ? this.toSingleSnapshot(this.voice, "voice") : null,
      music: this.music ? this.toSingleSnapshot(this.music, "music") : null,
      environmentTracks: this.environment.map((track) =>
        this.toEnvSnapshot(track),
      ),
      environmentMasterVolume: this.environmentMasterVolume,
      environmentDuckingMultiplier: this.environmentDuckingMultiplier,
      musicDuckingMultiplier: this.musicDuckingMultiplier,
      customized: this.customized,
      activePresetId: this.activePresetId,
      environmentLimitMessage: this.environmentLimitMessage,
      higherPrioritySpeechActive: this.higherPrioritySpeechActive,
    };
  }

  private toEnvSnapshot(track: EnvInternal): EnvironmentLayerTrack {
    const handle = this.handles.get(envKey(track.trackId));
    return {
      trackId: track.trackId,
      title: track.title,
      source: track.source,
      selectedVolume: track.selectedVolume,
      effectiveVolume: effectiveEnvironmentVolume({
        selectedVolume: track.selectedVolume,
        environmentMasterVolume: this.environmentMasterVolume,
        duckingMultiplier: this.environmentDuckingMultiplier,
      }),
      playing: track.playing,
      loop: track.loop,
      loadState: track.loadState,
      errorMessage: track.errorMessage,
      position: handle?.getCurrentTime(),
    };
  }

  private toSingleSnapshot(
    track: SingleInternal,
    kind: "voice" | "music",
  ): SingleLayerTrackState {
    const handle = this.handles.get(kind === "voice" ? VOICE_KEY : MUSIC_KEY);
    const effective =
      kind === "voice"
        ? effectiveVoiceVolume(track.selectedVolume)
        : effectiveMusicVolume({
            selectedVolume: track.selectedVolume,
            duckingMultiplier: this.musicDuckingMultiplier,
          });
    return {
      trackId: track.trackId,
      title: track.title,
      source: track.source,
      selectedVolume: track.selectedVolume,
      effectiveVolume: effective,
      playing: track.playing,
      loop: track.loop,
      loadState: track.loadState,
      errorMessage: track.errorMessage,
      position: handle?.getCurrentTime(),
    };
  }

  private applyEnvironmentVolumes(): void {
    for (const track of this.environment) {
      const handle = this.handles.get(envKey(track.trackId));
      if (!handle) continue;
      handle.setVolume(
        effectiveEnvironmentVolume({
          selectedVolume: track.selectedVolume,
          environmentMasterVolume: this.environmentMasterVolume,
          duckingMultiplier: this.environmentDuckingMultiplier,
        }),
      );
    }
  }

  private applyMusicVolume(): void {
    if (!this.music) return;
    const handle = this.handles.get(MUSIC_KEY);
    if (!handle) return;
    handle.setVolume(
      effectiveMusicVolume({
        selectedVolume: this.music.selectedVolume,
        duckingMultiplier: this.musicDuckingMultiplier,
      }),
    );
  }

  private applyVoiceVolume(): void {
    if (!this.voice) return;
    const handle = this.handles.get(VOICE_KEY);
    if (!handle) return;
    handle.setVolume(effectiveVoiceVolume(this.voice.selectedVolume));
  }

  private refreshDucking(): void {
    const voicePlaying = Boolean(this.voice?.playing);
    const shouldDuck = voicePlaying || this.higherPrioritySpeechActive;
    const next = duckingMultipliersForVoiceActive(shouldDuck);
    this.environmentDuckingMultiplier = next.environment;
    this.musicDuckingMultiplier = next.music;
    this.applyEnvironmentVolumes();
    this.applyMusicVolume();
  }

  private markCustomizedFromEnvironmentChange(): void {
    if (this.applyingPreset) return;
    if (this.activePresetId) {
      this.customized = true;
      this.activePresetId = null;
    } else {
      this.customized = true;
    }
  }

  private releaseHandle(key: string): void {
    const handle = this.handles.get(key);
    if (!handle) return;
    handle.stopAndRelease();
    this.handles.delete(key);
  }

  private ensureHandle(
    key: string,
    source: string,
    loop: boolean,
  ): PlaybackHandle {
    const existing = this.handles.get(key);
    if (existing) return existing;
    const created = this.port.create(key, source, loop);
    this.handles.set(key, created);
    return created;
  }

  async addEnvironmentTrack(trackId: string): Promise<AddEnvironmentResult> {
    this.environmentLimitMessage = null;
    const catalog = layeredCatalogTrackById(trackId);
    if (!catalog || catalog.layer !== "environment") {
      return {
        ok: false,
        reason: "unknown_track",
        message: "That environment sound is not available right now.",
      };
    }
    if (this.environment.some((t) => t.trackId === trackId)) {
      return {
        ok: false,
        reason: "duplicate",
        message: "That sound is already part of your environment.",
      };
    }
    if (this.environment.length >= MAX_ENVIRONMENT_TRACKS) {
      this.environmentLimitMessage = LAYERED_AUDIO_COPY.environmentLimit;
      this.notify();
      return {
        ok: false,
        reason: "limit",
        message: LAYERED_AUDIO_COPY.environmentLimit,
      };
    }

    const entry: EnvInternal = {
      trackId: catalog.id,
      title: catalog.title,
      source: catalog.source,
      selectedVolume: catalog.defaultVolume,
      playing: false,
      loop: catalog.loop,
      loadState: "loading",
    };
    this.environment.push(entry);
    this.markCustomizedFromEnvironmentChange();

    const key = envKey(trackId);
    const handle = this.ensureHandle(key, catalog.source, catalog.loop);
    handle.setVolume(
      effectiveEnvironmentVolume({
        selectedVolume: entry.selectedVolume,
        environmentMasterVolume: this.environmentMasterVolume,
        duckingMultiplier: this.environmentDuckingMultiplier,
      }),
    );

    try {
      await handle.play();
      entry.playing = true;
      entry.loadState = "ready";
    } catch {
      // Keep the sound in the mix — browser may block autoplay until a gesture.
      entry.playing = false;
      entry.loadState = "ready";
      entry.errorMessage =
        "Ready when you are — press Resume if the sound did not start.";
    }

    this.notify();
    return { ok: true, trackId };
  }

  removeEnvironmentTrack(trackId: string): void {
    const index = this.environment.findIndex((t) => t.trackId === trackId);
    if (index < 0) return;
    this.environment.splice(index, 1);
    this.releaseHandle(envKey(trackId));
    this.environmentLimitMessage = null;
    this.markCustomizedFromEnvironmentChange();
    this.notify();
  }

  setEnvironmentTrackVolume(trackId: string, volume: number): void {
    const track = this.environment.find((t) => t.trackId === trackId);
    if (!track) return;
    track.selectedVolume = clampVolume(volume);
    this.applyEnvironmentVolumes();
    this.notify();
  }

  setEnvironmentMasterVolume(volume: number): void {
    this.environmentMasterVolume = clampVolume(volume);
    this.applyEnvironmentVolumes();
    this.notify();
  }

  async pauseEnvironmentTrack(trackId: string): Promise<void> {
    const track = this.environment.find((t) => t.trackId === trackId);
    if (!track) return;
    this.handles.get(envKey(trackId))?.pause();
    track.playing = false;
    this.notify();
  }

  async resumeEnvironmentTrack(trackId: string): Promise<void> {
    const track = this.environment.find((t) => t.trackId === trackId);
    if (!track) return;
    const handle = this.handles.get(envKey(trackId));
    if (!handle) return;
    try {
      await handle.play();
      track.playing = true;
      track.loadState = "ready";
    } catch {
      track.loadState = "error";
      track.errorMessage =
        "That sound could not resume. You can try again in a moment.";
    }
    this.notify();
  }

  async pauseAllEnvironment(): Promise<void> {
    for (const track of this.environment) {
      this.handles.get(envKey(track.trackId))?.pause();
      track.playing = false;
    }
    this.notify();
  }

  async resumeAllEnvironment(): Promise<void> {
    for (const track of this.environment) {
      const handle = this.handles.get(envKey(track.trackId));
      if (!handle) continue;
      try {
        await handle.play();
        track.playing = true;
      } catch {
        track.loadState = "error";
      }
    }
    this.notify();
  }

  async setVoice(trackId: string): Promise<LayerPlayResult> {
    const catalog = layeredCatalogTrackById(trackId);
    if (!catalog || catalog.layer !== "voice") {
      return {
        ok: false,
        trackId,
        reason: "unknown_track",
        message: "That voice track is not available right now.",
      };
    }

    // Replace current Voice — never overlap spoken experiences.
    this.releaseHandle(VOICE_KEY);
    this.voice = {
      trackId: catalog.id,
      title: catalog.title,
      source: catalog.source,
      selectedVolume: catalog.defaultVolume,
      playing: false,
      loop: catalog.loop,
      loadState: "loading",
    };

    const handle = this.ensureHandle(VOICE_KEY, catalog.source, catalog.loop);
    handle.setVolume(effectiveVoiceVolume(this.voice.selectedVolume));

    try {
      await handle.play();
      this.voice.playing = true;
      this.voice.loadState = "ready";
    } catch {
      this.voice.playing = false;
      this.voice.loadState = "ready";
      this.voice.errorMessage =
        "Voice is ready — press Resume if it did not start. Environment and music are unchanged.";
    }

    this.refreshDucking();
    this.notify();
    return { ok: true, trackId };
  }

  async pauseVoice(): Promise<void> {
    if (!this.voice) return;
    this.handles.get(VOICE_KEY)?.pause();
    this.voice.playing = false;
    this.refreshDucking();
    this.notify();
  }

  async resumeVoice(): Promise<void> {
    if (!this.voice) return;
    const handle = this.handles.get(VOICE_KEY);
    if (!handle) return;
    try {
      await handle.play();
      this.voice.playing = true;
      this.refreshDucking();
    } catch {
      this.voice.loadState = "error";
    }
    this.notify();
  }

  stopVoice(): void {
    this.releaseHandle(VOICE_KEY);
    this.voice = null;
    this.refreshDucking();
    this.notify();
  }

  async setMusic(trackId: string): Promise<LayerPlayResult> {
    const catalog = layeredCatalogTrackById(trackId);
    if (!catalog || catalog.layer !== "music") {
      return {
        ok: false,
        trackId,
        reason: "unknown_track",
        message: "That music track is not available right now.",
      };
    }

    this.releaseHandle(MUSIC_KEY);
    this.music = {
      trackId: catalog.id,
      title: catalog.title,
      source: catalog.source,
      selectedVolume: catalog.defaultVolume,
      playing: false,
      loop: catalog.loop,
      loadState: "loading",
    };

    const handle = this.ensureHandle(MUSIC_KEY, catalog.source, catalog.loop);
    handle.setVolume(
      effectiveMusicVolume({
        selectedVolume: this.music.selectedVolume,
        duckingMultiplier: this.musicDuckingMultiplier,
      }),
    );

    try {
      await handle.play();
      this.music.playing = true;
      this.music.loadState = "ready";
    } catch {
      this.music.playing = false;
      this.music.loadState = "ready";
      this.music.errorMessage =
        "Music is ready — press Resume if it did not start. Environment sounds are unchanged.";
    }

    this.notify();
    return { ok: true, trackId };
  }

  async pauseMusic(): Promise<void> {
    if (!this.music) return;
    this.handles.get(MUSIC_KEY)?.pause();
    this.music.playing = false;
    this.notify();
  }

  async resumeMusic(): Promise<void> {
    if (!this.music) return;
    const handle = this.handles.get(MUSIC_KEY);
    if (!handle) return;
    try {
      await handle.play();
      this.music.playing = true;
    } catch {
      this.music.loadState = "error";
    }
    this.notify();
  }

  stopMusic(): void {
    this.releaseHandle(MUSIC_KEY);
    this.music = null;
    this.notify();
  }

  setMusicVolume(volume: number): void {
    if (!this.music) return;
    this.music.selectedVolume = clampVolume(volume);
    this.applyMusicVolume();
    this.notify();
  }

  setVoiceVolume(volume: number): void {
    if (!this.voice) return;
    this.voice.selectedVolume = clampVolume(volume);
    this.applyVoiceVolume();
    this.notify();
  }

  /**
   * Higher-priority spoken media (live Shari / spoken video).
   * Ducks Music + Environment; does not clear Environment selections.
   */
  setHigherPrioritySpeechActive(active: boolean): void {
    if (this.higherPrioritySpeechActive === active) return;
    this.higherPrioritySpeechActive = active;
    if (active && this.voice?.playing) {
      this.handles.get(VOICE_KEY)?.pause();
      this.voice.playing = false;
    }
    this.refreshDucking();
    this.notify();
  }

  async applyPreset(presetId: string): Promise<ApplyPresetResult> {
    const preset = layeredAudioPresetById(presetId);
    if (!preset) {
      return {
        ok: false,
        appliedEnvironmentIds: [],
        skippedTrackIds: [presetId],
        musicApplied: false,
        voiceApplied: false,
      };
    }

    this.applyingPreset = true;
    try {
      for (const track of [...this.environment]) {
        this.releaseHandle(envKey(track.trackId));
      }
      this.environment = [];
      this.environmentLimitMessage = null;

      const skipped: string[] = [];
      const applied: string[] = [];

      for (const id of preset.environmentTrackIds) {
        if (applied.length >= MAX_ENVIRONMENT_TRACKS) {
          skipped.push(id);
          continue;
        }
        const result = await this.addEnvironmentTrack(id);
        if (result.ok) {
          applied.push(id);
        } else {
          skipped.push(id);
        }
      }

      let musicApplied = false;
      if (preset.musicTrackId) {
        const musicResult = await this.setMusic(preset.musicTrackId);
        musicApplied = musicResult.ok;
        if (!musicResult.ok) skipped.push(preset.musicTrackId);
      } else {
        this.stopMusic();
      }

      let voiceApplied = false;
      if (preset.voiceTrackId) {
        const voiceResult = await this.setVoice(preset.voiceTrackId);
        voiceApplied = voiceResult.ok;
        if (!voiceResult.ok) skipped.push(preset.voiceTrackId);
      } else {
        this.stopVoice();
      }

      this.customized = false;
      this.activePresetId = preset.id;
      this.notify();

      return {
        ok: applied.length > 0 || musicApplied || voiceApplied,
        appliedEnvironmentIds: applied,
        skippedTrackIds: skipped,
        musicApplied,
        voiceApplied,
      };
    } finally {
      this.applyingPreset = false;
    }
  }

  stopAll(): void {
    for (const track of this.environment) {
      this.releaseHandle(envKey(track.trackId));
    }
    this.environment = [];
    this.releaseHandle(MUSIC_KEY);
    this.music = null;
    this.releaseHandle(VOICE_KEY);
    this.voice = null;
    this.environmentLimitMessage = null;
    this.higherPrioritySpeechActive = false;
    this.environmentDuckingMultiplier = 1;
    this.musicDuckingMultiplier = 1;
    this.customized = false;
    this.activePresetId = null;
    this.notify();
  }

  /** Test / remount safety — count live playback handles. */
  activeHandleCount(): number {
    return this.handles.size;
  }
}
