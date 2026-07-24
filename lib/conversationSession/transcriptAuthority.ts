/**
 * Phase 2 — ConversationSession transcript authority.
 *
 * Spine conversationHistory is the sole authoritative transcript.
 * React messages / messagesRef are a view. Certification reads the spine.
 */

import type { ConversationHistoryEntry, ConversationSession } from "./types";
import {
  applyConversationSessionPatch,
  getOrCreateConversationSession,
  isConversationSessionSpineEnabled,
  loadConversationSession,
} from "./store";
import {
  logSpineInvariant,
  markSpineTranscriptCommitted,
  reportProjectionConversationIdMismatch,
} from "./spineInvariants";

function activeSpineConversationId(): string | null {
  return loadConversationSession()?.conversationId?.trim() || null;
}

export type SpineTurnAppendInput = {
  conversationId?: string | null;
  role: "user" | "assistant";
  /** Preferred field (Phase 2). */
  text?: string;
  /** Legacy alias for text. */
  content?: string;
  metadata?: ConversationHistoryEntry["metadata"];
  at?: string;
  /** When true (default), skip if last spine entry is identical. */
  dedupe?: boolean;
  source?: string;
};

export type SpineTranscriptMessage = {
  role: "user" | "assistant";
  content: string;
};

function resolveTurnText(input: SpineTurnAppendInput): string {
  return (input.text ?? input.content ?? "").toString();
}

/**
 * Canonical transcript write. All Companion committed turns should flow here.
 */
export function appendConversationSpineTurn(
  input: SpineTurnAppendInput,
): ConversationSession {
  const spine = getOrCreateConversationSession();
  const role = input.role;
  const text = resolveTurnText(input);
  const expectedId = input.conversationId?.trim() || null;
  const activeId = spine.conversationId;

  if (expectedId && expectedId !== activeId) {
    reportProjectionConversationIdMismatch({
      projection: "appendConversationSpineTurn",
      projectionConversationId: expectedId,
      spineConversationId: activeId,
    });
  }

  const history = spine.conversationHistory ?? [];
  const dedupe = input.dedupe !== false;
  const last = history[history.length - 1];
  if (
    dedupe &&
    last &&
    last.role === role &&
    last.content === text
  ) {
    markSpineTranscriptCommitted(role, input.source ?? "append_dedupe");
    return spine;
  }

  const nextEntry: ConversationHistoryEntry = {
    role,
    content: text,
    at: input.at ?? new Date().toISOString(),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };

  const next = applyConversationSessionPatch({
    conversationHistory: [...history, nextEntry],
  });
  markSpineTranscriptCommitted(role, input.source ?? "append");
  return next;
}

/** Patch the trailing assistant turn (streaming finalization). */
export function replaceLastSpineAssistantTurn(
  text: string,
  opts?: { source?: string; metadata?: ConversationHistoryEntry["metadata"] },
): ConversationSession | null {
  const spine = loadConversationSession();
  if (!spine) return null;
  const history = spine.conversationHistory ?? [];
  const last = history[history.length - 1];
  if (!last || last.role !== "assistant") {
    return appendConversationSpineTurn({
      conversationId: spine.conversationId,
      role: "assistant",
      text,
      metadata: opts?.metadata,
      source: opts?.source ?? "replace_last_assistant_create",
    });
  }
  const updated: ConversationHistoryEntry[] = [
    ...history.slice(0, -1),
    {
      ...last,
      content: text,
      at: new Date().toISOString(),
      ...(opts?.metadata ? { metadata: opts.metadata } : {}),
    },
  ];
  const next = applyConversationSessionPatch({ conversationHistory: updated });
  markSpineTranscriptCommitted("assistant", opts?.source ?? "stream_update");
  return next;
}

/** Authoritative transcript for certification / consumers. */
export function getSpineTranscriptMessages(
  conversationId?: string | null,
): SpineTranscriptMessage[] {
  const spine = loadConversationSession();
  if (!spine) return [];
  const expected = conversationId?.trim() || null;
  if (expected && expected !== spine.conversationId) {
    reportProjectionConversationIdMismatch({
      projection: "spine_transcript_read",
      projectionConversationId: expected,
      spineConversationId: spine.conversationId,
    });
    return [];
  }
  return (spine.conversationHistory ?? []).map((e) => ({
    role: e.role,
    content: e.content,
  }));
}

function committedViewTurns(
  messages: ReadonlyArray<{ role: string; content: string }>,
): SpineTranscriptMessage[] {
  return messages
    .filter(
      (m): m is SpineTranscriptMessage =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .filter((m) => m.role === "user" || m.content.trim().length > 0);
}

function commonPrefixLength(
  a: ReadonlyArray<SpineTranscriptMessage>,
  b: ReadonlyArray<SpineTranscriptMessage>,
): number {
  let i = 0;
  while (
    i < a.length &&
    i < b.length &&
    a[i]!.role === b[i]!.role &&
    a[i]!.content === b[i]!.content
  ) {
    i += 1;
  }
  return i;
}

/**
 * Dual-write helper: keep spine history aligned when the React view updates.
 * Called from the Companion setMessages choke point (atomic with UI commit).
 */
export function syncCompanionViewMessagesToSpine(
  prev: ReadonlyArray<{ role: string; content: string }>,
  next: ReadonlyArray<{ role: string; content: string }>,
): void {
  if (!isConversationSessionSpineEnabled()) return;

  const spine = getOrCreateConversationSession();
  const history = spine.conversationHistory ?? [];
  const committedNext = committedViewTurns(next);

  if (next.length === 0) {
    if (history.length > 0) {
      applyConversationSessionPatch({ conversationHistory: [] });
    }
    return;
  }

  const historyAsMessages: SpineTranscriptMessage[] = history.map((e) => ({
    role: e.role,
    content: e.content,
  }));
  const prefix = commonPrefixLength(historyAsMessages, committedNext);

  // Streaming: same length, last assistant content grew/changed.
  if (
    historyAsMessages.length === committedNext.length &&
    historyAsMessages.length > 0 &&
    prefix === historyAsMessages.length - 1 &&
    historyAsMessages[historyAsMessages.length - 1]!.role === "assistant" &&
    committedNext[committedNext.length - 1]!.role === "assistant"
  ) {
    replaceLastSpineAssistantTurn(
      committedNext[committedNext.length - 1]!.content,
      { source: "companion_view_stream" },
    );
    return;
  }

  // Pure append of new committed turns.
  if (
    prefix === historyAsMessages.length &&
    committedNext.length > historyAsMessages.length
  ) {
    for (let i = prefix; i < committedNext.length; i++) {
      appendConversationSpineTurn({
        conversationId: spine.conversationId,
        role: committedNext[i]!.role,
        text: committedNext[i]!.content,
        metadata: { source: "companion_view_sync" },
        source: "companion_view_sync",
      });
    }
    return;
  }

  // Already aligned.
  if (
    prefix === historyAsMessages.length &&
    prefix === committedNext.length
  ) {
    return;
  }

  // Divergent view vs spine — rebuild from view and warn (Phase 2 dual-write recovery).
  logSpineInvariant("projection_transcript_length_mismatch", {
    spineLength: historyAsMessages.length,
    viewLength: committedNext.length,
    commonPrefix: prefix,
    spineConversationId: spine.conversationId,
  });
  logSpineInvariant("append_helper_bypassed", {
    reason: "view_rebuild",
    spineLength: historyAsMessages.length,
    viewLength: committedNext.length,
  });
  const rebuilt: ConversationHistoryEntry[] = committedNext.map((m) => ({
    role: m.role,
    content: m.content,
    at: new Date().toISOString(),
    metadata: { source: "companion_view_rebuild" },
  }));
  applyConversationSessionPatch({ conversationHistory: rebuilt });
  if (committedNext.length > 0) {
    const last = committedNext[committedNext.length - 1]!;
    markSpineTranscriptCommitted(last.role, "companion_view_rebuild");
  }
}

/** Dev check: view vs spine after a render/commit. */
export function assertViewMatchesSpineTranscript(
  viewMessages: ReadonlyArray<{ role: string; content: string }>,
): void {
  const spineId = activeSpineConversationId();
  const spineMessages = getSpineTranscriptMessages(spineId);
  const viewTurns = committedViewTurns(viewMessages);
  if (spineMessages.length !== viewTurns.length) {
    logSpineInvariant("projection_transcript_length_mismatch", {
      spineLength: spineMessages.length,
      viewLength: viewTurns.length,
      spineConversationId: spineId,
    });
  }
  const lastView = viewTurns[viewTurns.length - 1];
  if (lastView?.role === "assistant") {
    const lastSpine = spineMessages[spineMessages.length - 1];
    if (!lastSpine || lastSpine.content !== lastView.content) {
      logSpineInvariant("assistant_render_without_spine_commit", {
        spineConversationId: spineId,
      });
    }
  }
  if (lastView?.role === "user") {
    const lastSpine = spineMessages[spineMessages.length - 1];
    if (!lastSpine || lastSpine.role !== "user") {
      logSpineInvariant("user_render_without_spine_commit", {
        spineConversationId: spineId,
      });
    }
  }
}

/** Dev check: certification input vs spine truth. */
export function assertCertReadsSpineTranscript(
  certMessages: ReadonlyArray<{ role: string; content: string }>,
  conversationId?: string | null,
): void {
  const spineMessages = getSpineTranscriptMessages(conversationId);
  if (spineMessages.length === 0 && certMessages.length === 0) return;
  if (spineMessages.length !== certMessages.length) {
    logSpineInvariant("certification_transcript_differs_from_spine", {
      spineLength: spineMessages.length,
      certLength: certMessages.length,
      conversationId: conversationId ?? null,
    });
    return;
  }
  for (let i = 0; i < spineMessages.length; i++) {
    if (
      spineMessages[i]!.role !== certMessages[i]!.role ||
      spineMessages[i]!.content !== certMessages[i]!.content
    ) {
      logSpineInvariant("certification_transcript_differs_from_spine", {
        index: i,
        conversationId: conversationId ?? null,
      });
      return;
    }
  }
}
