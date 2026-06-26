import type { ShariRelationshipStage, ShariVoiceKind } from "./types";
import { VOICE_COOLDOWN_DEFAULTS } from "./types";

const STORAGE_KEY = "companion-shari-voice-usage-v1";
const MAX_HISTORY = 240;

export type VoiceUsageRecord = {
  lineId: string;
  kind: ShariVoiceKind;
  compositeKey?: string;
  visitIndex: number;
  at: string;
};

type VoiceUsageStore = {
  history: VoiceUsageRecord[];
};

function readStore(): VoiceUsageStore {
  if (typeof window === "undefined") return { history: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { history: [] };
    const parsed = JSON.parse(raw) as VoiceUsageStore;
    return { history: Array.isArray(parsed.history) ? parsed.history : [] };
  } catch {
    return { history: [] };
  }
}

function writeStore(store: VoiceUsageStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        history: store.history.slice(0, MAX_HISTORY),
      }),
    );
  } catch {
    /* quota */
  }
}

export function cooldownForKind(kind: ShariVoiceKind): number {
  switch (kind) {
    case "greeting":
      return VOICE_COOLDOWN_DEFAULTS.greeting;
    case "question":
      return VOICE_COOLDOWN_DEFAULTS.question;
    case "observation":
      return VOICE_COOLDOWN_DEFAULTS.observation;
    case "echo":
      return VOICE_COOLDOWN_DEFAULTS.echo;
    case "invitation":
      return VOICE_COOLDOWN_DEFAULTS.question;
    default:
      return VOICE_COOLDOWN_DEFAULTS.question;
  }
}

export function isLineOnCooldown(
  lineId: string,
  kind: ShariVoiceKind,
  currentVisitIndex: number,
  customCooldown?: number,
): boolean {
  const window = customCooldown ?? cooldownForKind(kind);
  const history = readStore().history;
  for (const record of history) {
    if (record.lineId !== lineId) continue;
    if (currentVisitIndex - record.visitIndex < window) return true;
  }
  return false;
}

export function isCompositeOpeningOnCooldown(
  compositeKey: string,
  currentVisitIndex: number,
): boolean {
  const window = VOICE_COOLDOWN_DEFAULTS.openingComposite;
  const history = readStore().history;
  for (const record of history) {
    if (record.compositeKey !== compositeKey) continue;
    if (currentVisitIndex - record.visitIndex < window) return true;
  }
  return false;
}

export function recordVoiceUsage(input: {
  lineId: string;
  kind: ShariVoiceKind;
  visitIndex: number;
  compositeKey?: string;
}): void {
  const store = readStore();
  store.history.unshift({
    lineId: input.lineId,
    kind: input.kind,
    compositeKey: input.compositeKey,
    visitIndex: input.visitIndex,
    at: new Date().toISOString(),
  });
  writeStore(store);
}

export function relationshipStageFromVisits(
  sessionVisitIndex: number,
): ShariRelationshipStage {
  if (sessionVisitIndex <= 1) return "day_one";
  if (sessionVisitIndex < 30) return "early";
  if (sessionVisitIndex < 90) return "month";
  if (sessionVisitIndex < 500) return "trusted";
  if (sessionVisitIndex < 2000) return "deep";
  return "kin";
}

export function recordOpeningComposite(
  greetingId: string,
  questionId: string | null,
  visitIndex: number,
): void {
  const compositeKey = questionId ? `${greetingId}+${questionId}` : greetingId;
  recordVoiceUsage({
    lineId: greetingId,
    kind: "greeting",
    visitIndex,
    compositeKey,
  });
  if (questionId) {
    recordVoiceUsage({
      lineId: questionId,
      kind: "question",
      visitIndex,
      compositeKey,
    });
  }
}

/** Test helper — clears usage history. */
export function clearVoiceUsageForTests(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
