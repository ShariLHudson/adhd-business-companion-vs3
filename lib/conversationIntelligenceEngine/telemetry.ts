/**
 * CIE quality telemetry — internal only (package 198).
 */

import type { CieFailureCode, QualityEvent } from "./types";

export type CieTelemetryEvent = {
  conversationId: string;
  experienceId: string;
  turnId: string;
  status: QualityEvent["status"];
  failureCodes: CieFailureCode[];
  regenerated: boolean;
  usedFallback: boolean;
  primaryMode: string;
  conversationalMove: string;
  at: string;
};

const buffer: CieTelemetryEvent[] = [];
const MAX = 200;

export function recordCieTelemetry(event: CieTelemetryEvent): void {
  buffer.push(event);
  if (buffer.length > MAX) buffer.shift();
}

export function getCieTelemetryBuffer(): readonly CieTelemetryEvent[] {
  return buffer;
}

export function resetCieTelemetryForTests(): void {
  buffer.length = 0;
}

export function appendQualityHistory(
  history: QualityEvent[],
  event: QualityEvent,
): QualityEvent[] {
  return [...history, event].slice(-40);
}
