"use client";

import { useEffect, useState } from "react";
import {
  getBusinessProfile,
  saveBusinessProfile,
} from "@/lib/companionStore";

const ROLES = [
  "Coach",
  "Consultant",
  "Creator",
  "Service provider",
  "Business owner",
  "Product seller",
];
const GOALS = [
  "Get more clients",
  "Make consistent income",
  "Grow my audience",
  "Improve focus & productivity",
  "Launch an offer",
  "Organize business systems",
  "Reduce overwhelm",
];
const TRAITS = [
  "Overwhelmed easily",
  "Very busy",
  "Beginner level",
  "Experienced but stuck",
  "Impulsive decision maker",
  "Slow researcher",
  "Likes structure",
  "Hates structure",
];
const TONES = [
  "Friendly",
  "Professional",
  "Warm",
  "Direct",
  "Playful",
  "Simple / ADHD-friendly",
];

const LAST_STEP = 7;

// ADHD-simple, one-question-per-screen. Everything is skippable, always
// editable, and saves as you go.
export function BusinessProfilePanel({
  onDone,
  onOpenAvatars,
}: {
  onDone?: () => void;
  onOpenAvatars?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [sells, setSells] = useState("");
  const [idealClient, setIdealClient] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [customGoal, setCustomGoal] = useState("");

  // Client research now lives only in Client Avatars (single source of truth).

  useEffect(() => {
    const p = getBusinessProfile();
    if (p) {
      setRole(p.role);
      setGoals(p.goals);
      setSells(p.sells);
      setIdealClient(p.idealClient);
      setTraits(p.traits);
      setTone(p.tone);
      if (p.role || p.sells || p.idealClient) setStep(1); // returning → edit
    }
  }, []);

  function persist() {
    saveBusinessProfile({ role, goals, sells, idealClient, traits, tone });
  }
  function next() {
    persist();
    if (step >= LAST_STEP) onDone?.();
    else setStep((s) => s + 1);
  }
  function skip() {
    if (step >= LAST_STEP) onDone?.();
    else setStep((s) => s + 1);
  }
  function toggle(
    list: string[],
    set: (v: string[]) => void,
    value: string,
    max?: number,
  ) {
    if (list.includes(value)) set(list.filter((x) => x !== value));
    else if (!max || list.length < max) set([...list, value]);
  }

  const chip = (active: boolean) =>
    `rounded-full px-4 py-2 text-base font-semibold transition-colors ${
      active
        ? "bg-[#1e4f4f] text-white shadow-sm"
        : "bg-white/80 text-[#3d3630] hover:bg-white"
    }`;
  const input =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

  const titles = [
    "",
    "What do you do?",
    "What are you trying to achieve?",
    "What do you sell?",
    "Who is your ideal client?",
    "How do those clients tend to behave?",
    "What voice should Shari use?",
    "",
  ];

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-10">
      {/* Progress */}
      {step > 0 && step < LAST_STEP && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              Step {step} of {LAST_STEP - 1}
            </p>
            <button
              type="button"
              onClick={skip}
              className="text-sm font-semibold text-[#9a8f82] hover:text-[#1e4f4f]"
            >
              Skip
            </button>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e7dfd4]">
            <div
              className="h-full rounded-full bg-[#1e4f4f] transition-all"
              style={{ width: `${(step / (LAST_STEP - 1)) * 100}%` }}
            />
          </div>
          <p className="mt-5 text-2xl font-semibold text-[#1f1c19]">
            {titles[step]}
          </p>
        </>
      )}

      {/* Step 0 — welcome */}
      {step === 0 && (
        <div className="my-auto text-center">
          <p className="text-3xl">🧠</p>
          <p className="mt-3 text-2xl font-bold text-[#1f1c19]">
            Let&apos;s set up your AI so it actually understands your business.
          </p>
          <p className="mt-2 text-base text-[#6b635a]">
            About 2 minutes, one question at a time. Skip anything you want.
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-2xl bg-[#1e4f4f] px-10 py-4 text-xl font-bold text-white shadow-md hover:bg-[#163a3a]"
            >
              🚀 Start
            </button>
            <button
              type="button"
              onClick={() => onDone?.()}
              className="text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — role */}
      {step === 1 && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={chip(role === r)}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            value={ROLES.includes(role) ? "" : role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="…or type your own"
            className={input}
          />
        </div>
      )}

      {/* Step 2 — goals: pick any, add your own, pin a primary */}
      {step === 2 && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-[#6b635a]">
            Pick any that fit — then ⭐ the one or two that matter most.
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([...GOALS, ...goals])).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggle(goals, setGoals, g)}
                className={chip(goals.includes(g))}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customGoal.trim()) {
                  if (!goals.includes(customGoal.trim()))
                    setGoals([...goals, customGoal.trim()]);
                  setCustomGoal("");
                }
              }}
              placeholder="Type your own goal…"
              className={input}
            />
            <button
              type="button"
              disabled={!customGoal.trim()}
              onClick={() => {
                if (!goals.includes(customGoal.trim()))
                  setGoals([...goals, customGoal.trim()]);
                setCustomGoal("");
              }}
              className="shrink-0 rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              + Add
            </button>
          </div>

          {goals.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                Your goals — ⭐ = primary
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {goals.map((g, i) => (
                  <div
                    key={g}
                    className="flex items-center gap-2 rounded-lg border border-[#d4cdc3] bg-white/85 px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setGoals([g, ...goals.filter((x) => x !== g)])
                      }
                      title="Pin as primary"
                      className="text-lg"
                    >
                      {i < 2 ? "⭐" : "☆"}
                    </button>
                    <span className="flex-1 text-base text-[#1f1c19]">{g}</span>
                    <button
                      type="button"
                      onClick={() => setGoals(goals.filter((x) => x !== g))}
                      className="text-sm font-semibold text-[#a85c4a]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3 — sells */}
      {step === 3 && (
        <div className="mt-4">
          <input
            value={sells}
            onChange={(e) => setSells(e.target.value)}
            placeholder="e.g. 1:1 coaching, a course, done-for-you services"
            className={input}
            autoFocus
          />
          <p className="mt-2 text-sm text-[#6b635a]">
            Examples: coaching · services · digital products · consulting ·
            packages
          </p>
        </div>
      )}

      {/* Step 4 — ideal client + AIRA research */}
      {step === 4 && (
        <div className="mt-4">
          {/* Single source of truth: clients live in Client Avatars, not here.
              This step is now a read-only pointer, never a second definition. */}
          <div className="rounded-2xl border border-[#1e4f4f]/20 bg-white/85 p-4">
            <p className="text-base text-[#2d2926]">
              👤 Who you help lives in one place:{" "}
              <span className="font-semibold text-[#1f1c19]">
                Client Avatars
              </span>
              . Build, research, and switch them there — everything you make
              reads from that single source.
            </p>
            {onOpenAvatars && (
              <button
                type="button"
                onClick={onOpenAvatars}
                className="mt-3 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                Open Client Avatars →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 5 — traits */}
      {step === 5 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {TRAITS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggle(traits, setTraits, t)}
              className={chip(traits.includes(t))}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Step 6 — tone */}
      {step === 6 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={chip(tone === t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Step 7 — done */}
      {step === LAST_STEP && (
        <div className="my-auto text-center">
          <p className="text-3xl">✅</p>
          <p className="mt-3 text-2xl font-bold text-[#1f1c19]">
            Your AI now knows your business.
          </p>
          <p className="mt-2 text-base text-[#6b635a]">
            Emails, content, snippets, and insights will speak to your clients —
            not generic advice. Edit anytime in Profile.
          </p>
          <button
            type="button"
            onClick={() => onDone?.()}
            className="mt-6 rounded-2xl bg-[#1e4f4f] px-10 py-4 text-xl font-bold text-white shadow-md hover:bg-[#163a3a]"
          >
            🚀 Done
          </button>
        </div>
      )}

      {/* Nav for the middle steps */}
      {step > 0 && step < LAST_STEP && (
        <div className="mt-auto flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-xl px-4 py-2.5 text-base font-semibold text-[#6b635a] hover:bg-black/5"
          >
            ‹ Back
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-[#1e4f4f] px-8 py-3 text-lg font-bold text-white hover:bg-[#163a3a]"
          >
            {step === LAST_STEP - 1 ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
