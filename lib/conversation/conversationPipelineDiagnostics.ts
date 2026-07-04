/**
 * Development-only conversation pipeline diagnostics.
 * One log line per user turn — intent, handler, confidence, memory, fallback reason.
 */

export type ConversationPipelineDiagnostic = {
  turn: number;
  userText: string;
  detectedIntent: string;
  kernelHandled: boolean;
  informationalChatBypass: boolean;
  estateKernelForced: boolean;
  taskLockBlocksEstate: boolean;
  selectedHandler: string;
  workspacePanel?: string | null;
  currentPlaceId?: string | null;
  routingConfidence?: string | null;
  /** Canonical place id resolved from alias registry for this turn (navigation diagnostics). */
  resolvedCanonicalPlaceId?: string | null;
  /** Implied need → place match key (e.g. coffee-need:coffee-house). */
  impliedPlaceMatch?: string | null;
  /** IMPLIED_NEED intent with suggested paths (e.g. IMPLIED_NEED:coffee-need:real_world_break+estate_place+stay_here). */
  impliedNeedIntent?: string | null;
  primaryType?: string | null;
  primaryOwner?: string | null;
  primaryConfidence?: string | null;
  fallbackReason?: string | null;
  lastAssistantPreview?: string | null;
  priorUserPreview?: string | null;
  /** Turn owner — single handler for this message */
  turnOwner?: string | null;
  normalizedMessage?: string | null;
  pendingChoices?: boolean;
  pendingChoiceType?: string | null;
  capabilityMatch?: string | null;
  navigationTarget?: string | null;
  workflowTarget?: string | null;
  failureReason?: string | null;
  elapsedMs?: number;
  recovered?: boolean;
  /** Simple CREATE bypassed estate routing */
  createFastPath?: boolean;
  createDocumentType?: string | null;
};

declare global {
  interface Window {
    __sparkConversationPipelineLog?: ConversationPipelineDiagnostic[];
  }
}

export function logConversationPipelineDiagnostic(
  diagnostic: ConversationPipelineDiagnostic,
): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  if (typeof window === "undefined") return;

  const log = window.__sparkConversationPipelineLog ?? [];
  log.push(diagnostic);
  window.__sparkConversationPipelineLog = log.slice(-40);

  // eslint-disable-next-line no-console
  console.info("[conversation-pipeline]", {
    turn: diagnostic.turn,
    intent: diagnostic.detectedIntent,
    handler: diagnostic.selectedHandler,
    kernelHandled: diagnostic.kernelHandled,
    informationalBypass: diagnostic.informationalChatBypass,
    estateKernelForced: diagnostic.estateKernelForced,
    taskLockBlocksEstate: diagnostic.taskLockBlocksEstate,
    workspace: diagnostic.workspacePanel ?? null,
    placeId: diagnostic.currentPlaceId ?? null,
    resolvedCanonicalPlaceId: diagnostic.resolvedCanonicalPlaceId ?? null,
    impliedPlaceMatch: diagnostic.impliedPlaceMatch ?? null,
    impliedNeedIntent: diagnostic.impliedNeedIntent ?? null,
    primaryType: diagnostic.primaryType ?? null,
    primaryOwner: diagnostic.primaryOwner ?? null,
    primaryConfidence: diagnostic.primaryConfidence ?? null,
    confidence: diagnostic.routingConfidence ?? null,
    fallbackReason: diagnostic.fallbackReason ?? null,
    turnOwner: diagnostic.turnOwner ?? null,
    pendingChoices: diagnostic.pendingChoices ?? false,
    navigationTarget: diagnostic.navigationTarget ?? null,
    workflowTarget: diagnostic.workflowTarget ?? null,
    failureReason: diagnostic.failureReason ?? null,
    elapsedMs: diagnostic.elapsedMs ?? null,
    recovered: diagnostic.recovered ?? false,
    userPreview: diagnostic.userText.slice(0, 120),
    lastAssistantPreview: diagnostic.lastAssistantPreview?.slice(0, 120) ?? null,
    priorUserPreview: diagnostic.priorUserPreview?.slice(0, 120) ?? null,
  });
}
