// In-app reference detector. Wherever the Companion's content (a strategy, a
// deep dive, a tip) describes a technique that already EXISTS as a feature in
// the app — "keep an idea parking lot" (Clear My Mind), "can't decide which"
// (Spin the Wheel), "a focused block" (Focus Session) — we should name it AND
// give a one-tap way to get there. Same thinking everywhere: never describe a
// capability we have without offering the door to it.

import type { AppSection } from "./companionUi";

export type AppReference = {
  section: AppSection;
  label: string;
  emoji: string;
};

type RefRule = AppReference & { re: RegExp };

// Order matters only for de-duplication; each rule fires independently.
const RULES: RefRule[] = [
  {
    section: "brain-dump",
    label: "Clear My Mind",
    emoji: "🧠",
    re: /\b(idea )?parking lot|brain ?dump|clear (your|my|the) (head|mind)|capture (your |the )?(ideas|thoughts)|get it (all )?out of your head|empty your head|write (it|them|every idea) down|park (your |the )?ideas\b/i,
  },
  {
    section: "spin-wheel",
    label: "Spin the Wheel",
    emoji: "🎡",
    re: /\bspin the wheel|let (something|chance) (pick|choose|decide)|can'?t (decide|choose|pick) (which|what)\b/i,
  },
  {
    section: "focus-timer",
    label: "Focus Session",
    emoji: "🎯",
    re: /\bfocus session|pomodoro|focused? block|25[\s-]?min|short (burst|sprint) of focus|set a timer\b/i,
  },
  {
    section: "time-block",
    label: "Time Block",
    emoji: "📅",
    re: /\btime ?block|schedule (it|time|the)|put it on (your|the) calendar|block (out )?time\b/i,
  },
  {
    section: "breathe",
    label: "Breathe & Reset",
    emoji: "🌿",
    re: /\bbreathe|breathing|slow breath|reset your (attention|nervous system)|ground (yourself|your body)\b/i,
  },
  {
    section: "projects",
    label: "Projects",
    emoji: "📁",
    re: /\bidea parking lot|keep a (running )?(list|note) of (ideas|projects)|one project at a time|break (it|this|the work) into (smaller )?(steps|phases|pieces)\b/i,
  },
];

// Returns the distinct in-app destinations a block of text refers to. Pass any
// combination of a strategy's text (problem, whyWorks, example, deeper, steps).
export function appReferences(...texts: (string | undefined)[]): AppReference[] {
  const hay = texts.filter(Boolean).join("\n");
  const out: AppReference[] = [];
  const seen = new Set<AppSection>();
  for (const rule of RULES) {
    if (seen.has(rule.section)) continue;
    if (rule.re.test(hay)) {
      seen.add(rule.section);
      out.push({ section: rule.section, label: rule.label, emoji: rule.emoji });
    }
  }
  return out;
}
