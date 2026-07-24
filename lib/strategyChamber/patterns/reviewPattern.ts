/**
 * Member review of strategic pattern candidates.
 * Accept / dismiss / pause — never silent opt-in to future reasoning.
 */

import { getStrategicPattern, updateStrategicPattern } from "./patternStore";
import type { StrategicPatternCandidate } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

export function acceptStrategicPattern(input: {
  patternId: string;
  useInFutureReasoning?: boolean;
  note?: string;
}): StrategicPatternCandidate | null {
  const pattern = getStrategicPattern(input.patternId);
  if (!pattern) return null;
  if (pattern.status === "archived" || pattern.status === "superseded") {
    return pattern;
  }

  return updateStrategicPattern(pattern.id, {
    status: "accepted",
    useInFutureReasoning: Boolean(input.useInFutureReasoning),
    userResponse: {
      response: "accepted",
      note: input.note?.trim() || undefined,
      respondedAt: nowIso(),
    },
    lastReviewedAt: nowIso(),
  });
}

export function dismissStrategicPattern(input: {
  patternId: string;
  note?: string;
}): StrategicPatternCandidate | null {
  const pattern = getStrategicPattern(input.patternId);
  if (!pattern) return null;

  return updateStrategicPattern(pattern.id, {
    status: "dismissed",
    useInFutureReasoning: false,
    userResponse: {
      response: "dismissed",
      note: input.note?.trim() || undefined,
      respondedAt: nowIso(),
    },
    lastReviewedAt: nowIso(),
  });
}

export function pauseStrategicPattern(input: {
  patternId: string;
  note?: string;
}): StrategicPatternCandidate | null {
  const pattern = getStrategicPattern(input.patternId);
  if (!pattern) return null;

  return updateStrategicPattern(pattern.id, {
    status: "paused",
    useInFutureReasoning: false,
    userResponse: {
      response: "paused",
      note: input.note?.trim() || undefined,
      respondedAt: nowIso(),
    },
    lastReviewedAt: nowIso(),
  });
}

export function setPatternFutureReasoningUse(input: {
  patternId: string;
  useInFutureReasoning: boolean;
}): StrategicPatternCandidate | null {
  const pattern = getStrategicPattern(input.patternId);
  if (!pattern || pattern.status !== "accepted") return null;
  return updateStrategicPattern(pattern.id, {
    useInFutureReasoning: input.useInFutureReasoning,
    lastReviewedAt: nowIso(),
  });
}
