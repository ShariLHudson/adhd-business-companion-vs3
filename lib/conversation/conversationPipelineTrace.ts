/**
 * Conversation pipeline trace — one record per member message.
 * Surfaces ownership breaks: missing owner, stage hangs, OWNER START without COMPLETE.
 *
 * Dev console: window.__sparkPipelineTraceLog
 * Legacy merge: window.__sparkConversationPipelineLog (summary on flush)
 */

import {
  logConversationPipelineDiagnostic,
  type ConversationPipelineDiagnostic,
} from "./conversationPipelineDiagnostics";
import { normalizeTurnMessage, type TurnOwnerKind } from "./turnOwner";

export const DEFAULT_TURN_OWNER: TurnOwnerKind = "relationship_chat";

export type PipelineStageRecord = {
  stage: string;
  enteredAt: number;
  exitedAt?: number;
  elapsedMs?: number;
  failure?: string | null;
};

export type PipelineOwnerExecution = {
  owner: string;
  handler?: string | null;
  startedAt: number;
  completedAt?: number;
  elapsedMs?: number;
  failure?: string | null;
  fallback?: string | null;
};

export type PipelineTurnTrace = {
  turn: number;
  rawMessage: string;
  normalizedMessage: string;
  owner: string;
  intent: string;
  currentRoom: string | null;
  pendingChoice: boolean;
  pendingChoiceType: string | null;
  stages: PipelineStageRecord[];
  ownerExecutions: PipelineOwnerExecution[];
  startedAt: number;
  completedAt?: number;
  totalElapsedMs?: number;
  failure: string | null;
  fallbackChosen: string | null;
  ownerComplete: boolean;
  /** Set when OWNER START ran but COMPLETE never did — likely blocked async. */
  blockedOwner?: string | null;
  ownerReassignments?: Array<{ from: string; to: string; reason: string }>;
  /** Set when relationship_chat completes — blocks downstream handlers for this turn. */
  sealed?: boolean;
  sealedReason?: string | null;
};

export type StartPipelineTurnInput = {
  turn: number;
  rawMessage: string;
  currentRoom?: string | null;
  pendingChoice?: boolean;
  pendingChoiceType?: string | null;
  intent?: string | null;
  owner?: string | null;
};

declare global {
  interface Window {
    __sparkPipelineTraceLog?: PipelineTurnTrace[];
    __sparkPipelineActiveTrace?: PipelineTurnTrace | null;
  }
}

let activeTrace: PipelineTurnTrace | null = null;
const openStages = new Map<string, number>();
let activeOwnerExecution: PipelineOwnerExecution | null = null;
/** Persists for remainder of handleSend after finalize — blocks downstream after terminal complete. */
let turnSealed = false;
let turnSealedReason: string | null = null;
/** In-memory log when window is unavailable (tests, SSR). */
const inMemoryTraceLog: PipelineTurnTrace[] = [];

function isTraceEnabled(): boolean {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

function devOnly(): boolean {
  return isTraceEnabled() && typeof window !== "undefined";
}

/** Test and diagnostics access — last 50 flushed turns. */
export function getPipelineTraceLog(): PipelineTurnTrace[] {
  if (typeof window !== "undefined" && window.__sparkPipelineTraceLog) {
    return window.__sparkPipelineTraceLog;
  }
  return inMemoryTraceLog;
}

/** Clear flushed traces — tests only. */
export function resetPipelineTraceLog(): void {
  inMemoryTraceLog.length = 0;
  turnSealed = false;
  turnSealedReason = null;
  activeTrace = null;
  openStages.clear();
  activeOwnerExecution = null;
  if (typeof window !== "undefined") {
    window.__sparkPipelineTraceLog = [];
    window.__sparkPipelineActiveTrace = null;
  }
}

export function isPipelineTurnSealed(): boolean {
  return turnSealed;
}

/**
 * Clear all transient pipeline state before a new member message.
 * Preserves flushed trace log only — active turn, locks, and open stages are dropped.
 */
export function resetTransientPipelineState(
  reason = "fresh_turn",
): void {
  if (activeTrace) {
    activeTrace.failure = activeTrace.failure ?? `abandoned:${reason}`;
    finalizePipelineTurn();
  }
  turnSealed = false;
  turnSealedReason = null;
  openStages.clear();
  activeOwnerExecution = null;
  activeTrace = null;
  if (typeof window !== "undefined") {
    window.__sparkPipelineActiveTrace = null;
  }
}

/**
 * Mark turn terminal — relationship_chat (or other sealed owner) must not continue.
 */
export function sealPipelineTurn(reason: string): void {
  turnSealed = true;
  turnSealedReason = reason;
  if (activeTrace) {
    activeTrace.sealed = true;
    activeTrace.sealedReason = reason;
  }
  if (isTraceEnabled()) {
    // eslint-disable-next-line no-console
    console.info("[pipeline] TURN SEALED — downstream handlers blocked", {
      reason,
      owner: activeTrace?.owner ?? null,
    });
  }
}

/**
 * Returns false when a completed relationship_chat turn must not continue.
 * Logs a warning if a downstream layer attempts to proceed anyway.
 */
export function assertPipelineTurnContinuable(handler: string): boolean {
  const trace = activeTrace;

  if (turnSealed) {
    if (isTraceEnabled()) {
      // eslint-disable-next-line no-console
      console.warn("[pipeline] downstream blocked — terminal turn sealed", {
        handler,
        owner: trace?.owner ?? null,
        sealedReason: turnSealedReason ?? trace?.sealedReason ?? null,
      });
    }
    return false;
  }

  // Owner reassigned away from relationship — never block task/create handlers.
  if (trace?.owner && trace.owner !== "relationship_chat") {
    return true;
  }

  const relationshipTerminal =
    trace?.owner === "relationship_chat" && trace.ownerComplete === true;

  if (!relationshipTerminal) return true;

  if (isTraceEnabled()) {
    // eslint-disable-next-line no-console
    console.warn(
      "[pipeline] downstream blocked — relationship_chat terminal turn",
      {
        handler,
        owner: trace?.owner ?? "relationship_chat",
        ownerComplete: trace?.ownerComplete ?? turnSealed,
        sealedReason: turnSealedReason ?? trace?.sealedReason ?? null,
      },
    );
  }
  return false;
}

export function assertPipelineOwner(
  owner: string | null | undefined,
  reason = "unspecified",
): string {
  if (owner && owner.trim()) return owner.trim();
  if (devOnly()) {
    // eslint-disable-next-line no-console
    console.warn("[pipeline] owner missing — defaulting to relationship_chat", {
      reason,
    });
  }
  return DEFAULT_TURN_OWNER;
}

export function startPipelineTurn(input: StartPipelineTurnInput): PipelineTurnTrace {
  if (activeTrace) {
    activeTrace.failure = activeTrace.failure ?? "superseded_by_new_turn";
    finalizePipelineTurn();
  }
  turnSealed = false;
  turnSealedReason = null;
  openStages.clear();
  activeOwnerExecution = null;

  const trace: PipelineTurnTrace = {
    turn: input.turn,
    rawMessage: input.rawMessage,
    normalizedMessage: normalizeTurnMessage(input.rawMessage),
    owner: assertPipelineOwner(input.owner, "startPipelineTurn"),
    intent: input.intent ?? "unknown",
    currentRoom: input.currentRoom ?? null,
    pendingChoice: input.pendingChoice ?? false,
    pendingChoiceType: input.pendingChoiceType ?? null,
    stages: [],
    ownerExecutions: [],
    startedAt: Date.now(),
    failure: null,
    fallbackChosen: null,
    ownerComplete: false,
  };

  activeTrace = trace;

  if (isTraceEnabled()) {
    if (typeof window !== "undefined") {
      window.__sparkPipelineActiveTrace = trace;
    }
    // eslint-disable-next-line no-console
    console.info("[pipeline] TURN START", summarizeTrace(trace));
  }

  return trace;
}

export function getActivePipelineTrace(): PipelineTurnTrace | null {
  return activeTrace;
}

export function updatePipelineTurnContext(
  patch: Partial<
    Pick<
      PipelineTurnTrace,
      | "owner"
      | "intent"
      | "currentRoom"
      | "pendingChoice"
      | "pendingChoiceType"
      | "failure"
      | "fallbackChosen"
    >
  >,
): void {
  if (!activeTrace) return;
  if (patch.owner !== undefined) {
    activeTrace.owner = assertPipelineOwner(patch.owner, "updatePipelineTurnContext");
  }
  if (patch.intent !== undefined) activeTrace.intent = patch.intent;
  if (patch.currentRoom !== undefined) activeTrace.currentRoom = patch.currentRoom;
  if (patch.pendingChoice !== undefined) {
    activeTrace.pendingChoice = patch.pendingChoice;
  }
  if (patch.pendingChoiceType !== undefined) {
    activeTrace.pendingChoiceType = patch.pendingChoiceType;
  }
  if (patch.failure !== undefined) activeTrace.failure = patch.failure;
  if (patch.fallbackChosen !== undefined) {
    activeTrace.fallbackChosen = patch.fallbackChosen;
  }
}

/**
 * Exactly one owner per turn. Reassignments are logged when the handler changes.
 */
export function commitPipelineTurnOwner(
  owner: string | null | undefined,
  handler: string,
  reason?: string,
): string {
  const asserted = assertPipelineOwner(owner, handler);
  if (!activeTrace) return asserted;

  const previous = activeTrace.owner;
  if (previous !== asserted) {
    activeTrace.ownerReassignments ??= [];
    activeTrace.ownerReassignments.push({
      from: previous,
      to: asserted,
      reason: reason ?? handler,
    });
    if (devOnly()) {
      // eslint-disable-next-line no-console
      console.info("[pipeline] owner reassigned", {
        turn: activeTrace.turn,
        from: previous,
        to: asserted,
        handler,
        reason,
      });
    }
  }
  activeTrace.owner = asserted;
  return asserted;
}

export function pipelineStageEnter(stage: string): void {
  if (!activeTrace) return;
  const now = Date.now();
  openStages.set(stage, now);
  activeTrace.stages.push({ stage, enteredAt: now });
  if (devOnly()) {
    // eslint-disable-next-line no-console
    console.info("[pipeline] STAGE ENTER", {
      turn: activeTrace.turn,
      stage,
      owner: activeTrace.owner,
    });
  }
}

export function pipelineStageExit(stage: string, failure?: string | null): void {
  if (!activeTrace) return;
  const now = Date.now();
  const started = openStages.get(stage);
  openStages.delete(stage);

  const record = [...activeTrace.stages]
    .reverse()
    .find((s) => s.stage === stage && s.exitedAt == null);
  if (record) {
    record.exitedAt = now;
    record.elapsedMs = now - record.enteredAt;
    if (failure) record.failure = failure;
  }

  if (devOnly()) {
    // eslint-disable-next-line no-console
    console.info("[pipeline] STAGE EXIT", {
      turn: activeTrace.turn,
      stage,
      elapsedMs: record?.elapsedMs ?? (started ? now - started : null),
      failure: failure ?? null,
    });
  }
}

export function ownerExecutionStart(owner: string, handler?: string): void {
  if (!activeTrace) return;
  if (activeOwnerExecution && !activeOwnerExecution.completedAt) {
    if (devOnly()) {
      // eslint-disable-next-line no-console
      console.warn("[pipeline] OWNER START while prior owner incomplete", {
        turn: activeTrace.turn,
        prior: activeOwnerExecution.owner,
        next: owner,
        handler,
      });
    }
    activeTrace.blockedOwner = activeOwnerExecution.owner;
  }

  const execution: PipelineOwnerExecution = {
    owner: assertPipelineOwner(owner, handler ?? "ownerExecutionStart"),
    handler: handler ?? null,
    startedAt: Date.now(),
  };
  activeOwnerExecution = execution;
  activeTrace.ownerExecutions.push(execution);

  if (devOnly()) {
    // eslint-disable-next-line no-console
    console.info("[pipeline] OWNER START", {
      turn: activeTrace.turn,
      owner: execution.owner,
      handler: execution.handler,
    });
  }
}

export function ownerExecutionComplete(owner?: string): void {
  if (!activeTrace || !activeOwnerExecution) return;
  if (owner && activeOwnerExecution.owner !== owner) return;

  const now = Date.now();
  activeOwnerExecution.completedAt = now;
  activeOwnerExecution.elapsedMs = now - activeOwnerExecution.startedAt;

  if (devOnly()) {
    // eslint-disable-next-line no-console
    console.info("[pipeline] OWNER COMPLETE", {
      turn: activeTrace.turn,
      owner: activeOwnerExecution.owner,
      elapsedMs: activeOwnerExecution.elapsedMs,
    });
  }

  activeOwnerExecution = null;
  activeTrace.ownerComplete = true;

  if (activeTrace.owner === "relationship_chat") {
    sealPipelineTurn("relationship_chat_owner_complete");
  }

  if (activeTrace.owner === "frictionless:universal_creation") {
    sealPipelineTurn("create_terminal_owner_complete");
  }
}

export function ownerExecutionFail(
  err: unknown,
  fallback: string,
  owner?: string,
): void {
  if (!activeTrace) return;

  const failure =
    err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200);

  if (activeOwnerExecution) {
    if (!owner || activeOwnerExecution.owner === owner) {
      activeOwnerExecution.failure = failure;
      activeOwnerExecution.fallback = fallback;
      activeOwnerExecution.completedAt = Date.now();
      activeOwnerExecution.elapsedMs =
        activeOwnerExecution.completedAt - activeOwnerExecution.startedAt;
      activeOwnerExecution = null;
    }
  }

  activeTrace.failure = failure;
  activeTrace.fallbackChosen = fallback;
  activeTrace.ownerComplete = true;

  if (devOnly()) {
    // eslint-disable-next-line no-console
    console.warn("[pipeline] OWNER FAIL → fallback", {
      turn: activeTrace.turn,
      failure,
      fallback: fallback.slice(0, 120),
    });
  }
}

function summarizeTrace(trace: PipelineTurnTrace) {
  return {
    turn: trace.turn,
    owner: trace.owner,
    intent: trace.intent,
    room: trace.currentRoom,
    pending: trace.pendingChoice,
    message: trace.normalizedMessage.slice(0, 80),
  };
}

function flushToWindow(trace: PipelineTurnTrace): void {
  if (!isTraceEnabled()) return;

  inMemoryTraceLog.push(trace);
  while (inMemoryTraceLog.length > 50) {
    inMemoryTraceLog.shift();
  }

  if (typeof window !== "undefined") {
    const log = window.__sparkPipelineTraceLog ?? [];
    log.push(trace);
    window.__sparkPipelineTraceLog = log.slice(-50);
    window.__sparkPipelineActiveTrace = null;
  }

  const lastStage = trace.stages.at(-1);
  const diagnostic: ConversationPipelineDiagnostic = {
    turn: trace.turn,
    userText: trace.rawMessage,
    detectedIntent: trace.intent,
    kernelHandled: false,
    informationalChatBypass: false,
    estateKernelForced: false,
    taskLockBlocksEstate: false,
    selectedHandler: trace.ownerComplete ? trace.owner : `${trace.owner}:incomplete`,
    turnOwner: trace.owner,
    normalizedMessage: trace.normalizedMessage,
    currentPlaceId: trace.currentRoom,
    pendingChoices: trace.pendingChoice,
    pendingChoiceType: trace.pendingChoiceType,
    failureReason: trace.failure,
    fallbackReason: trace.fallbackChosen,
    elapsedMs: trace.totalElapsedMs,
    recovered: Boolean(trace.fallbackChosen),
  };
  logConversationPipelineDiagnostic(diagnostic);

  // eslint-disable-next-line no-console
  console.info("[pipeline] TURN COMPLETE", {
    ...summarizeTrace(trace),
    ownerComplete: trace.ownerComplete,
    blockedOwner: trace.blockedOwner ?? null,
    openStages: [...openStages.keys()],
    lastStage: lastStage?.stage ?? null,
    lastStageMs: lastStage?.elapsedMs ?? null,
    failure: trace.failure,
    fallback: trace.fallbackChosen,
    reassignments: trace.ownerReassignments ?? [],
    stages: trace.stages.map((s) => ({
      stage: s.stage,
      ms: s.elapsedMs,
      failure: s.failure ?? null,
    })),
    owners: trace.ownerExecutions.map((o) => ({
      owner: o.owner,
      handler: o.handler,
      ms: o.elapsedMs,
      complete: Boolean(o.completedAt),
      failure: o.failure ?? null,
    })),
  });
}

/**
 * Call once per turn from finishEarlyChatTurn / guaranteeChatTurnCompletion.
 */
export function finalizePipelineTurn(opts?: {
  failure?: string | null;
  fallback?: string | null;
}): void {
  if (!activeTrace) return;

  const trace = activeTrace;
  const now = Date.now();
  trace.completedAt = now;
  trace.totalElapsedMs = now - trace.startedAt;

  if (opts?.failure) trace.failure = opts.failure;
  if (opts?.fallback) trace.fallbackChosen = opts.fallback;

  if (activeOwnerExecution && !activeOwnerExecution.completedAt) {
    trace.blockedOwner = activeOwnerExecution.owner;
    trace.ownerComplete = false;
    if (devOnly()) {
      // eslint-disable-next-line no-console
      console.error("[pipeline] OWNER NEVER COMPLETED", {
        turn: trace.turn,
        owner: activeOwnerExecution.owner,
        handler: activeOwnerExecution.handler,
        openStages: [...openStages.keys()],
        elapsedMs: now - activeOwnerExecution.startedAt,
      });
    }
  }

  for (const [stage, enteredAt] of openStages.entries()) {
    pipelineStageExit(stage, "turn-finalized-with-open-stage");
    if (devOnly()) {
      // eslint-disable-next-line no-console
      console.warn("[pipeline] stage left open at turn end", {
        turn: trace.turn,
        stage,
        elapsedMs: now - enteredAt,
      });
    }
  }

  flushToWindow(trace);
  activeTrace = null;
  openStages.clear();
  activeOwnerExecution = null;
  // turnSealed persists until the next startPipelineTurn — blocks late async continuations.
}
