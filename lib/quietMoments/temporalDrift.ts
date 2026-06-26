import type {
  QuietMomentsInput,
  QuietMomentsPhase,
  TemporalDrift,
} from "./types";

const SETTLING_MS = 15_000;
const QUIET_MS = 60_000;
const DEEP_QUIET_MS = 300_000;

export function resolveQuietMomentsPhase(input: QuietMomentsInput): QuietMomentsPhase {
  if (input.isUserTyping || input.isAssistantStreaming) return "active";
  if (input.idleMs < SETTLING_MS) return "settling";
  if (input.idleMs < DEEP_QUIET_MS) return "quiet";
  return "deep-quiet";
}

export function resolveTemporalDrift(
  phase: QuietMomentsPhase,
  idleMs: number,
): TemporalDrift | null {
  if (phase === "active" || phase === "settling") return null;

  const minutes = idleMs / 60_000;
  const warmth = Math.min(0.12, minutes * 0.02);
  const steam = Math.max(0.25, 1 - minutes * 0.08);

  return {
    lightWarmthDelta: warmth,
    steamIntensity: steam,
    cloudDrift: minutes >= 2,
    subtle: true,
  };
}

/** ADHD rule — every return welcomed the same; no guilt interval. */
export function shouldWelcomeReturnWithoutGuilt(
  _returnAfterMinutes?: number | null,
): boolean {
  return true;
}

export function passesFiveMinuteTest(input: {
  phase: QuietMomentsPhase;
  suppressIdleEntertainment: boolean;
  flooded?: boolean;
}): boolean {
  if (input.flooded) return true;
  if (!input.suppressIdleEntertainment) return false;
  return input.phase === "quiet" || input.phase === "deep-quiet" || input.phase === "settling";
}
