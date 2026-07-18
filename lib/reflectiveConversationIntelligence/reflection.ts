/**
 * Reflection engine — meaning / tension / assumption; never paraphrase.
 */

import type { RciConversationArchetype, ThinkingMap } from "./types";

function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length]!;
}

const BY_ARCHETYPE: Record<RciConversationArchetype, readonly string[]> = {
  "business-decision": [
    "I wonder whether the hard part is choosing — or trusting yourself after you choose.",
    "Tell me if this fits: it may be less about the options, and more about what each one would ask of you.",
    "I am curious whether one option feels safer, even if it is not the one you want.",
    "Hiring help often comes down to cost, timing, and what you most want off your plate.",
  ],
  planning: [
    "I wonder if the plan is carrying more than a plan should — maybe a hope for certainty.",
    "It may be that the calendar is full, but the real question is what deserves the first quiet hour.",
    "Tell me if I am off: something about sequencing feels heavier than the tasks themselves.",
  ],
  "creative-block": [
    "I wonder if the block is about the work — or about needing it to be good before it exists.",
    "Sometimes a blank page is really a crowded mind. Does that fit at all?",
    "I am curious whether interest left, or fear of a mediocre draft arrived.",
  ],
  overwhelm: [
    "I wonder if everything feels equally loud, so nothing feels like a safe place to begin.",
    "Tell me if this fits: the load may be real, and the fog is making it look even larger.",
    "It may be less about doing more, and more about finding one place where your mind can land.",
  ],
  "fear-avoidance": [
    "I wonder what the avoidance is protecting — sometimes it is wiser than it looks.",
    "Tell me if I am reading this wrong: waiting may feel safer than finding out.",
    "I am curious whether the fear is about the outcome, or about how you will feel in the middle of it.",
  ],
  relationship: [
    "I wonder if the conversation is hard because something important is at stake — not because you lack words.",
    "Tell me if this fits: part of you wants honesty, and part of you wants to protect the relationship.",
    "I may be off, but the delay might be about aftercare — what happens after the words are said.",
  ],
  "opportunity-evaluation": [
    "I wonder whether the hesitation is about them — or about what yes would change for you.",
    "Tell me if this fits: opportunity and cost may be arriving in the same package.",
    "I am curious what would need to be true for this to feel like a clear yes.",
  ],
  "identity-confidence": [
    "I wonder if the doubt is about skill — or about belonging in the room where the skill shows.",
    "Tell me if I am off: you may already know more than the critical voice is allowing.",
    "I am curious what evidence you are using — and what evidence you are quietly ignoring.",
  ],
  "reflection-after-event": [
    "I wonder what you are still carrying from that — not just what happened.",
    "Tell me if this fits: the facts may be settled, but the meaning is still moving.",
    "I am curious what you want to take forward, and what you are ready to leave behind.",
  ],
  other: [
    "I wonder what feels most unfinished in what you just said.",
    "I am curious which part of this keeps pulling your attention back.",
    "What feels most useful to understand about this first?",
  ],
};

export function buildGentleObservation(
  map: ThinkingMap,
  seed: number,
): string {
  return pick(BY_ARCHETYPE[map.archetype] ?? BY_ARCHETYPE.other, seed);
}

export function buildTentativePattern(map: ThinkingMap, seed: number): string {
  const lines = [
    "I may be noticing a pattern of waiting until certainty arrives — which rarely does.",
    "There might be a pull between protecting your energy and wanting to move something forward.",
    "I wonder if this is another moment where starting feels riskier than staying stuck.",
  ];
  if (map.patterns.length > 0) {
    return pick(
      [
        "I may be off, but this seems related to a pattern you have touched before — coming close, then pausing.",
        "Tell me if this fits: the same tension may be showing up in a new outfit.",
      ],
      seed,
    );
  }
  return pick(lines, seed);
}

export function buildConnection(map: ThinkingMap, seed: number): string {
  if (map.concerns[0] && map.values[0]) {
    return `I am curious about the relationship between what you care about and what feels risky — they may be tugging on each other.`;
  }
  if (map.optionsNamed.length >= 2) {
    return `I wonder how those options connect to the outcome you want — not just which one is easier.`;
  }
  return pick(
    [
      "I am curious how the pieces you named connect to each other.",
      "Tell me if this fits: two parts of what you said may be linked more than they look.",
    ],
    seed,
  );
}

export function buildInviteContinue(seed: number): string {
  return pick(
    [
      "What else is true about that part?",
      "Stay with that for a moment — what else belongs with it?",
      "Which detail of that feels most useful to unpack next?",
    ],
    seed,
  );
}

export function buildClarification(seed: number): string {
  return pick(
    [
      "Can I ask you something? When you say that, what do you mean by the hardest part?",
      "I am curious about one part of that — what feels most alive in it right now?",
      "What keeps pulling your attention back to this?",
    ],
    seed,
  );
}

export function buildSummary(map: ThinkingMap): string {
  const bits: string[] = [];
  if (map.situation) bits.push("the situation you named");
  if (map.concerns[0]) bits.push("what feels at risk");
  if (map.goal) bits.push("what you are hoping for");
  if (map.optionsNamed.length) bits.push("the options you have already named");
  if (bits.length === 0) {
    return "A few things seem clearer already — what still feels unsettled for you?";
  }
  return `So far I am holding ${bits.slice(0, 3).join(", ")}. Does that match what feels most true?`;
}
