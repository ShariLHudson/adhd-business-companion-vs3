/** Maximum simultaneous Environment soundscapes. */
export const MAX_ENVIRONMENT_TRACKS = 3;

/** Maximum simultaneous sources: Voice + 3 Environment + Music. */
export const MAX_SIMULTANEOUS_SOURCES = 5;

export const LAYERED_AUDIO_COPY = {
  environmentLimit:
    "You can combine up to three environment sounds. Remove one before adding another.",
  environmentHeading: "Environment Sounds",
  buildEnvironment: "Build Your Environment",
  addASound: "Add a Sound",
  adjustMix: "Adjust Mix",
  customized: "Customized",
  pauseEnvironment: "Pause",
  changeEnvironment: "Change",
  ofSelected: (count: number, max: number) =>
    `${count} of ${max} sounds selected`,
} as const;

/** When Voice (or higher-priority speech) is active. */
export const VOICE_DUCK_MUSIC = 0.32;
export const VOICE_DUCK_ENVIRONMENT = 0.48;

export const DEFAULT_ENVIRONMENT_MASTER = 1;
export const DEFAULT_TRACK_VOLUME = 0.55;

export const VOLUME_FADE_MS = 280;
