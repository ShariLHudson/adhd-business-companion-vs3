// In-app reference detector. Wherever the Companion's content (a strategy, a
// deep dive, a tip) describes a technique that already EXISTS as a feature in
// the app — "keep an idea parking lot" (Clear My Mind), "can't decide which"
// (Spin the Wheel), "a focused block" (Focus Session) — we should name it AND
// give a one-tap way to get there. Same thinking everywhere: never describe a
// capability we have without offering the door to it.

import type { AppSection } from "./companionUi";
import { workspaceObjectId } from "./workspaceObjectIds";

export type AppReference = {
  section: AppSection;
  label: string;
  objectId: string;
};

type RefRule = AppReference & { re: RegExp };

const RULES: RefRule[] = [
  {
    section: "brain-dump",
    label: "Clear My Mind",
    objectId: "clear-my-mind",
    re: /\bbrain ?dump|clear (your|my|the) (head|mind)|mental clutter|crowded (head|brain)|can't think straight|get it (all )?out of your head|empty your head|sort (my|your) thoughts|too many thoughts\b/i,
  },
  {
    section: "focus",
    label: "Brain Parking Lot",
    objectId: "parking-lot",
    re: /\bbrain parking lot|park (this|that|it) for later|save (this|that|it) for later|idea (?:just )?popped up|don't want to lose (?:it|this)|while (?:i'm |im )?working\b/i,
  },
  {
    section: "focus",
    label: "Safe For Today",
    objectId: "safe-for-today",
    re: /\bsafe for today|permission not to|not (?:solving|doing) (?:this|it) today|can't deal with (?:this|it) today|postpone (?:the )?guilt\b/i,
  },
  {
    section: "spin-wheel",
    label: "Spin the Wheel",
    objectId: "spin-wheel",
    re: /\bspin the wheel|let (something|chance) (pick|choose|decide)|can'?t (decide|choose|pick) (which|what)\b/i,
  },
  {
    section: "focus-timer",
    label: "Focus Session",
    objectId: "focus-timer",
    re: /\bfocus session|pomodoro|focused? block|25[\s-]?min|short (burst|sprint) of focus|set a timer\b/i,
  },
  {
    section: "time-block",
    label: "Calendar",
    objectId: "calendar",
    re: /\btime ?block|schedule (it|time|the)|put it on (your|the) calendar|block (out )?time\b/i,
  },
  {
    section: "breathe",
    label: "Breathe",
    objectId: "breathing",
    re: /\bbreathe|breathing|slow breath|reset your (attention|nervous system)|ground (yourself|your body)\b/i,
  },
  {
    section: "projects",
    label: "Projects",
    objectId: "projects",
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
      out.push({
        section: rule.section,
        label: rule.label,
        objectId: rule.objectId ?? workspaceObjectId(rule.section),
      });
    }
  }
  return out;
}
