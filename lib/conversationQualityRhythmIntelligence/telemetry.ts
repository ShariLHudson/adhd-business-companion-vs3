/**
 * Structured CQRI telemetry — no chain-of-thought, no private reasoning.
 */

import type { CqriTelemetry } from "./types";

const MAX = 80;
const buffer: CqriTelemetry[] = [];

export function recordCqriTelemetry(event: CqriTelemetry): void {
  buffer.push(event);
  if (buffer.length > MAX) buffer.shift();
}

export function getCqriTelemetryBuffer(): readonly CqriTelemetry[] {
  return buffer;
}

export function resetCqriTelemetryForTests(): void {
  buffer.length = 0;
}
