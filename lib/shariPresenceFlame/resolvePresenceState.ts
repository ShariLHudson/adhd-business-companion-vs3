/**
 * Resolve companion presence from live signals.
 * Priority: Offline → Thinking → Speaking → Listening → Responding → Waiting → Resting
 */

import {
  ShariPresenceState,
  type ShariPresenceSignals,
  type ShariPresenceState as PresenceState,
} from "@/lib/shariPresenceFlame/types";

export function resolveShariPresenceState(
  signals: ShariPresenceSignals = {},
): PresenceState {
  if (signals.isOffline) return ShariPresenceState.OFFLINE;
  if (signals.isThinking) return ShariPresenceState.THINKING;
  if (signals.isSpeaking) return ShariPresenceState.SPEAKING;
  if (signals.isListening) return ShariPresenceState.LISTENING;
  if (signals.isResponding) return ShariPresenceState.RESPONDING;
  if (signals.isWaiting) return ShariPresenceState.WAITING;
  return ShariPresenceState.RESTING;
}

/** Screen-reader status — animation is never the only cue */
export function shariPresenceAriaLabel(state: PresenceState): string {
  switch (state) {
    case ShariPresenceState.RESTING:
      return "Shari is here";
    case ShariPresenceState.LISTENING:
      return "Shari is listening";
    case ShariPresenceState.THINKING:
      return "Shari is with you";
    case ShariPresenceState.RESPONDING:
      return "Shari is responding";
    case ShariPresenceState.SPEAKING:
      return "Shari is speaking";
    case ShariPresenceState.WAITING:
      return "Shari is ready";
    case ShariPresenceState.OFFLINE:
      return "Shari is unavailable";
    default:
      return "Shari is here";
  }
}

export function isValidShariPresenceState(
  value: string,
): value is PresenceState {
  return (Object.values(ShariPresenceState) as string[]).includes(value);
}
