"use client";

import { useEffect, useState } from "react";
import {
  getPrefs,
  getProjects,
  getTodayMomentum,
  getWeekMomentum,
  logMomentum,
  MOMENTUM_TYPE_LABEL,
  todayStr,
  type MomentumEvent,
  type MomentumType,
  type PatternAwareness,
  type Project,
} from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";

// Preset wins, grouped. Each is a one-tap "this happened today."
const WIN_GROUPS: {
  key: string;
  emoji: string;
  title: string;
  items: string[];
}[] = [
  {
    key: "showing-up",
    emoji: "🌱",
    title: "Showing up wins",
    items: ["I opened the app", "I thought about my work"],
  },
  {
    key: "action",
    emoji: "⚡",
    title: "Action wins",
    items: ["I worked on a task", "I made progress"],
  },
  {
    key: "business",
    emoji: "💼",
    title: "Business wins",
    items: ["Client work", "Content creation", "Sales actions"],
  },
];

export function ProgressPanel({ onOpen }: { onOpen?: (s: AppSection) => void }) {
  const [events, setEvents] = useState<MomentumEvent[]>([]);
  const [week, setWeek] = useState<MomentumEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pattern, setPattern] = useState<PatternAwareness>("light");
  const [winText, setWinText] = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>("showing-up");
  const [flash, setFlash] = useState<string | null>(null);

  function load() {
    setEvents(getTodayMomentum());
    setWeek(getWeekMomentum());
    setProjects(getProjects());
    setPattern(getPrefs().patternAwareness);
  }
  useEffect(() => {
    load();
  }, []);

  function logWin(text: string) {
    const t = text.trim();
    if (!t) return;
    logMomentum("move", `Win: ${t}`);
    setFlash(t);
    window.setTimeout(() => setFlash(null), 1600);
    load();
  }

  function addWin() {
    logWin(winText);
    setWinText("");
  }

  // ---- Today's momentum — one line only, no score -------------------------
  const count = (t: string) => events.filter((e) => e.type === t).length;
  const actions = count("start") + count("move") + count("complete");
  const phase =
    count("complete") > 0 || actions >= 3
      ? {
          label: "Flow",
          line: "Flow — you're in real motion today.",
        }
      : actions >= 1
        ? {
            label: "Building",
            line: "Building — you took some real steps today.",
          }
        : {
            label: "Starter",
            line: "Starter — you showed up. That's enough to build from.",
          };

  // Wins already logged today (preset taps + custom both land here).
  const loggedWins = events
    .filter((e) => e.label?.startsWith("Win:"))
    .map((e) => e.label.replace(/^Win:\s*/, ""));

  // Projects actually touched today.
  const touched = projects.filter(
    (p) => (p.updatedAt ?? "").slice(0, 10) === todayStr(),
  );

  // ---- Weekly pattern (opt-in, reflective only) ---------------------------
  const weekDays = new Set(week.map((e) => e.ts.slice(0, 10))).size;
  const typeCounts = week.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  const topType = (Object.entries(typeCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] ?? null) as MomentumType | null;
  const suggestion =
    topType === "start"
      ? "Short bursts of starting seemed to work for you — keep them small."
      : topType === "capture"
        ? "You capture a lot — try turning one capture into a single next step."
        : topType === "move"
          ? "Steady forward movement is your pattern — one project at a time fits you."
          : "Small, consistent actions are adding up. Keep them bite-sized.";

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      {/* TODAY */}
      <p className="text-2xl font-semibold text-[#1f1c19]">🟢 Today</p>

      {/* Momentum — one line, no number */}
      <div className="mt-4 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.06] p-4">
        <p className="text-sm font-semibold text-[#6b635a]">Today&apos;s momentum</p>
        <p className="mt-0.5 text-lg font-bold text-[#1f1c19]">{phase.line}</p>
      </div>

      {/* TODAY'S WINS */}
      <p className="mt-7 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Today&apos;s wins
      </p>

      {loggedWins.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {loggedWins.map((w, i) => (
            <span
              key={i}
              className="rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-sm font-medium text-[#1e4f4f]"
            >
              ✓ {w}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {WIN_GROUPS.map((g) => {
          const open = openGroup === g.key;
          return (
            <div
              key={g.key}
              className="overflow-hidden rounded-xl border border-[#d4cdc3] bg-white/85"
            >
              <button
                type="button"
                onClick={() => setOpenGroup(open ? null : g.key)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-base font-semibold text-[#1f1c19]">
                  {g.emoji} {g.title}
                </span>
                <span className="text-[#9a8f82]">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {g.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => logWin(item)}
                      className="rounded-full border border-[#c9bfb0] bg-white px-3 py-1.5 text-sm font-medium text-[#4b463f] transition-colors hover:border-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {flash && (
        <p className="mt-2 text-sm font-semibold text-[#1e4f4f]">
          Logged: {flash} 🎉
        </p>
      )}

      {/* PROJECTS YOU TOUCHED TODAY — real activity only */}
      {touched.length > 0 && (
        <>
          <p className="mt-7 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            What you worked on today
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {touched.slice(0, 6).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpen?.("projects")}
                className="rounded-xl border border-[#d4cdc3] bg-white/85 p-3 text-left transition-colors hover:bg-white"
              >
                <span className="text-base font-semibold text-[#1f1c19]">
                  {p.name}
                </span>
                {p.nextAction.trim() && (
                  <span className="mt-0.5 block text-sm text-[#6b635a]">
                    {p.nextAction}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* OPTIONAL — add a win or update */}
      <p className="mt-7 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Add a win or update
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={winText}
          onChange={(e) => setWinText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addWin();
          }}
          placeholder="Anything that happened today…"
          className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
        <button
          type="button"
          onClick={addWin}
          disabled={!winText.trim()}
          className="shrink-0 rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
        >
          ➕ Add
        </button>
      </div>

      {/* Weekly pattern — opt-in, reflective (kept below the fold) */}
      {pattern !== "off" && week.length > 0 && (
        <div className="mt-8 rounded-2xl border border-[#1e4f4f]/15 bg-white/70 p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            This week — what moved you forward
          </p>
          <p className="mt-2 text-base text-[#2d2926]">
            🌿 You had movement on{" "}
            <span className="font-semibold">{weekDays} of the last 7 days</span>
            {topType && (
              <>
                , mostly through{" "}
                <span className="font-semibold">
                  {MOMENTUM_TYPE_LABEL[topType]}
                </span>
              </>
            )}
            .
          </p>
          {(pattern === "guided" || pattern === "active") && (
            <p className="mt-2 text-base text-[#1e4f4f]">💡 {suggestion}</p>
          )}
          <p className="mt-2 text-xs text-[#9a8f82]">
            No scores, no comparison — just what tended to help. Change this in
            Settings → Pattern awareness.
          </p>
        </div>
      )}
    </div>
  );
}
