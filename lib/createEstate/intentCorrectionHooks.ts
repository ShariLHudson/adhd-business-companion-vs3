/**
 * Spec 131 Rule 13 — Learn from corrections (V1 hooks only).
 * Session-scoped; Intent Memory™ durable store remains a future capability.
 * Never surfaces in member UI.
 */

export type CreateIntentCorrectionRecord = {
  requestText: string;
  fromType: string;
  toType: string;
  at: string;
};

const SESSION_CAP = 24;
const sessionCorrections: CreateIntentCorrectionRecord[] = [];

/** Record when the member switches confirmed create type (also-considered). */
export function recordCreateIntentCorrection(input: {
  requestText: string;
  fromType: string;
  toType: string;
}): void {
  const fromType = input.fromType.trim();
  const toType = input.toType.trim();
  if (!fromType || !toType) return;
  if (fromType.toLowerCase() === toType.toLowerCase()) return;

  sessionCorrections.push({
    requestText: input.requestText.trim().slice(0, 240),
    fromType,
    toType,
    at: new Date().toISOString(),
  });
  while (sessionCorrections.length > SESSION_CAP) {
    sessionCorrections.shift();
  }
}

export function listSessionCreateIntentCorrections(): readonly CreateIntentCorrectionRecord[] {
  return sessionCorrections.slice();
}

/** Test / session reset only — not a member-facing control. */
export function clearSessionCreateIntentCorrections(): void {
  sessionCorrections.length = 0;
}
