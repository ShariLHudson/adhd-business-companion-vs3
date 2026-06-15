/**
 * Supportive activation messages — small next steps, never shame or pressure.
 */

import type {
  ActivationBlockerType,
  ActivationState,
  CognitiveLoadLevelHint,
  LikelyBlocker,
} from "./types";

type BlockerGuidance = {
  suggestedNextStep: string;
  companionOffer: string;
};

const BLOCKER_GUIDANCE: Record<ActivationBlockerType, BlockerGuidance[]> = {
  overwhelm: [
    {
      suggestedNextStep: "Pick one priority and park the rest for now.",
      companionOffer:
        "It sounds like a lot is on your plate. Want to choose just one thing that matters today?",
    },
    {
      suggestedNextStep: "Shrink the list — what can wait until tomorrow?",
      companionOffer:
        "It looks like you may be carrying a lot right now. Would it help to sort this into what matters today, what can wait, and what can be parked?",
    },
  ],
  clarity: [
    {
      suggestedNextStep: "Name the very next physical step — not the whole project.",
      companionOffer:
        "It sounds like the next step isn't clear yet. Want to define one small action together?",
    },
    {
      suggestedNextStep: "Ask one simple question: what would done look like?",
      companionOffer:
        "Clarity might be the blocker. Want to clarify the outcome in one sentence?",
    },
  ],
  fear_rsd: [
    {
      suggestedNextStep: "Separate what you know from what you're assuming.",
      companionOffer:
        "It sounds like fear may be loud right now. Want a safe first step that doesn't require perfection?",
    },
    {
      suggestedNextStep: "Try a draft only you will see — no audience yet.",
      companionOffer:
        "Worry about reaction can freeze progress. Want to create a private rough version first?",
    },
  ],
  perfectionism: [
    {
      suggestedNextStep: "Define a good-enough version you could ship today.",
      companionOffer:
        "It sounds like the bar may feel too high. Want to name a 'good enough for now' version?",
    },
    {
      suggestedNextStep: "Set a finish line — one more pass, then pause.",
      companionOffer:
        "Perfectionism can keep things in draft forever. Want to set a small finish line together?",
    },
  ],
  energy: [
    {
      suggestedNextStep: "Choose a minimum viable task — 5 minutes max.",
      companionOffer:
        "Energy looks low. Want to pick the smallest possible step, not a big push?",
    },
    {
      suggestedNextStep: "Take a recovery step before any business task.",
      companionOffer:
        "You may need recovery more than output right now. Want a light plan for today?",
    },
  ],
  decision: [
    {
      suggestedNextStep: "Narrow to two options and pick one to try.",
      companionOffer:
        "Too many options can stall you. Want to narrow this to two choices?",
    },
    {
      suggestedNextStep: "Defer nonessential decisions until after one small win.",
      companionOffer:
        "Decision fatigue is real. Want help picking one decision worth making today?",
    },
  ],
  task_friction: [
    {
      suggestedNextStep: "Shrink the task to the first 5-minute step.",
      companionOffer:
        "It sounds like the task may be too big right now. Want to shrink it to the first 5-minute step?",
    },
    {
      suggestedNextStep: "Pair the task with a short timer or body-doubling session.",
      companionOffer:
        "Friction can make starting hard. Want to try a tiny timed sprint on just one piece?",
    },
  ],
};

const PRODUCTIVITY_BLOCKERS: ActivationBlockerType[] = [
  "task_friction",
  "perfectionism",
  "decision",
  "clarity",
];

export function buildActivationGuidance(
  primary: LikelyBlocker | null,
  state: ActivationState,
  loadLevel: CognitiveLoadLevelHint | null | undefined,
  rotationKey: string,
  energyLow = false,
): BlockerGuidance {
  if (!primary || state === "moving") {
    return {
      suggestedNextStep: "Keep going at your own pace.",
      companionOffer: "",
    };
  }

  if (loadLevel === "heavy" || loadLevel === "overloaded") {
    return {
      suggestedNextStep: "Reduce scope — pick one priority and park the rest.",
      companionOffer:
        "It looks like you may be carrying a lot right now. Would it help to sort this into what matters today, what can wait, and what can be parked?",
    };
  }

  if (
    energyLow &&
    (primary.type === "energy" ||
      PRODUCTIVITY_BLOCKERS.includes(primary.type))
  ) {
    return pickGuidance("energy", rotationKey);
  }

  return pickGuidance(primary.type, rotationKey);
}

function pickGuidance(
  type: ActivationBlockerType,
  rotationKey: string,
): BlockerGuidance {
  const pool = BLOCKER_GUIDANCE[type];
  let hash = 0;
  for (let i = 0; i < rotationKey.length; i++) {
    hash = (hash * 31 + rotationKey.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length] ?? pool[0]!;
}

export function inferActivationState(
  blockers: LikelyBlocker[],
  text: string,
  loadLevel: CognitiveLoadLevelHint | null | undefined,
): ActivationState {
  const stuckish = /\b(stuck|frozen|paralyz|can'?t start)\b/i.test(text);
  const overwhelmed =
    loadLevel === "overloaded" ||
    blockers.some((b) => b.type === "overwhelm" && b.confidence !== "low");

  if (overwhelmed && stuckish) return "frozen";
  if (overwhelmed) return "frozen";
  if (stuckish || blockers.some((b) => b.confidence !== "low")) return "stuck";
  if (blockers.length > 0) return "hesitant";
  if (/\b(recover|catching up|better now|lighter)\b/i.test(text)) {
    return "recovering";
  }
  return "moving";
}
