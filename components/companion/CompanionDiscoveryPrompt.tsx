"use client";

import { useCallback, useEffect, useState } from "react";
import {
  discoveryCompletedLabel,
  nextHomeDiscoveryQuestion,
  recordDiscoveryAnswer,
  skipDiscoveryForSession,
  skipDiscoveryQuestion,
  type DiscoveryQuestion,
  type DiscoveryQuestionId,
} from "@/lib/companionDiscovery";

function DiscoveryQuestionCard({
  question,
  onAnswer,
  onSkip,
}: {
  question: DiscoveryQuestion;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
}) {
  const [custom, setCustom] = useState("");

  return (
    <div className="mt-3 rounded-xl border border-[#e7dfd4] bg-white/75 px-3 py-3 text-left shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        Getting To Know You
      </p>
      <p className="mt-0.5 text-xs text-[#6b635a]">{discoveryCompletedLabel()}</p>

      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Current question
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[#1f1c19]">{question.prompt}</p>
      <p className="mt-1.5 text-xs text-[#6b635a]">
        <span className="font-semibold text-[#4b463f]">Why I&apos;m asking:</span>{" "}
        {question.why}
      </p>

      {question.options.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onAnswer(opt)}
              className="rounded-full border border-[#1e4f4f]/20 bg-white px-2.5 py-1 text-xs font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}

      {question.allowCustom || question.options.length === 0 ? (
        <div className="mt-2 flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Your answer…"
            className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#1e4f4f]"
          />
          <button
            type="button"
            disabled={!custom.trim()}
            onClick={() => onAnswer(custom.trim())}
            className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            Answer
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onSkip}
        className="mt-2 text-xs font-semibold text-[#9a8f82] underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
      >
        Skip
      </button>
    </div>
  );
}

export function CompanionDiscoveryPrompt({
  hasMeaningfulUsage,
}: {
  hasMeaningfulUsage: boolean;
}) {
  const [question, setQuestion] = useState<DiscoveryQuestion | null>(null);

  const refresh = useCallback(() => {
    setQuestion(nextHomeDiscoveryQuestion({ hasMeaningfulUsage }));
  }, [hasMeaningfulUsage]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("companion-discovery-updated", onUpdate);
    return () => window.removeEventListener("companion-discovery-updated", onUpdate);
  }, [refresh]);

  if (!question) return null;

  function answerQuestion(answer: string, id: DiscoveryQuestionId) {
    recordDiscoveryAnswer(id, answer);
    refresh();
  }

  function skipQuestion() {
    if (!question) return;
    if (question.phase === "first-visit") {
      skipDiscoveryQuestion(question.id);
    } else {
      skipDiscoveryForSession();
    }
    refresh();
  }

  return (
    <DiscoveryQuestionCard
      question={question}
      onAnswer={(a) => answerQuestion(a, question.id)}
      onSkip={skipQuestion}
    />
  );
}
