// Dynamic closing reflections for strategy detail pages.
// Per-category libraries rotate so the same line doesn't repeat every visit.
// Optional personalization uses lightweight client signals (projects, brain dump).

import type { AppSection } from "./companionUi";
import { getBrainDumps, getProjects } from "./companionStore";
import type { Strategy } from "./strategySystem";

const ROTATION_KEY = "companion-strategy-reflection-rotation-v1";

export type StrategyReflectionContext = {
  openProjectCount: number;
  brainDumpCount: number;
  frequentStarter: boolean;
};

export function buildReflectionContext(): StrategyReflectionContext {
  if (typeof window === "undefined") {
    return { openProjectCount: 0, brainDumpCount: 0, frequentStarter: false };
  }
  const projects = getProjects().filter((p) => p.status === "in-progress");
  const dumps = getBrainDumps().filter((e) => !e.done);
  return {
    openProjectCount: projects.length,
    brainDumpCount: dumps.length,
    frequentStarter: projects.length >= 3,
  };
}

const REFLECTIONS_BY_CATEGORY: Record<string, string[]> = {
  overwhelm: [
    "You don't have to carry every task at the same time.",
    "Shrinking the frame is not giving up — it's how you get moving again.",
    "The list can wait. Your nervous system can't.",
    "One calm hour beats a frantic day spread across twelve things.",
  ],
  procrastination: [
    "Momentum often begins before motivation.",
    "Starting small is not cheating — it's how ADHD brains actually move.",
    "Future You is easier to help than rescue.",
    "The wall is usually the start, not the work.",
  ],
  focus: [
    "Attention is a resource — protect it like revenue.",
    "One tab closed is one door you can actually walk through.",
    "Depth in one place beats presence in five.",
    "Your brain isn't broken for wandering — it needs fewer open doors.",
  ],
  perfectionism: [
    "Done in the world beats perfect in your head.",
    "Shipping is a skill — and you're allowed to practice it messy.",
    "The people who need your work aren't waiting for polish.",
    "Good enough today creates feedback perfect never gets.",
  ],
  burnout: [
    "Rest is part of the work, not a reward you earn after collapse.",
    "Subtracting one thing can free more energy than any new hack.",
    "You don't have to push harder right now.",
    "Capacity returns when demand drops — not when willpower rises.",
  ],
  "emotional-regulation": [
    "What you feel makes sense. You don't have to argue your way out of it.",
    "Borrowed belief counts until your own catches up.",
    "Comparison steals momentum — your race is the only one that matters.",
    "A hard feeling isn't a verdict on who you are.",
  ],
  "decision-making": [
    "Most doors swing both ways — pick one and learn from walking through.",
    "A good-enough choice today beats a perfect choice that never lands.",
    "You can't steer a parked car.",
    "Clarity often comes after the first step, not before it.",
  ],
  "future-thinking": [
    "Future You is easier to help than rescue.",
    "A breadcrumb today saves a scavenger hunt tomorrow.",
    "Time blindness fades when the future has a visible address.",
    "Small gifts to future-you compound quietly.",
  ],
  visibility: [
    "If it's not visible, your brain acts like it doesn't exist.",
    "Out of sight really is out of mind — design for that truth.",
    "A landing strip beats a storage unit for what matters now.",
    "Make the next step impossible to miss, not heroic to remember.",
  ],
  memory: [
    "If remembering worked reliably, you wouldn't need the strategy.",
    "Your brain is for thinking — give storage a home outside your head.",
    "Capture once, trust the system, free the mental RAM.",
    "A note by the bed beats a brilliant thought lost at 2 a.m.",
  ],
  marketing: [
    "You don't have to be everywhere — just findable to the right people.",
    "One channel done well beats five channels done thinly.",
    "Their words convert better than your guesses ever will.",
    "Consistency in one place is louder than novelty in many.",
  ],
  sales: [
    "Offering help is not the same as being pushy.",
    "Warm leads are half-earned — don't let them go cold.",
    "A clear ask respects the person enough to let them choose.",
    "Most yeses live in the follow-up, not the first hello.",
  ],
  content: [
    "You already know enough to share — you just need a starting point.",
    "One strong idea can wear many outfits this week.",
    "Real questions beat blank pages every time.",
    "Repurposing is smart, not lazy.",
  ],
  offers: [
    "Clear beats clever when someone is trying to buy.",
    "One path to yes beats a maze of options.",
    "Your offer is a promise — make it easy to understand.",
    "Confusion is friction; clarity is kindness.",
  ],
  pricing: [
    "Charging well is part of serving well.",
    "Your rate is a signal — make it match the value.",
    "One raised price teaches you more than weeks of guessing.",
    "Undercharging doesn't make you kinder — it makes you tired.",
  ],
  systems: [
    "Write it once so future-you doesn't pay the thinking tax again.",
    "A checklist is compassion for a brain that forgets under load.",
    "Systems aren't boring — they're how freedom gets built.",
    "Repeatable beats brilliant when you're running on fumes.",
  ],
  "customer-relations": [
    "The clients you have are your warmest next revenue.",
    "Fast fixes turn complaints into loyalty.",
    "Small gestures without an ask are what people remember.",
    "Boundaries early prevent resentment later.",
  ],
  productivity: [
    "Three done beats forty imagined.",
    "Motion isn't progress — pick the needle-movers.",
    "A finished short list beats an endless guilty one.",
    "Win the day with less on the page, not more on your back.",
  ],
  planning: [
    "A one-page plan you'll read beats a novel you'll abandon.",
    "Structure now saves scramble later.",
    "Three outcomes a week is enough direction to matter.",
    "React less by making the priority visible before Monday noise.",
  ],
  "business-decisions": [
    "Direction beats perfection when the map is still forming.",
    "Test small before you scale big.",
    "There's rarely one perfect choice — just a next one.",
    "A reversible experiment is cheaper than endless research.",
  ],
};

const PERSONALIZED: {
  when: (ctx: StrategyReflectionContext, subcatId: string) => boolean;
  line: string;
}[] = [
  {
    when: (ctx, subcat) => ctx.openProjectCount >= 2 && subcat === "overwhelm",
    line: "Remember, not everything needs to happen today.",
  },
  {
    when: (ctx, subcat) =>
      ctx.openProjectCount >= 3 &&
      (subcat === "focus" || subcat === "procrastination" || subcat === "overwhelm"),
    line: "Finishing one door often creates more progress than opening three.",
  },
  {
    when: (ctx, subcat) =>
      ctx.brainDumpCount >= 3 &&
      (subcat === "focus" || subcat === "memory" || subcat === "visibility"),
    line: "Your ideas are safe. They don't all need your attention right now.",
  },
  {
    when: (ctx, subcat) => ctx.frequentStarter && subcat === "procrastination",
    line: "Starting counts — even when the finish line feels far away.",
  },
];

type RotationStore = Record<string, number>;

function readRotation(): RotationStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ROTATION_KEY);
    return raw ? (JSON.parse(raw) as RotationStore) : {};
  } catch {
    return {};
  }
}

function writeRotation(store: RotationStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ROTATION_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable */
  }
}

function rotationKey(subcatId: string, strategyId: string): string {
  return `${subcatId}::${strategyId}`;
}

/** Pick a closing reflection — strategy-specific library, then category, with rotation. */
export function pickStrategyReflection(
  subcatId: string,
  strategy?: Pick<Strategy, "id" | "reflections">,
  ctx: StrategyReflectionContext = buildReflectionContext(),
): string {
  for (const rule of PERSONALIZED) {
    if (rule.when(ctx, subcatId)) return rule.line;
  }

  const pool =
    strategy?.reflections?.length
      ? strategy.reflections
      : REFLECTIONS_BY_CATEGORY[subcatId] ?? [
          "One strategy used today is worth more than ten remembered tomorrow.",
        ];

  const key = rotationKey(subcatId, strategy?.id ?? "_category");
  const store = readRotation();
  const last = store[key] ?? -1;
  const next = (last + 1) % pool.length;
  store[key] = next;
  writeRotation(store);
  return pool[next]!;
}

/** Default companion tools when strategy text doesn't mention any. */
export const CATEGORY_COMPANION_TOOLS: Record<string, AppSection[]> = {
  overwhelm: ["brain-dump", "breathe"],
  procrastination: ["focus-timer", "projects"],
  focus: ["focus-timer"],
  perfectionism: ["focus-timer"],
  burnout: ["breathe", "energy"],
  "emotional-regulation": ["home"],
  "decision-making": ["spin-wheel", "home"],
  "future-thinking": ["projects", "time-block"],
  visibility: ["projects", "time-block"],
  memory: ["brain-dump", "snippets"],
  marketing: ["content-generator", "time-block"],
  sales: ["email-generator", "projects"],
  content: ["content-generator", "time-block"],
  offers: ["content-generator", "projects"],
  pricing: ["home"],
  systems: ["templates-library", "snippets"],
  "customer-relations": ["email-generator", "projects"],
  productivity: ["time-block", "projects"],
  planning: ["time-block", "projects"],
  "business-decisions": ["spin-wheel", "home"],
};
