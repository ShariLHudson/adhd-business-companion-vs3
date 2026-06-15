"use client";

import { useCallback, useEffect, useState } from "react";
import {
  completeFirstVisit,
  disableDiscovery,
  getQuestion,
  markWelcomeSeen,
  nextFirstVisitQuestion,
  nextProgressiveQuestion,
  recordDiscoveryAnswer,
  shouldShowFirstVisitWelcome,
  skipDiscoveryForSession,
  skipDiscoveryQuestion,
  type DiscoveryQuestion,
  type DiscoveryQuestionId,
} from "@/lib/companionDiscovery";

type Phase = "hidden" | "welcome" | "question" | "first-complete";

const WELCOME_COPY = {
  title: "Hi, I'm Shari.",
  body: "I'm here to help with life and business in a way that works with your brain.",
  note: "I'll occasionally ask questions so I can support you better. You can skip anything, change it later, or turn it off entirely.",
  cta: "Let's start with a few quick questions.",
};

function DiscoveryQuestionCard({
  question,
  onAnswer,
  onSkip,
  onTurnOff,
  onChangeLater,
}: {
  question: DiscoveryQuestion;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  onTurnOff: () => void;
  onChangeLater?: () => void;
}) {
  const [custom, setCustom] = useState("");

  return (
    <div className="mb-3 rounded-2xl border border-[#d4cdc3] bg-white/90 px-4 py-4 shadow-sm">
      <p className="text-base font-semibold text-[#1f1c19]">{question.prompt}</p>
      <p className="mt-1.5 text-sm text-[#6b635a]">
        <span className="font-medium text-[#1e4f4f]">Why I&apos;m asking:</span>{" "}
        {question.why}
      </p>
      {question.examples && question.examples.length > 0 ? (
        <p className="mt-2 text-sm text-[#6b635a]">
          <span className="font-medium text-[#4b463f]">Examples:</span>{" "}
          {question.examples.join(" · ")}
        </p>
      ) : null}
      {question.options.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onAnswer(opt)}
              className="rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}
      {question.allowCustom || question.options.length === 0 ? (
        <div className="mt-3 flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Type your answer…"
            className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
          />
          <button
            type="button"
            disabled={!custom.trim()}
            onClick={() => onAnswer(custom.trim())}
            className="rounded-lg bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#9a8f82]">
        <button
          type="button"
          onClick={onSkip}
          className="font-semibold underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
        >
          Skip
        </button>
        {onChangeLater ? (
          <button
            type="button"
            onClick={onChangeLater}
            className="font-semibold underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
          >
            Change later
          </button>
        ) : null}
        <button
          type="button"
          onClick={onTurnOff}
          className="font-semibold underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
        >
          Turn off anytime
        </button>
      </div>
    </div>
  );
}

export function CompanionDiscoveryPrompt({
  hasMeaningfulUsage,
  onOpenGettingToKnowYou,
  onFirstVisitComplete,
}: {
  hasMeaningfulUsage: boolean;
  onOpenGettingToKnowYou?: () => void;
  onFirstVisitComplete?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [question, setQuestion] = useState<DiscoveryQuestion | null>(null);

  const refresh = useCallback(() => {
    if (shouldShowFirstVisitWelcome()) {
      setPhase("welcome");
      setQuestion(null);
      return;
    }
    const firstQ = nextFirstVisitQuestion();
    if (firstQ) {
      setPhase("question");
      setQuestion(firstQ);
      return;
    }
    const progQ = nextProgressiveQuestion({ hasMeaningfulUsage });
    if (progQ) {
      setPhase("question");
      setQuestion(progQ);
      return;
    }
    setPhase("hidden");
    setQuestion(null);
  }, [hasMeaningfulUsage]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("companion-discovery-updated", onUpdate);
    return () => window.removeEventListener("companion-discovery-updated", onUpdate);
  }, [refresh]);

  function answerQuestion(answer: string, id: DiscoveryQuestionId) {
    recordDiscoveryAnswer(id, answer);
    const stillFirst = nextFirstVisitQuestion();
    if (!stillFirst && !shouldShowFirstVisitWelcome()) {
      const wasFirstVisit = question?.phase === "first-visit";
      if (wasFirstVisit) {
        completeFirstVisit();
        setPhase("first-complete");
        onFirstVisitComplete?.();
        return;
      }
    }
    refresh();
  }

  function skipQuestion() {
    if (!question) return;
    if (question.phase === "first-visit") {
      skipDiscoveryQuestion(question.id);
      const stillFirst = nextFirstVisitQuestion();
      if (stillFirst) {
        setQuestion(stillFirst);
        return;
      }
      completeFirstVisit();
      setPhase("first-complete");
      onFirstVisitComplete?.();
      return;
    }
    skipDiscoveryForSession();
    refresh();
  }

  if (phase === "hidden") return null;

  if (phase === "welcome") {
    return (
      <div className="mb-3 rounded-2xl border border-[#1e4f4f]/20 bg-white/95 px-4 py-5 shadow-sm">
        <p className="text-xl font-semibold text-[#1f1c19]">{WELCOME_COPY.title}</p>
        <p className="mt-2 text-base text-[#4b463f]">{WELCOME_COPY.body}</p>
        <p className="mt-2 text-sm text-[#6b635a]">{WELCOME_COPY.note}</p>
        <p className="mt-3 text-sm font-medium text-[#1e4f4f]">{WELCOME_COPY.cta}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              markWelcomeSeen();
              const q = nextFirstVisitQuestion();
              if (q) {
                setPhase("question");
                setQuestion(q);
              } else {
                completeFirstVisit();
                setPhase("hidden");
              }
            }}
            className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => {
              markWelcomeSeen();
              completeFirstVisit();
              setPhase("hidden");
            }}
            className="rounded-xl border border-[#c9bfb0] px-4 py-2.5 text-sm font-semibold text-[#3d3630]"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  if (phase === "first-complete") {
    return (
      <div className="mb-3 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.05] px-4 py-4 text-center">
        <p className="text-base font-semibold text-[#1f1c19]">You&apos;re all set for today.</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          I&apos;ll ask more when it feels natural — one at a time.
        </p>
        <button
          type="button"
          onClick={() => setPhase("hidden")}
          className="mt-3 rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          Start conversation
        </button>
      </div>
    );
  }

  if (phase === "question" && question) {
    return (
      <DiscoveryQuestionCard
        question={question}
        onAnswer={(a) => answerQuestion(a, question.id)}
        onSkip={skipQuestion}
        onTurnOff={() => {
          disableDiscovery();
          setPhase("hidden");
        }}
        onChangeLater={onOpenGettingToKnowYou}
      />
    );
  }

  return null;
}
