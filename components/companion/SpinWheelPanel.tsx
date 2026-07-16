"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  playChime,
  playDecisionResultChime,
  playSpin,
  unlockChime,
} from "@/lib/chime";
import type { AppSection } from "@/lib/companionUi";
import { SpinWheelDecisionRoomShell } from "@/components/companion/SpinWheelDecisionRoomShell";
import {
  decisionWheelConicGradient,
  isSpinWheelSoundEnabled,
  prefersReducedMotion,
  setSpinWheelSoundEnabled,
} from "@/lib/spinWheel/decisionRoom";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";

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
  if (!cat) return { emoji: "·", label: "Clear My Mind" };
  if (cat === "Health") return { emoji: "·", label: "Health" };
  if (["Family", "Home", "Personal Errands"].includes(cat))
    return { emoji: "·", label: "Personal" };
  if (["Ideas", "Brainstorm", "Someday / Maybe", "Follow Up"].includes(cat))
    return { emoji: "·", label: "Clear My Mind" };
  return { emoji: "·", label: "Business" };
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

function shortLabel(text: string, max = 18): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

const btnPrimary =
  "rounded-xl bg-[#1e4f4f] px-5 py-3.5 text-lg font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]";
const btnSecondary =
  "rounded-xl border border-[#1e4f4f]/40 bg-white/90 px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]";

export function SpinWheelPanel({
  onOpen,
  onAsk,
  onBack,
  autoSpinWhenReady = false,
  onAutoSpinStarted,
}: {
  onOpen?: (s: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onBack?: () => void;
  autoSpinWhenReady?: boolean;
  onAutoSpinStarted?: () => void;
}) {
  const [pool, setPool] = useState<PoolItem[]>([]);
  const [result, setResult] = useState<PoolItem | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultPhase, setResultPhase] = useState<ResultPhase>("actions");
  const [celebrating, setCelebrating] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [winnerGlow, setWinnerGlow] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const autoSpinStartedRef = useRef(false);

  useEffect(() => {
    setSoundOn(isSpinWheelSoundEnabled());
    setReducedMotion(prefersReducedMotion());
  }, []);

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
          source: { emoji: "·", label: "Project" },
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
          source: { emoji: "·", label: "Momentum Boost" },
          quick: true,
        }),
      );

    setPool([...dumps, ...projItems, ...boosts]);
  }, []);

  function resetResultUi() {
    setResultPhase("actions");
    setShowPicker(false);
    setCelebrating(false);
    setWinnerGlow(false);
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSpinWheelSoundEnabled(next);
    if (next) unlockChime();
  }

  function spin() {
    if (pool.length === 0 || spinning) return;
    unlockChime();
    const reduced = reducedMotion || prefersReducedMotion();
    const dur = soundOn ? playSpin() : reduced ? 200 : 2600;
    setResult(null);
    resetResultUi();
    setSpinning(true);
    if (reduced) {
      setRotation((r) => r + 40);
    } else {
      setRotation((r) => r + 1800 + Math.floor(Math.random() * 360));
    }
    window.setTimeout(() => {
      const picked = pool[Math.floor(Math.random() * pool.length)]!;
      setResult(picked);
      setSpinning(false);
      setWinnerGlow(true);
      if (soundOn) playDecisionResultChime();
      window.setTimeout(() => setWinnerGlow(false), reduced ? 0 : 1600);
    }, reduced ? 200 : dur);
  }

  useEffect(() => {
    if (!autoSpinWhenReady) {
      autoSpinStartedRef.current = false;
      return;
    }
    if (autoSpinStartedRef.current || pool.length === 0) return;
    autoSpinStartedRef.current = true;
    spin();
    onAutoSpinStarted?.();
  }, [autoSpinWhenReady, pool.length, onAutoSpinStarted]);

  function pickFromList(item: PoolItem) {
    setResult(item);
    resetResultUi();
    setShowPicker(false);
    setWinnerGlow(true);
    if (soundOn) playDecisionResultChime();
    window.setTimeout(() => setWinnerGlow(false), 1200);
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
    if (soundOn) playChime();
    setCelebrating(true);
    window.setTimeout(() => {
      markDone(item);
    }, 1800);
  }

  function clearChoices() {
    if (spinning) return;
    setPool([]);
    setResult(null);
    resetResultUi();
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
            Do it later
          </button>
        ) : null}
        {onAsk ? (
          <button
            type="button"
            onClick={() => helpMeStart(item)}
            className={btnSecondary}
          >
            Help me start
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onOpen?.("time-block")}
          className={btnSecondary}
        >
          Schedule it
        </button>
        <button type="button" onClick={spin} className={btnSecondary}>
          Spin Again
        </button>
        <button
          type="button"
          onClick={() => notDoingThis(item)}
          className={btnSecondary}
        >
          Not doing this
        </button>
      </div>
    );
  }

  const segmentCount = Math.max(pool.length, 6);
  const wheelGradient = decisionWheelConicGradient(segmentCount);
  const labelItems = pool.slice(0, Math.min(pool.length, 8));

  return (
    <SpinWheelDecisionRoomShell>
      <div
        className="companion-fade-in flex flex-col px-5 py-6 text-center md:px-8 md:py-8"
        data-testid="spin-wheel-panel"
      >
        {onBack ? (
          <div className="mb-3 text-left">
            <button
              type="button"
              className="plan-day-morning-note__previous"
              onClick={onBack}
              data-testid="app-back-button"
              aria-label="Previous Screen"
            >
              <span aria-hidden="true">←</span>
              <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
            </button>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="text-left">
            <p className="font-serif text-3xl font-semibold text-[#1f1c19]">
              Decision Room
            </p>
            <p className="mt-1 text-base text-[#6b635a]">
              Let the wheel choose one real next step — then begin without
              second-guessing.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            className={btnSecondary}
            aria-pressed={soundOn}
            data-testid="spin-wheel-sound-toggle"
          >
            {soundOn ? "Sound On" : "Sound Off"}
          </button>
        </div>

        {pool.length === 0 ? (
          <div className="mt-10">
            <p className="text-base text-[#6b635a]">
              Nothing eligible yet. Tag a Clear My Mind item &ldquo;This
              week,&rdquo; or give an active project a next action.
            </p>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className={`${btnPrimary} mt-6`}
              data-testid="spin-wheel-add-choice"
            >
              Add Choice
            </button>
          </div>
        ) : showPicker ? (
          <div className="companion-fade-in mt-6 w-full text-left">
            <p className="text-center text-base font-semibold text-[#1f1c19]">
              Add Choice
            </p>
            <p className="mt-1 text-center text-sm text-[#6b635a]">
              Choose something from your list to use as the decision.
            </p>
            <ul className="mt-4 flex max-h-[min(24rem,50vh)] flex-col gap-2 overflow-y-auto">
              {pool.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => pickFromList(item)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-[#d4cdc3] bg-white/90 px-3.5 py-3 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/35 hover:bg-white"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
                      {item.source.label}
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
                Spin instead
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
            <div
              className="decision-wheel mt-8"
              data-testid="decision-wheel"
              aria-hidden={spinning ? true : undefined}
            >
              <div className="decision-wheel__pointer" aria-hidden="true" />
              <div className="decision-wheel__rim">
                <div
                  className={`decision-wheel__face ${
                    reducedMotion ? "decision-wheel__face--reduced" : ""
                  } ${winnerGlow ? "decision-wheel__face--winner" : ""}`}
                  style={{
                    background: wheelGradient,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {labelItems.length > 0 ? (
                    <div className="decision-wheel__labels" aria-hidden="true">
                      {labelItems.map((item, i) => {
                        const angle =
                          (360 / Math.max(labelItems.length, 1)) * i;
                        return (
                          <span
                            key={item.id}
                            className="decision-wheel__label"
                            style={{
                              transform: `rotate(${angle}deg) translateY(-4.35rem)`,
                            }}
                          >
                            {shortLabel(item.text, 14)}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="decision-wheel__hub" aria-hidden="true">
                Spark
              </div>
              <div className="decision-wheel__pedestal" aria-hidden="true" />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className={btnSecondary}
                data-testid="spin-wheel-add-choice"
              >
                Add Choice
              </button>
              <button
                type="button"
                onClick={clearChoices}
                className={btnSecondary}
                data-testid="spin-wheel-clear-choices"
              >
                Clear Choices
              </button>
            </div>

            {!result ? (
              <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className={`${btnPrimary} mt-5 px-12`}
                data-testid="spin-wheel-spin"
              >
                {spinning ? "Spinning…" : "Spin"}
              </button>
            ) : (
              <div
                className={`companion-fade-in mt-6 w-full rounded-2xl border-2 border-[#1e4f4f]/55 bg-white/90 p-6 transition-transform duration-300 ${
                  celebrating || winnerGlow ? "scale-[1.02]" : ""
                }`}
                role="status"
                aria-live="polite"
                data-testid="spin-wheel-result"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
                  The wheel chose
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-xs font-semibold text-[#1e4f4f]">
                  {result.source.label}
                </span>
                <p className="mt-3 font-serif text-2xl font-semibold text-[#1f1c19]">
                  {result.text}
                </p>

                {celebrating ? (
                  <div className="companion-fade-in mt-4 text-center">
                    <p className="text-lg font-semibold text-[#1e4f4f]">
                      One small step is enough.
                    </p>
                  </div>
                ) : resultPhase === "later-ack" ? (
                  <div className="companion-fade-in mt-4">
                    <p className="text-base text-[#2d2926]">
                      No problem. I&apos;ll keep it here for later.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={spin}
                        className={btnSecondary}
                      >
                        Spin Again
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
                      That&apos;s okay. Let&apos;s find something that feels
                      easier.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={spin}
                        className={btnSecondary}
                      >
                        Spin Again
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPicker(true)}
                        className={btnSecondary}
                      >
                        Add Choice
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
                        Yes
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
                        data-testid="spin-wheel-use-choice"
                      >
                        Use This Choice
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
                            className="mt-1 rounded-xl border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                          >
                            Start focus session
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
    </SpinWheelDecisionRoomShell>
  );
}
