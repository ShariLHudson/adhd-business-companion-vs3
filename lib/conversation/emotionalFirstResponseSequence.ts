/**
 * Emotional-First Response Sequence™
 *
 * Before advice, scripts, or solutions:
 * 1. Detect emotional state
 * 2. Reflect in natural language
 * 3. Normalize without fixing
 * 4. Then structure / guidance (consumer applies)
 * 5. Always offer continuation — never end after a solution
 *
 * Understanding + copy planning only. Does not send messages or route.
 *
 * @see docs/EMOTIONAL_FIRST_RESPONSE_SEQUENCE.md
 * @see docs/RELATIONSHIP_CONSTITUTION.md
 * @see docs/SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md (Rule 1 — Reflect)
 */

import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import {
  detectUniversalDocumentType,
  shouldEnterUniversalCreation,
} from "@/lib/universalCreation/orchestrator";

export type MemberEmotionalSignal =
  | "fear"
  | "avoidance"
  | "overwhelm"
  | "uncertainty"
  | "stress"
  | "grief"
  | "shame"
  | "exhaustion"
  | "frustration"
  | "discouragement"
  | "pride"
  | "excitement"
  | "confusion"
  | "conflict_dread";

export type EmotionalFirstResponsePhase =
  | "detect"
  | "reflect"
  | "normalize"
  | "guide"
  | "continue";

export type EmotionalFirstResponseInput = {
  text: string;
  /** When true, plan still requires reflect + normalize before guidance */
  hasSolutionReady?: boolean;
};

export type EmotionalFirstResponsePlan = {
  phases: EmotionalFirstResponsePhase[];
  detectedSignals: MemberEmotionalSignal[];
  reflection: string | null;
  normalization: string | null;
  /** Consumer may attach structure / advice only after reflect + normalize */
  mayProceedToGuidance: boolean;
  continuationOffers: readonly string[];
  requiresEmotionalFirstSequence: boolean;
  reasoning: string;
};

const CONFLICT_DREAD_RE =
  /\b(?:conflict|confrontation|dread(?:ing)? (?:the )?call|boundary conversation|hard conversation|difficult client)\b/i;

const SIGNAL_RULES: readonly {
  signal: MemberEmotionalSignal;
  pattern: RegExp;
}[] = [
  {
    signal: "overwhelm",
    pattern:
      /\b(?:overwhelm(?:ed|ing)?|too much|can'?t cope|drowning|fried|burnt?\s*out|shutdown|everything at once)\b/i,
  },
  {
    signal: "fear",
    pattern:
      /\b(?:afraid|scared|fear|terrified|what if|worried i(?:'ll| will)|might fail|might lose)\b/i,
  },
  {
    signal: "avoidance",
    pattern:
      /\b(?:avoid(?:ing)?|procrastinat(?:e|ing)|putting (?:it|this) off|can'?t start|haven'?t started|keep delaying)\b/i,
  },
  {
    signal: "uncertainty",
    pattern:
      /\b(?:don'?t know|not sure|uncertain|no idea|confused about|can'?t tell|which way|stuck between)\b/i,
  },
  {
    signal: "stress",
    pattern:
      /\b(?:stress(?:ed|ful)?|anxious|anxiety|tense|on edge|wound up|frazzled|pressure)\b/i,
  },
  {
    signal: "grief",
    pattern:
      /\b(?:grief|grieving|loss|lost (?:my|the)|miss (?:them|him|her)|passed away|goodbye)\b/i,
  },
  {
    signal: "shame",
    pattern:
      /\b(?:ashamed|embarrassed|feel stupid|like a failure|should have|behind everyone|not good enough)\b/i,
  },
  {
    signal: "exhaustion",
    pattern:
      /\b(?:exhausted|drained|no energy|low energy|can'?t keep going|wiped|depleted|tired of)\b/i,
  },
  {
    signal: "frustration",
    pattern:
      /\b(?:frustrat(?:ed|ing)|annoyed|stuck again|this keeps happening|why won'?t it)\b/i,
  },
  {
    signal: "discouragement",
    pattern:
      /\b(?:discouraged|hopeless|what'?s the point|giving up|not working|nothing works)\b/i,
  },
  {
    signal: "pride",
    pattern:
      /\b(?:proud|i did it|nailed it|finally got|big win|so happy about)\b/i,
  },
  {
    signal: "excitement",
    pattern:
      /\b(?:excited|can'?t wait|thrilled|pumped|so ready)\b/i,
  },
  {
    signal: "confusion",
    pattern:
      /\b(?:confused|makes no sense|can'?t figure out|all over the place)\b/i,
  },
  {
    signal: "conflict_dread",
    pattern: CONFLICT_DREAD_RE,
  },
];

/** Purely informational / definitional — skip emotional-first layering */
const FACTUAL_SKIP_RE =
  /^(?:what is|what are|how do i|how does|define|explain|when is|where is|who is)\b/i;

const REFLECTION_LINES: Record<MemberEmotionalSignal, readonly string[]> = {
  overwhelm: [
    "It sounds like a lot is landing on you at once.",
    "That's a heavy load — I hear you.",
    "Feels like everything is asking for attention right now.",
  ],
  fear: [
    "There's some real fear in what you're carrying.",
    "It sounds like part of you is bracing for what might happen.",
    "I can hear the worry underneath this.",
  ],
  avoidance: [
    "It sounds like starting has been harder than the thing itself.",
    "Something about this keeps getting pushed to later — that makes sense to name.",
    "You're not lazy — it sounds like the door feels heavy right now.",
  ],
  uncertainty: [
    "You're standing in the not-knowing — that's uncomfortable.",
    "It sounds like the path isn't clear yet.",
    "Not having a clear next step can be its own kind of tired.",
  ],
  stress: [
    "You're carrying a lot of tension in this.",
    "It sounds like your nervous system is on high alert.",
    "There's pressure here — I hear it.",
  ],
  grief: [
    "This carries real loss — I'm here with you in it.",
    "Something precious is missing from the picture right now.",
    "Grief doesn't need fixing — it needs room.",
  ],
  shame: [
    "It sounds like you're being hard on yourself.",
    "There's a sting in this — like you expected more from yourself.",
    "I hear shame in this, not failure.",
  ],
  exhaustion: [
    "You're running on empty — that matters.",
    "It sounds like you've been giving more than you've had back.",
    "Tired isn't a character flaw — it's a signal.",
  ],
  frustration: [
    "Something keeps bumping up against you here.",
    "It sounds like you've hit the same wall more than once.",
    "The frustration makes sense — you care about this working.",
  ],
  discouragement: [
    "It sounds like hope got a little thin.",
    "You're wondering if any of this is worth the effort right now.",
    "Discouragement often shows up right before a pivot — or a rest.",
  ],
  pride: [
    "There's real pride in this — I can hear it.",
    "Something good landed for you here.",
  ],
  excitement: [
    "There's energy in what you're saying.",
    "Something about this has you lit up.",
  ],
  confusion: [
    "A lot is swirling — it's hard to grab one thread.",
    "You're trying to hold more than one thing at once.",
  ],
  conflict_dread: [
    "This sounds like one of those conversations that feels heavier than the words.",
    "I can see why you'd want to avoid this call.",
  ],
};

const NORMALIZATION_LINES: Record<MemberEmotionalSignal, readonly string[]> = {
  overwhelm: [
    "A lot of capable people hit this wall — especially when everything matters at once.",
    "Nothing is wrong with you for feeling full.",
  ],
  fear: [
    "Fear usually shows up when something important is on the line.",
    "It makes sense your mind is trying to protect you.",
  ],
  avoidance: [
    "Avoidance is often a nervous system move — not a moral one.",
    "When the stakes feel high, starting can feel disproportionately hard.",
  ],
  uncertainty: [
    "Not knowing yet is a normal part of real decisions.",
    "Clarity often comes after you've sat with the fog a little.",
  ],
  stress: [
    "Stress doesn't mean you're failing — it means something matters.",
    "Your body is responding to real pressure.",
  ],
  grief: [
    "There's no right timeline for this.",
    "Love and loss travel together — what you're feeling belongs here.",
  ],
  shame: [
    "Shame shrinks when it's spoken — you're not alone in this feeling.",
    "Most entrepreneurs have a voice like this; it isn't the truth about you.",
  ],
  exhaustion: [
    "Rest isn't earned — sometimes it's required.",
    "You've been human in a demanding season.",
  ],
  frustration: [
    "Frustration usually means you still care — apathy would be quieter.",
    "Repeated friction is exhausting; your reaction is understandable.",
  ],
  discouragement: [
    "Discouragement is a season, not a verdict.",
    "It's okay if today doesn't feel like momentum.",
  ],
  pride: [
    "You earned this — it's okay to let it land.",
    "Pride here makes sense; you did something that mattered.",
  ],
  excitement: [
    "There's real energy in this — we can channel it without rushing.",
    "Excitement often means something important is waking up.",
  ],
  confusion: [
    "Confusion usually means you're holding more than one true thing at once.",
    "Not knowing yet doesn't mean you're behind.",
  ],
  conflict_dread: [
    "Dreading a hard conversation usually means you care about the relationship.",
    "Avoiding the call isn't weakness — it's your nervous system bracing.",
  ],
};

const CONTINUATION_OFFERS = {
  presence: [
    "We can stay here — no rush.",
    "I'm here if you just want to talk it through.",
    "We don't have to solve anything right now.",
  ],
  practice: [
    "Want to try one small piece together?",
    "We could walk through just the next inch — not the whole thing.",
    "Happy to practice one step with you if that helps.",
  ],
  refinement: [
    "We can refine this until it feels right.",
    "Want to adjust what we have so far?",
    "We can shape this more — your call on pace.",
  ],
} as const;

function pickVariant<T>(items: readonly T[], seed: string): T {
  const code = [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return items[code % items.length]!;
}

/** Detect emotional signals in member text — observation, not diagnosis. */
export function detectMemberEmotionalSignals(text: string): MemberEmotionalSignal[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const skipConflictDread =
    /\b(?:email|e-mail|letter|write|draft|compose)\b/i.test(trimmed);

  const found: MemberEmotionalSignal[] = [];
  for (const rule of SIGNAL_RULES) {
    if (rule.signal === "conflict_dread" && skipConflictDread) continue;
    if (rule.pattern.test(trimmed)) found.push(rule.signal);
  }
  return found;
}

export function shouldUseEmotionalFirstSequence(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (
    shouldEnterUniversalCreation(trimmed) ||
    isSimpleCreateRequest(trimmed) ||
    detectUniversalDocumentType(trimmed)
  ) {
    return false;
  }
  if (/\b(?:write|draft|compose)\b/i.test(trimmed) && /\b(?:email|letter)\b/i.test(trimmed)) {
    return false;
  }
  if (FACTUAL_SKIP_RE.test(trimmed) && detectMemberEmotionalSignals(trimmed).length === 0) {
    return false;
  }
  return detectMemberEmotionalSignals(trimmed).length > 0;
}

function buildContinuationOffers(
  signals: MemberEmotionalSignal[],
  hasSolutionReady: boolean,
  seed: string,
): readonly string[] {
  const offers: string[] = [
    pickVariant(CONTINUATION_OFFERS.presence, seed),
  ];

  if (hasSolutionReady || signals.includes("uncertainty") || signals.includes("avoidance")) {
    offers.push(pickVariant(CONTINUATION_OFFERS.refinement, `${seed}-refine`));
  } else {
    offers.push(pickVariant(CONTINUATION_OFFERS.practice, `${seed}-practice`));
  }

  if (offers.length < 3) {
    offers.push(pickVariant(CONTINUATION_OFFERS.presence, `${seed}-stay`));
  }

  return offers.slice(0, 3);
}

/**
 * Plan the emotional-first sequence for a turn.
 * Consumers must order: reflect → normalize → guidance → continuation.
 */
export function planEmotionalFirstResponse(
  input: EmotionalFirstResponseInput,
): EmotionalFirstResponsePlan {
  const text = input.text.trim();
  const signals = detectMemberEmotionalSignals(text);

  if (!shouldUseEmotionalFirstSequence(text)) {
    return {
      phases: ["guide", "continue"],
      detectedSignals: [],
      reflection: null,
      normalization: null,
      mayProceedToGuidance: true,
      continuationOffers: [
        pickVariant(CONTINUATION_OFFERS.presence, text),
        pickVariant(CONTINUATION_OFFERS.practice, `${text}-p`),
      ],
      requiresEmotionalFirstSequence: false,
      reasoning: "No emotional signal — guidance may lead; still offer continuation.",
    };
  }

  const primary = signals[0]!;
  const reflection = pickVariant(REFLECTION_LINES[primary], text);
  const normalization = pickVariant(NORMALIZATION_LINES[primary], `${text}-norm`);

  return {
    phases: ["detect", "reflect", "normalize", "guide", "continue"],
    detectedSignals: signals,
    reflection,
    normalization,
    mayProceedToGuidance: true,
    continuationOffers: buildContinuationOffers(
      signals,
      Boolean(input.hasSolutionReady),
      text,
    ),
    requiresEmotionalFirstSequence: true,
    reasoning: `Emotional signal(s): ${signals.join(", ")} — reflect and normalize before guidance; never end without continuation.`,
  };
}

/** Internal prompt hint — ordering law for response builders. */
export function emotionalFirstResponseHint(plan: EmotionalFirstResponsePlan): string {
  if (!plan.requiresEmotionalFirstSequence) {
    return [
      "EMOTIONAL-FIRST SEQUENCE: No strong emotional signal.",
      "After any guidance, offer continuation — do not end the interaction.",
    ].join("\n");
  }

  const lines = [
    "EMOTIONAL-FIRST SEQUENCE (mandatory order):",
    "1. Detect — already done internally.",
    `2. Reflect — lead with something like: "${plan.reflection}"`,
    `3. Normalize — without fixing: "${plan.normalization}"`,
    "4. Only then — structure, advice, or solution (if appropriate).",
    "5. Always end with continuation — never stop after the solution.",
    `   Continuation options: ${plan.continuationOffers.join(" · ")}`,
    "FORBIDDEN: Jump to fixes · therapy jargon · 'You should' · closing the conversation.",
  ];
  return lines.join("\n");
}

/** Assemble member-facing opening (reflect + normalize) — Shari voice, one breath at a time. */
export function formatEmotionalFirstOpening(plan: EmotionalFirstResponsePlan): string | null {
  if (!plan.requiresEmotionalFirstSequence || !plan.reflection || !plan.normalization) {
    return null;
  }
  return `${plan.reflection} ${plan.normalization}`;
}

/** Continuation line after guidance — never imply the session ended. */
export function formatEmotionalContinuation(plan: EmotionalFirstResponsePlan): string {
  const offer = plan.continuationOffers[0] ?? "We can keep going whenever you're ready.";
  return offer;
}
