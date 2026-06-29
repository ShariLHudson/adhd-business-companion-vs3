export type WelcomeAmbienceTrack = {
  id: string;
  src: string;
  volume: number;
  duckVolume: number;
  /** Volume while Shari pauses — slightly raised, still under voice. */
  pauseVolume: number;
  fadeInMs: number;
  fadeOutMs: number;
  restoreMs: number;
  loop?: boolean;
};

export type WelcomeVoiceTrack = {
  id: string;
  greetingText: string;
  greetingSrc: string;
  bodyText: string;
  cachedBodySrcs: readonly string[];
  /** Single pre-rendered MP3 — skips greeting + part clips when present. */
  fullWelcomeSrc?: string;
  /** 1 = normal; 0.93 ≈ slightly slower, calmer delivery. */
  playbackRate?: number;
};

export type WelcomeImmersiveTimeline = {
  silenceMs: number;
  musicStartMs: number;
  voiceStartMs: number;
};

export type WelcomeAudioProfile = {
  id: string;
  ambience?: WelcomeAmbienceTrack;
  voice?: WelcomeVoiceTrack;
  timeline?: WelcomeImmersiveTimeline;
};

export type WelcomeVoiceTransportState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export type WelcomePlaybackProgress = {
  currentSeconds: number;
  totalSeconds: number;
  ratio: number;
};
