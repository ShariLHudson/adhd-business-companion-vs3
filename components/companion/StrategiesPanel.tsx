"use client";

import { useEffect, useState } from "react";
import {
  STRATEGY_CATEGORIES,
  getCategory,
  getStrategy,
  recommendedFor,
  strategiesFor,
  type Strategy,
} from "@/lib/strategySystem";
import { getPrefs, saveProject } from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";

type View =
  | { v: "categories" }
  | { v: "category"; catId: string; all: boolean }
  | { v: "strategy"; stratId: string };

// Meaning hue → brighter decorative counterpart (matches the rest of the app).
const DECOR: Record<string, string> = {
  "#1e4f4f": "#0d9488",
  "#9a6fb0": "#a855f7",
  "#4a6fa5": "#3b82f6",
  "#2f4f7a": "#6366f1",
  "#c08a3e": "#f59e0b",
  "#a85c4a": "#ef4444",
  "#6b8e23": "#22c55e",
};

// Category → Strategy → Action. ADHD-friendly: never more than 3 meaningful
// choices on screen. Categories are navigation; strategies are action-first.
export function StrategiesPanel({
  onOpen,
  onAsk,
  registerBack,
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [view, setView] = useState<View>({ v: "categories" });
  const visualMode = getPrefs().visualMode;
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";

  // Global Back steps inward-first: strategy → category → categories → exit.
  useEffect(() => {
    registerBack?.(() => {
      if (view.v === "strategy") {
        const s = getStrategy(view.stratId);
        setView(
          s ? { v: "category", catId: s.categoryId, all: false } : { v: "categories" },
        );
        return true;
      }
      if (view.v === "category") {
        setView({ v: "categories" });
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [view, registerBack]);

  function accent(color: string) {
    return decorative ? (DECOR[color] ?? color) : color;
  }
  function tint(color: string) {
    const c = accent(color);
    return colorOn
      ? {
          borderLeftWidth: 5,
          borderLeftColor: c,
          ...(decorative ? { backgroundColor: `${c}14` } : {}),
        }
      : undefined;
  }

  // ---- Category grid ------------------------------------------------------
  if (view.v === "categories") {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
        <p className="text-2xl font-semibold text-[#1f1c19]">Strategies</p>
        <p className="mt-1 text-base text-[#6b635a]">
          What&apos;s your problem area right now? Pick one — I&apos;ll show a
          couple of moves.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {STRATEGY_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setView({ v: "category", catId: c.id, all: false })}
              style={tint(c.color)}
              className="flex items-start gap-3 rounded-2xl border border-[#1e4f4f]/20 bg-white/85 p-4 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
            >
              <span aria-hidden="true" className="text-2xl">
                {c.emoji}
              </span>
              <span>
                <span className="block text-base font-semibold text-[#1f1c19]">
                  {c.label}
                </span>
                <span className="mt-0.5 block text-sm text-[#6b635a]">
                  {c.blurb}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Category page (2–3 recommended + browse all) -----------------------
  if (view.v === "category") {
    const cat = getCategory(view.catId);
    if (!cat) {
      setView({ v: "categories" });
      return null;
    }
    const list = view.all ? strategiesFor(cat.id) : recommendedFor(cat.id);
    const total = strategiesFor(cat.id).length;

    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "categories" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ All areas
        </button>
        <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#1f1c19]">
          <span aria-hidden="true">{cat.emoji}</span>
          {cat.label}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          {view.all ? "Every strategy here." : "A couple of moves that fit."}
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {list.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setView({ v: "strategy", stratId: s.id })}
                style={tint(cat.color)}
                className="w-full rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
              >
                <span className="block text-base font-semibold text-[#1f1c19]">
                  {s.title}
                </span>
                <span className="mt-0.5 block text-sm text-[#6b635a]">
                  {s.problem}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {!view.all && total > list.length && (
          <button
            type="button"
            onClick={() => setView({ v: "category", catId: cat.id, all: true })}
            className="mt-4 self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
          >
            Browse all {total} strategies →
          </button>
        )}
      </div>
    );
  }

  // ---- Strategy detail ----------------------------------------------------
  const s: Strategy | undefined = getStrategy(view.stratId);
  if (!s) {
    setView({ v: "categories" });
    return null;
  }
  const cat = getCategory(s.categoryId);

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <button
        type="button"
        onClick={() =>
          setView({ v: "category", catId: s.categoryId, all: false })
        }
        className="self-start text-sm font-semibold text-[#1e4f4f]"
      >
        ‹ {cat?.label ?? "Back"}
      </button>

      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{s.title}</p>
      <p className="mt-1 text-base text-[#6b635a]">{s.problem}</p>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        When to use it
      </p>
      <p className="mt-1 text-base text-[#2d2926]">{s.whenToUse}</p>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        Do this
      </p>
      <ol className="mt-2 flex flex-col gap-2">
        {s.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: accent(cat?.color ?? "#1e4f4f") }}
            >
              {i + 1}
            </span>
            <span className="text-base leading-relaxed text-[#1f1c19]">
              {step}
            </span>
          </li>
        ))}
      </ol>

      {/* Execution layer — ALWAYS the same structure. A strategy never ends
          without a destination. */}
      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        Take it somewhere
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onOpen?.("focus-timer")}
          className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
        >
          ▶ Start now
        </button>
        <button
          type="button"
          onClick={() => onOpen?.("time-block")}
          className="rounded-xl border border-[#1e4f4f]/40 bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f]"
        >
          ⏱ Time block
        </button>
        {onAsk && (
          <button
            type="button"
            onClick={() =>
              onAsk(
                `Help me apply the "${s.title}" strategy: ${s.steps[0]} What's my first move right now?`,
              )
            }
            className="rounded-xl border border-[#1e4f4f]/40 bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f]"
          >
            💬 Talk it through
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            saveProject({
              name: s.title,
              goal: s.problem,
              nextAction: s.steps[0] ?? "",
              horizon: "now",
              status: "in-progress",
            });
            onOpen?.("projects");
          }}
          className="rounded-xl border border-[#1e4f4f]/40 bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f]"
        >
          📁 Save to project
        </button>
      </div>
    </div>
  );
}
