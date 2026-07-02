import {
  createSpeechAudio,
  fetchCompanionSpeechBlob,
} from "@/lib/companionTts";
import {
  isBenignAudioPlayError,
  isWelcomeAudioSessionUnlocked,
  unlockBrowserAudio,
} from "./audioUnlock";
import { chunkSpeechText } from "./chunkSpeechText";
import { fadeAudioVolumeAsync } from "./fadeVolume";
import {
  loadCachedSpeechClip,
  resolveWelcomeVoiceSources,
} from "./welcomeVoiceCache";
import type {
  WelcomeAudioProfile,
  WelcomeImmersiveTimeline,
  WelcomePlaybackProgress,
  WelcomeVoiceTransportState,
} from "./types";

type VoiceListener = (state: WelcomeVoiceTransportState) => void;
type UnlockListener = (unlocked: boolean) => void;
type ProgressListener = (progress: WelcomePlaybackProgress) => void;

type SpeechClip = {
  audio: HTMLAudioElement;
  revoke: () => void;
  cached: boolean;
};

/**
 * Reusable welcome audio — immersive timeline, ambience, voice, ducking.
 */
export class WelcomeAudioManager {
  private profile: WelcomeAudioProfile;
  private ambience: HTMLAudioElement | null = null;
  private ambienceFadeToken = 0;
  private ambiencePlaying = false;
  private ambienceTargetVolume = 0;
  private ducking = false;
  private voiceClips: SpeechClip[] = [];
  private voiceChunkIndex = 0;
  private voiceReady = false;
  private voiceLoading = false;
  private voiceMuted = false;
  private musicMuted = false;
  private voiceState: WelcomeVoiceTransportState = "idle";
  private voiceListeners = new Set<VoiceListener>();
  private unlockListeners = new Set<UnlockListener>();
  private progressListeners = new Set<ProgressListener>();
  private timelineTimers: ReturnType<typeof setTimeout>[] = [];
  private immersiveStarted = false;
  private immersiveStartAt: number | null = null;
  private audioUnlocked = false;
  private voiceStarted = false;
  private destroyed = false;
  private voiceLoadPromise: Promise<boolean> | null = null;
  private playExperiencePromise: Promise<boolean> | null = null;

  constructor(profile: WelcomeAudioProfile) {
    this.profile = profile;
    this.ambienceTargetVolume = profile.ambience?.volume ?? 0.17;
    if (isWelcomeAudioSessionUnlocked()) {
      this.audioUnlocked = true;
    }
  }

  /** Re-sync after listeners attach (e.g. sidebar click unlocked before mount). */
  adoptSessionUnlock(): boolean {
    if (this.audioUnlocked) return true;
    if (!isWelcomeAudioSessionUnlocked()) return false;
    this.setAudioUnlocked(true);
    return true;
  }

  getVoiceState(): WelcomeVoiceTransportState {
    return this.voiceState;
  }

  isVoiceReady(): boolean {
    return this.voiceReady;
  }

  getVoiceClipCount(): number {
    return this.voiceClips.length;
  }

  isAudioUnlocked(): boolean {
    return this.audioUnlocked;
  }

  onVoiceStateChange(listener: VoiceListener): () => void {
    this.voiceListeners.add(listener);
    return () => this.voiceListeners.delete(listener);
  }

  onAudioUnlockChange(listener: UnlockListener): () => void {
    this.unlockListeners.add(listener);
    return () => this.unlockListeners.delete(listener);
  }

  onProgressChange(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => this.progressListeners.delete(listener);
  }

  getPlaybackProgress(): WelcomePlaybackProgress {
    let totalSeconds = 0;
    let currentSeconds = 0;

    for (let index = 0; index < this.voiceClips.length; index++) {
      const clip = this.voiceClips[index];
      const duration = clip.audio.duration;
      if (!Number.isFinite(duration) || duration <= 0) continue;
      totalSeconds += duration;
      if (index < this.voiceChunkIndex) {
        currentSeconds += duration;
      } else if (index === this.voiceChunkIndex) {
        currentSeconds += clip.audio.currentTime;
      }
    }

    const ratio =
      totalSeconds > 0 ? Math.min(1, currentSeconds / totalSeconds) : 0;

    return { currentSeconds, totalSeconds, ratio };
  }

  private emitProgress(): void {
    const progress = this.getPlaybackProgress();
    for (const listener of this.progressListeners) listener(progress);
  }

  private wireProgressUpdates(audio: HTMLAudioElement): void {
    const onTime = () => this.emitProgress();
    audio.ontimeupdate = onTime;
    audio.onloadedmetadata = onTime;
  }

  private setVoiceState(state: WelcomeVoiceTransportState): void {
    this.voiceState = state;
    for (const listener of this.voiceListeners) listener(state);
  }

  private setAudioUnlocked(unlocked: boolean): void {
    this.audioUnlocked = unlocked;
    for (const listener of this.unlockListeners) listener(unlocked);
  }

  private get ambienceTrack() {
    return this.profile.ambience;
  }

  private get timeline(): WelcomeImmersiveTimeline {
    return (
      this.profile.timeline ?? {
        silenceMs: 2000,
        musicStartMs: 2000,
        voiceStartMs: 3750,
      }
    );
  }

  private immersiveElapsedMs(): number {
    if (this.immersiveStartAt === null) return 0;
    return performance.now() - this.immersiveStartAt;
  }

  private clearTimeline(): void {
    for (const timer of this.timelineTimers) clearTimeout(timer);
    this.timelineTimers = [];
  }

  private ensureAmbienceElement(): HTMLAudioElement | null {
    const track = this.ambienceTrack;
    if (!track || typeof window === "undefined") return null;
    if (!this.ambience) {
      const audio = new Audio(track.src);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      this.wireSeamlessLoop(audio, track.volume);
      this.ambience = audio;
    }
    return this.ambience;
  }

  private wireSeamlessLoop(audio: HTMLAudioElement, targetVolume: number): void {
    const fadeWindow = 1.4;
    audio.addEventListener("timeupdate", () => {
      if (!this.ambiencePlaying || !audio.duration) return;
      const level = this.ducking
        ? (this.ambienceTrack?.duckVolume ?? targetVolume)
        : this.ambienceTargetVolume;
      const t = audio.currentTime;
      const remaining = audio.duration - t;
      if (t < fadeWindow) {
        audio.volume = level * (t / fadeWindow);
      } else if (remaining < fadeWindow) {
        audio.volume = level * (remaining / fadeWindow);
      } else {
        audio.volume = level;
      }
    });
  }

  async probeAmbience(): Promise<boolean> {
    const audio = this.ensureAmbienceElement();
    if (!audio) return false;
    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) return true;
    if (this.ambiencePlaying) return true;
    return new Promise((resolve) => {
      let settled = false;
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        audio.removeEventListener("loadedmetadata", onReady);
        audio.removeEventListener("loadeddata", onReady);
        audio.removeEventListener("error", onError);
        resolve(ok);
      };
      const onReady = () => done(true);
      const onError = () => done(false);
      const timer = setTimeout(() => done(false), 4000);
      audio.addEventListener("loadedmetadata", onReady, { once: true });
      audio.addEventListener("loadeddata", onReady, { once: true });
      audio.addEventListener("error", onError, { once: true });
      if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        audio.load();
      }
    });
  }

  setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    if (muted) {
      void this.stopAmbience();
      return;
    }
    if (this.audioUnlocked && this.immersiveStarted && !this.ambiencePlaying) {
      void this.startAmbience();
    }
  }

  setVoiceMuted(muted: boolean): void {
    this.voiceMuted = muted;
    if (muted) {
      this.stopVoice();
      return;
    }
    if (this.voiceState === "paused") {
      this.resumeVoice();
      return;
    }
    if (
      this.audioUnlocked &&
      this.immersiveStarted &&
      this.voiceState !== "playing"
    ) {
      void this.startVoiceSequence();
    }
  }

  async startAmbience(): Promise<boolean> {
    const track = this.ambienceTrack;
    const audio = this.ensureAmbienceElement();
    if (!track || !audio || this.destroyed || this.musicMuted) return false;
    if (!this.audioUnlocked) return false;

    const token = ++this.ambienceFadeToken;
    this.ambiencePlaying = true;
    this.ambienceTargetVolume = track.volume;
    audio.volume = 0;
    try {
      await audio.play();
    } catch (error) {
      this.ambiencePlaying = false;
      if (isBenignAudioPlayError(error)) return false;
      return false;
    }
    if (token !== this.ambienceFadeToken || this.destroyed) return false;
    const target = this.ducking ? track.duckVolume : track.volume;
    await fadeAudioVolumeAsync(audio, target, track.fadeInMs);
    return true;
  }

  async stopAmbience(): Promise<void> {
    const track = this.ambienceTrack;
    const audio = this.ambience;
    if (!audio) return;

    const token = ++this.ambienceFadeToken;
    this.ambiencePlaying = false;
    this.ducking = false;
    await fadeAudioVolumeAsync(audio, 0, track?.fadeOutMs ?? 2000);
    if (token !== this.ambienceFadeToken) return;
    audio.pause();
    audio.currentTime = 0;
  }

  private async fadeAmbienceTo(target: number, durationMs: number): Promise<void> {
    const audio = this.ambience;
    if (!audio || !this.ambiencePlaying) return;
    this.ambienceTargetVolume = target;
    const token = ++this.ambienceFadeToken;
    await fadeAudioVolumeAsync(audio, target, durationMs);
    if (token !== this.ambienceFadeToken) return;
  }

  async duckAmbienceForVoice(): Promise<void> {
    const track = this.ambienceTrack;
    if (!track || !this.ambiencePlaying) return;
    this.ducking = true;
    await this.fadeAmbienceTo(track.duckVolume, track.fadeInMs);
  }

  async raiseAmbienceForVoicePause(): Promise<void> {
    const track = this.ambienceTrack;
    if (!track || !this.ambiencePlaying) return;
    this.ducking = false;
    await this.fadeAmbienceTo(track.pauseVolume, track.restoreMs);
  }

  async restoreAmbienceAfterVoice(): Promise<void> {
    const track = this.ambienceTrack;
    if (!track || !this.ambiencePlaying) {
      this.ducking = false;
      return;
    }
    this.ducking = false;
    await this.fadeAmbienceTo(track.volume, track.restoreMs);
  }

  private clearVoiceClips(): void {
    for (const clip of this.voiceClips) {
      clip.audio.pause();
      if (!clip.cached) {
        clip.audio.src = "";
        clip.revoke();
      }
    }
    this.voiceClips = [];
    this.voiceChunkIndex = 0;
    this.voiceReady = false;
  }

  private clipFromCached(src: string, audio: HTMLAudioElement): SpeechClip {
    this.applyVoicePlaybackRateToAudio(audio);
    return { audio, revoke: () => {}, cached: true };
  }

  private voicePlaybackRate(): number {
    const rate = this.profile.voice?.playbackRate ?? 1;
    return rate > 0 ? rate : 1;
  }

  private applyVoicePlaybackRateToAudio(audio: HTMLAudioElement): void {
    const rate = this.voicePlaybackRate();
    if (rate === 1) return;
    audio.playbackRate = rate;
    audio.defaultPlaybackRate = rate;
  }

  private async loadVoiceChunks(): Promise<boolean> {
    const voice = this.profile.voice;
    if (!voice) return false;

    this.clearVoiceClips();
    const clips: SpeechClip[] = [];

    if (voice.fullWelcomeSrc) {
      const full = await loadCachedSpeechClip(voice.fullWelcomeSrc);
      if (full) {
        clips.push(this.clipFromCached(full.src, full.audio));
      }
    }

    if (clips.length === 0) {
      const cached = await resolveWelcomeVoiceSources(
        voice.greetingSrc,
        voice.cachedBodySrcs,
      );

      const cacheComplete =
        Boolean(cached.greeting) &&
        cached.parts.length === voice.cachedBodySrcs.length;

      if (cacheComplete && cached.greeting) {
        clips.push(
          this.clipFromCached(cached.greeting.src, cached.greeting.audio),
        );
        for (const part of cached.parts) {
          clips.push(this.clipFromCached(part.src, part.audio));
        }
      } else {
        const fullSpeech = [voice.greetingText.trim(), voice.bodyText.trim()]
          .filter(Boolean)
          .join("\n\n");
        const chunks = chunkSpeechText(fullSpeech);
        for (const chunk of chunks) {
          const blob = await fetchCompanionSpeechBlob(chunk);
          if (!blob) continue;
          const clip = { ...createSpeechAudio(blob), cached: false };
          this.applyVoicePlaybackRateToAudio(clip.audio);
          clips.push(clip);
        }
      }
    }

    if (clips.length === 0) return false;
    this.voiceClips = clips;
    this.voiceReady = true;
    return true;
  }

  async preloadVoice(): Promise<boolean> {
    if (this.destroyed) return false;
    if (this.voiceReady) return true;
    if (!this.voiceLoadPromise) {
      this.voiceLoadPromise = this.runPreloadVoice();
    }
    return this.voiceLoadPromise;
  }

  private async runPreloadVoice(): Promise<boolean> {
    if (this.destroyed) return false;
    if (this.voiceReady) return true;
    if (this.voiceLoading) {
      while (this.voiceLoading && !this.destroyed) {
        await new Promise((r) => setTimeout(r, 50));
      }
      return this.voiceReady;
    }

    this.voiceLoading = true;
    if (this.voiceState === "idle") {
      this.setVoiceState("loading");
    }

    const ok = await this.loadVoiceChunks();
    this.voiceLoading = false;

    if (this.destroyed) return false;
    if (!ok) {
      this.setVoiceState("error");
      return false;
    }
    if (this.voiceState === "loading") {
      this.setVoiceState("idle");
    }
    return true;
  }

  private async playVoiceChunk(index: number): Promise<void> {
    if (this.voiceMuted || !this.audioUnlocked) return;
    const clip = this.voiceClips[index];
    if (!clip) {
      await this.onVoiceFinished();
      return;
    }

    const audio = clip.audio;
    this.voiceChunkIndex = index;
    this.wireProgressUpdates(audio);
    audio.onended = () => {
      if (index + 1 < this.voiceClips.length) {
        void this.duckAmbienceForVoice();
        void this.playVoiceChunk(index + 1);
      } else {
        void this.onVoiceFinished();
      }
    };
    audio.onerror = () => {
      this.setVoiceState("error");
      void this.restoreAmbienceAfterVoice();
    };

    try {
      await audio.play();
      this.setVoiceState("playing");
    } catch (error) {
      if (isBenignAudioPlayError(error)) {
        this.setVoiceState("idle");
        return;
      }
      this.setVoiceState("error");
      void this.restoreAmbienceAfterVoice();
    }
  }

  private async onVoiceFinished(): Promise<void> {
    await this.restoreAmbienceAfterVoice();
    this.setVoiceState("ended");
  }

  private async startVoiceSequence(): Promise<void> {
    if (this.destroyed || this.voiceMuted || !this.audioUnlocked) return;
    if (this.voiceStarted && this.voiceState === "playing") return;

    if (!this.voiceReady) {
      const ok = await this.preloadVoice();
      if (!ok) return;
    }

    this.voiceStarted = true;
    this.resetVoicePlayback();
    await this.duckAmbienceForVoice();
    await this.playVoiceChunk(0);
  }

  private scheduleImmersiveTimeline(): void {
    this.clearTimeline();
    if (!this.audioUnlocked) return;

    const elapsed = this.immersiveElapsedMs();
    const { musicStartMs, voiceStartMs } = this.timeline;
    const musicDelay = Math.max(0, musicStartMs - elapsed);
    const voiceDelay = Math.max(0, voiceStartMs - elapsed);

    if (!this.musicMuted) {
      if (musicDelay === 0) {
        void this.startAmbience();
      } else {
        this.timelineTimers.push(
          setTimeout(() => {
            void this.startAmbience();
          }, musicDelay),
        );
      }
    }

    if (!this.voiceMuted) {
      if (voiceDelay === 0) {
        void this.startVoiceSequence();
      } else {
        this.timelineTimers.push(
          setTimeout(() => {
            void this.startVoiceSequence();
          }, voiceDelay),
        );
      }
    }
  }

  private async syncTimelineToNow(): Promise<void> {
    if (!this.immersiveStarted || this.destroyed || !this.audioUnlocked) return;
    this.scheduleImmersiveTimeline();
  }

  /** Call inside a user gesture — unlocks audio and schedules playback. */
  async enterRoom(): Promise<boolean> {
    if (this.destroyed) return false;
    if (!this.immersiveStarted) {
      this.beginImmersiveWelcome();
    }
    if (!this.audioUnlocked) {
      const unlocked = await unlockBrowserAudio();
      this.setAudioUnlocked(unlocked);
      if (!unlocked) return false;
    }

    await this.preloadVoice();
    this.scheduleImmersiveTimeline();
    return true;
  }

  beginImmersiveWelcome(): void {
    if (this.destroyed || this.immersiveStarted) return;
    this.immersiveStarted = true;
    this.immersiveStartAt = performance.now();
    this.clearTimeline();
    void this.preloadVoice();
  }

  pauseExperience(): void {
    const clip = this.voiceClips[this.voiceChunkIndex];
    if (clip && this.voiceState === "playing") {
      clip.audio.pause();
      this.setVoiceState("paused");
      void this.raiseAmbienceForVoicePause();
    }
    const audio = this.ambience;
    if (audio && this.ambiencePlaying) {
      audio.pause();
    }
  }

  resumeExperience(): void {
    if (!this.audioUnlocked) return;
    const audio = this.ambience;
    if (audio && this.ambiencePlaying && !this.musicMuted) {
      void audio.play().catch(() => {
        /* benign race with pause/load */
      });
    }
    if (!this.voiceMuted && this.voiceState === "paused") {
      this.resumeVoice();
    }
  }

  async stopExperience(): Promise<void> {
    this.clearTimeline();
    this.resetVoicePlayback();
    await this.stopAmbience();
    this.voiceStarted = false;
    this.immersiveStarted = false;
    this.immersiveStartAt = null;
    this.setVoiceState("idle");
    this.emitProgress();
  }

  async restartExperience(): Promise<void> {
    await this.stopExperience();
    await this.playExperience();
  }

  /** User gesture — unlock audio, start music, schedule voice. */
  async playExperience(): Promise<boolean> {
    if (this.playExperiencePromise) {
      return this.playExperiencePromise;
    }
    this.playExperiencePromise = this.runPlayExperience().finally(() => {
      this.playExperiencePromise = null;
    });
    return this.playExperiencePromise;
  }

  private async runPlayExperience(): Promise<boolean> {
    if (this.destroyed) return false;

    if (this.voiceState === "paused") {
      this.resumeExperience();
      return true;
    }

    if (this.voiceState === "ended") {
      this.resetVoicePlayback();
      this.voiceStarted = false;
    }

    if (!this.immersiveStarted) {
      this.beginImmersiveWelcome();
    }

    if (!this.audioUnlocked) {
      const unlocked = await unlockBrowserAudio();
      this.setAudioUnlocked(unlocked);
      if (!unlocked) return false;
    }

    await this.preloadVoice();
    this.scheduleImmersiveTimeline();
    return true;
  }

  pauseVoice(): void {
    const clip = this.voiceClips[this.voiceChunkIndex];
    if (!clip || this.voiceState !== "playing") return;
    clip.audio.pause();
    this.setVoiceState("paused");
    void this.raiseAmbienceForVoicePause();
  }

  resumeVoice(): void {
    const clip = this.voiceClips[this.voiceChunkIndex];
    if (!clip || this.voiceState !== "paused" || this.voiceMuted) return;
    void this.duckAmbienceForVoice().then(() => {
      void clip.audio.play().catch((error) => {
        if (!isBenignAudioPlayError(error)) {
          this.setVoiceState("error");
        }
      });
      this.setVoiceState("playing");
    });
  }

  private resetVoicePlayback(): void {
    for (const clip of this.voiceClips) {
      clip.audio.onended = null;
      clip.audio.onerror = null;
      clip.audio.ontimeupdate = null;
      clip.audio.onloadedmetadata = null;
      clip.audio.pause();
      clip.audio.currentTime = 0;
    }
    this.voiceChunkIndex = 0;
    this.emitProgress();
  }

  stopVoice(): void {
    this.resetVoicePlayback();
    void this.restoreAmbienceAfterVoice();
    this.setVoiceState("idle");
    this.voiceStarted = false;
  }

  destroy(): void {
    this.destroyed = true;
    this.clearTimeline();
    this.ambienceFadeToken++;
    void this.stopAmbience();
    this.resetVoicePlayback();
    this.clearVoiceClips();
    if (this.ambience) {
      this.ambience.src = "";
      this.ambience = null;
    }
    this.voiceListeners.clear();
    this.unlockListeners.clear();
    this.progressListeners.clear();
  }
}
