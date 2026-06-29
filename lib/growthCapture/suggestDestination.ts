import type { GrowthDestinationSuggestion, GrowthPrimaryDestination } from "./types";

const EVIDENCE_SIGNALS =
  /\b(improved|solved|prevented|outcome|impact|client|strategy|worked|proved|evidence|metric|result|helped|fixed|reduced|increased)\b/i;

const PORTFOLIO_SIGNALS =
  /\b(created|built|launched|published|finished|completed|course|video|website|campaign|presentation|artwork|project|designed|wrote|produced)\b/i;

const JOURNAL_SIGNALS =
  /\b(feel|felt|feeling|reflection|learned|realized|personal|today i|grateful|hard day|overwhelmed|proud|processing|thinking about)\b/i;

/**
 * V1 heuristic destination suggestion — replaced by companion intelligence later.
 */
export function suggestGrowthDestination(body: string): GrowthDestinationSuggestion {
  const text = body.trim();
  if (!text) {
    return {
      destination: "uncategorized",
      confidence: "low",
      reason: "Save first — you can organize whenever you're ready.",
    };
  }

  let evidence = 0;
  let portfolio = 0;
  let journal = 0;

  if (EVIDENCE_SIGNALS.test(text)) evidence += 2;
  if (PORTFOLIO_SIGNALS.test(text)) portfolio += 2;
  if (JOURNAL_SIGNALS.test(text)) journal += 2;

  if (/\b(problem|issue|blocker)\b/i.test(text)) evidence += 1;
  if (/\b(draft|ship|release|deploy)\b/i.test(text)) portfolio += 1;
  if (/\b(I'm|I am|my heart|my mind)\b/i.test(text)) journal += 1;

  const scores: { dest: GrowthPrimaryDestination; score: number }[] = [
    { dest: "evidence-bank", score: evidence },
    { dest: "portfolio", score: portfolio },
    { dest: "journal", score: journal },
  ];
  scores.sort((a, b) => b.score - a.score);

  const top = scores[0];
  const second = scores[1];

  if (top.score === 0) {
    return {
      destination: "uncategorized",
      confidence: "low",
      reason: "Saved — file it when you know, or leave it here for now.",
    };
  }

  const confidence =
    top.score >= 3 || top.score - second.score >= 2
      ? "high"
      : top.score >= 2
        ? "medium"
        : "low";

  const reasons: Record<GrowthPrimaryDestination, string> = {
    "evidence-bank": "This looks like objective proof — impact, outcomes, or what worked.",
    portfolio: "This feels like something you created or finished.",
    journal: "This sounds like private reflection worth keeping.",
    uncategorized: "Saved — organize when you're ready.",
  };

  return {
    destination: top.dest,
    confidence,
    reason: reasons[top.dest],
  };
}
