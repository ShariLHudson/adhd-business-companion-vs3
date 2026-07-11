/**
 * When Estate Intelligence should invite The Stables.
 */

export type StablesRecommendationMatch = {
  score: number;
  reason: string;
};

const STABLES_SIGNAL_RULES: { pattern: RegExp; score: number; reason: string }[] =
  [
    { pattern: /\b(?:i'?m|i am) nervous\b/i, score: 24, reason: "nervous" },
    {
      pattern: /\b(?:lack|lacking|low) (?:of )?confidence\b/i,
      score: 26,
      reason: "lack of confidence",
    },
    {
      pattern: /\b(?:afraid|scared) to raise (?:my )?prices?\b/i,
      score: 28,
      reason: "afraid to raise prices",
    },
    {
      pattern: /\bavoid(?:ing)? networking\b/i,
      score: 26,
      reason: "avoiding networking",
    },
    {
      pattern: /\b(?:afraid|scared) of speaking\b/i,
      score: 26,
      reason: "afraid of speaking",
    },
    {
      pattern: /\bdon'?t trust myself\b/i,
      score: 28,
      reason: "don't trust myself",
    },
    {
      pattern: /\bsecond[- ]?guess(?:ing)? everything\b/i,
      score: 26,
      reason: "second guessing",
    },
    {
      pattern: /\b(?:afraid|scared) of rejection\b/i,
      score: 26,
      reason: "afraid of rejection",
    },
    {
      pattern: /\bimposter\b/i,
      score: 22,
      reason: "imposter feelings",
    },
    {
      pattern: /\b(?:don'?t|do not) feel capable\b/i,
      score: 22,
      reason: "not capable",
    },
    {
      pattern: /\bneed grounding\b/i,
      score: 20,
      reason: "need grounding",
    },
  ];

export function scoreStablesRecommendation(
  text: string,
): StablesRecommendationMatch | null {
  let best: StablesRecommendationMatch | null = null;

  for (const rule of STABLES_SIGNAL_RULES) {
    if (!rule.pattern.test(text)) continue;
    if (!best || rule.score > best.score) {
      best = { score: rule.score, reason: rule.reason };
    }
  }

  return best;
}

export function shouldRecommendStables(text: string): boolean {
  const match = scoreStablesRecommendation(text);
  return Boolean(match && match.score >= 20);
}

export function stablesInvitationLine(): string {
  return "I'd like to take us somewhere that might help. Let's spend a few minutes at the Stables.";
}
