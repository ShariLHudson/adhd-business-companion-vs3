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
  onStartStrategyApply,
}: {
  strategyTitle: string;
  strategyId?: string;
  categoryId?: string;
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  /** Guided coach flow — preferred when available. */
  onStartStrategyApply?: (strategyId: string) => void;
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
  const activeOption: StrategyApplyOption | null =
    options.find((o) => o.id === (selectedId ?? suggestedId)) ?? options[0] ?? null;

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

  function useStrategy() {
    if (onStartStrategyApply && strategyId) {
      onStartStrategyApply(strategyId);
      return;
    }
    if (activeOption) {
      openRoute(activeOption);
    }
  }

  const canUse =
    Boolean(onStartStrategyApply && strategyId) ||
    Boolean(activeOption && (onAsk || activeOption.section));

  return (
    <div className="mt-8 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] p-4">
      <p className="text-base font-semibold text-[#1f1c19]">Use this strategy</p>
      {activeProjectName ? (
        <p className="mt-1 text-xs text-[#9a8f82]">
          Current focus: {activeProjectName} — we&apos;ll weave it in only if it
          fits.
        </p>
      ) : null}

      <button
        type="button"
        onClick={useStrategy}
        disabled={!canUse}
        className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
      >
        Use this strategy →
      </button>

      {options.length > 1 ? (
        <>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Or choose a different move
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((opt) => {
              const active = (selectedId ?? suggestedId) === opt.id;
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
          {activeOption && selectedId ? (
            <p className="mt-2 text-sm text-[#6b635a]">{activeOption.hint}</p>
          ) : null}
        </>
      ) : activeOption ? (
        <p className="mt-2 text-sm text-[#6b635a]">{activeOption.hint}</p>
      ) : null}
    </div>
  );
}
