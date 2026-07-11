/**
 * Clear My Mind Mode — interactive thinking workspace (not chat).
 * Spark stays in this mode until the member explicitly exits.
 *
 * @see docs/estate/recognition/library/154_CLEAR_MY_MIND_EXPERIENCE_ARCHITECTURE.md
 * @see docs/protocols/CLEAR_MY_MIND_FLOW_PROTOCOL.md
 */

export type ClearMyMindModePhase =
  | "capture"
  | "organize"
  | "action"
  | "visual"
  | "follow-up"
  | "session-end"
  | "idle";

export type ClearMyMindModeState = {
  active: boolean;
  phase: ClearMyMindModePhase;
  startedAt: string | null;
  captureCount: number;
};

const EMPTY: ClearMyMindModeState = {
  active: false,
  phase: "idle",
  startedAt: null,
  captureCount: 0,
};

let modeState: ClearMyMindModeState = { ...EMPTY };

export function getClearMyMindMode(): ClearMyMindModeState {
  return { ...modeState };
}

export function isClearMyMindModeActive(): boolean {
  return modeState.active;
}

/** Enter Clear My Mind Mode — capture first, no organizing yet. */
export function enterClearMyMindMode(): ClearMyMindModeState {
  modeState = {
    active: true,
    phase: "capture",
    startedAt: new Date().toISOString(),
    captureCount: 0,
  };
  return getClearMyMindMode();
}

export function setClearMyMindModePhase(
  phase: ClearMyMindModePhase,
): ClearMyMindModeState {
  if (!modeState.active && phase !== "idle") {
    modeState = {
      active: true,
      phase,
      startedAt: modeState.startedAt ?? new Date().toISOString(),
      captureCount: modeState.captureCount,
    };
    return getClearMyMindMode();
  }
  modeState = { ...modeState, phase };
  return getClearMyMindMode();
}

export function noteClearMyMindCapture(count = 1): ClearMyMindModeState {
  if (!modeState.active) enterClearMyMindMode();
  modeState = {
    ...modeState,
    captureCount: modeState.captureCount + Math.max(0, count),
    phase: modeState.phase === "idle" ? "capture" : modeState.phase,
  };
  return getClearMyMindMode();
}

/** Exit only when the member chooses — never silently. */
export function exitClearMyMindMode(): ClearMyMindModeState {
  modeState = { ...EMPTY };
  return getClearMyMindMode();
}

export function resetClearMyMindModeForTests(): void {
  modeState = { ...EMPTY };
}

/** True when chat should stay inside Clear My Mind (not standard conversation). */
export function shouldStayInClearMyMindMode(input: {
  activeSection?: string | null;
  userText?: string;
}): boolean {
  if (input.activeSection === "brain-dump") return true;
  if (modeState.active) return true;
  return false;
}

/**
 * Explicit exit / leave-mode phrases — only these may end Clear My Mind Mode
 * from conversation (UI back button also exits).
 */
/** Explicit leave only — "I'm done" / "Done" means organize, not exit. */
export const CLEAR_MY_MIND_EXIT_RE =
  /\b(?:return home|go home|back to (?:chat|home|welcome)|leave clear my mind|exit clear my mind|save for later|end (?:this )?session)\b/i;

export function isClearMyMindExitRequest(text: string): boolean {
  return CLEAR_MY_MIND_EXIT_RE.test(text.trim());
}

/** Organize / Done transition from capture. */
export const CLEAR_MY_MIND_ORGANIZE_RE =
  /\b(?:organize(?:\s+(?:this|these|them|it|my thoughts)?)?|sort(?:\s+(?:this|these|them|it))?|i(?:'m| am) done|that(?:'s| is) (?:everything|all)|ready to organize)\b/i;

export function isClearMyMindOrganizeRequest(text: string): boolean {
  return CLEAR_MY_MIND_ORGANIZE_RE.test(text.trim());
}
