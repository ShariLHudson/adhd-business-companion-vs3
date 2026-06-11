"use client";

import { useEffect, useState } from "react";
import {
  addXp,
  getBrainDumps,
  getProjects,
  getXp,
  updateBrainDump,
} from "@/lib/companionStore";
import { playSpin, unlockChime } from "@/lib/chime";
import type { AppSection } from "@/lib/companionUi";

function withinDays(iso: string, days: number) {
  return Date.now() - new Date(iso).getTime() < days * 86400000;
}

type PoolItem = { id: string; text: string; kind: "braindump" | "project" };

// Spin the Wheel — a sound-driven commitment engine. It picks ONE eligible
// action from the next 7 days (Brain Dump items + active project next actions)
// and immediately converts it into execution. One spin = one commitment.
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
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const dumps = getBrainDumps()
      .filter(
        (e) =>
          !e.done &&
          (e.schedulingIntent === "today" ||
            e.schedulingIntent === "week" ||
            withinDays(e.createdAt, 7)),
      )
      .map((e): PoolItem => ({ id: e.id, text: e.text, kind: "braindump" }));
    const projItems = getProjects()
      .filter(
        (p) =>
          p.horizon === "now" &&
          p.status !== "completed" &&
          p.nextAction.trim(),
      )
      .map((p): PoolItem => ({ id: p.id, text: p.nextAction, kind: "project" }));
    setPool([...dumps, ...projItems]);
    setXp(getXp());
  }, []);

  function spin() {
    if (pool.length === 0 || spinning) return;
    unlockChime();
    const dur = playSpin();
    setResult(null);
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
    setXp(addXp(10));
    setResult(null);
    setPool((p) => p.filter((x) => x.id !== item.id));
  }

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col items-center px-6 py-10 text-center">
      <div className="flex w-full items-center justify-between">
        <p className="text-2xl font-semibold text-[#1f1c19]">Spin the Wheel</p>
        <span className="rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-sm font-semibold text-[#1e4f4f]">
          {xp} XP
        </span>
      </div>
      <p className="mt-1 text-base text-[#6b635a]">
        The wheel picks a real item from your Brain Dump + Projects (next 0–10
        days), then helps you commit instantly.
      </p>

      {pool.length === 0 ? (
        <p className="mt-12 text-base text-[#6b635a]">
          Nothing eligible yet. Tag Brain Dump items &ldquo;This week,&rdquo; or
          give an active project a next action.
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
            <div className="companion-fade-in mt-8 w-full rounded-2xl border-2 border-[#1e4f4f] bg-[#1e4f4f]/[0.06] p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
                Do this now
              </p>
              <p className="mt-2 text-xl font-semibold text-[#1f1c19]">
                {result.text}
              </p>
              {/* ADHD default: DO first → THINK second → SCHEDULE last */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpen?.("focus-timer")}
                  className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
                >
                  ▶ Start Focus
                </button>
                {onAsk && (
                  <button
                    type="button"
                    onClick={() =>
                      onAsk(
                        `Break "${result.text}" into the smallest first step.`,
                      )
                    }
                    className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
                  >
                    🔨 Break it down
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpen?.("time-block")}
                  className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
                >
                  ⏱ Time Block
                </button>
                <button
                  type="button"
                  onClick={() => markDone(result)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                >
                  ✓ Done
                </button>
              </div>
              <p className="mt-3 text-xs text-[#9a8f82]">
                ✓ One spin, one commitment. You don&apos;t need to decide — just
                start.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
