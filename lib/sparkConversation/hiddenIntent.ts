/**
 * Hidden Intent — Spec 121 / CT-11.
 * Invisible to members. Coaches Spark toward mentor behavior, not task-bot.
 *
 * @see docs/conversation-tests/ct-11.md
 * @see docs/conversation-gold-standards/gs-hidden-intent.md
 */

export type HiddenIntentConfidence = "high" | "medium";

export type HiddenIntentHypothesis = {
  patternId: string;
  literalRequest: string;
  hiddenGoal: string;
  coachingAngle: string;
  confidence: HiddenIntentConfidence;
};

const HIDDEN_INTENT_PATTERNS: readonly {
  id: string;
  pattern: RegExp;
  literalRequest: string;
  hiddenGoal: string;
  coachingAngle: string;
}[] = [
  {
    id: "sop",
    pattern: /\b(sop|standard operating procedure|process doc(?:ument)?)\b/i,
    literalRequest: "SOP / process documentation",
    hiddenGoal: "Train someone (often a VA) to work independently without constant questions",
    coachingAngle:
      "Ask who needs to run this without them in the room — independence, not documentation for its own sake.",
  },
  {
    id: "newsletter",
    pattern: /\b(newsletter|email list|mailing list|substack)\b/i,
    literalRequest: "Newsletter / email list",
    hiddenGoal: "Build trust with an audience before or between sales",
    coachingAngle:
      "Ask who it is for and what they should feel after reading — trust and relationship, not tooling or cadence first.",
  },
  {
    id: "pricing",
    pattern: /\b(pric(e|ing)|what to charge|rate|fees?)\b/i,
    literalRequest: "Pricing help",
    hiddenGoal: "Feel confident charging what the offer is actually worth",
    coachingAngle:
      "Explore whether the blocker is picking a number or believing it is fair — confidence and worth, not formulas first.",
  },
  {
    id: "website",
    pattern: /\b(website|web site|landing page|homepage)\b/i,
    literalRequest: "Website",
    hiddenGoal: "Create credibility and generate the right leads",
    coachingAngle:
      "Ask what a stranger should understand or do in the first ten seconds — legitimacy and conversion, not pages or builders first.",
  },
  {
    id: "marketing",
    pattern: /\b(marketing help|help (?:with )?marketing|get more (?:people|clients)|promot(?:e|ion))\b/i,
    literalRequest: "Marketing help",
    hiddenGoal: "Help more people understand why the business is different",
    coachingAngle:
      "Explore what feels misunderstood about the offer — differentiation and relationship, not tactics or channels first.",
  },
];

/**
 * Detect a likely hidden intent behind a literal business request.
 * Returns null when no mentor-relevant pattern matches.
 */
export function detectHiddenIntent(message: string): HiddenIntentHypothesis | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  for (const entry of HIDDEN_INTENT_PATTERNS) {
    if (!entry.pattern.test(trimmed)) continue;
    return {
      patternId: entry.id,
      literalRequest: entry.literalRequest,
      hiddenGoal: entry.hiddenGoal,
      coachingAngle: entry.coachingAngle,
      confidence: "high",
    };
  }

  const needMatch = trimmed.match(
    /\b(?:i )?need (?:an? |the )?(.{3,60}?)(?:\.|$)/i,
  );
  if (needMatch) {
    const literal = needMatch[1].trim();
    if (literal.length >= 3) {
      return {
        patternId: "generic_need",
        literalRequest: literal,
        hiddenGoal: "Clarify the real outcome behind the deliverable they named",
        coachingAngle:
          "Wonder what success looks like beyond having the thing — one gentle question before any template or outline.",
        confidence: "medium",
      };
    }
  }

  return null;
}

/** Prompt block for companion-chat — never shown to members. */
export function buildHiddenIntentPromptHint(
  hypothesis: HiddenIntentHypothesis,
): string {
  return [
    "HIDDEN INTENT (CT-11 / Spec 121 — mentor, not task-bot):",
    `Literal request: ${hypothesis.literalRequest}`,
    `Likely underlying goal: ${hypothesis.hiddenGoal}`,
    `Coaching angle: ${hypothesis.coachingAngle}`,
    "TURN 1: Do NOT output outlines, templates, structures, step lists, or tool recommendations.",
    "TURN 1: Do NOT draft, create, or open any workspace — permission comes after the why is clear.",
    "Exactly ONE coaching question OR one short reflection — wonder, do not diagnose.",
    "Never say: Here's a structure, Let me draft, I'll create, or Let's pick a platform.",
  ].join(" ");
}

/** Iceberg / dev summary line */
export function summarizeHiddenIntent(hypothesis: HiddenIntentHypothesis): string {
  return `Hidden intent: ${hypothesis.literalRequest} → ${hypothesis.hiddenGoal}`;
}
