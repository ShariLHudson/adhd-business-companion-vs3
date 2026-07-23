"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ContinueYourJourney } from "@/components/companion/ContinueYourJourney";
import { StrategyDecisionRecord } from "@/components/companion/StrategyDecisionRecord";
import { StrategyThinkingPanel } from "@/components/companion/StrategyThinkingPanel";
import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import { chooseEmergingOption } from "@/lib/strategyChamber/answerIntake";
import {
  buildConversationTurnView,
  buildQuestionChoices,
  suggestEmergingOptions,
} from "@/lib/strategyChamber/conversationGuidance";
import {
  buildContinueYourJourney,
  STRATEGY_HANDOFF_LIVE_DESTINATIONS,
  type ContinueJourneyDestinationId,
  type StrategyWorkItem,
} from "@/lib/strategyChamber";
import { buildIntelligentDecisionRecord } from "@/lib/strategyChamber/intelligence";

type Props = {
  work: StrategyWorkItem;
  presentation: AdaptivePresentationResolved;
  onAnswer: (answer: string) => void;
  onPause: () => void;
  onDraftChange: (draft: string) => void;
  onPatchWork: (patch: Partial<StrategyWorkItem>) => void;
  onJourneySelect: (destinationId: ContinueJourneyDestinationId) => void;
  onBrowseLibrary: () => void;
  onAskDifferentQuestion: (question: string) => void;
};

function useSpeechInput(onResult: (text: string) => void): {
  supported: boolean;
  listening: boolean;
  toggle: () => void;
} {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{
    stop: () => void;
    start: () => void;
    onresult: ((ev: {
      results: { [i: number]: { [j: number]: { transcript: string } } };
    }) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
  } | null>(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggle = useCallback(() => {
    if (!supported) return;
    const SR =
      (
        window as unknown as {
          SpeechRecognition?: new () => NonNullable<
            typeof recognitionRef.current
          >;
          webkitSpeechRecognition?: new () => NonNullable<
            typeof recognitionRef.current
          >;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => NonNullable<
            typeof recognitionRef.current
          >;
        }
      ).webkitSpeechRecognition;
    if (!SR) return;
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (ev) => {
      const transcript = ev.results[0]?.[0]?.transcript?.trim();
      if (transcript) onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onResult, supported]);

  return { supported, listening, toggle };
}

/**
 * Conversation-first Strategy Chamber surface — not a worksheet.
 */
export function StrategyChamberConversation({
  work,
  presentation,
  onAnswer,
  onPause,
  onDraftChange,
  onPatchWork,
  onJourneySelect,
  onBrowseLibrary,
  onAskDifferentQuestion,
}: Props) {
  const [answer, setAnswer] = useState(work.draftResponse || "");
  const [showThinking, setShowThinking] = useState(
    work.sourceContext === "review_thinking",
  );
  const [forceRecord, setForceRecord] = useState(false);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [explainAlt, setExplainAlt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const view = buildConversationTurnView(work, presentation, {
    forceShowRecord: forceRecord,
  });

  useEffect(() => {
    setAnswer(work.draftResponse || "");
  }, [work.id, work.activeQuestion, work.version]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 56), 200)}px`;
  }, [answer]);

  const applySpeech = useCallback(
    (text: string) => {
      setAnswer((prev) => {
        const next = prev ? `${prev} ${text}` : text;
        onDraftChange(next);
        return next;
      });
    },
    [onDraftChange],
  );
  const speech = useSpeechInput(applySpeech);

  const questionChoices = buildQuestionChoices(work);
  const options = view.showOptions
    ? suggestEmergingOptions(work).slice(0, 3)
    : [];

  function submit() {
    const trimmed = answer.trim();
    if (!trimmed) return;
    onAnswer(trimmed);
    setAnswer("");
  }

  return (
    <div
      className="mt-2 flex flex-col gap-3"
      data-testid="strategy-chamber-conversation"
    >
      <p
        className="text-sm font-semibold text-[#1e4f4f]"
        data-testid="strategy-chamber-thinking-through"
      >
        {view.thinkingThroughLine}
      </p>

      <div
        className="rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-3"
        data-testid="strategy-chamber-shari-turn"
      >
        <p className="text-base leading-relaxed text-[#2d2926]">
          {explainAlt
            ? "In simpler words: tell me the next piece that feels true, and I will keep organizing the thinking for you."
            : view.reflection}
        </p>
        <p className="mt-3 text-lg font-semibold leading-snug text-[#1f1c19]">
          {view.question}
        </p>
        {presentation.preferExamples ? (
          <p className="mt-2 text-sm text-[#6b635a]">
            A short answer is enough — even a rough sentence.
          </p>
        ) : null}
      </div>

      {questionChoices.length > 0 ? (
        <div data-testid="strategy-chamber-question-selector">
          <label className="text-sm font-semibold text-[#4b463f]">
            What would be easiest to answer next?
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19]"
            defaultValue=""
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              if (id === "free") {
                setShowMoreQuestions(false);
                textareaRef.current?.focus();
                return;
              }
              const choice = questionChoices.find((c) => c.id === id);
              if (choice) onAskDifferentQuestion(choice.question);
              e.target.value = "";
            }}
            data-testid="strategy-chamber-question-select"
          >
            <option value="" disabled>
              Choose a question (optional)
            </option>
            {questionChoices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
            <option value="free">I would rather explain in my own words</option>
          </select>
          {showMoreQuestions ? null : null}
        </div>
      ) : null}

      {options.length > 0 ? (
        <div
          className="flex flex-col gap-2"
          data-testid="strategy-chamber-option-cards"
        >
          <p className="text-sm font-semibold text-[#1f1c19]">
            I see a few directions worth exploring.
          </p>
          {options.map((opt) => (
            <div
              key={opt.id}
              className="rounded-xl border border-[#e7dfd4] bg-[#faf8f5] px-3 py-3"
              data-testid={`strategy-option-card-${opt.id}`}
            >
              <p className="font-semibold text-[#1f1c19]">{opt.title}</p>
              {opt.whyItMayFit ? (
                <p className="mt-1 text-sm text-[#4b463f]">{opt.whyItMayFit}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                  onClick={() => {
                    onPatchWork({
                      ...chooseEmergingOption(
                        {
                          ...work,
                          optionsConsidered: options,
                          optionsOffered: true,
                        },
                        opt.id,
                      ),
                      optionsConsidered: options,
                      optionsOffered: true,
                    });
                  }}
                  data-testid={`strategy-option-explore-${opt.id}`}
                >
                  Explore This Option
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              className="font-semibold text-[#1e4f4f] underline"
              onClick={() =>
                onPatchWork({
                  optionsConsidered: options,
                  optionsOffered: true,
                  activeQuestion:
                    "Would you like to explore one, compare all three, or keep talking first?",
                })
              }
            >
              Compare these
            </button>
            <button
              type="button"
              className="font-semibold text-[#6b635a] underline"
              onClick={() =>
                onAskDifferentQuestion(
                  "What other direction should we consider?",
                )
              }
            >
              Suggest another
            </button>
            <button
              type="button"
              className="font-semibold text-[#6b635a] underline"
              onClick={() =>
                onPatchWork({
                  optionsOffered: false,
                  activeQuestion: "What else feels important before we look at options?",
                })
              }
              data-testid="strategy-options-not-ready"
            >
              I am not ready for options yet
            </button>
          </div>
        </div>
      ) : null}

      <div data-testid="strategy-chamber-entry-form">
        <textarea
          ref={textareaRef}
          value={answer}
          rows={2}
          placeholder="Tell me what comes to mind."
          className="w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          data-testid="strategy-chamber-entry-answer"
          onChange={(e) => {
            setAnswer(e.target.value);
            onDraftChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#163d3d] disabled:opacity-40"
            disabled={!answer.trim()}
            onClick={submit}
            data-testid="strategy-chamber-entry-save"
          >
            Continue
          </button>
          <button
            type="button"
            className="rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-base font-semibold text-[#1e4f4f]"
            onClick={() => {
              if (answer.trim()) onDraftChange(answer);
              onPause();
            }}
            data-testid="strategy-chamber-entry-pause"
          >
            Save for Later
          </button>
          {speech.supported ? (
            <button
              type="button"
              className="rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm font-semibold text-[#4b463f]"
              onClick={speech.toggle}
              data-testid="strategy-chamber-voice"
            >
              {speech.listening ? "Listening…" : "Speak"}
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-[#6b635a]" data-testid="strategy-autosave-note">
          Your work is saved automatically.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {view.showThinkingAvailable ? (
          <button
            type="button"
            className="text-left text-sm font-semibold text-[#1e4f4f] underline"
            onClick={() => setShowThinking((v) => !v)}
            data-testid="strategy-view-thinking"
          >
            {showThinking ? "Hide My Thinking" : "View My Thinking So Far"}
          </button>
        ) : null}
        <button
          type="button"
          className="text-left text-sm font-semibold text-[#6b635a] underline"
          onClick={() => setExplainAlt((v) => !v)}
          data-testid="strategy-explain-another-way"
        >
          Explain This Another Way
        </button>
        {view.showDecisionRecord || forceRecord ? null : (
          <button
            type="button"
            className="text-left text-sm font-semibold text-[#6b635a] underline"
            onClick={() => setForceRecord(true)}
            data-testid="strategy-request-summary"
          >
            Show a summary
          </button>
        )}
      </div>

      {showThinking ? (
        <StrategyThinkingPanel
          item={work}
          onClose={() => setShowThinking(false)}
          onCorrect={(sectionId, nextBody) => {
            if (sectionId === "thinking_through") {
              onPatchWork({ decisionStatement: nextBody, title: nextBody.slice(0, 72) });
            } else if (sectionId === "happening") {
              onPatchWork({ currentReality: nextBody });
            }
          }}
        />
      ) : null}

      {view.showDecisionRecord || forceRecord ? (
        <div className="mt-2 flex flex-col gap-3" data-testid="strategy-decision-record-gate">
          <p className="text-sm text-[#4b463f]">
            Here is what I have captured from our conversation. Would you like to
            change anything before we use it?
          </p>
          <StrategyDecisionRecord
            record={buildIntelligentDecisionRecord(work)}
            summaryFirst={presentation.summaryFirst}
          />
          <button
            type="button"
            className="w-fit rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onPatchWork({ decisionRecordConfirmed: true })}
            data-testid="strategy-confirm-decision-record"
          >
            This looks right
          </button>
        </div>
      ) : null}

      {view.showContinueJourney ? (
        <ContinueYourJourney
          model={buildContinueYourJourney(work, {
            maxSecondary: Math.min(
              2,
              Math.max(0, presentation.maxVisibleChoices - 1),
            ),
          })}
          liveDestinations={STRATEGY_HANDOFF_LIVE_DESTINATIONS}
          onSelect={onJourneySelect}
        />
      ) : null}

      <button
        type="button"
        className="text-left text-sm font-semibold text-[#6b635a] underline"
        data-testid="strategy-chamber-browse-library-from-journey"
        onClick={onBrowseLibrary}
      >
        Browse the strategy library
      </button>
    </div>
  );
}
