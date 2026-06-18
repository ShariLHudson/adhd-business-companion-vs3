"use client";

import { useMemo, useState } from "react";
import {
  buildStrategyApplyChatPrompt,
  getStrategyApplyOptions,
  pickActiveProjectName,
  suggestedApplyOptionId,
  type StrategyApplyOption,
} from "@/lib/strategyApplyOptions";
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
  const activeProjectName = useMemo(() => pickActiveProjectName(), []);
  const options = useMemo(
    () =>
      getStrategyApplyOptions(strategyId, categoryId, {
        strategyTitle,
        activeProjectName,
      }),
    [strategyId, categoryId, strategyTitle, activeProjectName],
  );
  const suggestedId = useMemo(
    () =>
      suggestedApplyOptionId(options, {
        strategyTitle,
        strategyId,
        categoryId: categoryId ?? "",
        activeProjectName,
      }),
    [options, strategyTitle, strategyId, categoryId, activeProjectName],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: StrategyApplyOption | null =
    options.find((o) => o.id === selectedId) ?? null;

  function openRoute(option: StrategyApplyOption) {
    const ctx = {
      strategyTitle,
      strategyId,
      categoryId: categoryId ?? "",
      activeProjectName,
    };
    const prompt = buildStrategyApplyChatPrompt(option, ctx);
    if (prompt && onAsk) {
      onAsk(prompt);
      return;
    }
    if (option.section) {
      onOpen?.(option.section);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] p-4">
      <p className="text-base font-semibold text-[#1f1c19]">
        Use this strategy now
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        What do you want to do with &ldquo;{strategyTitle}&rdquo;?
      </p>
      {activeProjectName ? (
        <p className="mt-1 text-xs text-[#9a8f82]">
          Current focus: {activeProjectName} — we&apos;ll weave it in only if it
          fits.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selectedId === opt.id;
          const isSuggested = !selectedId && suggestedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedId(opt.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                  : isSuggested
                    ? "border-[#1e4f4f]/50 bg-[#1e4f4f]/[0.08] text-[#1e4f4f]"
                    : "border-[#1e4f4f]/25 bg-white text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-4 rounded-xl border border-[#d4cdc3] bg-white/90 p-4">
          <p className="text-sm font-medium text-[#1f1c19]">
            <span className="text-[#1e4f4f]">{strategyTitle}</span>
            {" · "}
            {selected.label}
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">{selected.hint}</p>
          <button
            type="button"
            onClick={() => openRoute(selected)}
            disabled={
              !onOpen &&
              !(selected.chatPrompt && onAsk) &&
              !selected.section
            }
            className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
          >
            {selected.openLabel} →
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#9a8f82]">
          Pick the move that matches where you are — I&apos;ll coach you through
          it.
        </p>
      )}
    </div>
  );
}
