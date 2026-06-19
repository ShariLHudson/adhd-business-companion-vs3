/**
 * Stash source conversation before Create handoff — user can return after purity reset.
 */

import type { ChatTurn } from "./createInitialization";

export type StashedConversation = {
  messages: ChatTurn[];
  label: "Original Conversation" | "Planning Conversation";
  artifactType?: string;
  stashedAt: string;
};

const STORAGE_KEY = "companion-conversation-handoff-stash-v1";

let memoryStash: StashedConversation | null = null;

const RETURN_TO_CONVERSATION_RE =
  /\b(?:return to (?:the )?(?:original|planning|source|previous) conversation|back to (?:our )?(?:planning|conversation|chat)|restore (?:the )?conversation|go back to (?:our )?chat|resume (?:our )?conversation|where we left off (?:in )?chat)\b/i;

const RETURN_TO_PLANNING_RE =
  /\b(?:return to planning|back to planning|planning conversation)\b/i;

export function isReturnToConversationRequest(text: string): boolean {
  return RETURN_TO_CONVERSATION_RE.test(text.trim());
}

export function stashLabelForHandoff(
  artifactType?: string,
): StashedConversation["label"] {
  if (
    artifactType &&
    /\b(?:plan|strategy|marketing|business|project|workshop)\b/i.test(
      artifactType,
    )
  ) {
    return "Planning Conversation";
  }
  return "Original Conversation";
}

export function stashConversationBeforeHandoff(
  messages: ChatTurn[],
  opts?: { artifactType?: string; label?: StashedConversation["label"] },
): StashedConversation {
  const snapshot: StashedConversation = {
    messages: messages.map((m) => ({ ...m })),
    label:
      opts?.label ?? stashLabelForHandoff(opts?.artifactType),
    artifactType: opts?.artifactType,
    stashedAt: new Date().toISOString(),
  };
  memoryStash = snapshot;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* noop */
    }
  }
  return snapshot;
}

export function loadStashedConversation(): StashedConversation | null {
  if (memoryStash) return memoryStash;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StashedConversation;
    if (!parsed?.messages?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasStashedConversation(): boolean {
  return loadStashedConversation() !== null;
}

export function clearStashedConversation(): void {
  memoryStash = null;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function buildRecoveryOfferLine(
  label: StashedConversation["label"] = "Original Conversation",
): string {
  return `Say **Return to ${label}** anytime to get back to what we discussed.`;
}

export function buildRecoveryRestoredMessage(
  label: StashedConversation["label"],
): string {
  return `You're back in our ${label.toLowerCase()} — pick up where we left off.`;
}

export function resolveReturnToConversationLabel(
  text: string,
): StashedConversation["label"] | null {
  if (!isReturnToConversationRequest(text)) return null;
  if (RETURN_TO_PLANNING_RE.test(text.trim())) {
    return "Planning Conversation";
  }
  return null;
}
