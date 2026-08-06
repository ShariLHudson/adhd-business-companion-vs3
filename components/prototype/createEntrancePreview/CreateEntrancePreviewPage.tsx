"use client";

import { useState } from "react";
import {
  buildPreviewReflection,
  detectPreviewTopic,
  PREVIEW_ACKNOWLEDGMENTS,
  PREVIEW_FOLLOW_UP_QUESTIONS,
  type PreviewMessage,
  type PreviewStage,
  type PreviewTopic,
} from "./entrancePreviewConversation";

/**
 * Create Entrance Preview (2026-08-06) — isolated prototype only.
 *
 * Evaluates whether the conversation-first Create doorway feels right
 * before any production change. Deliberately does NOT:
 *  - open a real workspace or create a record
 *  - use the legacy split-panel Create workspace experience
 *  - use existing Create sections, Browse Categories, or the old
 *    three-button (Start Freely / Start With Guidance / Browse Categories)
 *    entry pattern
 *  - touch any production routing
 *
 * Everything below is local component state and copy from
 * entrancePreviewConversation.ts — nothing imports from lib/createEstate/,
 * lib/currentFocus/, or lib/createWorkflow*.
 */
export function CreateEntrancePreviewPage() {
  const [stage, setStage] = useState<PreviewStage>("opening");
  const [topic, setTopic] = useState<PreviewTopic | null>(null);
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [inputValue, setInputValue] = useState("");

  function reset() {
    setStage("opening");
    setTopic(null);
    setMessages([]);
    setInputValue("");
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");

    if (stage === "opening") {
      const detected = detectPreviewTopic(text);
      setTopic(detected);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: PREVIEW_ACKNOWLEDGMENTS[detected] },
      ]);
      const followUp = PREVIEW_FOLLOW_UP_QUESTIONS[detected];
      if (followUp) {
        setMessages((prev) => [...prev, { role: "assistant", content: followUp }]);
      }
      setStage("acknowledged");
      return;
    }

    if (stage === "acknowledged" && topic) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: buildPreviewReflection(topic) },
      ]);
      setStage("reflecting");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 bg-[#faf7f2] px-6 py-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
          Preview only — not connected to production Create
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#1f1c19]">
          What are you working on?
        </h1>
        <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
          Tell me what you&apos;re thinking about. It does not have to be
          fully formed yet.
        </p>
      </div>

      <ul className="flex flex-col gap-3" data-testid="preview-thread">
        {messages.map((message, i) => (
          <li
            key={i}
            className={
              message.role === "user"
                ? "self-end rounded-2xl bg-[#3d3429] px-4 py-2.5 text-base text-[#f7f2ea]"
                : "self-start rounded-2xl border border-[#e7dfd4] bg-white px-4 py-2.5 text-base text-[#1f1c19]"
            }
            data-testid={
              message.role === "user"
                ? "preview-message-user"
                : "preview-message-assistant"
            }
          >
            {message.content}
          </li>
        ))}
      </ul>

      {stage !== "reflecting" ? (
        <div className="flex items-end gap-2 rounded-2xl border border-[#cfc6b8] bg-white p-2 shadow-sm">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            placeholder="Say whatever's on your mind…"
            className="max-h-32 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-base leading-relaxed text-[#1f1c19] focus:outline-none"
            data-testid="preview-input"
            aria-label="What are you working on?"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="shrink-0 rounded-xl bg-[#3d3429] px-5 py-2.5 text-base font-semibold text-[#f7f2ea] transition enabled:hover:bg-[#2c241c] disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="preview-send"
          >
            Send
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={reset}
          className="self-start rounded-xl border border-[#cfc6b8] bg-white px-5 py-2.5 text-base font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
          data-testid="preview-start-over"
        >
          Start over
        </button>
      )}
    </div>
  );
}
