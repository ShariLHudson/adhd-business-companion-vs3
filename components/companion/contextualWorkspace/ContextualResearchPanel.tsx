"use client";

import { useEffect, useRef, useState } from "react";
import type { SharedResearchFinding } from "@/lib/research/types";
import { ResearchFindingCard } from "@/components/companion/research/ResearchFindingCard";

/**
 * ContextualResearchPanel — the shared research conversation (a reusable,
 * controlled panel) that expands inside a builder, beneath the active question
 * or area. Used identically by Client Avatar, Business Estate, and the Research
 * Library — only the persona/labels, prior context, and save destination differ.
 *
 * Part of the Contextual Workspace pattern (see ./README.md). It never
 * navigates, never opens split chat, never routes to Chamber / Board.
 *
 * Controlled (Phase 2): the panel does NOT own the thread. The host passes the
 * active thread's `messages` and receives every change via `onMessagesChange`,
 * so threads can be persisted on the avatar and survive close/reopen, switching
 * questions/areas, saving, and leaving. Mount ONE panel at the workspace level
 * and switch `questionKey` to switch threads — no per-area duplicate panels.
 *
 * Behavior:
 * - Auto-researches once per key, only when its thread is empty (a restored,
 *   non-empty thread never re-runs), so reopening resumes the conversation.
 * - After each useful reply: Add This Response / Add Entire Research Session /
 *   Keep Researching / Not Now. Add actions append via the host; dedup is by
 *   stable message id (`addedResponseIds`) — never by comparing text.
 * - On failure it stays open with a calm error + Try Again, and never offers an
 *   add action for an error.
 */

export type ContextualResearchMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Auto-research request — sent to the model but not rendered. */
  hidden?: boolean;
  /** A failure notice — offers Try Again, never an add action. */
  error?: boolean;
  /**
   * Structured findings attached to an assistant reply (Research-with-Sources
   * and honestly-labeled Explore findings). Empty/absent for a plain
   * conversational reply — the current Client Avatar behavior. Citation cards
   * render only via findingMayShowCitation(); see ResearchFindingCard.
   */
  findings?: SharedResearchFinding[];
};

const CALM_ERROR =
  "I couldn't reach research just now. Your answer is safe — you can try again.";

let messageSeq = 0;
function newMessageId(): string {
  messageSeq += 1;
  // App-runtime id (stable once created); randomness only varies the suffix.
  const rand = Math.random().toString(36).slice(2, 8);
  return `rm_${messageSeq}_${rand}`;
}

export type ContextualResearchPanelProps = {
  open: boolean;
  onToggle: () => void;
  /** Identity of the active question / area — the thread is scoped to this. */
  questionKey: string;
  /** The active question or area, shown as the conversation's anchor. */
  questionLabel: string;
  /** Scoped system prompt (question + answer + prior context). */
  systemPrompt: string;
  /** Auto first request, sent (hidden) the first time an empty thread opens. */
  autoPrompt?: string;
  /** The active thread's messages (host-owned, persisted with the avatar). */
  messages: ContextualResearchMessage[];
  /** Emitted on every thread change so the host can persist it. */
  onMessagesChange: (next: ContextualResearchMessage[]) => void;
  /** Canonical ids of responses already added to an answer (dedup by id). */
  addedResponseIds?: string[];
  /** Append one response into the member's answer for this question/area. */
  onAddResponse?: (message: ContextualResearchMessage) => void;
  /** Append the whole session's not-yet-added responses. */
  onAddSession?: () => void;
  toggleLabel?: string;
  helperText?: string;
  /** Label for the single-response add action. */
  addLabel?: string;
  /** Label for the whole-session add action. */
  addAllLabel?: string;
  /** Confirmation shown after a response was added. */
  addedLabel?: string;
};

export function ContextualResearchPanel({
  open,
  onToggle,
  questionKey,
  questionLabel,
  systemPrompt,
  autoPrompt,
  messages,
  onMessagesChange,
  addedResponseIds = [],
  onAddResponse,
  onAddSession,
  toggleLabel = "Research this question",
  helperText = "Shari researches this for you. Read along, keep asking, and add anything useful to your answer.",
  addLabel = "Add This Response",
  addAllLabel = "Add Entire Research Session",
  addedLabel = "Added to your answer ✓",
}: ContextualResearchPanelProps) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState<Record<string, true>>({});
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const autoRanRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = messages.filter((m) => !(m.role === "user" && m.hidden));
  const added = new Set(addedResponseIds);
  const hasAddable = messages.some(
    (m) => m.role === "assistant" && !m.error && !m.hidden && !added.has(m.id),
  );

  // Fresh input line per question/area.
  useEffect(() => {
    setInput("");
  }, [questionKey]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, busy]);

  // Auto-research once per key — only when its thread is still empty, so a
  // restored (persisted) thread resumes instead of re-running.
  useEffect(() => {
    if (!open || !autoPrompt) return;
    if (autoRanRef.current.has(questionKey)) return;
    if (messagesRef.current.length > 0) return;
    autoRanRef.current.add(questionKey);
    void runRequest(autoPrompt, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoPrompt, questionKey]);

  async function complete(projected: ContextualResearchMessage[]) {
    setBusy(true);
    try {
      const res = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: projected.map((m) => ({ role: m.role, content: m.content })),
          talkItOutShariEngine: true,
          systemPromptOverride: systemPrompt,
        }),
      });
      const data = await res.json();
      const reply = typeof data.message === "string" ? data.message.trim() : "";
      if (!reply) throw new Error("empty");
      onMessagesChange([
        ...projected,
        { id: newMessageId(), role: "assistant", content: reply },
      ]);
    } catch {
      onMessagesChange([
        ...projected,
        {
          id: newMessageId(),
          role: "assistant",
          content: CALM_ERROR,
          error: true,
        },
      ]);
    }
    setBusy(false);
  }

  function runRequest(text: string, hidden: boolean) {
    const userMsg: ContextualResearchMessage = {
      id: newMessageId(),
      role: "user",
      content: text,
      hidden,
    };
    const projected = [...messagesRef.current, userMsg];
    onMessagesChange(projected);
    return complete(projected);
  }

  function submitFollowUp() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void runRequest(text, false);
  }

  function retry() {
    const cur = messagesRef.current;
    const trimmed = cur[cur.length - 1]?.error ? cur.slice(0, -1) : cur;
    onMessagesChange(trimmed);
    void complete(trimmed);
  }

  const anchorText =
    visible.some((m) => m.role === "assistant") || busy
      ? busy
        ? "Thinking…"
        : ""
      : "Researching this for you…";

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
            {visible.map((m) => {
              const isAdded = added.has(m.id);
              const isDismissed = dismissed[m.id];
              return (
                <div
                  key={m.id}
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
                  {m.role === "assistant" && !m.error && m.findings?.length ? (
                    <div
                      className="mt-2 flex flex-col gap-2"
                      data-testid="research-findings"
                    >
                      {m.findings.map((f) => (
                        <ResearchFindingCard key={f.id} finding={f} />
                      ))}
                    </div>
                  ) : null}
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
                    isAdded ? (
                      <p className="mt-1.5 text-xs font-semibold text-[#1e4f4f]">
                        {addedLabel}
                      </p>
                    ) : isDismissed ? null : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onAddResponse?.(m)}
                          className="rounded-md bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#163a3a]"
                          data-testid="research-add-to-answer"
                        >
                          {addLabel}
                        </button>
                        {hasAddable ? (
                          <button
                            type="button"
                            onClick={() => onAddSession?.()}
                            className="rounded-md border border-[#1e4f4f]/40 bg-white px-2.5 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                            data-testid="research-add-session"
                          >
                            {addAllLabel}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setDismissed((d) => ({ ...d, [m.id]: true }));
                            inputRef.current?.focus();
                          }}
                          className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                          data-testid="research-keep-researching"
                        >
                          Keep Researching
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDismissed((d) => ({ ...d, [m.id]: true }))
                          }
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
            {anchorText ? (
              <p className="self-start text-sm italic text-[#9a8f82]">
                {anchorText}
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
