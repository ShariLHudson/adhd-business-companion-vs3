"use client";

import { useState } from "react";
import type { SidebarToolId } from "@/lib/companionUi";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";

// Focus = a calm support menu. Three primary actions always visible; the rest
// live in two collapsed-by-default sections so the first view is only THREE
// decisions — everything stays one tap away (nothing hidden on another screen).
type Option = {
  emoji: string;
  title: string;
  desc: string;
  tool?: SidebarToolId; // routes via onOpen
  getUnstuck?: boolean; // conversational — routes to chat, not a tool
};

const PRIMARY: Option[] = [
  {
    emoji: "🧠",
    title: "Clear My Mind",
    desc: "Reduce mental clutter — get thoughts out and find next steps.",
    tool: "brain-dump",
  },
  {
    emoji: "🎯",
    title: "Focus Session",
    desc: "Answer a few quick questions, then work with a timer.",
    tool: "focus-timer",
  },
  {
    emoji: "🚶",
    title: "Get Unstuck",
    desc: "Talk it through and find the smallest next step.",
    getUnstuck: true,
  },
];

const TOOLS: Option[] = [
  {
    emoji: "📅",
    title: "Block Out Time",
    desc: "Set a momentum appointment — movement counts.",
    tool: "time-block",
  },
  {
    emoji: "🌿",
    title: "Breathe & Reset",
    desc: "Calm your nervous system and regroup.",
    tool: "breathe",
  },
  {
    emoji: "🎧",
    title: "Focus Audio",
    desc: "Background sound to help you stay with it.",
    tool: "focus-audio",
  },
];

const BOOSTERS: Option[] = [
  {
    emoji: "🎮",
    title: "Momentum Games",
    desc: "Fifteen playful games — pattern, memory, speed, and more.",
    tool: "games",
  },
  {
    emoji: "🎡",
    title: "Spin The Wheel",
    desc: "Let the wheel choose when everything feels equally important.",
    tool: "spin-wheel",
  },
  {
    emoji: "🧭",
    title: "Help Me Right Now",
    desc: "Adjust My Day, parking lot, Safe For Today, spin, focus — each solves a different problem.",
    tool: "activities",
  },
];

export function FocusAreaPanel({
  onOpen,
  onGetUnstuck,
}: {
  onOpen: (tool: SidebarToolId) => void;
  onGetUnstuck?: () => void;
}) {
  // Every section starts collapsed — opening Focus shows only the three
  // section headers, nothing expanded.
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [boostersOpen, setBoostersOpen] = useState(false);

  const go = (o: Option) => {
    if (o.getUnstuck) onGetUnstuck?.();
    else if (o.tool) onOpen(o.tool);
  };

  const card = (o: Option, large: boolean) => (
    <button
      key={o.title}
      type="button"
      onClick={() => go(o)}
      className={`flex items-start gap-3 rounded-2xl border text-left transition-colors ${
        large
          ? "border-[#1e4f4f]/20 bg-white/85 p-4 shadow-sm hover:border-[#1e4f4f]/45 hover:bg-white"
          : "border-[#d4cdc3] bg-white/70 px-3.5 py-3 hover:border-[#1e4f4f]/40 hover:bg-white"
      }`}
    >
      <span aria-hidden="true" className={large ? "text-2xl" : "text-xl"}>
        {o.emoji}
      </span>
      <span>
        <span className="block text-base font-semibold text-[#1f1c19]">
          {o.title}
        </span>
        <span className="mt-0.5 block text-sm text-[#6b635a]">{o.desc}</span>
      </span>
    </button>
  );

  const section = (
    label: string,
    open: boolean,
    toggle: () => void,
    items: Option[],
  ) => (
    <div className="mt-4">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border border-[#d4cdc3] bg-white/70 px-4 py-3 text-left transition-colors hover:bg-white"
      >
        <span className="text-base font-semibold text-[#1f1c19]">{label}</span>
        <span aria-hidden="true" className="text-[#7c7468]">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div className="companion-fade-in mt-2 flex flex-col gap-2">
          {items.map((o) => card(o, false))}
        </div>
      )}
    </div>
  );

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <WorkspaceGuide section="focus" />
      <p className="text-2xl font-semibold text-[#1f1c19]">Focus</p>
      <p className="mt-1 text-base text-[#6b635a]">What would help right now?</p>

      <div className="mt-5 flex flex-col gap-0.5">
        {section(
          "🧭 Start Here",
          primaryOpen,
          () => setPrimaryOpen((o) => !o),
          PRIMARY,
        )}
        {section("🧰 Focus Tools", toolsOpen, () => setToolsOpen((o) => !o), TOOLS)}
        {section(
          "⚡ Momentum Boosters",
          boostersOpen,
          () => setBoostersOpen((o) => !o),
          BOOSTERS,
        )}
      </div>
    </div>
  );
}
