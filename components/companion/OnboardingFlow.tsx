"use client";

import { useState } from "react";
import {
  saveAvatar,
  setActiveAvatar,
  saveBusinessProfile,
  savePrefs,
  type AvatarResearch,
} from "@/lib/companionStore";

// First-run onboarding — "teach the AI how your brain + business works in under
// 2 minutes." Light, conversational, never a wall of forms. Builds the first
// avatar (L1 + L2 auto), sets it active, captures comms style + a business goal.

const EMOJIS = ["👤", "🧑‍💻", "🧠", "🌿", "🚀", "💼", "✨", "🌱", "🎯", "❤️"];

const FOR_WHOM = [
  "My clients",
  "My audience",
  "My business",
  "Multiple groups",
  "I'm not sure yet",
];

const COMMS = [
  "Short + simple",
  "Supportive",
  "Direct + action-based",
  "Structured step-by-step",
  "Motivational",
];

const GOALS = [
  "Get more clients",
  "Stay consistent",
  "Create content",
  "Build systems",
  "Grow income",
  "Organize my business",
];

const input =
  "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

export function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const [screen, setScreen] = useState(0);
  const [forWhom, setForWhom] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👤");
  const [desc, setDesc] = useState("");
  const [struggle, setStruggle] = useState("");
  const [achieve, setAchieve] = useState("");
  const [blocker, setBlocker] = useState("");
  const [research, setResearch] = useState<AvatarResearch>({});
  const [aiBusy, setAiBusy] = useState(false);
  const [comms, setComms] = useState("");
  const [customComms, setCustomComms] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState("");

  const next = () => setScreen((s) => Math.min(s + 1, 6));
  const back = () => setScreen((s) => Math.max(s - 1, 0));

  async function expand() {
    setAiBusy(true);
    try {
      const res = await fetch("/api/avatar-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idealClient: [desc, struggle, achieve, blocker]
            .filter(Boolean)
            .join(". "),
        }),
      });
      const d = await res.json();
      if (res.ok) {
        const join = (a: unknown) =>
          Array.isArray(a) ? a.filter(Boolean).join("; ") : "";
        const ct = (d.contentTriggers ?? {}) as { works?: string[] };
        setResearch({
          behavioral: join(d.behaviorPatterns),
          buying: join(d.buyingBehavior),
          communication: join(d.communicationStyle),
          market: typeof d.guidance === "string" ? d.guidance : "",
          notes: ct.works?.length ? `Resonates with: ${ct.works.join("; ")}` : "",
        });
      }
    } catch {
      /* optional */
    }
    setAiBusy(false);
  }

  function finish(skip = false) {
    if (!skip) {
      const list = saveAvatar({
        name: name.trim() || "My ideal client",
        who: desc,
        painPoints: struggle,
        goals: achieve,
        currentBehavior: blocker,
        emoji,
        research,
        isPrimary: true,
      });
      if (list[0]) setActiveAvatar(list[0].id);
      const tone = (customComms.trim() || comms).trim();
      saveBusinessProfile({ goals, ...(tone ? { tone } : {}) });
    }
    savePrefs({ onboarded: true });
    onDone();
  }

  function toggleGoal(g: string) {
    setGoals((cur) =>
      cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g],
    );
  }

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-base font-medium transition-colors ${
      active
        ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
        : "border-[#c9bfb0] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4efe7] p-4">
      <div className="flex max-h-full w-full max-w-lg flex-col overflow-y-auto rounded-3xl border border-[#1e4f4f]/15 bg-white/90 p-6 shadow-xl sm:p-8">
        {/* progress dots */}
        {screen > 0 && (
          <div className="mb-5 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <span
                key={n}
                className={`h-1.5 rounded-full transition-all ${
                  n <= screen ? "w-6 bg-[#1e4f4f]" : "w-1.5 bg-[#d4cdc3]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Screen 1 — welcome */}
        {screen === 0 && (
          <div className="text-center">
            <p className="text-4xl">🧠</p>
            <p className="mt-3 text-3xl font-bold text-[#1f1c19]">
              Let&apos;s build your thinking partner
            </p>
            <p className="mt-2 text-lg text-[#6b635a]">
              This takes about 2 minutes. You can change anything later.
            </p>
            <button
              type="button"
              onClick={next}
              className="mt-7 w-full rounded-xl bg-[#1e4f4f] px-6 py-3.5 text-lg font-semibold text-white hover:bg-[#163a3a]"
            >
              Start
            </button>
            <button
              type="button"
              onClick={() => finish(true)}
              className="mt-3 text-sm font-medium text-[#9a8f82] hover:underline"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Screen 2 — who for */}
        {screen === 1 && (
          <div>
            <p className="text-2xl font-semibold text-[#1f1c19]">
              Who do you want help with?
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {FOR_WHOM.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                    setForWhom(o);
                    next();
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-base font-medium transition-colors ${
                    forWhom === o
                      ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06] text-[#1f1c19]"
                      : "border-[#d4cdc3] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Screen 3 — first avatar (light) */}
        {screen === 2 && (
          <div>
            <p className="text-2xl font-semibold text-[#1f1c19]">
              Who&apos;s the main person you work with?
            </p>
            <p className="mt-1 text-base text-[#6b635a]">
              Keep it quick — you can add detail later.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional) — e.g. Overwhelmed Coach"
                className={input}
              />
              <div>
                <p className="mb-1.5 text-sm font-semibold text-[#6b635a]">
                  Pick an emoji
                </p>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-colors ${
                        emoji === e
                          ? "bg-[#1e4f4f]/15 ring-2 ring-[#1e4f4f]"
                          : "bg-white hover:bg-[#f0f5f5]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="One line about them…"
                className={input}
              />
            </div>
          </div>
        )}

        {/* Screen 4 — light research + AI expand */}
        {screen === 3 && (
          <div>
            <p className="text-2xl font-semibold text-[#1f1c19]">
              Tell me the basics so I understand them
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <textarea
                value={struggle}
                onChange={(e) => setStruggle(e.target.value)}
                placeholder="What are they struggling with most?"
                className={`min-h-[60px] resize-none ${input}`}
              />
              <textarea
                value={achieve}
                onChange={(e) => setAchieve(e.target.value)}
                placeholder="What are they trying to achieve?"
                className={`min-h-[60px] resize-none ${input}`}
              />
              <textarea
                value={blocker}
                onChange={(e) => setBlocker(e.target.value)}
                placeholder="What usually gets in their way?"
                className={`min-h-[60px] resize-none ${input}`}
              />
              <button
                type="button"
                onClick={() => {
                  if (!aiBusy) void expand();
                }}
                disabled={aiBusy || (!struggle && !desc)}
                className="w-fit rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
              >
                {aiBusy ? "Thinking…" : "🧠 Help me expand this (AI assisted)"}
              </button>
              {research.behavioral && (
                <div className="rounded-xl border border-[#1e4f4f]/20 bg-white/85 p-3 text-sm leading-relaxed text-[#2d2926]">
                  <p className="font-semibold text-[#1f1c19]">
                    Got it — here&apos;s a starting profile:
                  </p>
                  <p className="mt-1">📊 {research.behavioral}</p>
                  {research.communication && (
                    <p className="mt-1">🧠 {research.communication}</p>
                  )}
                  <p className="mt-2 text-xs text-[#9a8f82]">
                    Saved to this avatar — refine it anytime in Profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Screen 5 — communication style */}
        {screen === 4 && (
          <div>
            <p className="text-2xl font-semibold text-[#1f1c19]">
              How should I communicate with them?
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {COMMS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setComms(c)}
                  className={chip(comms === c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              value={customComms}
              onChange={(e) => setCustomComms(e.target.value)}
              placeholder="…or describe your own style"
              className={`mt-3 ${input}`}
            />
          </div>
        )}

        {/* Screen 6 — business goal */}
        {screen === 5 && (
          <div>
            <p className="text-2xl font-semibold text-[#1f1c19]">
              What are you trying to achieve?
            </p>
            <p className="mt-1 text-base text-[#6b635a]">Pick any that fit.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(new Set([...GOALS, ...goals])).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGoal(g)}
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
                placeholder="Add your own goal…"
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
          </div>
        )}

        {/* Screen 7 — done */}
        {screen === 6 && (
          <div className="text-center">
            <p className="text-4xl">✨</p>
            <p className="mt-3 text-2xl font-bold text-[#1f1c19]">
              Your AI is now learning how you think.
            </p>
            <p className="mt-2 text-base text-[#6b635a]">
              {name.trim() || "Your first client"} {emoji} is set as your active
              avatar — everything Shari writes will adapt to them.
            </p>
            <button
              type="button"
              onClick={() => finish()}
              className="mt-7 w-full rounded-xl bg-[#1e4f4f] px-6 py-3.5 text-lg font-semibold text-white hover:bg-[#163a3a]"
            >
              Go to dashboard
            </button>
            <p className="mt-3 text-sm text-[#9a8f82]">
              You can add another avatar or refine this one anytime in Profile.
            </p>
          </div>
        )}

        {/* nav row (hidden on welcome + done) */}
        {screen > 0 && screen < 6 && (
          <div className="mt-7 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={back}
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-base font-semibold text-[#1e4f4f]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-base font-semibold text-white hover:bg-[#163a3a]"
            >
              {screen === 5 ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
