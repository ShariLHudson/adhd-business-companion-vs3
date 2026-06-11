"use client";

import { getPrefs } from "@/lib/companionStore";
import type { SidebarToolId } from "@/lib/companionUi";

type Tool = {
  label: string;
  desc: string;
  emoji: string;
  color: string;
  tool?: SidebarToolId;
  soon?: boolean;
};

const TOOLS: Tool[] = [
  {
    label: "Focus Session",
    desc: "A Pomodoro timer to lock in.",
    emoji: "⏱",
    color: "#1e4f4f",
    tool: "focus-timer",
  },
  {
    label: "Brain Dump",
    desc: "Empty your head — capture it all.",
    emoji: "🧠",
    color: "#9a6fb0",
    tool: "brain-dump",
  },
  {
    label: "Breathe / Reset",
    desc: "A guided breath to settle.",
    emoji: "🌬",
    color: "#4a6fa5",
    tool: "breathe",
  },
  {
    label: "Focus Audio",
    desc: "Sounds to help you concentrate.",
    emoji: "🎧",
    color: "#2f4f7a",
    tool: "focus-audio",
  },
  {
    label: "Time Block",
    desc: "Plan intent-to-start nudges for your day.",
    emoji: "🗓",
    color: "#c08a3e",
    tool: "time-block",
  },
];
// Spin the Wheel + Reset Tools intentionally left out of the default Focus
// grid — Shari surfaces them when you're stuck ("can't pick? I'll spin for
// you"). They still exist as sections; this keeps Focus calm, not a toy box.

// Meaning hue → its brighter decorative counterpart, so the two color modes
// look genuinely different.
const DECOR: Record<string, string> = {
  "#1e4f4f": "#0d9488",
  "#9a6fb0": "#a855f7",
  "#4a6fa5": "#3b82f6",
  "#2f4f7a": "#6366f1",
  "#c08a3e": "#f59e0b",
  "#a85c4a": "#ef4444",
  "#6b8e23": "#22c55e",
};

export function FocusAreaPanel({
  onOpen,
}: {
  onOpen: (tool: SidebarToolId) => void;
}) {
  const visualMode = getPrefs().visualMode;
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <p className="text-2xl font-semibold text-[#1f1c19]">Focus</p>
      <p className="mt-1 text-base text-[#6b635a]">
        Everything to help you settle in and concentrate.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <button
            key={t.label}
            type="button"
            disabled={t.soon}
            onClick={() => t.tool && onOpen(t.tool)}
            style={
              colorOn
                ? (() => {
                    const c = decorative ? (DECOR[t.color] ?? t.color) : t.color;
                    return {
                      borderLeftWidth: 5,
                      borderLeftColor: c,
                      ...(decorative ? { backgroundColor: `${c}14` } : {}),
                    };
                  })()
                : undefined
            }
            className={`flex items-start gap-3 rounded-2xl border border-[#1e4f4f]/20 bg-white/85 p-4 text-left shadow-sm transition-colors ${
              t.soon
                ? "cursor-not-allowed opacity-60"
                : "hover:border-[#1e4f4f]/45 hover:bg-white"
            }`}
          >
            <span aria-hidden="true" className="text-2xl">
              {t.emoji}
            </span>
            <span>
              <span className="block text-base font-semibold text-[#1f1c19]">
                {t.label}
                {t.soon && (
                  <span className="ml-2 rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-medium text-[#1e4f4f]">
                    soon
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-sm text-[#6b635a]">
                {t.desc}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
