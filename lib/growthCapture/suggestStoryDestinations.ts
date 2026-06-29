import type { GrowthSectionId } from "@/lib/growthNavigation";

export type GrowthStoryDestinationId = Exclude<
  GrowthSectionId,
  "growth" | "confidence-vault" | "my-journey"
>;

export type GrowthStoryRecommendation = {
  id: GrowthStoryDestinationId;
  label: string;
  reason: string;
};

export type GrowthStoryCompanionSuggestion = {
  headline: string;
  recommendations: GrowthStoryRecommendation[];
};

const WIN_SIGNALS =
  /\b(finished|completed|proud|celebrate|win|went well|better than expected|courage|showed up|finally|accomplished|milestone|remember this)\b/i;

const EVIDENCE_SIGNALS =
  /\b(proof|grew|growth|confidence|impact|client|solved|worked|helped|improved|result|evidence|metric|outcome|difficult)\b/i;

const PORTFOLIO_SIGNALS =
  /\b(created|built|launched|published|designed|wrote|produced|course|campaign|project|portfolio)\b/i;

const JOURNAL_SIGNALS =
  /\b(feel|felt|feeling|reflection|learned|realized|grateful|processing|thinking about|today i|personal|overwhelmed)\b/i;

const DESTINATION_LABELS: Record<GrowthStoryDestinationId, string> = {
  "wins-this-week": "Celebration Garden",
  "evidence-bank": "Evidence Vault",
  "growth-journal": "Journal",
  "growth-portfolio": "Creative Studio",
};

function scoreDestinations(text: string): Map<GrowthStoryDestinationId, number> {
  const scores = new Map<GrowthStoryDestinationId, number>([
    ["wins-this-week", 0],
    ["evidence-bank", 0],
    ["growth-journal", 0],
    ["growth-portfolio", 0],
  ]);

  if (WIN_SIGNALS.test(text)) scores.set("wins-this-week", (scores.get("wins-this-week") ?? 0) + 2);
  if (EVIDENCE_SIGNALS.test(text)) scores.set("evidence-bank", (scores.get("evidence-bank") ?? 0) + 2);
  if (PORTFOLIO_SIGNALS.test(text)) scores.set("growth-portfolio", (scores.get("growth-portfolio") ?? 0) + 2);
  if (JOURNAL_SIGNALS.test(text)) scores.set("growth-journal", (scores.get("growth-journal") ?? 0) + 2);

  if (/\b(call|conversation|meeting)\b/i.test(text)) {
    scores.set("wins-this-week", (scores.get("wins-this-week") ?? 0) + 1);
    scores.set("evidence-bank", (scores.get("evidence-bank") ?? 0) + 1);
  }

  return scores;
}

const DESTINATION_REASONS: Record<GrowthStoryDestinationId, string> = {
  "wins-this-week": "it's something worth remembering.",
  "evidence-bank": "it shows proof of your confidence growing.",
  "growth-journal": "it sounds like private reflection worth keeping.",
  "growth-portfolio": "it's something you created or finished.",
};

/**
 * Companion-style multi-destination suggestion — user tells their story first.
 */
export function suggestGrowthStoryDestinations(
  body: string,
): GrowthStoryCompanionSuggestion {
  const text = body.trim();
  if (!text) {
    return {
      headline: "Tell me what happened — I'll help you keep it.",
      recommendations: [],
    };
  }

  const scores = scoreDestinations(text);
  const ranked = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  if (ranked.length === 0) {
    return {
      headline: "This feels important.",
      recommendations: [
        {
          id: "growth-journal",
          label: DESTINATION_LABELS["growth-journal"],
          reason: "you can always start here and move it later.",
        },
      ],
    };
  }

  const topScore = ranked[0][1];
  const recommendations = ranked
    .filter(([, score]) => score >= topScore - 1 && score > 0)
    .slice(0, 2)
    .map(([id]) => ({
      id,
      label: DESTINATION_LABELS[id],
      reason: DESTINATION_REASONS[id],
    }));

  return {
    headline: "This feels important.",
    recommendations,
  };
}
