"use client";

import { useEffect, useState } from "react";
import {
  addXp,
  getBrainDumps,
  getProjects,
  updateBrainDump,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import { isVisibleInMentalLandscape } from "@/lib/thoughtLifecycle";
import { momentumBoostItems } from "@/lib/momentumBoosts";
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
  kind: "braindump" | "project" | "momentum-boost";
  source: Source;
  quick: boolean;
};

type ResultPhase =
  | "actions"
  | "committed"
  | "not-yet"
  | "later-ack"
  | "dismissed-ack";

const QUICK_RE =
  /\b(call|email|text|send|buy|book|schedule|reply|pay|order|message|dm|confirm|cancel|sign|submit|reach out|follow up)\b/i;

function bdSource(cat?: string): Source {
  if (!cat) return { emoji: "🧠", label: "Clear My Mind" };
  if (cat === "Health") return { emoji: "❤️", label: "Health" };
  if (["Family", "Home", "Personal Errands"].includes(cat))
    return { emoji: "🏠", label: "Personal" };
  if (["Ideas", "Brainstorm", "Someday / Maybe", "Follow Up"].includes(cat))
    return { emoji: "🧠", label: "Clear My Mind" };
  return { emoji: "💼", label: "Business" };
}

function poolFromBd(e: BrainDumpEntry): PoolItem {
  const isProject = !!e.projectId || (e.estimateMin ?? 0) > 20;
  const quick = isProject
    ? false
    : (e.estimateMin ?? 0) > 0 || QUICK_RE.test(e.text) || e.text.length < 60;
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

const btnPrimary =
  "rounded-xl bg-[#1e4f4f] px-5 py-3.5 text-lg font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]";
const btnSecondary =
  "rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]";

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
  const [resultPhase, setResultPhase] = useState<ResultPhase>("actions");
  const [celebrating, setCelebrating] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const bd = getBrainDumps().filter(isVisibleInMentalLandscape);
    const thisWeek = bd.filter(
      (e) => e.schedulingIntent === "today" || e.schedulingIntent === "week",
    );
    const recent = bd.filter((e) => withinDays(e.createdAt, 7));
    const dumps = (thisWeek.length ? thisWeek : recent).map(poolFromBd);

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

    const boosts = shuffle(momentumBoostItems())
      .slice(0, 3)
      .map(
        (d): PoolItem => ({
          id: d.id,
          text: d.text,
          kind: "momentum-boost",
          source: { emoji: "⚡", label: "Momentum Boost" },
          quick: true,
        }),
      );

    setPool([...dumps, ...projItems, ...boosts]);
  }, []);

  function resetResultUi() {
    setResultPhase("actions");
    setShowPicker(false);
    setCelebrating(false);
  }

  function spin() {
    if (pool.length === 0 || spinning) return;
    unlockChime();
    const dur = playSpin();
    setResult(null);
    resetResultUi();
    setSpinning(true);
    setRotation((r) => r + 1800 + Math.floor(Math.random() * 360));
    window.setTimeout(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)]!);
      setSpinning(false);
    }, dur);
  }

  function pickFromList(item: PoolItem) {
    setResult(item);
    resetResultUi();
    setShowPicker(false);
  }

  function markDone(item: PoolItem) {
    if (item.kind === "braindump") {
      updateBrainDump(item.id, { done: true });
    }
    addXp(10);
    setResult(null);
    resetResultUi();
    setPool((p) => p.filter((x) => x.id !== item.id));
  }

  function doItNow() {
    setResultPhase("committed");
  }

  function helpMeStart(item: PoolItem) {
    onAsk?.(
      `Let's do "${item.text}" together. What's the very first tiny step? ` +
        `If it's a call, ask me for the number; if it's writing, help me with the first sentence; ` +
        `otherwise, name the smallest physical action to begin.`,
    );
  }

  function doItLater(item: PoolItem) {
    if (item.kind === "braindump") {
      updateBrainDump(item.id, { schedulingIntent: "later" });
    }
    setPool((p) => p.filter((x) => x.id !== item.id));
    setResultPhase("later-ack");
  }

  function notDoingThis(item: PoolItem) {
    setPool((p) => p.filter((x) => x.id !== item.id));
    setResultPhase("dismissed-ack");
  }

  function finishTask(item: PoolItem) {
    playChime();
    setCelebrating(true);
    window.setTimeout(() => {
      markDone(item);
    }, 1800);
  }

  function resultHint(item: PoolItem) {
    if (item.kind === "momentum-boost" || isPhysicalActionText(item.text)) {
      return "A small feel-good action — just do it.";
    }
    if (item.quick) return "This looks like a quick win.";
    return "This one's a bit bigger — but we'll start small.";
  }

  function SoftExitRow({
    item,
    includeDoLater = true,
  }: {
    item: PoolItem;
    includeDoLater?: boolean;
  }) {
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {includeDoLater ? (
          <button
            type="button"
            onClick={() => doItLater(item)}
            className={btnSecondary}
          >
            ⏰ Do it later
          </button>
        ) : null}
        {onAsk ? (
          <button
            type="button"
            onClick={() => helpMeStart(item)}
            className={btnSecondary}
          >
            🤝 Help me start
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onOpen?.("time-block")}
          className={btnSecondary}
        >
          📅 Schedule it
        </button>
        <button type="button" onClick={spin} className={btnSecondary}>
          🎡 Spin again
        </button>
        <button
          type="button"
          onClick={() => notDoingThis(item)}
          className={btnSecondary}
        >
          🗑️ Not doing this
        </button>
      </div>
    );
  }

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
      ) : showPicker ? (
        <div className="companion-fade-in mt-8 w-full text-left">
          <p className="text-center text-base font-semibold text-[#1f1c19]">
            Choose from your list
          </p>
          <p className="mt-1 text-center text-sm text-[#6b635a]">
            Pick something that feels doable right now.
          </p>
          <ul className="mt-4 flex max-h-[min(24rem,50vh)] flex-col gap-2 overflow-y-auto">
            {pool.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => pickFromList(item)}
                  className="flex w-full items-start gap-3 rounded-2xl border border-[#d4cdc3] bg-white/85 px-3.5 py-3 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/35 hover:bg-white"
                >
                  <span className="text-sm">
                    {item.source.emoji} {item.source.label}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-[#1f1c19]">
                    {item.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={spin} className={btnSecondary}>
              🎡 Spin instead
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className={btnSecondary}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
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
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#4b463f]">
                {result.source.emoji} {result.source.label}
              </span>
              <p className="mt-3 text-xl font-semibold text-[#1f1c19]">
                {result.text}
              </p>

              {celebrating ? (
                <div className="companion-fade-in mt-4 text-center">
                  <p className="text-3xl">🎉 ✨ 🌟</p>
                  <p className="mt-2 text-lg font-semibold text-[#1e4f4f]">
                    One small step is enough.
                  </p>
                </div>
              ) : resultPhase === "later-ack" ? (
                <div className="companion-fade-in mt-4">
                  <p className="text-base text-[#2d2926]">
                    No problem. I&apos;ll keep it here for later.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={spin} className={btnSecondary}>
                      🎡 Spin again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        resetResultUi();
                      }}
                      className={btnSecondary}
                    >
                      Done for now
                    </button>
                  </div>
                </div>
              ) : resultPhase === "dismissed-ack" ? (
                <div className="companion-fade-in mt-4">
                  <p className="text-base text-[#2d2926]">
                    That&apos;s okay. Let&apos;s find something that feels easier.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={spin} className={btnSecondary}>
                      🎡 Spin again
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPicker(true)}
                      className={btnSecondary}
                    >
                      Choose from list
                    </button>
                  </div>
                </div>
              ) : resultPhase === "committed" ? (
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
                      className={btnSecondary}
                    >
                      ✅ Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setResultPhase("not-yet")}
                      className={btnSecondary}
                    >
                      Not yet
                    </button>
                  </div>
                </>
              ) : resultPhase === "not-yet" ? (
                <div className="companion-fade-in mt-4">
                  <p className="text-base text-[#2d2926]">
                    Okay — no pressure. Want to do it later or pick something
                    else?
                  </p>
                  <div className="mt-4">
                    <SoftExitRow item={result} />
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-sm text-[#6b635a]">
                    {resultHint(result)}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[#4b463f]">
                    What&apos;s your move?
                  </p>
                  <div className="mt-3 flex flex-col items-stretch gap-3">
                    <button
                      type="button"
                      onClick={doItNow}
                      className={btnPrimary}
                    >
                      ✅ I&apos;ll do it now
                    </button>
                    <SoftExitRow item={result} />
                  </div>

                  {!result.quick &&
                    result.kind !== "momentum-boost" &&
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
