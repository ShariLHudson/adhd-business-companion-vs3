"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import {
  MIND_MAP_DISCOVERY_QUESTIONS,
  hasEnoughForMindMapFirstDraft,
  type MindMapDiscoveryQuestionId,
  gatherMindMapDiscoveryContext,
  type DiscoveryContextSeed,
} from "@/lib/visualFocus/discoveryInterview";

export type MindMapDiscoveryAnswers = {
  topic: string;
  everything: string;
  /** End goal / desired outcome (242). */
  desiredOutcome?: string;
  /** @deprecated use desiredOutcome */
  anythingElse?: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function MindMapDiscoveryInterview({
  onCancel,
  onComplete,
  seedText,
}: {
  onCancel: () => void;
  onComplete: (answers: MindMapDiscoveryAnswers) => void;
  /** Optional NL seed ("mind map this launch plan") — same interview as frame click. */
  seedText?: string;
}) {
  const [context] = useState<DiscoveryContextSeed>(() =>
    gatherMindMapDiscoveryContext({ seedText }),
  );
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState(context.suggestedTopic ?? "");
  const [everything, setEverything] = useState(
    context.suggestedEverything ?? "",
  );
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [confirmedContext, setConfirmedContext] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceSupported = useMemo(() => Boolean(getSpeechRecognition()), []);

  const questions = useMemo(() => {
    const fresh =
      confirmedContext &&
      !topic.trim() &&
      !everything.trim() &&
      context.knownFacts.length > 0;
    return MIND_MAP_DISCOVERY_QUESTIONS.filter((q) => {
      if (!confirmedContext || fresh) {
        // Pattern 5: if memory already gives a strong draft, still show topic/ideas only.
        if (
          q.id === "desired-outcome" &&
          hasEnoughForMindMapFirstDraft({
            topic: topic || context.suggestedTopic || "",
            everything: everything || context.suggestedEverything || "",
          })
        ) {
          return false;
        }
        return true;
      }
      if (q.id === "main-topic" && context.skipTopicQuestion && topic.trim()) {
        return false;
      }
      if (
        q.id === "everything" &&
        context.skipEverythingQuestion &&
        everything.trim()
      ) {
        return false;
      }
      if (
        q.id === "desired-outcome" &&
        hasEnoughForMindMapFirstDraft({ topic, everything })
      ) {
        return false;
      }
      return true;
    });
  }, [confirmedContext, context, everything, topic]);

  const question = questions[Math.min(step, Math.max(questions.length - 1, 0))];
  const progress = questions.length
    ? `${Math.min(step + 1, questions.length)} of ${questions.length}`
    : "Ready";

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Pattern 5 — if context alone is enough after confirm, build immediately.
  useEffect(() => {
    if (!confirmedContext) return;
    if (questions.length > 0) return;
    onComplete({
      topic: topic.trim() || context.suggestedTopic || "Central idea",
      everything: everything.trim() || context.suggestedEverything || "",
      desiredOutcome: desiredOutcome.trim() || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when questions collapse to empty
  }, [confirmedContext, questions.length]);

  function currentValue(): string {
    if (!question) return "";
    if (question.id === "main-topic") return topic;
    if (question.id === "everything") return everything;
    return desiredOutcome;
  }

  function setCurrentValue(value: string) {
    if (!question) return;
    if (question.id === "main-topic") setTopic(value);
    else if (question.id === "everything") setEverything(value);
    else setDesiredOutcome(value);
  }

  function appendVoice(transcript: string) {
    const t = transcript.trim();
    if (!t) return;
    setCurrentValue(
      currentValue() ? `${currentValue().trim()}\n${t}` : t,
    );
  }

  function toggleVoice() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const parts: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.isFinal && result[0]?.transcript) {
          parts.push(result[0].transcript);
        }
      }
      if (parts.length) appendVoice(parts.join(" "));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function canAdvance(): boolean {
    if (question.allowSkip) return true;
    return currentValue().trim().length > 0;
  }

  function finish(extra?: string) {
    onComplete({
      topic: topic.trim() || context.suggestedTopic || "Central idea",
      everything: everything.trim(),
      desiredOutcome: (extra ?? desiredOutcome).trim() || undefined,
    });
  }

  function handleNext() {
    if (!question || !canAdvance()) return;
    const nextTopic = question.id === "main-topic" ? currentValue() : topic;
    const nextEverything =
      question.id === "everything" ? currentValue() : everything;
    if (
      question.id === "everything" &&
      hasEnoughForMindMapFirstDraft({
        topic: nextTopic,
        everything: nextEverything,
      }) &&
      step >= questions.length - 1
    ) {
      finish();
      return;
    }
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    finish();
  }

  function handleBack() {
    if (step === 0) {
      if (confirmedContext && context.knownFacts.length > 0) {
        setConfirmedContext(false);
        return;
      }
      onCancel();
      return;
    }
    setStep((s) => s - 1);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text");
    if (!pasted || pasted.length < 8) return;
    // Allow default paste; hint is enough — lists are first-class via parseIdeaLines
  }

  const showContextGate =
    !confirmedContext && context.knownFacts.length > 0;

  if (showContextGate) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mind-map-context-title"
        data-testid="mind-map-discovery-context"
      >
        <div className="w-full max-w-lg rounded-2xl border border-[#e7dfd4] bg-[#fffdf8] p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8b7355]">
            Discovery Interview · Mind Map
          </p>
          <h2
            id="mind-map-context-title"
            className="mt-2 text-xl font-semibold text-[#1f1c19]"
          >
            I already see some of this
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#6b635a]">
            {context.knownFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          {context.suggestedTopic ? (
            <p className="mt-3 text-sm text-[#1f1c19]">
              Suggested center:{" "}
              <span className="font-semibold">{context.suggestedTopic}</span>
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setTopic("");
                setEverything("");
                setDesiredOutcome("");
                setConfirmedContext(true);
                setStep(0);
              }}
              className="rounded-xl border border-[#e7dfd4] px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
            >
              Start fresh
            </button>
            <button
              type="button"
              data-testid="mind-map-use-context"
              onClick={() => {
                setConfirmedContext(true);
                setStep(0);
              }}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
            >
              Use what you know
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
        data-testid="mind-map-discovery-building"
      >
        <div className="rounded-2xl bg-[#fffdf8] px-6 py-5 shadow-xl">
          <SparkLoadingState message="Building your first draft…" size="md" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mind-map-discovery-title"
      data-testid="mind-map-discovery-interview"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#e7dfd4] bg-[#fffdf8] p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-wide text-[#8b7355]">
          Discovery Interview · Mind Map · {progress}
        </p>
        <h2
          id="mind-map-discovery-title"
          className="mt-2 text-xl font-semibold text-[#1f1c19]"
        >
          {question.prompt}
        </h2>
        {question.hint ? (
          <p className="mt-1 text-sm text-[#6b635a]">{question.hint}</p>
        ) : null}
        <textarea
          value={currentValue()}
          onChange={(e) => setCurrentValue(e.target.value)}
          onPaste={handlePaste}
          rows={question.id === "everything" ? 7 : 3}
          autoFocus
          placeholder={question.placeholder}
          className="mt-4 w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#8b7355]"
          data-testid={`mind-map-discovery-${question.id as MindMapDiscoveryQuestionId}`}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e7dfd4] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]">
            Paste notes
            <input
              type="file"
              accept=".txt,.md,.csv,text/plain"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                setCurrentValue(
                  currentValue()
                    ? `${currentValue().trim()}\n${text.trim()}`
                    : text.trim(),
                );
                e.target.value = "";
              }}
            />
          </label>
          {voiceSupported ? (
            <button
              type="button"
              onClick={toggleVoice}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                listening
                  ? "border-[#c48992] bg-[#fdf2f4] text-[#9b2c2c]"
                  : "border-[#e7dfd4] bg-white text-[#6b635a] hover:bg-[#faf7f2]"
              }`}
              data-testid="mind-map-discovery-voice"
            >
              {listening ? "Stop voice" : "Speak"}
            </button>
          ) : (
            <span className="text-xs text-[#9a8f82]">
              Paste lists freely · voice unavailable in this browser
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
          >
            {step === 0 ? "Back" : "Back"}
          </button>
          <div className="flex flex-wrap gap-2">
            {question.allowSkip ? (
              <button
                type="button"
                onClick={() => finish("")}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#8b7355] hover:bg-[#f5efe6]"
              >
                Skip
              </button>
            ) : null}
            <button
              type="button"
              disabled={!canAdvance()}
              onClick={handleNext}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c] disabled:cursor-not-allowed disabled:opacity-40"
              data-testid="mind-map-discovery-next"
            >
              {step < questions.length - 1 ? "Continue" : "Build first draft"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
