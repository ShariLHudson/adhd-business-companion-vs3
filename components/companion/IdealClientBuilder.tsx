"use client";

import { useEffect, useRef, useState } from "react";
import {
  deleteAvatar,
  getAvatars,
  saveAvatar,
  setPrimaryAvatar,
  setActiveAvatar,
  getActiveAvatar,
  duplicateAvatar,
  CLIENT_BEHAVIOR_TRAITS,
  TRAIT_EMOJI,
  type IdealClientAvatar,
  type AvatarResearch,
} from "@/lib/companionStore";

// Curated identity marks — double as quick "icons" and emoji avatars.
const EMOJI_CHOICES = [
  "🧑‍💻",
  "🧠",
  "🌿",
  "🚀",
  "💼",
  "✨",
  "🌱",
  "⛰️",
  "🧭",
  "🎯",
  "❤️",
  "👤",
];

type StepKey =
  | "who"
  | "painPoints"
  | "goals"
  | "currentBehavior"
  | "solution"
  | "behavior"
  | "insights"
  | "expand"
  | "research"
  | "identity"
  | "revenue";

// Level 3 research modules — optional depth.
const RESEARCH_MODULES: {
  key: keyof Omit<AvatarResearch, "custom">;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  {
    key: "behavioral",
    emoji: "📊",
    label: "Behavioral patterns",
    hint: "How they react under stress, procrastinate, make decisions.",
  },
  {
    key: "motivation",
    emoji: "💡",
    label: "Motivation drivers",
    hint: "Urgency vs calm, reward sensitivity, fear-based vs growth.",
  },
  {
    key: "buying",
    emoji: "💸",
    label: "Buying behavior",
    hint: "What makes them buy fast, what delays them, trust triggers.",
  },
  {
    key: "communication",
    emoji: "🧠",
    label: "Communication preferences",
    hint: "Short vs detailed, emotional vs logical, steps vs overview.",
  },
  {
    key: "market",
    emoji: "🌍",
    label: "Market insights",
    hint: "Industry patterns, common objections, content preferences.",
  },
  {
    key: "notes",
    emoji: "✍️",
    label: "What I notice about this client",
    hint: "Your own observations and patterns from experience.",
  },
];

// Research-first flow: quick identity → lightweight discovery → AI expand →
// review → optional deep refine. Early understanding = sharper AI sooner.
const STEPS: { key: StepKey; q: string; hint?: string }[] = [
  {
    key: "who",
    q: "Who do you help most often?",
    hint: "Give them a name and a quick description.",
  },
  {
    key: "identity",
    q: "Give them a face.",
    hint: "An emoji or photo makes them feel real — pick fast.",
  },
  { key: "painPoints", q: "What are they struggling with most?" },
  { key: "goals", q: "What are they trying to achieve?" },
  { key: "currentBehavior", q: "What slows them down or holds them back?" },
  {
    key: "expand",
    q: "🧠 Let's understand them — fast.",
    hint: "I'll turn your answers into a behavior profile you can tweak.",
  },
  {
    key: "behavior",
    q: "How do they tend to behave?",
    hint: "These shape tone, length, and CTA. (I may have pre-filled some.)",
  },
  {
    key: "insights",
    q: "A little more on what moves them (optional).",
    hint: "Edit anything AIRA suggested, or add your own.",
  },
  { key: "solution", q: "How do you help them in a way others don't?" },
  {
    key: "research",
    q: "🔬 Refine this avatar further (optional).",
    hint: "Deeper research layers — only if you want. You can always come back.",
  },
  {
    key: "revenue",
    q: "Want to track revenue from this client type? (optional)",
  },
];

// Short labels for the section-jump nav (edit mode is a hub, not a wizard).
const STEP_NAV: Record<StepKey, string> = {
  who: "Identity",
  identity: "Photo",
  painPoints: "Struggles",
  goals: "Goals",
  currentBehavior: "Obstacles",
  expand: "AI expand",
  behavior: "Behavior",
  insights: "Motivation",
  solution: "Your edge",
  research: "Research",
  revenue: "Revenue",
};

type TextFieldKey = "painPoints" | "goals" | "currentBehavior" | "solution";

type Form = {
  id?: string;
  name: string;
  who: string;
  painPoints: string;
  goals: string;
  currentBehavior: string;
  solution: string;
  tagline: string;
  emoji?: string;
  image?: string;
  revenue?: string;
  behaviorTraits: string[];
  motivations?: string;
  objections?: string;
  triggers?: string;
  contentPrefs?: string;
  research: AvatarResearch;
};

const EMPTY: Form = {
  name: "",
  who: "",
  painPoints: "",
  goals: "",
  currentBehavior: "",
  solution: "",
  tagline: "",
  emoji: "👤",
  behaviorTraits: [],
  research: {},
};

function AvatarMark({
  avatar,
  size,
}: {
  avatar: { emoji?: string; image?: string };
  size: number;
}) {
  if (avatar.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatar.image}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-[#1e4f4f]/10"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {avatar.emoji ?? "👤"}
    </div>
  );
}

export function IdealClientBuilder() {
  const [avatars, setAvatars] = useState<IdealClientAvatar[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [building, setBuilding] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [aiBusy, setAiBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function refresh() {
    setAvatars(getAvatars());
    setActiveId(getActiveAvatar()?.id);
  }
  useEffect(() => {
    refresh();
  }, []);

  function startNew() {
    setForm({ ...EMPTY });
    setStep(0);
    setBuilding(true);
  }

  function startEdit(a: IdealClientAvatar) {
    setForm({
      id: a.id,
      name: a.name,
      who: a.who,
      painPoints: a.painPoints,
      goals: a.goals,
      currentBehavior: a.currentBehavior,
      solution: a.solution,
      tagline: a.tagline,
      emoji: a.emoji ?? "👤",
      image: a.image,
      revenue: a.revenue,
      behaviorTraits: a.behaviorTraits ?? [],
      motivations: a.motivations,
      objections: a.objections,
      triggers: a.triggers,
      contentPrefs: a.contentPrefs,
      research: a.research ?? {},
    });
    setStep(0);
    setBuilding(true);
  }

  function setResearch(
    key: keyof Omit<AvatarResearch, "custom">,
    value: string,
  ) {
    setForm((f) => ({ ...f, research: { ...f.research, [key]: value } }));
  }

  async function aiMarketInsights() {
    setAiBusy(true);
    try {
      const res = await fetch("/api/avatar-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idealClient: [form.who, form.painPoints]
            .filter(Boolean)
            .join(". "),
          traits: form.behaviorTraits,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        const join = (a: unknown) =>
          Array.isArray(a) ? a.filter(Boolean).join("; ") : "";
        const ct = (d.contentTriggers ?? {}) as {
          works?: string[];
          avoids?: string[];
        };
        const market = [
          typeof d.guidance === "string" ? d.guidance : "",
          ct.works?.length ? `Works: ${ct.works.join("; ")}.` : "",
          ct.avoids?.length ? `Avoid: ${ct.avoids.join("; ")}.` : "",
        ]
          .filter(Boolean)
          .join(" ");
        setForm((f) => ({
          ...f,
          research: {
            ...f.research,
            behavioral: f.research.behavioral || join(d.behaviorPatterns),
            buying: f.research.buying || join(d.buyingBehavior),
            communication:
              f.research.communication || join(d.communicationStyle),
            market: market || f.research.market,
          },
        }));
      }
    } catch {
      /* optional */
    }
    setAiBusy(false);
  }

  // Quick-edit: open an avatar straight to a given section (no wizard lock).
  function startEditAt(a: IdealClientAvatar, key: StepKey) {
    startEdit(a);
    const i = STEPS.findIndex((s) => s.key === key);
    if (i >= 0) setStep(i);
  }

  function toggleTrait(t: string) {
    setForm((f) => ({
      ...f,
      behaviorTraits: f.behaviorTraits.includes(t)
        ? f.behaviorTraits.filter((x) => x !== t)
        : [...f.behaviorTraits, t],
    }));
  }

  function finish() {
    saveAvatar({ ...form });
    refresh();
    setBuilding(false);
    setForm({ ...EMPTY });
    setStep(0);
  }

  function onUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) => ({ ...f, image: String(reader.result), emoji: undefined }));
    reader.readAsDataURL(file);
  }

  // ---- Interview ----------------------------------------------------------
  if (building) {
    const current = STEPS[step]!;
    const isLast = step === STEPS.length - 1;
    const editing = Boolean(form.id);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        {editing ? (
          // Edit mode = section hub: jump straight to any block, no flow lock.
          <div className="mb-2">
            <p className="text-2xl font-semibold text-[#1f1c19]">
              {form.emoji ?? "👤"} {form.name || "Editing avatar"}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStep(i)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    i === step
                      ? "bg-[#1e4f4f] text-white"
                      : "bg-white/80 text-[#4b463f] hover:bg-white"
                  }`}
                >
                  {STEP_NAV[s.key]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-[#9a8f82]">
            Step {step + 1} of {STEPS.length}
          </p>
        )}
        <p className="mt-2 text-2xl font-semibold leading-snug text-[#1f1c19]">
          {current.q}
        </p>
        {current.hint && (
          <p className="mt-1 text-base text-[#6b635a]">{current.hint}</p>
        )}

        <div className="mt-6 flex-1">
          {current.key === "who" && (
            <div className="flex flex-col gap-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name (optional) — e.g. Burned Out Coach"
                className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              />
              <textarea
                value={form.who}
                onChange={(e) => setForm({ ...form, who: e.target.value })}
                placeholder="Describe who they are…"
                className="min-h-[160px] resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              />
            </div>
          )}

          {(current.key === "painPoints" ||
            current.key === "goals" ||
            current.key === "currentBehavior" ||
            current.key === "solution") && (
            <textarea
              value={form[current.key as TextFieldKey]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [current.key as TextFieldKey]: e.target.value,
                })
              }
              placeholder="Take your time — a sentence or two is plenty."
              className="min-h-[200px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
          )}

          {current.key === "expand" && (
            <div className="flex flex-col gap-3">
              <p className="text-base text-[#4b463f]">
                From what you just told me, I can suggest behavior patterns,
                buying behavior, and how to talk to them — all editable in the
                next steps.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!aiBusy) void aiMarketInsights();
                }}
                disabled={aiBusy}
                className="w-fit rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
              >
                {aiBusy ? "Thinking…" : "🧠 Help me expand this profile"}
              </button>
              {(form.research.behavioral ||
                form.research.buying ||
                form.research.communication ||
                form.research.market) && (
                <div className="rounded-xl border border-[#1e4f4f]/20 bg-white/85 p-3 text-sm leading-relaxed text-[#2d2926]">
                  <p className="font-semibold text-[#1f1c19]">
                    Here&apos;s a starting profile:
                  </p>
                  {form.research.behavioral && (
                    <p className="mt-1">📊 {form.research.behavioral}</p>
                  )}
                  {form.research.buying && (
                    <p className="mt-1">💸 {form.research.buying}</p>
                  )}
                  {form.research.communication && (
                    <p className="mt-1">🧠 {form.research.communication}</p>
                  )}
                  {form.research.market && (
                    <p className="mt-1">🌍 {form.research.market}</p>
                  )}
                  <p className="mt-2 text-xs text-[#9a8f82]">
                    Tweak any of this in the next steps — it&apos;s a draft.
                  </p>
                </div>
              )}
              <p className="text-sm text-[#9a8f82]">
                Prefer to skip? Just tap Next — you can expand later.
              </p>
            </div>
          )}

          {current.key === "behavior" && (
            <div className="flex flex-wrap gap-2">
              {CLIENT_BEHAVIOR_TRAITS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTrait(t)}
                  className={`rounded-full border px-4 py-2 text-base font-medium transition-colors ${
                    form.behaviorTraits.includes(t)
                      ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                      : "border-[#c9bfb0] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
                  }`}
                >
                  {TRAIT_EMOJI[t] ?? ""} {t}
                </button>
              ))}
            </div>
          )}

          {current.key === "insights" && (
            <div className="flex flex-col gap-3">
              {(
                [
                  ["motivations", "What truly motivates them?"],
                  ["objections", "What makes them hesitate to buy?"],
                  ["triggers", "What pushes them to finally decide?"],
                  ["contentPrefs", "How do they like to consume content?"],
                ] as [
                  "motivations" | "objections" | "triggers" | "contentPrefs",
                  string,
                ][]
              ).map(([key, label]) => (
                <div key={String(key)}>
                  <p className="mb-1 text-sm font-semibold text-[#6b635a]">
                    {label}
                  </p>
                  <textarea
                    value={(form[key] as string) ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    placeholder="Optional…"
                    className="min-h-[64px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  />
                </div>
              ))}
            </div>
          )}

          {current.key === "research" && (
            <div className="flex flex-col gap-3">
              {RESEARCH_MODULES.map((m) => (
                <details
                  key={m.key}
                  className="rounded-xl border border-[#d4cdc3] bg-white/85 p-3"
                  open={Boolean(form.research[m.key])}
                >
                  <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-[#1f1c19]">
                    <span>
                      {m.emoji} {m.label}
                    </span>
                    {m.key === "market" && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!aiBusy) void aiMarketInsights();
                        }}
                        className="rounded-md bg-[#1e4f4f]/10 px-2 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/20"
                      >
                        {aiBusy ? "Researching…" : "🔍 AI research"}
                      </span>
                    )}
                  </summary>
                  <p className="mt-1 text-sm text-[#9a8f82]">{m.hint}</p>
                  <textarea
                    value={(form.research[m.key] as string) ?? ""}
                    onChange={(e) => setResearch(m.key, e.target.value)}
                    placeholder="Optional…"
                    className="mt-2 min-h-[64px] w-full resize-none rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  />
                </details>
              ))}

              {/* Custom research fields — experiments, content ideas, tests */}
              <div className="rounded-xl border border-[#d4cdc3] bg-white/85 p-3">
                <p className="text-base font-semibold text-[#1f1c19]">
                  ➕ Custom research fields
                </p>
                <p className="mt-1 text-sm text-[#9a8f82]">
                  e.g. “What I want to test”, “Messaging experiments”, “Content
                  ideas”.
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {(form.research.custom ?? []).map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={c.label}
                        onChange={(e) => {
                          const custom = [...(form.research.custom ?? [])];
                          custom[i] = { ...custom[i]!, label: e.target.value };
                          setForm({
                            ...form,
                            research: { ...form.research, custom },
                          });
                        }}
                        placeholder="Label"
                        className="w-1/3 rounded-lg border border-[#c9bfb0] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#1e4f4f]"
                      />
                      <input
                        value={c.value}
                        onChange={(e) => {
                          const custom = [...(form.research.custom ?? [])];
                          custom[i] = { ...custom[i]!, value: e.target.value };
                          setForm({
                            ...form,
                            research: { ...form.research, custom },
                          });
                        }}
                        placeholder="Notes…"
                        className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#1e4f4f]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const custom = (form.research.custom ?? []).filter(
                            (_, j) => j !== i,
                          );
                          setForm({
                            ...form,
                            research: { ...form.research, custom },
                          });
                        }}
                        className="shrink-0 px-2 text-[#a85c4a]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        research: {
                          ...form.research,
                          custom: [
                            ...(form.research.custom ?? []),
                            { label: "", value: "" },
                          ],
                        },
                      })
                    }
                    className="w-fit rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                  >
                    + Add field
                  </button>
                </div>
              </div>
            </div>
          )}

          {current.key === "identity" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <AvatarMark avatar={form} size={72} />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                  >
                    Upload image
                  </button>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: undefined })}
                      className="text-xs font-medium text-[#a85c4a]"
                    >
                      Remove image
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                  }}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#6b635a]">
                  Or pick an emoji
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, emoji: e, image: undefined })
                      }
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-colors ${
                        form.emoji === e && !form.image
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
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="A one-line tagline (optional)"
                className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              />
            </div>
          )}

          {current.key === "revenue" && (
            <input
              value={form.revenue ?? ""}
              onChange={(e) => setForm({ ...form, revenue: e.target.value })}
              placeholder="e.g. ~$2k/mo — or leave blank to skip"
              className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
          )}
        </div>

        <div className="mt-6 flex justify-between gap-2">
          {editing ? (
            // Hub: save from any section, no "next step" requirement.
            <>
              <button
                type="button"
                onClick={() => setBuilding(false)}
                className="rounded-xl border-2 border-[#1e4f4f] bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => finish()}
                className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
              >
                Save changes
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  step === 0 ? setBuilding(false) : setStep(step - 1)
                }
                className="rounded-xl border-2 border-[#1e4f4f] bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
              >
                {step === 0 ? "Cancel" : "Back"}
              </button>
              <button
                type="button"
                onClick={() => (isLast ? finish() : setStep(step + 1))}
                className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
              >
                {isLast ? "Save client" : "Next"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- List of avatars ----------------------------------------------------
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">Client Avatars</p>
        <button
          type="button"
          onClick={startNew}
          className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          + New avatar
        </button>
      </div>
      <p className="mt-1 text-base text-[#6b635a]">
        Who you help. Everything Shari writes adapts to whoever&apos;s in use.
      </p>
      {(() => {
        const active = avatars.find((a) => a.id === activeId);
        return active ? (
          <p className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-sm font-semibold text-[#1e4f4f]">
            👤 Using: {active.name}
          </p>
        ) : null;
      })()}

      {avatars.length === 0 ? (
        <p className="mt-8 text-base text-[#6b635a]">
          No ideal clients yet. Tap “New ideal client” and I&apos;ll walk you
          through it, one question at a time.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {avatars.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-[#d4cdc3] bg-white/85 p-4"
            >
              <div className="flex items-center gap-3">
                <AvatarMark avatar={a} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-base font-semibold text-[#1f1c19]">
                    {a.name}
                    {a.isPrimary ? (
                      <span className="shrink-0 rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-bold text-[#1e4f4f]">
                        ⭐ Primary
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-[#f3efe8] px-2 py-0.5 text-xs font-semibold text-[#9a8f82]">
                        Secondary
                      </span>
                    )}
                  </p>
                  {a.tagline && (
                    <p className="truncate text-sm text-[#6b635a]">
                      {a.tagline}
                    </p>
                  )}
                </div>
              </div>
              {a.who && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#4b463f]">
                  {a.who}
                </p>
              )}
              {a.behaviorTraits && a.behaviorTraits.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.behaviorTraits.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#f3efe8] px-2 py-0.5 text-xs text-[#6b635a]"
                    >
                      {TRAIT_EMOJI[t] ?? ""} {t}
                    </span>
                  ))}
                </div>
              )}
              {a.research &&
                Object.values(a.research).some((v) =>
                  Array.isArray(v) ? v.length : v,
                ) && (
                  <p className="mt-2 text-xs font-semibold text-[#1e4f4f]">
                    🧠 Research added
                  </p>
                )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                {activeId === a.id ? (
                  <span className="rounded-md bg-[#1e4f4f] px-2.5 py-1 text-white">
                    ✓ In use
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAvatar(a.id);
                      setActiveId(a.id);
                    }}
                    className="rounded-md bg-[#1e4f4f]/10 px-2.5 py-1 text-[#1e4f4f] hover:bg-[#1e4f4f]/20"
                  >
                    Use in AI
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(a)}
                  className="rounded-md px-2.5 py-1 text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => startEditAt(a, "behavior")}
                  className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-[#1e4f4f]/10"
                >
                  Behavior
                </button>
                <button
                  type="button"
                  onClick={() => startEditAt(a, "research")}
                  className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-[#1e4f4f]/10"
                >
                  Research
                </button>
                {!a.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setAvatars(setPrimaryAvatar(a.id))}
                    className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-[#1e4f4f]/10"
                  >
                    Make primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAvatars(duplicateAvatar(a.id))}
                  className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-[#1e4f4f]/10"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatars(deleteAvatar(a.id));
                    setActiveId(getActiveAvatar()?.id);
                  }}
                  className="rounded-md px-2.5 py-1 text-[#a85c4a] hover:bg-[#a85c4a]/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
