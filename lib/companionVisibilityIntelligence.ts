/**
 * Visibility & Marketing Confidence — ADHD Entrepreneur Behavioral Framework™.
 * Many "marketing problems" are visibility, confidence, and emotional safety problems.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { ActualNeed, IntuitiveSignal } from "./companionIntuitiveAwareness";

export type VisibilityAdhdPattern =
  | "visibility_fear"
  | "fear_of_judgment"
  | "fear_of_criticism"
  | "rejection_sensitivity"
  | "validation_seeking"
  | "content_perfectionism"
  | "visibility_avoidance"
  | "comparison_spiral"
  | "engagement_obsession"
  | "visibility_hangover"
  | "fear_of_success"
  | "inconsistent_visibility";

export type VisibilityIntelligenceAnalysis = {
  inVisibilityContext: boolean;
  patterns: VisibilityAdhdPattern[];
  primaryPattern: VisibilityAdhdPattern | null;
  actualNeed: ActualNeed | null;
  signals: IntuitiveSignal[];
  companionMove: string;
  adhdTranslation: string;
};

export const VISIBILITY_SCORECARD_THRESHOLDS = {
  understanding: 80,
  trust: 80,
  confidence: 85,
  momentum: 80,
  action: 85,
  routing: 75,
  overanalysis: 85,
  adhdAlignment: 90,
} as const;

const VISIBILITY_CONTEXT_RE =
  /\b(?:video|post(?:ing)?|publish|content|visible|visibility|webinar|speak(?:ing)?|brand(?:ing)?|camera|record(?:ing)?|likes?|comments?|engagement|audience|marketing)\b/i;

const PATTERN_RULES: { pattern: VisibilityAdhdPattern; re: RegExp }[] = [
  {
    pattern: "visibility_avoidance",
    re: /\b(?:keep putting (?:it )?off|putting off (?:making |recording )?|avoiding (?:video|posting|visibility)|before i start posting|better brand before)\b/i,
  },
  {
    pattern: "visibility_fear",
    re: /\b(?:scared to (?:post|be seen|go live)|afraid (?:to be seen|people will)|fear of (?:being seen|visibility)|terrified|nobody will show up)\b/i,
  },
  {
    pattern: "fear_of_judgment",
    re: /\b(?:look foolish|looking stupid|people will judge|fear of judgment|what will people think)\b/i,
  },
  {
    pattern: "fear_of_criticism",
    re: /\b(?:negative comments?|people disagree|fear of criticism|criticized|hate comments)\b/i,
  },
  {
    pattern: "rejection_sensitivity",
    re: /\b(?:what if people disagree|afraid they(?:'ll| will) hate|nobody will like)\b/i,
  },
  {
    pattern: "validation_seeking",
    re: /\b(?:keep checking likes|checking comments|refreshing|obsessing over (?:likes|metrics|engagement))\b/i,
  },
  {
    pattern: "content_perfectionism",
    re: /\b(?:recorded it \d+ times|still don'?t like it|isn'?t quite ready|not ready to publish|endless (?:editing|rewriting))\b/i,
  },
  {
    pattern: "comparison_spiral",
    re: /\b(?:everyone else is doing better|they(?:'re| are) ahead of me|comparison|falling behind)\b/i,
  },
  {
    pattern: "engagement_obsession",
    re: /\b(?:nobody responded|no (?:likes|engagement)|worked hard and nobody|metrics obsession)\b/i,
  },
  {
    pattern: "visibility_hangover",
    re: /\b(?:posted once and vanish(?:ed)?|disappeared after posting|posted and went quiet|visibility hangover)\b/i,
  },
  {
    pattern: "fear_of_success",
    re: /\b(?:afraid if it works|scared of success|what if it actually takes off)\b/i,
  },
  {
    pattern: "inconsistent_visibility",
    re: /\b(?:post for a few days then disappear|inconsistent posting|stop posting after|can'?t keep up posting)\b/i,
  },
];

function userLines(messages: ChatTurn[]): string[] {
  return messages.filter((m) => m.role === "user").map((m) => m.content);
}

function inferVisibilityActualNeed(
  text: string,
  patterns: VisibilityAdhdPattern[],
): ActualNeed | null {
  if (
    patterns.includes("visibility_avoidance") ||
    /\b(?:better brand before|putting off (?:making |recording )?videos?)\b/i.test(text)
  ) {
    return /\b(?:brand|posting|publish)\b/i.test(text) ? "launch_move" : "start_execution";
  }
  if (
    patterns.includes("content_perfectionism") ||
    /\b(?:isn'?t quite ready|recorded it \d+ times)\b/i.test(text)
  ) {
    return "start_execution";
  }
  if (patterns.includes("inconsistent_visibility")) {
    return "clarify_direction";
  }
  if (patterns.includes("validation_seeking")) {
    return "clarify_direction";
  }
  if (patterns.includes("engagement_obsession")) {
    return "build_confidence";
  }
  if (
    patterns.includes("comparison_spiral") ||
    patterns.includes("visibility_hangover") ||
    patterns.includes("fear_of_criticism") ||
    patterns.includes("rejection_sensitivity") ||
    patterns.includes("visibility_fear") ||
    patterns.includes("fear_of_judgment") ||
    /\b(?:terrified|nobody will show up|nobody responded)\b/i.test(text)
  ) {
    return "build_confidence";
  }
  if (patterns.includes("fear_of_success")) {
    return "build_confidence";
  }
  return null;
}

function visibilitySignals(patterns: VisibilityAdhdPattern[]): IntuitiveSignal[] {
  const signals = new Set<IntuitiveSignal>();
  if (
    patterns.some((p) =>
      ["visibility_avoidance", "content_perfectionism", "inconsistent_visibility"].includes(p),
    )
  ) {
    signals.add("avoidance");
  }
  if (
    patterns.some((p) =>
      [
        "visibility_fear",
        "fear_of_judgment",
        "fear_of_criticism",
        "rejection_sensitivity",
        "fear_of_success",
      ].includes(p),
    )
  ) {
    signals.add("resistance");
  }
  if (
    patterns.some((p) =>
      ["comparison_spiral", "engagement_obsession", "visibility_hangover"].includes(p),
    )
  ) {
    signals.add("discouragement");
  }
  if (patterns.includes("validation_seeking")) signals.add("hesitation");
  return [...signals];
}

function companionMoveForVisibility(
  primaryPattern: VisibilityAdhdPattern | null,
  actualNeed: ActualNeed | null,
): string {
  switch (primaryPattern) {
    case "visibility_avoidance":
      return "One simple visibility action — record or publish the smallest version. No content strategy.";
    case "content_perfectionism":
      return "Define good enough to publish. Post or ship — stop re-recording.";
    case "validation_seeking":
      return "Reconnect to purpose, not metrics. Step away from the dopamine loop.";
    case "inconsistent_visibility":
      return "Create a rhythm you can sustain — not an aggressive content calendar.";
    case "fear_of_criticism":
    case "rejection_sensitivity":
      return "Normalize visibility discomfort. Focus on helping one person — not winning everyone.";
    case "visibility_fear":
      return "Reduce scope. One low-exposure visibility step that still moves you forward.";
    case "comparison_spiral":
      return "Ground in your evidence and progress — not someone else's highlight reel.";
    case "engagement_obsession":
      return "Separate effort from immediate results. Protect consistency over instant validation.";
    case "visibility_hangover":
      return "Normalize the post-publish crash. Gentle re-entry — no shame.";
    case "fear_of_judgment":
      return "It's normal to feel exposed. One audience-focused message beats hiding.";
    default:
      if (actualNeed === "build_confidence") {
        return "Evidence-based confidence recovery — what went well, one next visibility step.";
      }
      if (actualNeed === "launch_move") {
        return "Check if branding truly blocks publishing. Move toward one visible action.";
      }
      return "One post, one video, one rhythm — decide what visibility needs to accomplish today.";
  }
}

export function analyzeVisibilityIntelligence(input: {
  userText: string;
  messages: ChatTurn[];
}): VisibilityIntelligenceAnalysis | null {
  const text = input.userText.trim();
  const haystack = [...userLines(input.messages), text].join(" ");

  const isVideoAvoidance =
    /\b(?:should make videos?|making videos?)\b/i.test(haystack) &&
    /\b(?:putting (?:it )?off|keep putting)\b/i.test(text);

  const patterns = PATTERN_RULES.filter(({ re }) => re.test(haystack)).map((r) => r.pattern);
  if (isVideoAvoidance && !patterns.includes("visibility_avoidance")) {
    patterns.unshift("visibility_avoidance");
  }

  if (!VISIBILITY_CONTEXT_RE.test(haystack) && !isVideoAvoidance && patterns.length === 0) {
    return null;
  }

  const primaryPattern = patterns[0] ?? null;
  const actualNeed = inferVisibilityActualNeed(text, patterns);
  const signals = visibilitySignals(patterns);

  return {
    inVisibilityContext: true,
    patterns,
    primaryPattern,
    actualNeed,
    signals,
    companionMove: companionMoveForVisibility(primaryPattern, actualNeed),
    adhdTranslation:
      "Marketing expertise is advisory. ADHD filter wins: one sustainable visibility action beats a 90-day content strategy.",
  };
}

export function mergeVisibilityIntoIntuitive(input: {
  visibility: VisibilityIntelligenceAnalysis;
  existingSignals: IntuitiveSignal[];
}): {
  signals: IntuitiveSignal[];
  actualNeed: ActualNeed | null;
  companionMove: string;
} {
  const signals = new Set([...input.existingSignals, ...input.visibility.signals]);
  return {
    signals: [...signals],
    actualNeed: input.visibility.actualNeed,
    companionMove: input.visibility.companionMove,
  };
}

export const VISIBILITY_INTERVENTION_CATALOG: Record<VisibilityAdhdPattern, string> = {
  visibility_fear: "One low-exposure visibility step — not a full campaign.",
  fear_of_judgment: "Focus on helping one person who needs your message.",
  fear_of_criticism: "Normalize discomfort; audience value over universal approval.",
  rejection_sensitivity: "Visibility discomfort is normal — one brave publish.",
  validation_seeking: "Reconnect to why you posted; close the metrics tab.",
  content_perfectionism: "Good enough to publish — ship the current version.",
  visibility_avoidance: "Smallest record-or-post action now — not a video plan.",
  comparison_spiral: "Your progress evidence beats their highlight reel.",
  engagement_obsession: "Consistency over instant likes — one next post.",
  visibility_hangover: "Re-entry without shame after going visible.",
  fear_of_success: "Name the fear; one small step if success feels scary.",
  inconsistent_visibility: "Sustainable rhythm — not daily posting pressure.",
};
