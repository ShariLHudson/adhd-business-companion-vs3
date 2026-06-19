"use client";

import { useEffect, useState } from "react";
import { businessContextSummary } from "@/lib/companionStore";
import {
  addDraftReviewNote,
  appendDraftReviewMessage,
  applyReviewSuggestionToDraft,
  canAskDraftReview,
  DRAFT_REVIEW_QUICK_PROMPTS,
  loadDraftReviewSession,
  newDraftReviewMessageId,
  receiptForReviewAction,
  suggestionButtonsFor,
  updateDraftReviewMessages,
  type DraftReviewContext,
  type DraftReviewMessage,
  type DraftReviewSuggestion,
} from "@/lib/createDraftReview";

const chip =
  "rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/8 disabled:opacity-50";

export function CreateDraftReviewChat({
  context,
  draft,
  onApplyDraft,
  onReceipt,
  disabled,
}: {
  context: DraftReviewContext;
  draft: string;
  onApplyDraft: (next: string) => void;
  onReceipt?: (message: string) => void;
  disabled?: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<DraftReviewMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const session = loadDraftReviewSession(context.sessionId);
    setMessages(session?.messages ?? []);
  }, [context.sessionId]);

  async function askReview(askText: string) {
    const trimmed = askText.trim();
    if (!trimmed || !canAskDraftReview(draft) || busy) return;

    const userMsg: DraftReviewMessage = {
      id: newDraftReviewMessageId(),
      role: "user",
      content: trimmed,
    };
    const withUser = appendDraftReviewMessage(context.sessionId, userMsg);
    setMessages(withUser.messages);
    setQuestion("");
    setBusy(true);
    setError(false);

    try {
      const res = await fetch("/api/create-draft-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          context: { ...context, draftContent: draft },
          history: withUser.messages.slice(0, -1),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.answer) {
        setError(true);
        return;
      }

      const assistantMsg: DraftReviewMessage = {
        id: newDraftReviewMessageId(),
        role: "assistant",
        content: data.answer as string,
        suggestion: (data.suggestion as DraftReviewSuggestion | null) ?? null,
      };
      const withAssistant = appendDraftReviewMessage(
        context.sessionId,
        assistantMsg,
      );
      setMessages(withAssistant.messages);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function handleSuggestionAction(
    messageId: string,
    suggestion: DraftReviewSuggestion,
    action: "apply" | "append" | "rewrite" | "note" | "dismiss",
  ) {
    let nextDraft = draft;
    let receipt = receiptForReviewAction(action);

    if (action === "rewrite" && suggestion.proposedText?.trim()) {
      setBusy(true);
      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: draft,
            action: "modify",
            instruction: `${suggestion.summary}. ${suggestion.proposedText}`,
            context: businessContextSummary(),
          }),
        });
        const data = await res.json();
        if (res.ok && data.result) {
          nextDraft = data.result;
        }
      } catch {
        receipt = receiptForReviewAction("dismiss");
      } finally {
        setBusy(false);
      }
    } else if (action === "apply" || action === "append") {
      nextDraft = applyReviewSuggestionToDraft(draft, suggestion, action);
    } else if (action === "note") {
      addDraftReviewNote(
        context.sessionId,
        suggestion.summary + (suggestion.proposedText ? `\n${suggestion.proposedText}` : ""),
      );
    }

    if (action === "apply" || action === "append" || action === "rewrite") {
      if (nextDraft !== draft) onApplyDraft(nextDraft);
    }

    const updatedMessages = messages.map((m) =>
      m.id === messageId ? { ...m, receipt } : m,
    );
    updateDraftReviewMessages(context.sessionId, updatedMessages);
    setMessages(updatedMessages);
    onReceipt?.(receipt);
  }

  return (
    <div className="mt-5 rounded-2xl border border-[#c9dfd8] bg-[#f5faf9] p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-[#1e4f4f]">
        Ask Shari About This Draft
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Ask a question before changing the draft.
      </p>

      {messages.length > 0 ? (
        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto rounded-xl border border-[#d4cdc3] bg-white/80 p-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "text-sm text-[#1f1c19]"
                  : "text-sm text-[#2d4a48]"
              }
            >
              <span className="font-semibold">
                {m.role === "user" ? "You" : "Shari"}:
              </span>{" "}
              {m.content}
              {m.suggestion ? (
                <div className="mt-2 rounded-lg border border-[#c9dfd8] bg-[#f5faf9] p-2">
                  <p className="text-xs font-semibold text-[#1e4f4f]">
                    Suggestion: {m.suggestion.summary}
                  </p>
                  {m.suggestion.proposedText ? (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-[#6b635a]">
                      {m.suggestion.proposedText}
                    </p>
                  ) : null}
                  {!m.receipt ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestionButtonsFor(m.suggestion).map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          disabled={disabled || busy}
                          onClick={() =>
                            void handleSuggestionAction(
                              m.id,
                              m.suggestion!,
                              btn.action,
                            )
                          }
                          className={chip}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs italic text-[#6b635a]">
                      {m.receipt}
                    </p>
                  )}
                </div>
              ) : null}
              {m.receipt && !m.suggestion ? (
                <p className="mt-1 text-xs italic text-[#6b635a]">{m.receipt}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {DRAFT_REVIEW_QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            disabled={disabled || busy || !canAskDraftReview(draft)}
            onClick={() => void askReview(prompt.question)}
            className={chip}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What would you like to ask about this draft?"
        disabled={disabled || busy || !canAskDraftReview(draft)}
        className="mt-3 min-h-[72px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] disabled:opacity-60"
      />

      <div className="mt-3">
        <button
          type="button"
          disabled={
            disabled || busy || !question.trim() || !canAskDraftReview(draft)
          }
          onClick={() => void askReview(question)}
          className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
        >
          {busy ? "Asking Shari…" : "Ask Shari"}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-[#a85c4a]">
          Couldn&apos;t get an answer just now — try again.
        </p>
      ) : null}
    </div>
  );
}
