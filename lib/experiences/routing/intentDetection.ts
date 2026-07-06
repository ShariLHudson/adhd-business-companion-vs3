import type { ExecutiveExperienceId, ExperienceIntent } from "../types";

const INTENT_PATTERNS: Record<ExecutiveExperienceId, RegExp[]> = {
  build_something: [/\bbuild\b/i, /\bcreate\b/i, /\bmake\b/i, /\bdraft\b/i, /\bwrite\b/i],
  think_with_me: [/\bthink\b/i, /\btalk\b/i, /\bbrainstorm\b/i, /\bclarify\b/i, /\bwork through\b/i],
  help_me_decide: [/\bdecide\b/i, /\bchoose\b/i, /\bwhich\b/i, /\boption\b/i, /\bshould i\b/i],
  research_for_me: [/\bresearch\b/i, /\blook into\b/i, /\bfind out\b/i, /\binvestigate\b/i],
  launch_something: [/\blaunch\b/i, /\bship\b/i, /\bgo live\b/i, /\brelease\b/i],
  review_my_company: [/\breview\b/i, /\bcompany\b/i, /\bhealth\b/i, /\boverview\b/i, /\bhow are we\b/i],
  teach_me: [/\bteach\b/i, /\blearn\b/i, /\bexplain\b/i, /\bshow me how\b/i, /\bhelp me understand\b/i],
  quiet_work: [/\bquiet\b/i, /\bfocus\b/i, /\bdeep work\b/i, /\bdon'?t interrupt\b/i, /\bleave me\b/i],
};

export function detectExperienceIntent(phrase: string): ExperienceIntent {
  const normalized = phrase.trim();
  if (!normalized) {
    return { phrase: normalized, confidence: "low" };
  }

  let best: { id: ExecutiveExperienceId; score: number } | null = null;

  for (const [id, patterns] of Object.entries(INTENT_PATTERNS) as [ExecutiveExperienceId, RegExp[]][]) {
    const score = patterns.reduce((sum, pattern) => sum + (pattern.test(normalized) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) {
      best = { id, score };
    }
  }

  if (!best) {
    return { phrase: normalized, confidence: "low" };
  }

  return {
    phrase: normalized,
    experienceId: best.id,
    confidence: best.score >= 2 ? "high" : "medium",
  };
}

export function resolveExperienceId(
  intent?: ExperienceIntent,
  fallback: ExecutiveExperienceId = "think_with_me",
): ExecutiveExperienceId {
  if (intent?.experienceId) return intent.experienceId;
  if (intent?.phrase) {
    const detected = detectExperienceIntent(intent.phrase);
    if (detected.experienceId) return detected.experienceId;
  }
  return fallback;
}
