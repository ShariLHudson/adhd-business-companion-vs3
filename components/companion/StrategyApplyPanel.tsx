"use client";

import type { StrategyApplySession } from "@/lib/strategyApplyCoach";
import { getStrategy } from "@/lib/strategySystem";

export function StrategyApplyPanel({
  session,
  onBack,
}: {
  session: StrategyApplySession;
  onBack?: () => void;
}) {
  const strategy = getStrategy(session.strategyId);
  const done = session.phase === "done";

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
      ) : null}

      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{session.title}</p>
      <p className="mt-1 text-sm text-[#6b635a]">
        {done
          ? "Your plan — built from your answers with Shari."
          : "Answer in chat — each reply fills in here."}
      </p>

      {strategy && !done ? (
        <p className="mt-3 text-sm leading-relaxed text-[#6b635a]">{strategy.whenToUse}</p>
      ) : null}

      <ol className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto">
        {session.questions.map((q, i) => {
          const answer = session.answers[q.id]?.trim();
          const isCurrent =
            !done && i === session.questionIndex && !answer;
          const isUpcoming = !done && i > session.questionIndex;

          return (
            <li
              key={q.id}
              className={`rounded-xl border p-4 ${
                isCurrent
                  ? "border-[#1e4f4f]/40 bg-[#1e4f4f]/[0.06]"
                  : isUpcoming
                    ? "border-[#e7dfd4] bg-[#faf8f5] opacity-60"
                    : "border-[#e7dfd4] bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-[#1e4f4f]">
                {i + 1}. {q.prompt}
              </p>
              {answer ? (
                <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-[#2d2926]">
                  {answer}
                </p>
              ) : isCurrent ? (
                <p className="mt-2 text-sm italic text-[#6b635a]">
                  Waiting for your answer in chat…
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {done && session.plan ? (
        <pre className="mt-4 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-[#e7dfd4] bg-white p-4 text-sm leading-relaxed text-[#2d2926]">
          {session.plan}
        </pre>
      ) : null}
    </div>
  );
}
