"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  getProjects,
  getTodayMomentum,
  getWeekMomentum,
  logMomentum,
  todayStr,
  type MomentumEvent,
  type MomentumType,
  type Project,
} from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";
import { MicButton } from "./MicButton";
import {
  getTomorrowFocusForToday,
  markTomorrowFocusDone,
  type TomorrowFocusItem,
} from "@/lib/tomorrowFocus";

// Momentum is about *noticing* progress for the user — not asking them to log it.
// Calm, lightweight, emotionally rewarding. Everything is derived from real
// Companion activity. No scores, no streaks, no dashboard energy.

type Bridge = { label: string; section: AppSection };

// Warm closing observations — rotate one per day. Recognition, not metrics.
const OBSERVATIONS = [
  "You kept coming back today.",
  "Progress doesn't have to be dramatic to matter.",
  "You didn't need a perfect day to make progress.",
  "You showed up even when things felt hard.",
  "You made more progress than you probably realize.",
  "Small steps still count as steps.",
];

// Personal, optional reflection prompts — rotate across themes (Wins, Self-
// Compassion, Learning, ADHD Awareness, Gratitude). One at a time. Never homework.
const PROMPTS = [
  // Wins
  "What went better than expected today?",
  "What are you proud of today?",
  "What did you finish today?",
  // Self-compassion
  "What was hard today?",
  "What would you say to a friend who had your day?",
  "What did you survive today?",
  // Learning
  "What helped more than expected?",
  "What got in your way today?",
  "What did you learn about yourself today?",
  // ADHD awareness
  "When did your brain work best today?",
  "What helped you focus?",
  "What drained your energy today?",
  // Gratitude
  "What made you smile today?",
  "Who helped you today?",
  "What are you thankful for?",
];

// "One thing Shari noticed today…" — encouraging, observational, never judgmental.
const NOTICED_LINES = [
  "You kept showing up even when motivation wasn't there.",
  "You made progress by breaking things into smaller steps.",
  "You kept returning to what mattered.",
  "You paused before pushing harder.",
  "You made room for recovery.",
];

export function ProgressPanel({ onOpen }: { onOpen?: (s: AppSection) => void }) {
  const [events, setEvents] = useState<MomentumEvent[]>([]);
  const [week, setWeek] = useState<MomentumEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState<string | null>(null); // accordion — all collapsed
  const [moreOpen, setMoreOpen] = useState(false);
  const [fromYesterday, setFromYesterday] = useState<TomorrowFocusItem[]>([]);

  function load() {
    setEvents(getTodayMomentum());
    setWeek(getWeekMomentum());
    setProjects(getProjects());
    setFromYesterday(getTomorrowFocusForToday());
  }
  useEffect(() => {
    load();
    const onUpdate = () => setFromYesterday(getTomorrowFocusForToday());
    window.addEventListener("tomorrow-focus-updated", onUpdate);
    return () => window.removeEventListener("tomorrow-focus-updated", onUpdate);
  }, []);

  function saveReflection() {
    const t = reflection.trim();
    if (!t) return;
    logMomentum("move", `Reflection: ${t}`); // memory only — never shown as a score
    setReflection("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  // Stable per-day index for rotating copy.
  const dayIndex = Number(todayStr().replace(/-/g, "")) || 0;
  const observation = OBSERVATIONS[dayIndex % OBSERVATIONS.length];
  const prompt = PROMPTS[dayIndex % PROMPTS.length];
  const noticedLine = NOTICED_LINES[dayIndex % NOTICED_LINES.length];

  // ---- Derive today's activity from real events --------------------------
  const c = (t: MomentumType) => events.filter((e) => e.type === t).length;
  const focusStarts = events.filter(
    (e) => e.type === "start" && /focus session/i.test(e.label),
  ).length;
  const blockStarts = events.filter(
    (e) => e.type === "start" && /^started:/i.test(e.label),
  ).length;
  const breatheCount = events.filter(
    (e) => e.type === "reset" && /breath/i.test(e.label),
  ).length;
  const resetCount = c("reset") - breatheCount;
  const captures = c("capture");
  const completes = c("complete");
  const moves = c("move");
  const resilience = c("resilience");

  const touched = projects.filter(
    (p) => (p.updatedAt ?? "").slice(0, 10) === todayStr(),
  );

  const plural = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;

  const noticed: string[] = [];
  if (focusStarts)
    noticed.push(`Completed ${plural(focusStarts, "focus session", "focus sessions")}`);
  if (blockStarts)
    noticed.push(`Started ${plural(blockStarts, "time block", "time blocks")}`);
  if (completes)
    noticed.push(`Finished ${plural(completes, "thing", "things")} you set out to do`);
  if (captures)
    noticed.push(`Captured ${plural(captures, "Clear My Mind item", "Clear My Mind items")}`);
  if (breatheCount) noticed.push("Used Breathe & Reset");
  if (resetCount > 0) noticed.push("Took a reset");
  if (resilience) noticed.push("Came back after getting stuck");
  if (moves) noticed.push("Moved a project forward");
  touched.slice(0, 3).forEach((p) => noticed.push(`Worked on ${p.name}`));

  // ---- Warm snapshot line ------------------------------------------------
  const actions = focusStarts + blockStarts + completes + moves + captures;
  const snapshot = resilience
    ? "You came back after getting stuck. That takes real strength."
    : completes > 0 || actions >= 3
      ? "You're building momentum."
      : actions >= 1
        ? "You kept showing up — that counts."
        : "A fresh page. Even being here is a start.";

  // ---- Weekly observation (no counts, just patterns) ---------------------
  const weekTypeCounts = week.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  const topType = (Object.entries(weekTypeCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] ?? null) as MomentumType | null;

  const weekLine =
    topType === "capture" || topType === "reset"
      ? "One thing I noticed — things tended to move more easily after you cleared your head first."
      : topType === "start"
        ? "You often found your footing after a short focus session."
        : topType === "move"
          ? "You moved best when you stayed with one thing at a time."
          : topType === "complete"
            ? "Finishing small things seemed to keep you going this week."
            : "Small, steady actions have been adding up this week.";

  // ---- One recommended action, guided by the week's pattern --------------
  const primaryBridge: Bridge =
    topType === "capture" || topType === "reset"
      ? { label: "🧠 Clear my mind", section: "brain-dump" }
      : topType === "start"
        ? { label: "🎯 Focus session", section: "focus-timer" }
        : topType === "complete" || topType === "move"
          ? { label: "🎯 Focus session", section: "focus-timer" }
          : { label: "💬 Talk with Shari", section: "home" };

  const allBridges: Bridge[] = [
    { label: "🧠 Clear my mind", section: "brain-dump" },
    { label: "🎯 Focus session", section: "focus-timer" },
    { label: "🌿 Breathe & reset", section: "breathe" },
    { label: "💬 Talk with Shari", section: "home" },
  ];
  const otherBridges = allBridges.filter((b) => b.section !== primaryBridge.section);

  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <p className="text-2xl font-semibold text-[#1f1c19]">Momentum</p>

      {/* Momentum snapshot — the one thing always visible */}
      <div className="mt-4 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.06] p-5">
        <p className="text-lg font-bold leading-snug text-[#1f1c19]">{snapshot}</p>
        <p className="mt-2 text-base italic text-[#4b6b6b]">{observation}</p>
      </div>

      {fromYesterday.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#c9bfb0] bg-white/90 p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            You wanted to revisit these today
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {fromYesterday.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#e4ddd2] bg-[#faf6f0]/80 px-3 py-2"
              >
                <span className="text-base text-[#1f1c19]">{item.text}</span>
                <button
                  type="button"
                  onClick={() => {
                    markTomorrowFocusDone(item.id);
                    setFromYesterday(getTomorrowFocusForToday());
                  }}
                  className="shrink-0 text-sm font-semibold text-[#1e4f4f] hover:underline"
                >
                  Done
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accordion — all collapsed by default */}
      <div className="mt-5 flex flex-col gap-2.5">
        <Section
          id="noticed"
          title="What Shari noticed today"
          open={open === "noticed"}
          onToggle={() => toggle("noticed")}
        >
          {noticed.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {noticed.map((line, i) => (
                <p key={i} className="text-base text-[#2d2926]">
                  <span className="text-[#1e4f4f]">✓</span> {line}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-base text-[#6b635a]">
              Nothing here yet — that&apos;s okay. Anything you do from here counts.
            </p>
          )}
        </Section>

        {week.length > 0 && (
          <Section
            id="week"
            title="What seemed to help this week"
            open={open === "week"}
            onToggle={() => toggle("week")}
          >
            <p className="text-base leading-relaxed text-[#2d2926]">🌿 {weekLine}</p>
          </Section>
        )}

        <Section
          id="keep"
          title="Keep the momentum going"
          open={open === "keep"}
          onToggle={() => toggle("keep")}
        >
          <button
            type="button"
            onClick={() => onOpen?.(primaryBridge.section)}
            className="inline-flex items-center rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#163a3a]"
          >
            {primaryBridge.label} →
          </button>
          <button
            type="button"
            onClick={() => setMoreOpen((m) => !m)}
            className="mt-3 block text-sm font-semibold text-[#1e4f4f] hover:underline"
          >
            {moreOpen ? "Fewer options" : "More options"}
          </button>
          {moreOpen && (
            <div className="mt-2 flex flex-wrap gap-2">
              {otherBridges.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => onOpen?.(b.section)}
                  className="rounded-full border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-medium text-[#4b463f] transition-colors hover:border-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
                >
                  {b.label} →
                </button>
              ))}
            </div>
          )}
        </Section>

        <Section
          id="reflect"
          title="End of day reflection"
          open={open === "reflect"}
          onToggle={() => toggle("reflect")}
        >
          {/* One supportive observation before the prompt — never judgmental */}
          <div className="rounded-xl bg-[#1e4f4f]/[0.05] px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
              One thing Shari noticed today…
            </p>
            <p className="mt-0.5 text-base text-[#2d2926]">{noticedLine}</p>
          </div>
          <p className="mt-3 text-sm text-[#9a8f82]">
            Optional — a thought before today ends.
          </p>
          <p className="mt-2 text-base font-medium text-[#2d2926]">{prompt}</p>
          <div className="mt-2 flex gap-2">
            <input
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveReflection();
              }}
              placeholder="Optional reflection…"
              className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
            <MicButton
              onText={(t) =>
                setReflection((prev) => (prev ? `${prev} ${t}` : t))
              }
            />
            <button
              type="button"
              onClick={saveReflection}
              disabled={!reflection.trim()}
              className="shrink-0 rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {saved && (
            <p className="mt-2 text-sm font-medium text-[#1e4f4f]">
              Saved — I&apos;ll remember that. 🌿
            </p>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="overflow-hidden rounded-2xl border border-[#1e4f4f]/15 bg-white/70"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-base font-semibold text-[#2d2926]">{title}</span>
        <span className="text-[#9a8f82]">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
