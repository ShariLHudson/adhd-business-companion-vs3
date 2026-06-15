"use client";

import { useState } from "react";
import {
  STRATEGY_STRUGGLES,
  struggleById,
  suggestedStruggleForStrategy,
  type StrategyStruggleId,
} from "@/lib/strategyWorkspace";
import type { AppSection } from "@/lib/companionUi";

export function StrategyUseNow({
  strategyTitle,
  strategyId,
  categoryId,
  onOpen,
  onAsk,
}: {
  strategyTitle: string;
  strategyId?: string;
  categoryId?: string;
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
}) {
  const [selected, setSelected] = useState<StrategyStruggleId | null>(null);

  const route = selected ? struggleById(selected) : null;
  const suggested =
    strategyId && categoryId
      ? suggestedStruggleForStrategy(strategyId, categoryId)
      : null;

  function openRoute() {
    if (!route) return;
    const prompt = route.chatPrompt?.(strategyTitle);
    if (prompt && onAsk) {
      onAsk(prompt);
      return;
    }
    onOpen?.(route.section);
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] p-4">
      <p className="text-base font-semibold text-[#1f1c19]">
        Use this strategy right now
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">What are you struggling with?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {STRATEGY_STRUGGLES.map((s) => {
          const active = selected === s.id;
          const isSuggested = !selected && suggested === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                  : isSuggested
                    ? "border-[#1e4f4f]/50 bg-[#1e4f4f]/[0.08] text-[#1e4f4f]"
                    : "border-[#1e4f4f]/25 bg-white text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {route ? (
        <div className="mt-4 rounded-xl border border-[#d4cdc3] bg-white/90 p-4">
          <p className="text-sm font-medium text-[#1f1c19]">
            Using <span className="text-[#1e4f4f]">{strategyTitle}</span> when you
            have {route.label.toLowerCase()}
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">{route.hint}</p>
          <button
            type="button"
            onClick={openRoute}
            disabled={!onOpen && !(route.chatPrompt && onAsk)}
            className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
          >
            {route.openLabel} →
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#9a8f82]">
          Pick what feels most true — I&apos;ll send you to the right workspace.
        </p>
      )}
    </div>
  );
}
