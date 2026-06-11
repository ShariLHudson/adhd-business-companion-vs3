"use client";

import { useState } from "react";

// Business Playbook — exactly three visible sections per the engine spec:
// "What are you trying to do?" (the entry), Templates, and Deep Dives.
// Every choice hands ONE focused prompt to Shari, who returns a single next
// step / copy-ready template / deep dive.

type PlaybookTab = "start" | "templates" | "deepdives" | "client";

type Option = { id: string; label: string; prompt: string };

const GOALS: Option[] = [
  {
    id: "clients",
    label: "Attract better-fit clients",
    prompt: "I want to attract better-fit clients.",
  },
  {
    id: "offer",
    label: "Create an offer that sells",
    prompt: "I want to create an offer that sells.",
  },
  {
    id: "content",
    label: "Build consistent content",
    prompt: "I want to build consistent content.",
  },
  {
    id: "audience",
    label: "Grow the right audience",
    prompt: "I want to grow the right audience.",
  },
  {
    id: "stuck",
    label: "I feel stuck",
    prompt: "I feel stuck.",
  },
  {
    id: "unsure",
    label: "I'm not sure yet",
    prompt: "I'm not sure yet.",
  },
];

// Templates is a creation layer: pick a type, Shari generates the output.
const TEMPLATES: Option[] = [
  { id: "content", label: "Content" },
  { id: "offers", label: "Offers" },
  { id: "emails", label: "Emails" },
  { id: "strategy", label: "Strategy" },
].map((t) => ({
  ...t,
  prompt: `Create a new ${t.label.toLowerCase()} template I can use right now — copy-paste ready, no preamble.`,
}));

const DEEP_DIVES: Option[] = [
  { id: "positioning", label: "Positioning" },
  { id: "pricing", label: "Pricing your offer" },
  { id: "converts", label: "Content that converts" },
  { id: "niche", label: "Finding your niche" },
  { id: "first100", label: "Your first 100 followers" },
].map((d) => ({
  ...d,
  prompt: `Give me a deep dive on ${d.label.toLowerCase()}.`,
}));

const TABS: { id: PlaybookTab; label: string }[] = [
  { id: "start", label: "What are you trying to do?" },
  { id: "templates", label: "Templates" },
  { id: "deepdives", label: "Deep Dives" },
  { id: "client", label: "👤 Ideal Client" },
];

export function BusinessPlaybookPanel({
  onAsk,
  onOpenLibrary,
}: {
  onAsk: (prompt: string) => void;
  onOpenLibrary?: () => void;
}) {
  const [tab, setTab] = useState<PlaybookTab>("start");

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">
          Business Playbook
        </p>
        {onOpenLibrary && (
          <button
            type="button"
            onClick={onOpenLibrary}
            className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
          >
            📚 Templates Library
          </button>
        )}
      </div>

      {/* Section tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-[#1e4f4f] text-white shadow-sm"
                : "bg-white/80 text-[#3d3630] hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "start" && (
        <div className="mt-7">
          <p className="text-xl font-semibold text-[#1f1c19]">
            What are you trying to do?
          </p>
          <p className="mt-1 text-base text-[#6b635a]">
            Pick one — I&apos;ll take it from there.
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onAsk(g.prompt)}
                className="rounded-xl border border-[#1e4f4f]/25 bg-white/85 px-4 py-4 text-left text-base font-medium text-[#1f1c19] shadow-sm transition-colors hover:border-[#1e4f4f]/50 hover:bg-white"
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "templates" && (
        <div className="mt-7">
          <p className="text-xl font-semibold text-[#1f1c19]">
            Create a template
          </p>
          <p className="mt-1 text-base text-[#6b635a]">
            Pick a type — I&apos;ll generate one you can use right now.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onAsk(t.prompt)}
                className="rounded-xl border border-[#1e4f4f]/25 bg-white/85 px-4 py-3.5 text-left text-base font-medium text-[#1f1c19] shadow-sm transition-colors hover:border-[#1e4f4f]/50 hover:bg-white"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "deepdives" && (
        <div className="mt-7">
          <p className="text-xl font-semibold text-[#1f1c19]">Deep Dives</p>
          <p className="mt-1 text-base text-[#6b635a]">
            One concept at a time — problem, insight, and a single action.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {DEEP_DIVES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onAsk(d.prompt)}
                className="rounded-xl border border-[#1e4f4f]/25 bg-white/85 px-4 py-3.5 text-left text-base font-medium text-[#1f1c19] shadow-sm transition-colors hover:border-[#1e4f4f]/50 hover:bg-white"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "client" && (
        <div className="mt-5 rounded-xl border border-[#d4cdc3] bg-white/85 p-4 text-base text-[#4b463f]">
          👤 Client Avatars now live in one place:{" "}
          <span className="font-semibold text-[#1f1c19]">
            Profile → Client Avatars
          </span>
          . Create, edit, and switch them there — every tool reads from that
          single source.
        </div>
      )}
    </div>
  );
}
