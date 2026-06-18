"use client";

import { saveUserStrategy } from "@/lib/userStrategies";

export function BusinessStrategyDraftPanel({
  typeLabel,
  draft,
  onBack,
  onTalkWithShari,
  onStartOver,
}: {
  typeLabel: string;
  draft: string;
  onBack?: () => void;
  onTalkWithShari?: () => void;
  onStartOver?: () => void;
}) {
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Business Strategies
        </button>
      ) : null}
      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{typeLabel}</p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Your plan outline — use chat with Shari to flesh out weeks, content, and
        instructions.
      </p>
      {onTalkWithShari ? (
        <button
          type="button"
          onClick={onTalkWithShari}
          className="mt-4 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
        >
          Talk it out with Shari
        </button>
      ) : null}
      <pre className="mt-4 min-h-[200px] flex-1 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-[#e7dfd4] bg-white p-4 text-sm leading-relaxed text-[#2d2926]">
        {draft}
      </pre>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(draft)}
          className="flex-1 rounded-xl border border-[#1e4f4f]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          Copy plan
        </button>
        <button
          type="button"
          onClick={() => {
            saveUserStrategy({
              title: typeLabel,
              type: "business",
              category: "planning",
              source: "user_generated",
              description: draft.split("\n").slice(0, 6).join(" ").slice(0, 200),
              whenToUse: "When you're executing this plan.",
              steps: draft
                .split("\n")
                .filter((l) => /^\d+\./.test(l.trim()))
                .map((l) => l.replace(/^\d+\.\s*/, ""))
                .slice(0, 5),
              whyItWorks: "Built with Shari from your answers and coaching.",
            });
          }}
          className="flex-1 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          Save to Saved Strategies
        </button>
      </div>
      {onStartOver ? (
        <button
          type="button"
          onClick={onStartOver}
          className="mt-2 text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
        >
          Start a new strategy
        </button>
      ) : null}
    </div>
  );
}
