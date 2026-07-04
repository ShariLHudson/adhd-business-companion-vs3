/**
 * Reliable conversation turn pipeline — bounded layer execution with dev logging.
 * On timeout or throw: skip layer, stay in chat, log recovery — never hang Thinking.
 */

import {
  isLayerTimeoutError,
  withAsyncLayerTimeout,
  withLayerTimeout,
} from "@/lib/chatFastPath/layerTimeout";
import {
  logConversationPipelineDiagnostic,
  type ConversationPipelineDiagnostic,
} from "./conversationPipelineDiagnostics";
import { normalizeTurnMessage } from "./turnOwner";

export const LAYER_TIMEOUT_MS = {
  decision_engine: 3_000,
  estate_kernel: 5_000,
  frictionless: 8_000,
  concierge: 5_000,
  discovery: 5_000,
  universal_creation: 5_000,
  create_fast_path: 5_000,
  navigation: 5_000,
  workflow_launch: 8_000,
  companion_chat: 28_000,
} as const;

export type PipelineLayer = keyof typeof LAYER_TIMEOUT_MS;

export type ReliableLayerContext = {
  turn?: number;
  userText?: string;
  normalizedMessage?: string;
  currentRoom?: string | null;
  turnOwner?: string | null;
  intent?: string | null;
};

function failureReasonFromError(err: unknown, layer: PipelineLayer): string {
  if (isLayerTimeoutError(err)) return `${layer}-timeout`;
  if (err instanceof Error) return err.message.slice(0, 200);
  return `${layer}-error`;
}

export function logPipelineLayerRecovery(
  layer: PipelineLayer,
  err: unknown,
  ctx: ReliableLayerContext,
  elapsedMs: number,
): void {
  const diagnostic: ConversationPipelineDiagnostic = {
    turn: ctx.turn ?? 0,
    userText: ctx.userText ?? "",
    detectedIntent: ctx.intent ?? "unknown",
    kernelHandled: false,
    informationalChatBypass: false,
    estateKernelForced: false,
    taskLockBlocksEstate: false,
    selectedHandler: `recovered:${layer}`,
    turnOwner: ctx.turnOwner ?? null,
    normalizedMessage: ctx.normalizedMessage ?? normalizeTurnMessage(ctx.userText ?? ""),
    currentPlaceId: ctx.currentRoom ?? null,
    failureReason: failureReasonFromError(err, layer),
    elapsedMs,
    recovered: true,
  };
  logConversationPipelineDiagnostic(diagnostic);
}

/**
 * Run a sync pipeline layer with a hard time budget. Returns fallback on timeout/error.
 */
export function runReliableSyncLayer<T>(
  layer: PipelineLayer,
  fn: () => T,
  fallback: T,
  ctx: ReliableLayerContext = {},
): T {
  const started = Date.now();
  const timeoutMs = LAYER_TIMEOUT_MS[layer];
  try {
    return withLayerTimeout(layer, fn, timeoutMs);
  } catch (err) {
    logPipelineLayerRecovery(layer, err, ctx, Date.now() - started);
    return fallback;
  }
}

/**
 * Run an async pipeline layer with a hard time budget. Returns fallback on timeout/error.
 */
export async function runReliableAsyncLayer<T>(
  layer: PipelineLayer,
  fn: () => Promise<T>,
  fallback: T,
  ctx: ReliableLayerContext = {},
): Promise<T> {
  const started = Date.now();
  const timeoutMs = LAYER_TIMEOUT_MS[layer];
  try {
    return await withAsyncLayerTimeout(layer, fn, timeoutMs);
  } catch (err) {
    logPipelineLayerRecovery(layer, err, ctx, Date.now() - started);
    return fallback;
  }
}

export function logPipelineTurnFailure(
  ctx: ReliableLayerContext & {
    failureReason: string;
    selectedHandler?: string;
    elapsedMs?: number;
  },
): void {
  logConversationPipelineDiagnostic({
    turn: ctx.turn ?? 0,
    userText: ctx.userText ?? "",
    detectedIntent: ctx.intent ?? "unknown",
    kernelHandled: false,
    informationalChatBypass: false,
    estateKernelForced: false,
    taskLockBlocksEstate: false,
    selectedHandler: ctx.selectedHandler ?? "companion_api",
    turnOwner: ctx.turnOwner ?? null,
    normalizedMessage:
      ctx.normalizedMessage ?? normalizeTurnMessage(ctx.userText ?? ""),
    currentPlaceId: ctx.currentRoom ?? null,
    failureReason: ctx.failureReason,
    elapsedMs: ctx.elapsedMs,
    recovered: true,
  });
}
