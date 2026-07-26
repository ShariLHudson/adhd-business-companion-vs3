"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ContextualResearchPanel — a reusable, self-contained research conversation
 * that expands *inside* a builder, directly beneath the active question.
 *
 * Part of the Contextual Workspace pattern (see ./README.md). It never
 * navigates, never opens split chat, and never routes to Chamber / Board — it
 * is a scoped conversation tied to one question.
 *
 * Behavior:
 * - When opened for a question, it automatically researches that question once
 *   per workspace session (built from context via `autoPrompt`), so the member
 *   never has to retype the question. The initial request is sent but not shown
 *   as a member-authored message; a calm "Researching this question…" state
 *   shows instead.
 * - After each useful reply, it offers Add to Answer / Keep Researching / Not
 *   Now. Add to Answer appends only that reply to the member's answer (via
 *   `onAddToAnswer`) — never the whole conversation, never overwriting.
 * - Threads are per-question: reopening the same question preserves the
 *   conversation; a new question gets a fresh thread and its own auto-research.
 * - On failure it stays open with a calm error + Try Again, and never offers
 *   Add to Answer for an error.
 *
 * Reuse: any builder passes `questionKey` (identity of the active question),
 * `questionLabel`, a scoped `systemPrompt`, an `autoPrompt`, and `onAddToAnswer`.
 */

type ResearchMessage = {
  role: "user" | "assistant";
  content: string;
  /** Auto-research request — sent to the model but not rendered. */
  hidden?: boolean;
  /** A failure notice — offers Try Again, never Add to Answer. */
  error?: boolean;
};

const CALM_ERROR =
  "I couldn't reach research just now. Your answer is safe — you can try again.";

export type ContextualResearchPanelProps = {
  open: boolean;
  onToggle: () => void;
  /** Identity of the active question — threads are scoped to this. */
  questionKey: string;
  /** The active question, shown as the conversation's anchor. */
  questionLabel: string;
  /** Scoped system prompt (question + answer + prior context). */
  systemPrompt: string;
  /** Auto first request, sent (hidden) the first time this question opens. */
  autoPrompt?: string;
  /** Append the given reply into the member's answer for this question. */
  onAddToAnswer?: (text: string) => void;
  toggleLabel?: string;
  helperText?: string;
  /** Label for the append action (e.g. "Add to This Area"). */
  addLabel?: string;
  /** Confirmation shown after appending (e.g. "Added to this area ✓"). */
  addedLabel?: string;
};

export function ContextualResearchPanel({
  open,
  onToggle,
  questionKey,
  questionLabel,
  systemPrompt,
  autoPrompt,
  onAddToAnswer,
  toggleLabel = "Research This Question",
  helperText = "Shari researches this question for you. Read along, keep asking, and add anything useful to your answer.",
  addLabel = "Add to Answer",
  addedLabel = "Added to your answer ✓",
}: ContextualResearchPanelProps) {
  // Per-question threads so navigating between questions keeps each thread.
  const [threads, setThreads] = useState<Record<string, ResearchMessage[]>>({});
  const [input, setInput] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [acted, setActed] = useState<Record<string, "added" | "dismissed">>({});
  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const autoRanRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = threads[questionKey] ?? [];
  const busy = busyKey === questionKey;
  const visible = messages.filter((m) => !(m.role === "user" && m.hidden));

  // Fresh input line per question.
  useEffect(() => {
    setInput("");
  }, [questionKey]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threads, open, busyKey]);

  // Auto-research once per question, the first time its panel is open.
  useEffect(() => {
    if (!open || !autoPrompt) return;
    if (autoRanRef.current.has(questionKey)) return;
    autoRanRef.current.add(questionKey);
    void runRequest(questionKey, autoPrompt, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoPrompt, questionKey]);

  async function complete(qk: string, thread: ResearchMessage[]) {
    setBusyKey(qk);
    try {
      const res = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: thread.map((m) => ({ role: m.role, content: m.content })),
          talkItOutShariEngine: true,
          systemPromptOverride: systemPrompt,
        }),
      });
      const data = await res.json();
      const reply =
        typeof data.message === "string" ? data.message.trim() : "";
      if (!reply) throw new Error("empty");
      setThreads((t) => ({
        ...t,
        [qk]: [...(t[qk] ?? thread), { role: "assistant", content: reply }],
      }));
    } catch {
      setThreads((t) => ({
        ...t,
        [qk]: [
          ...(t[qk] ?? thread),
          { role: "assistant", content: CALM_ERROR, error: true },
        ],
      }));
    }
    setBusyKey((k) => (k === qk ? null : k));
  }

  function runRequest(qk: string, text: string, hidden: boolean) {
    const userMsg: ResearchMessage = { role: "user", content: text, hidden };
    const projected = [...(threadsRef.current[qk] ?? []), userMsg];
    setThreads((t) => ({ ...t, [qk]: [...(t[qk] ?? []), userMsg] }));
    return complete(qk, projected);
  }

  function submitFollowUp() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void runRequest(questionKey, text, false);
  }

  function retry() {
    const cur = threadsRef.current[questionKey] ?? [];
    const trimmed = cur[cur.length - 1]?.error ? cur.slice(0, -1) : cur;
    setThreads((t) => ({ ...t, [questionKey]: trimmed }));
    void complete(questionKey, trimmed);
  }

  function actKey(idx: number) {
    return `${questionKey}#${idx}`;
  }

  function addToAnswer(idx: number, text: string) {
    onAddToAnswer?.(text);
    setActed((a) => ({ ...a, [actKey(idx)]: "added" }));
  }

  function dismiss(idx: number, focus: boolean) {
    setActed((a) => ({ ...a, [actKey(idx)]: "dismissed" }));
    if (focus) inputRef.current?.focus();
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#1e4f4f]/20 bg-white/78 backdrop-blur-md">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left"
        data-testid="research-this-question-toggle"
      >
        <span className="flex items-center gap-2 text-base font-semibold text-[#1e4f4f]">
          <span aria-hidden>🔬</span> {toggleLabel}
        </span>
        <span aria-hidden className="text-[#1e4f4f]">
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open ? (
        <div className="border-t border-[#1e4f4f]/12 px-4 pb-4 pt-3">
          <p className="text-sm text-[#6b635a]">{helperText}</p>
          <p className="mt-2 rounded-lg bg-[#1e4f4f]/8 px-3 py-2 text-sm font-medium text-[#2d2926]">
            {questionLabel}
          </p>

          <div
            ref={scrollRef}
            className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {visible.map((m, i) => {
              // Map back to the real index for per-message action state.
              const realIdx = messages.indexOf(m);
              const state = acted[actKey(realIdx)];
              return (
                <div
                  key={realIdx}
                  className={
                    m.role === "user"
                      ? "self-end rounded-2xl bg-[#1e4f4f] px-3 py-2 text-sm text-white"
                      : m.error
                        ? "self-start rounded-2xl border border-[#a85c4a]/30 bg-[#fdf3f0] px-3 py-2 text-sm text-[#7a3b2c]"
                        : "self-start rounded-2xl bg-white px-3 py-2 text-sm leading-relaxed text-[#2d2926] shadow-sm"
                  }
                  style={{ maxWidth: "92%" }}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.role === "assistant" && m.error ? (
                    <button
                      type="button"
                      onClick={retry}
                      className="mt-2 rounded-md bg-[#1e4f4f] px-3 py-1 text-xs font-semibold text-white hover:bg-[#163a3a]"
                      data-testid="research-try-again"
                    >
                      Try Again
                    </button>
                  ) : null}
                  {m.role === "assistant" && !m.error ? (
                    state === "added" ? (
                      <p className="mt-1.5 text-xs font-semibold text-[#1e4f4f]">
                        {addedLabel}
                      </p>
                    ) : state === "dismissed" ? null : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => addToAnswer(realIdx, m.content)}
                          className="rounded-md bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#163a3a]"
                          data-testid="research-add-to-answer"
                        >
                          {addLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => dismiss(realIdx, true)}
                          className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                          data-testid="research-keep-researching"
                        >
                          Keep Researching
                        </button>
                        <button
                          type="button"
                          onClick={() => dismiss(realIdx, false)}
                          className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#1e4f4f]/10"
                        >
                          Not Now
                        </button>
                      </div>
                    )
                  ) : null}
                </div>
              );
            })}
            {busy ? (
              <p className="self-start text-sm italic text-[#9a8f82]">
                {visible.some((m) => m.role === "assistant")
                  ? "Thinking…"
                  : "Researching this question…"}
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitFollowUp();
                }
              }}
              rows={2}
              placeholder="Ask a follow-up…"
              aria-label={`Ask a follow-up research question about: ${questionLabel}`}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              data-testid="research-input"
            />
            <button
              type="button"
              onClick={submitFollowUp}
              disabled={busy || !input.trim()}
              className="shrink-0 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
