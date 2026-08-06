"use client";

import { useState } from "react";
import {
  answerCurrentQuestion,
  isJourneyComplete,
  journeyFor,
  REASONING_PATTERN_EXAMPLES,
  OPENING_QUESTION,
  OPENING_SUPPORT,
  PREVIEW_BOUNDARY_REPLY,
  PROGRESS_CAPTION,
  RESEARCH_CHOICE_NOT_NOW,
  RESEARCH_CHOICE_YES,
  RESEARCH_USE_IDEAS_LABEL,
  RESEARCH_USE_RECOMMENDATION_LABEL,
  researchAcceptMessages,
  researchDeclineMessages,
  researchOfferFor,
  researchUseMessages,
  startJourney,
  thinkingHelpFor,
  UNCLEAR_REPLY,
  type JourneyState,
  type PreviewMessage,
  type ResearchUse,
} from "./chatFirstReasoningJourney";

/**
 * Chat-First Reasoning Experience Preview (2026-08-06) — isolated prototype.
 *
 * Founder review of the intended future Create experience before any
 * implementation. Deliberately does NOT:
 *  - modify production Create or replace any existing route
 *  - open a workspace, create a record, or persist anything
 *  - use the existing wizard UI, templates, categories, sections, or forms
 *  - build research infrastructure (research moments are concept-only)
 *
 * Everything below is local component state and authored copy from
 * chatFirstReasoningJourney.ts.
 */
export function ChatFirstReasoningPreviewPage() {
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  // Research stages: "offer" awaits yes/not-now; "use" awaits how the member
  // wants findings applied (Rule 7). Answering the question instead simply
  // dissolves either stage — research never blocks.
  const [researchStage, setResearchStage] = useState<"offer" | "use" | null>(
    null,
  );

  const inJourney = journeyState !== null && !isJourneyComplete(journeyState);
  const complete = journeyState !== null && isJourneyComplete(journeyState);
  const answeredCount = journeyState?.answers.length ?? 0;

  function appendSpark(lines: string[]) {
    setMessages((prev) => [
      ...prev,
      ...lines.map(
        (content): PreviewMessage => ({ role: "assistant", content }),
      ),
    ]);
  }

  function reset() {
    setJourneyState(null);
    setMessages([]);
    setInputValue("");
    setResearchStage(null);
  }

  function send(rawText?: string) {
    const text = (rawText ?? inputValue).trim();
    if (!text) return;
    setInputValue("");
    setResearchStage(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    if (journeyState === null) {
      const started = startJourney(text);
      if (!started) {
        appendSpark([UNCLEAR_REPLY]);
        return;
      }
      setJourneyState(started.state);
      appendSpark(started.messages);
      return;
    }

    if (isJourneyComplete(journeyState)) {
      appendSpark([PREVIEW_BOUNDARY_REPLY]);
      return;
    }

    const advanced = answerCurrentQuestion(journeyState, text);
    setJourneyState(advanced.state);
    appendSpark(advanced.messages);
  }

  function helpMeThink() {
    if (!journeyState) return;
    const help = thinkingHelpFor(journeyState);
    if (help) appendSpark([help]);
  }

  function researchThis() {
    if (!journeyState) return;
    appendSpark([researchOfferFor(journeyState)]);
    setResearchStage("offer");
  }

  function chooseResearch(accepted: boolean) {
    if (!journeyState) return;
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: accepted ? RESEARCH_CHOICE_YES : RESEARCH_CHOICE_NOT_NOW,
      },
    ]);
    if (accepted) {
      appendSpark(researchAcceptMessages(journeyState));
      setResearchStage("use");
      return;
    }
    setResearchStage(null);
    appendSpark(researchDeclineMessages(journeyState));
  }

  function chooseResearchUse(use: ResearchUse) {
    if (!journeyState) return;
    setResearchStage(null);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content:
          use === "ideas"
            ? RESEARCH_USE_IDEAS_LABEL
            : RESEARCH_USE_RECOMMENDATION_LABEL,
      },
    ]);
    appendSpark(researchUseMessages(journeyState, use));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 bg-[#faf7f2] px-6 py-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
          Preview only — not connected to production Create
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#1f1c19]">
          {OPENING_QUESTION}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
          {OPENING_SUPPORT}
        </p>
      </div>

      {/* Gentle progress — soft dots, never a numbered form. */}
      {journeyState !== null ? (
        <div
          className="flex items-center gap-3"
          data-testid="preview-progress"
          aria-label={
            complete ? "Understanding complete" : "Understanding in progress"
          }
        >
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {journeyFor(journeyState.journeyId).questions.map((q, i) => (
              <span
                key={q.id}
                className={
                  i < answeredCount
                    ? "h-2 w-2 rounded-full bg-[#8a7a68]"
                    : "h-2 w-2 rounded-full bg-[#ddd4c7]"
                }
              />
            ))}
          </div>
          <p className="text-sm text-[#9a8f82]">
            {complete
              ? "We have what we need to begin — whenever you're ready."
              : PROGRESS_CAPTION}
          </p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3" data-testid="preview-thread">
        {messages.map((message, i) => (
          <li
            key={i}
            className={
              message.role === "user"
                ? "max-w-[85%] self-end whitespace-pre-line rounded-2xl bg-[#3d3429] px-4 py-2.5 text-base text-[#f7f2ea]"
                : "max-w-[85%] self-start whitespace-pre-line rounded-2xl border border-[#e7dfd4] bg-white px-4 py-2.5 text-base leading-relaxed text-[#1f1c19]"
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

      {/* Optional companions to the current question — never required. */}
      {inJourney && researchStage === "offer" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => chooseResearch(true)}
            className="rounded-full bg-[#3d3429] px-4 py-2 text-sm font-semibold text-[#f7f2ea] transition hover:bg-[#2c241c]"
            data-testid="preview-research-yes"
          >
            {RESEARCH_CHOICE_YES}
          </button>
          <button
            type="button"
            onClick={() => chooseResearch(false)}
            className="rounded-full border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
            data-testid="preview-research-not-now"
          >
            {RESEARCH_CHOICE_NOT_NOW}
          </button>
        </div>
      ) : null}
      {inJourney && researchStage === "use" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => chooseResearchUse("ideas")}
            className="rounded-full border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
            data-testid="preview-research-use-ideas"
          >
            {RESEARCH_USE_IDEAS_LABEL}
          </button>
          <button
            type="button"
            onClick={() => chooseResearchUse("recommendation")}
            className="rounded-full border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
            data-testid="preview-research-use-recommendation"
          >
            {RESEARCH_USE_RECOMMENDATION_LABEL}
          </button>
        </div>
      ) : null}
      {inJourney && researchStage === null ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={helpMeThink}
            className="rounded-full border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
            data-testid="preview-help-me-think"
          >
            Help me think this through
          </button>
          <button
            type="button"
            onClick={researchThis}
            className="rounded-full border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
            data-testid="preview-research-this"
          >
            Research this
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2 rounded-2xl border border-[#cfc6b8] bg-white p-2 shadow-sm">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder={
            inJourney
              ? "Share as much or as little as you like…"
              : "Tell me what you'd like to make happen…"
          }
          className="max-h-32 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-base leading-relaxed text-[#1f1c19] focus:outline-none"
          data-testid="preview-input"
          aria-label={OPENING_QUESTION}
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={!inputValue.trim()}
          className="shrink-0 rounded-xl bg-[#3d3429] px-5 py-2.5 text-base font-semibold text-[#f7f2ea] transition enabled:hover:bg-[#2c241c] disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="preview-send"
        >
          Send
        </button>
      </div>

      {journeyState === null && messages.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[#9a8f82]">
            Four ways we can think together — try one:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {REASONING_PATTERN_EXAMPLES.map((p) => (
              <button
                key={p.verb}
                type="button"
                onClick={() => send(p.example)}
                className="rounded-2xl border border-[#e7dfd4] bg-white px-4 py-3 text-left transition hover:bg-[#f3ebe0]"
                data-testid="preview-example-chip"
              >
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                  {p.verb}
                </span>
                <span className="mt-0.5 block text-xs text-[#9a8f82]">
                  {p.pattern}
                </span>
                <span className="mt-1.5 block text-sm text-[#3d3429]">
                  &ldquo;{p.example}&rdquo;
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {complete ? (
        <button
          type="button"
          onClick={reset}
          className="self-start rounded-xl border border-[#cfc6b8] bg-white px-5 py-2.5 text-base font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
          data-testid="preview-start-over"
        >
          Start over
        </button>
      ) : null}
    </div>
  );
}
