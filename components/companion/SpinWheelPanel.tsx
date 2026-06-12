"use client";

import { useEffect, useState } from "react";
import {
  addXp,
  getBrainDumps,
  getProjects,
  updateBrainDump,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import { dopamineHitItems } from "@/lib/dopamineHits";
import { isPhysicalActionText } from "@/lib/doItNowActions";
import { playChime, playSpin, unlockChime } from "@/lib/chime";
import type { AppSection } from "@/lib/companionUi";

function withinDays(iso: string, days: number) {
  return Date.now() - new Date(iso).getTime() < days * 86400000;
}

type Source = { emoji: string; label: string };
type PoolItem = {
  id: string;
  text: string;
  kind: "braindump" | "project" | "dopamine";
  source: Source;
  quick: boolean; // drives context-aware post-spin actions
};

// Quick-task signals — verbs that usually mean "a few minutes."
const QUICK_RE =
  /\b(call|email|text|send|buy|book|schedule|reply|pay|order|message|dm|confirm|cancel|sign|submit|reach out|follow up)\b/i;

// Map a Clear My Mind category to a friendly source tag.
function bdSource(cat?: string): Source {
  if (!cat) return { emoji: "🧠", label: "Clear My Mind" };
  if (cat === "Health") return { emoji: "❤️", label: "Health" };
  if (["Family", "Home", "Personal Errands"].includes(cat))
    return { emoji: "🏠", label: "Personal" };
  if (["Ideas", "Brainstorm", "Someday / Maybe", "Follow Up"].includes(cat))
    return { emoji: "🧠", label: "Clear My Mind" };
  return { emoji: "💼", label: "Business" }; // all business sub-categories
}

function poolFromBd(e: BrainDumpEntry): PoolItem {
  const isProject = !!e.projectId || (e.estimateMin ?? 0) > 20;
  const quick = isProject ? false : (e.estimateMin ?? 0) > 0 || QUICK_RE.test(e.text) || e.text.length < 60;
  return {
    id: e.id,
    text: e.text,
    kind: "braindump",
    source: bdSource(e.category),
    quick: isProject ? false : quick,
  };
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Spin the Wheel — a sound-driven commitment engine. It picks ONE eligible
// action and immediately reduces resistance with context-aware next steps.
// Sources (priority): Clear My Mind (this week) → Project next actions →
// Dopamine Hits. Momentum can come from a small enjoyable action too.
export function SpinWheelPanel({
  onOpen,
  onAsk,
}: {
  onOpen?: (s: AppSection) => void;
  onAsk?: (prompt: string) => void;
}) {
  const [pool, setPool] = useState<PoolItem[]>([]);
  const [result, setResult] = useState<PoolItem | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const bd = getBrainDumps().filter((e) => !e.done);
    // 1) Clear My Mind items tagged for this week; fall back to recent captures.
    const thisWeek = bd.filter(
      (e) => e.schedulingIntent === "today" || e.schedulingIntent === "week",
    );
    const recent = bd.filter((e) => withinDays(e.createdAt, 7));
    const dumps = (thisWeek.length ? thisWeek : recent).map(poolFromBd);

    // 2) Project next actions (active, in-focus).
    const projItems = getProjects()
      .filter(
        (p) => p.horizon === "now" && p.status !== "completed" && p.nextAction.trim(),
      )
      .map(
        (p): PoolItem => ({
          id: p.id,
          text: p.nextAction,
          kind: "project",
          source: { emoji: "💼", label: "Project" },
          quick: false,
        }),
      );

    // 3) A few Dopamine Hits so the wheel isn't only work.
    const dopa = shuffle(dopamineHitItems())
      .slice(0, 3)
      .map(
        (d): PoolItem => ({
          id: d.id,
          text: d.text,
          kind: "dopamine",
          source: { emoji: "⚡", label: "Dopamine Hit" },
          quick: true,
        }),
      );

    setPool([...dumps, ...projItems, ...dopa]);
  }, []);

  function spin() {
    if (pool.length === 0 || spinning) return;
    unlockChime();
    const dur = playSpin();
    setResult(null);
    setWaiting(false);
    setSpinning(true);
    setRotation((r) => r + 1800 + Math.floor(Math.random() * 360));
    window.setTimeout(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)]!);
      setSpinning(false);
    }, dur);
  }

  function markDone(item: PoolItem) {
    if (item.kind === "braindump") {
      updateBrainDump(item.id, { done: true });
    }
    addXp(10); // internal momentum only — no visible score
    setResult(null);
    setPool((p) => p.filter((x) => x.id !== item.id));
  }

  // "I'll do it now" — commit, encourage, and wait for their return.
  function doItNow() {
    setWaiting(true);
  }

  // "Help me start" — hand the task to Shari for a tiny first-step coaching turn.
  function helpMeStart(item: PoolItem) {
    onAsk?.(
      `Let's do "${item.text}" together. What's the very first tiny step? ` +
        `If it's a call, ask me for the number; if it's writing, help me with the first sentence; ` +
        `otherwise, name the smallest physical action to begin.`,
    );
  }

  // They came back and finished — soft success tone, a beat of celebration,
  // then clear the item and offer another spin.
  function finishTask(item: PoolItem) {
    playChime();
    setCelebrating(true);
    window.setTimeout(() => {
      setCelebrating(false);
      setWaiting(false);
      markDone(item);
    }, 1800);
  }

  const btnPrimary =
    "rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]";
  const btnSecondary =
    "rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]";
  const btnGhost =
    "rounded-lg px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10";

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col items-center px-6 py-10 text-center">
      <p className="text-2xl font-semibold text-[#1f1c19]">Spin the Wheel</p>
      <p className="mt-1 text-base text-[#6b635a]">
        The wheel picks one real item — from Clear My Mind, your projects, or a
        small feel-good action — then helps you start without deciding.
      </p>

      {pool.length === 0 ? (
        <p className="mt-12 text-base text-[#6b635a]">
          Nothing eligible yet. Tag a Clear My Mind item &ldquo;This week,&rdquo;
          or give an active project a next action.
        </p>
      ) : (
        <>
          {/* Wheel */}
          <div className="relative mt-8 h-56 w-56">
            <div
              className="absolute left-1/2 top-[-4px] z-10 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "16px solid #1e4f4f",
              }}
              aria-hidden="true"
            />
            <div
              className="h-56 w-56 rounded-full border-4 border-white shadow-xl"
              style={{
                background:
                  "conic-gradient(#1e4f4f 0 60deg, #9a6fb0 60deg 120deg, #c08a3e 120deg 180deg, #4a6fa5 180deg 240deg, #6b8e23 240deg 300deg, #a85c4a 300deg 360deg)",
                transform: `rotate(${rotation}deg)`,
                transition: "transform 2.5s cubic-bezier(0.17, 0.67, 0.21, 0.99)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl">
              🎯
            </div>
          </div>

          {!result ? (
            <button
              type="button"
              onClick={spin}
              disabled={spinning}
              className="mt-8 rounded-2xl bg-[#1e4f4f] px-10 py-4 text-xl font-semibold text-white shadow-md hover:bg-[#163a3a] disabled:opacity-60"
            >
              {spinning ? "Spinning…" : "🎡 Spin"}
            </button>
          ) : (
            <div
              className={`companion-fade-in mt-8 w-full rounded-2xl border-2 border-[#1e4f4f] bg-[#1e4f4f]/[0.06] p-6 transition-transform duration-300 ${
                celebrating ? "scale-[1.03]" : ""
              }`}
            >
              {/* Source tag — where this came from */}
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#4b463f]">
                {result.source.emoji} {result.source.label}
              </span>
              <p className="mt-3 text-xl font-semibold text-[#1f1c19]">
                {result.text}
              </p>

              {celebrating ? (
                /* Finished — soft celebration, then the wheel offers another. */
                <div className="companion-fade-in mt-4 text-center">
                  <p className="text-3xl">🎉 ✨ 🌟</p>
                  <p className="mt-2 text-lg font-semibold text-[#1e4f4f]">
                    One small step is enough.
                  </p>
                </div>
              ) : waiting ? (
                /* They committed — encourage, then ask if they finished. */
                <>
                  <p className="mt-3 text-base text-[#2d2926]">
                    Perfect. Go do it. I&apos;ll be here when you&apos;re back.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[#6b635a]">
                    Did you finish it?
                  </p>
                  <div className="mt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => finishTask(result)}
                      className={btnPrimary}
                    >
                      ✅ Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaiting(false)}
                      className={btnGhost}
                    >
                      Not yet
                    </button>
                  </div>
                </>
              ) : (
                /* The whole job: remove choosing. Do it / Help / Schedule. */
                <>
                  <p className="mt-2 text-sm text-[#6b635a]">
                    {result.kind === "dopamine" ||
                    isPhysicalActionText(result.text)
                      ? "A small feel-good action — just do it."
                      : result.quick
                        ? "This looks like a quick win."
                        : "This one's a bit bigger — but we'll start small."}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[#4b463f]">
                    What&apos;s your move?
                  </p>
                  <div className="mt-3 flex flex-col items-stretch gap-2">
                    <button
                      type="button"
                      onClick={doItNow}
                      className="rounded-xl bg-[#1e4f4f] px-5 py-3.5 text-lg font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]"
                    >
                      ✅ I&apos;ll do it now
                    </button>
                    <div className="flex flex-wrap justify-center gap-2">
                      {onAsk && (
                        <button
                          type="button"
                          onClick={() => helpMeStart(result)}
                          className={btnSecondary}
                        >
                          🤝 Help me start
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpen?.("time-block")}
                        className={btnSecondary}
                      >
                        📅 Schedule it
                      </button>
                    </div>
                  </div>

                  {/* Focus session is not a primary choice — only offered when a
                      task is big enough to benefit from it. */}
                  {!result.quick &&
                    result.kind !== "dopamine" &&
                    !isPhysicalActionText(result.text) && (
                      <div className="mt-4 border-t border-[#1e4f4f]/15 pt-3">
                        <p className="text-xs text-[#6b635a]">
                          Need help staying focused?
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpen?.("focus-timer")}
                          className="mt-1 rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                        >
                          ⏱ Start focus session
                        </button>
                      </div>
                    )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
