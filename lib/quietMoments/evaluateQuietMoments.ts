import type { CommunicationAnchorMode } from "@/lib/companionCommunicationAnchor";
import { resolveQuietMotions, resolveShariQuietPosture } from "./catalog";
import {
  passesFiveMinuteTest,
  resolveQuietMomentsPhase,
  resolveTemporalDrift,
  shouldWelcomeReturnWithoutGuilt,
} from "./temporalDrift";
import type { QuietMomentsInput, QuietMomentsIntelligence } from "./types";

/**
 * Quiet Moments™ — evaluate ambient life while nothing is happening.
 * Life, not activity. Peace, not a paused app.
 */
export function evaluateQuietMoments(
  input: QuietMomentsInput,
): QuietMomentsIntelligence {
  const phase = resolveQuietMomentsPhase(input);
  const suppressIdleEntertainment = phase !== "active";
  const anchorMode: CommunicationAnchorMode =
    phase === "active" ? "full" : "quiet";

  const allowedMotions = resolveQuietMotions({
    timeOfDay: input.timeOfDay,
    season: input.season,
    recoveryGentle: input.recoveryGentle,
    flooded: input.flooded,
  });

  const temporalDrift = resolveTemporalDrift(phase, input.idleMs);
  const shariPosture = resolveShariQuietPosture({
    idleMs: input.idleMs,
    roomId: input.roomId,
  });

  const welcomeReturnWithoutGuilt = shouldWelcomeReturnWithoutGuilt(
    input.returnAfterMinutes,
  );

  const fiveMinuteTestPassed = passesFiveMinuteTest({
    phase,
    suppressIdleEntertainment,
    flooded: input.flooded,
  });

  const ambientAudioEligible =
    phase !== "active" && !input.recoveryGentle && !input.flooded;

  return {
    phase,
    anchorMode,
    shariPosture,
    allowedMotions,
    temporalDrift,
    suppressIdleEntertainment,
    welcomeReturnWithoutGuilt,
    ambientAudioEligible,
    fiveMinuteTestPassed,
  };
}

/** Merge quiet-moment motions into an existing motion profile without removing life. */
export function mergeQuietMotions<T extends string>(
  enabled: T[],
  quietMotions: T[],
  phase: QuietMomentsIntelligence["phase"],
): T[] {
  if (phase === "active") return enabled;
  const set = new Set(enabled);
  for (const motion of quietMotions) {
    set.add(motion);
  }
  return [...set];
}
