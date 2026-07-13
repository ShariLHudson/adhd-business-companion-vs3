/**
 * Shari Presence Flame — living companion presence (not a loading spinner).
 * One shared state machine for all Estate rooms.
 */

export const ShariPresenceState = {
  RESTING: "resting",
  LISTENING: "listening",
  THINKING: "thinking",
  RESPONDING: "responding",
  SPEAKING: "speaking",
  WAITING: "waiting",
  OFFLINE: "offline",
} as const;

export type ShariPresenceState =
  (typeof ShariPresenceState)[keyof typeof ShariPresenceState];

export const SHARI_PRESENCE_STATES: readonly ShariPresenceState[] = [
  ShariPresenceState.RESTING,
  ShariPresenceState.LISTENING,
  ShariPresenceState.THINKING,
  ShariPresenceState.RESPONDING,
  ShariPresenceState.SPEAKING,
  ShariPresenceState.WAITING,
  ShariPresenceState.OFFLINE,
] as const;

/** Ease between presence states — continuous, never snap */
export const SHARI_PRESENCE_TRANSITION_MS = 700;

export type ShariPresenceSignals = {
  isOffline?: boolean;
  /** AI request / preparing a response */
  isThinking?: boolean;
  /** Text beginning to appear */
  isResponding?: boolean;
  /** Voice output playing */
  isSpeaking?: boolean;
  /** Microphone / voice transcription / attentive input */
  isListening?: boolean;
  /** Soft settle after a turn */
  isWaiting?: boolean;
};

export type ShariPresenceFlameSize = "sm" | "md" | "lg";
