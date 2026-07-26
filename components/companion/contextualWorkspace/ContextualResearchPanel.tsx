"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ContextualResearchPanel — a reusable, self-contained research conversation
 * that expands *inside* a builder, directly beneath the active question.
 *
 * Part of the Contextual Workspace pattern (see ./README.md). It never
 * navigates, never opens split chat, and never routes to Chamber / Board — it
 * is simply a scoped conversation tied to one question. The member reads the
 * assistant's help and copies whatever wording they like into their own answer
 * field. There is no automatic insertion in this phase, by design.
 *
 * Reuse: any builder (Client Avatar today; Business Estate, Projects,
 * Marketing, Decision Compass later) passes a `questionKey` (resets the thread
 * when the active question changes), a human `questionLabel`, and a scoped
 * `systemPrompt`.
 */

type ResearchMessage = { role: "user" | "assistant"; content: string };

export type ContextualResearchPanelProps = {
  open: boolean;
  onToggle: () => void;
  /** Changing this resets the conversation — research is per-question. */
  questionKey: string;
  /** The active question, shown as the conversation's anchor. */
  questionLabel: string;
  /** Scoped system prompt (avatar + question context) for the assistant. */
  systemPrompt: string;
  /** Optional label for the expander. */
  toggleLabel?: string;
  /** Optional helper text under the toggle. */
  helperText?: string;
};

export function ContextualResearchPanel({
  open,
  onToggle,
  questionKey,
  questionLabel,
  systemPrompt,
  toggleLabel = "Research This Question",
  helperText = "Explore this question, think it through with Shari, and copy anything useful into your answer.",
}: ContextualResearchPanelProps) {
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Research is scoped to the active question — start fresh when it changes.
  useEffect(() => {
    setMessages([]);
    setInput("");
    setCopiedIdx(null);
  }, [questionKey]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const nextMessages: ResearchMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          talkItOutShariEngine: true,
          systemPromptOverride: systemPrompt,
        }),
      });
      const data = await res.json();
      const reply =
        typeof data.message === "string" && data.message.trim()
          ? data.message.trim()
          : "I'm having trouble reaching that right now — try again in a moment.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't reach that just now. Your answer above is safe — try again in a moment.",
        },
      ]);
    }
    setBusy(false);
  }

  async function copy(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      window.setTimeout(() => setCopiedIdx((v) => (v === idx ? null : v)), 1600);
    } catch {
      /* clipboard blocked — the text is selectable, so the member can copy it manually */
    }
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
            className="mt-3 flex max-h-72 flex-col gap-3 overflow-y-auto"
          >
            {messages.length === 0 ? (
              <p className="text-sm italic text-[#9a8f82]">
                Ask anything about this — for examples, angles, or how to word it.
                I&apos;ll help you think; you keep the pen.
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "self-end rounded-2xl bg-[#1e4f4f] px-3 py-2 text-sm text-white"
                    : "self-start rounded-2xl bg-white px-3 py-2 text-sm leading-relaxed text-[#2d2926] shadow-sm"
                }
                style={{ maxWidth: "90%" }}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === "assistant" ? (
                  <button
                    type="button"
                    onClick={() => copy(m.content, i)}
                    className="mt-1.5 rounded-md px-2 py-0.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                  >
                    {copiedIdx === i ? "Copied ✓" : "Copy"}
                  </button>
                ) : null}
              </div>
            ))}
            {busy ? (
              <p className="self-start text-sm italic text-[#9a8f82]">Thinking…</p>
            ) : null}
          </div>

          <div className="mt-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={2}
              placeholder="Ask about this question…"
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              data-testid="research-input"
            />
            <button
              type="button"
              onClick={() => void send()}
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
