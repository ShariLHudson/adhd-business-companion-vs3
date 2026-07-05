/**
 * CREATE terminal owner — pipeline instrumentation.
 *
 * Dev console: window.__sparkCreateTerminalTraceLog
 *
 * Expected sequence:
 *   decision_engine_create
 *   → universal_creation_entered
 *   → universal_creation_first_response
 *   → create_terminal_return
 */

export type CreateTerminalPipelineStage =
  | "decision_engine_create"
  | "universal_creation_entered"
  | "universal_creation_first_response"
  | "create_terminal_return"
  | "post_create_violation";

export type CreateTerminalTraceEntry = {
  turn: number;
  stage: CreateTerminalPipelineStage;
  userText: string;
  engineIntent: string;
  engineConfidence: string;
  owner: string;
  handler: string;
  at: number;
  detail?: string | null;
  /** Present when a downstream handler ran after CREATE terminal return. */
  violationStack?: string | null;
};

declare global {
  interface Window {
    __sparkCreateTerminalTraceLog?: CreateTerminalTraceEntry[];
  }
}

const inMemoryLog: CreateTerminalTraceEntry[] = [];

function traceEnabled(): boolean {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

export function getCreateTerminalTraceLog(): CreateTerminalTraceEntry[] {
  if (typeof window !== "undefined" && window.__sparkCreateTerminalTraceLog) {
    return window.__sparkCreateTerminalTraceLog;
  }
  return inMemoryLog;
}

export function resetCreateTerminalTraceLog(): void {
  inMemoryLog.length = 0;
  if (typeof window !== "undefined") {
    window.__sparkCreateTerminalTraceLog = [];
  }
}

export function logCreateTerminalStage(
  entry: Omit<CreateTerminalTraceEntry, "at">,
): void {
  const record: CreateTerminalTraceEntry = { ...entry, at: Date.now() };
  inMemoryLog.push(record);
  if (typeof window !== "undefined") {
    const log = window.__sparkCreateTerminalTraceLog ?? [];
    log.push(record);
    window.__sparkCreateTerminalTraceLog = log.slice(-60);
  }
  if (traceEnabled()) {
    // eslint-disable-next-line no-console
    console.info("[create-terminal]", record.stage, {
      turn: record.turn,
      owner: record.owner,
      handler: record.handler,
      detail: record.detail ?? undefined,
    });
  }
}

/** Log when any handler executes after CREATE terminal ownership completed. */
export function logPostCreateTerminalViolation(
  turn: number,
  handler: string,
  userText: string,
): void {
  const stack = new Error(
    `post-CREATE handler: ${handler}`,
  ).stack?.slice(0, 1200) ?? null;
  logCreateTerminalStage({
    turn,
    stage: "post_create_violation",
    userText,
    engineIntent: "CREATE",
    engineConfidence: "high",
    owner: "frictionless:universal_creation",
    handler,
    detail: "downstream handler after CREATE terminal return",
    violationStack: stack,
  });
  if (traceEnabled()) {
    // eslint-disable-next-line no-console
    console.error(
      "[create-terminal] VIOLATION — handler after CREATE terminal return",
      { turn, handler, stack },
    );
  }
}
