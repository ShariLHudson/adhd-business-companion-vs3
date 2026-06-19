/**
 * Create draft review chat — ask Shari about a draft without auto-editing.
 */

import type { ChatTurn } from "./createInitialization";

export type DraftReviewQuickPrompt = {
  id: string;
  label: string;
  question: string;
};

export const DRAFT_REVIEW_QUICK_PROMPTS: DraftReviewQuickPrompt[] = [
  { id: "missing", label: "What is missing?", question: "What is missing from this draft?" },
  { id: "clearer", label: "Make this clearer", question: "How could this draft be clearer?" },
  {
    id: "beginners",
    label: "Would this work for beginners?",
    question: "Would a beginner understand this draft?",
  },
  {
    id: "shorter",
    label: "Should this be shorter?",
    question: "Is this draft too long? What could be cut?",
  },
  {
    id: "stronger",
    label: "What would make this stronger?",
    question: "What would make this draft stronger?",
  },
  {
    id: "steps",
    label: "Turn this into steps",
    question: "Should this be a checklist or step-by-step format instead?",
  },
  {
    id: "gaps",
    label: "Check for gaps",
    question: "What gaps or weak spots do you see in this draft?",
  },
];

export type DraftReviewSuggestionAction =
  | "apply"
  | "append"
  | "rewrite"
  | "note";

export type DraftReviewSuggestion = {
  summary: string;
  proposedText?: string;
  actionKind: DraftReviewSuggestionAction;
};

export type DraftReviewMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestion?: DraftReviewSuggestion | null;
  receipt?: string | null;
};

export type DraftReviewContext = {
  sessionId: string;
  draftTitle: string;
  draftType: string;
  draftContent: string;
  projectName?: string | null;
  projectId?: string | null;
  sourceConversationSummary?: string | null;
  sessionMetadata?: Record<string, string>;
};

export type DraftReviewSession = {
  sessionId: string;
  messages: DraftReviewMessage[];
  notes: string[];
  updatedAt: string;
};

export const DRAFT_REVIEW_RECEIPTS = {
  applied: "I updated the draft.",
  note: "I saved that as a note for this draft.",
  unchanged: "Your draft is unchanged.",
} as const;

const STORAGE_PREFIX = "companion-create-draft-review-v1:";

let memorySessions = new Map<string, DraftReviewSession>();

export function draftReviewStorageKey(sessionId: string): string {
  return `${STORAGE_PREFIX}${sessionId}`;
}

export function canAskDraftReview(draftContent: string): boolean {
  return Boolean(draftContent?.trim());
}

export function summarizeSourceConversation(messages: ChatTurn[]): string | null {
  if (!messages.length) return null;
  const userLines = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean)
    .slice(-6);
  if (!userLines.length) return null;
  return userLines.join(" · ").slice(0, 600);
}

export function buildDraftReviewContext(input: {
  sessionId: string;
  draftTitle: string;
  draftType: string;
  draftContent: string;
  projectName?: string | null;
  projectId?: string | null;
  sourceConversationSummary?: string | null;
  sessionMetadata?: Record<string, string>;
}): DraftReviewContext {
  return {
    sessionId: input.sessionId,
    draftTitle: input.draftTitle.trim() || "Draft",
    draftType: input.draftType.trim() || "Draft",
    draftContent: input.draftContent,
    projectName: input.projectName ?? null,
    projectId: input.projectId ?? null,
    sourceConversationSummary: input.sourceConversationSummary ?? null,
    sessionMetadata: input.sessionMetadata ?? {},
  };
}

export function buildDraftReviewSystemPrompt(ctx: DraftReviewContext): string {
  const meta =
    ctx.sessionMetadata && Object.keys(ctx.sessionMetadata).length
      ? Object.entries(ctx.sessionMetadata)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join("\n")
      : "None";

  return [
    "You are Shari, reviewing a Create draft WITH the founder — not editing it automatically.",
    "MODE: REVIEW ONLY. Answer questions about the draft. Do not rewrite the full draft in your answer.",
    "If you see a concrete improvement, put it ONLY in the suggestion JSON field — never auto-apply.",
    "Tone: warm, honest, collaborative — 'we are reviewing this together.'",
    "",
    "DRAFT CONTEXT:",
    `- Title: ${ctx.draftTitle}`,
    `- Type: ${ctx.draftType}`,
    ctx.projectName ? `- Linked project: ${ctx.projectName}` : "- Linked project: none",
    ctx.sourceConversationSummary
      ? `- Source conversation summary: ${ctx.sourceConversationSummary}`
      : "- Source conversation summary: none",
    `- Create session metadata:\n${meta}`,
    "",
    "FULL DRAFT:",
    ctx.draftContent,
    "",
    "Respond as JSON only:",
    '{ "answer": "your review reply", "suggestion": null | { "summary": "short label", "proposedText": "optional snippet or full replacement", "actionKind": "apply"|"append"|"rewrite"|"note" } }',
    "Use suggestion only when a specific change is worth offering. actionKind hints: apply=replace section or whole draft, append=add to end, rewrite=full rewrite offered, note=insight to save without changing draft.",
  ].join("\n");
}

export function buildDraftReviewUserPayload(
  question: string,
  history: DraftReviewMessage[],
): string {
  const prior = history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Founder" : "Shari"}: ${m.content}`)
    .join("\n");
  return prior
    ? `Prior review chat:\n${prior}\n\nNew question: ${question}`
    : question;
}

export function parseDraftReviewResponse(raw: string): {
  answer: string;
  suggestion: DraftReviewSuggestion | null;
} {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { answer: trimmed, suggestion: null };
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      answer?: string;
      suggestion?: DraftReviewSuggestion | null;
    };
    const answer = (parsed.answer ?? trimmed).trim();
    const suggestion = normalizeSuggestion(parsed.suggestion);
    return { answer, suggestion };
  } catch {
    return { answer: trimmed, suggestion: null };
  }
}

function normalizeSuggestion(
  raw: DraftReviewSuggestion | null | undefined,
): DraftReviewSuggestion | null {
  if (!raw?.summary?.trim()) return null;
  const kind = raw.actionKind;
  if (!kind || !["apply", "append", "rewrite", "note"].includes(kind)) {
    return {
      summary: raw.summary.trim(),
      proposedText: raw.proposedText?.trim() || undefined,
      actionKind: raw.proposedText?.trim() ? "apply" : "note",
    };
  }
  return {
    summary: raw.summary.trim(),
    proposedText: raw.proposedText?.trim() || undefined,
    actionKind: kind,
  };
}

export function applyReviewSuggestionToDraft(
  draft: string,
  suggestion: DraftReviewSuggestion,
  action: "apply" | "append" | "rewrite",
): string {
  const proposed = suggestion.proposedText?.trim();
  if (action === "rewrite" && proposed) return proposed;
  if (action === "apply" && proposed) return proposed;
  if (action === "append" && proposed) {
    const sep = draft.trim().endsWith("\n") ? "\n" : "\n\n";
    return `${draft.trim()}${sep}${proposed}`;
  }
  return draft;
}

export function receiptForReviewAction(
  action: "apply" | "append" | "rewrite" | "note" | "dismiss",
): string {
  switch (action) {
    case "apply":
    case "append":
    case "rewrite":
      return DRAFT_REVIEW_RECEIPTS.applied;
    case "note":
      return DRAFT_REVIEW_RECEIPTS.note;
    case "dismiss":
    default:
      return DRAFT_REVIEW_RECEIPTS.unchanged;
  }
}

export function suggestionButtonsFor(
  suggestion: DraftReviewSuggestion,
): { id: string; label: string; action: DraftReviewSuggestionAction | "dismiss" }[] {
  const buttons: { id: string; label: string; action: DraftReviewSuggestionAction | "dismiss" }[] =
    [];
  if (suggestion.actionKind === "append") {
    buttons.push({ id: "append", label: "Add this to draft", action: "append" });
  } else if (suggestion.actionKind === "rewrite") {
    buttons.push({
      id: "rewrite",
      label: "Rewrite draft with this",
      action: "rewrite",
    });
  } else if (suggestion.proposedText) {
    buttons.push({ id: "apply", label: "Apply this change", action: "apply" });
  }
  if (suggestion.actionKind === "note" || !suggestion.proposedText) {
    buttons.push({ id: "note", label: "Keep as note", action: "note" });
  }
  buttons.push({ id: "dismiss", label: "Leave draft as-is", action: "dismiss" });
  return buttons;
}

export function loadDraftReviewSession(sessionId: string): DraftReviewSession | null {
  if (!sessionId) return null;
  const cached = memorySessions.get(sessionId);
  if (cached) return cached;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftReviewStorageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftReviewSession;
    if (parsed?.sessionId !== sessionId) return null;
    memorySessions.set(sessionId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraftReviewSession(session: DraftReviewSession): void {
  memorySessions.set(session.sessionId, session);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      draftReviewStorageKey(session.sessionId),
      JSON.stringify(session),
    );
  } catch {
    /* noop */
  }
}

export function updateDraftReviewMessages(
  sessionId: string,
  messages: DraftReviewMessage[],
): DraftReviewSession {
  const existing = loadDraftReviewSession(sessionId);
  const next: DraftReviewSession = {
    sessionId,
    messages,
    notes: existing?.notes ?? [],
    updatedAt: new Date().toISOString(),
  };
  saveDraftReviewSession(next);
  return next;
}

export function appendDraftReviewMessage(
  sessionId: string,
  message: DraftReviewMessage,
): DraftReviewSession {
  const existing =
    loadDraftReviewSession(sessionId) ??
    ({
      sessionId,
      messages: [],
      notes: [],
      updatedAt: new Date().toISOString(),
    } satisfies DraftReviewSession);
  const next: DraftReviewSession = {
    ...existing,
    messages: [...existing.messages, message],
    updatedAt: new Date().toISOString(),
  };
  saveDraftReviewSession(next);
  return next;
}

export function addDraftReviewNote(sessionId: string, note: string): DraftReviewSession {
  const existing = loadDraftReviewSession(sessionId);
  const base: DraftReviewSession = existing ?? {
    sessionId,
    messages: [],
    notes: [],
    updatedAt: new Date().toISOString(),
  };
  const next: DraftReviewSession = {
    ...base,
    notes: [...base.notes, note.trim()],
    updatedAt: new Date().toISOString(),
  };
  saveDraftReviewSession(next);
  return next;
}

export function newDraftReviewMessageId(): string {
  return `drv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** @internal tests */
export function clearDraftReviewSessionsForTests(): void {
  memorySessions.clear();
}
