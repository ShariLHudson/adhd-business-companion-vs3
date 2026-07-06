import type { FounderAdaptationCategory, FounderRecommendation } from "../types";
import { listPatterns } from "../patterns/patternEngine";
import { listFrictionPatterns } from "../patterns/frictionPatterns";
import { listStrengths } from "../patterns/strengthPatterns";
import { isObservationalPhrase } from "../patterns/patternEngine";

const ADAPTATION_HOOKS: { category: FounderAdaptationCategory; patternId: string; suggestion: string }[] = [
  {
    category: "best_work_today",
    patternId: "pat-morning-strategy",
    suggestion: "Begin with strategy or one decision before lunch.",
  },
  {
    category: "best_time_to_create",
    patternId: "pat-short-sessions",
    suggestion: "A focused 60–90 minute block may finish better than an open afternoon.",
  },
  {
    category: "best_mission",
    patternId: "pat-listening-rooms",
    suggestion: "Listening Rooms may be the calmest mission surface today.",
  },
  {
    category: "best_environment",
    patternId: "pat-audio-restart",
    suggestion: "If energy is low, audio capture before heavy writing.",
  },
  {
    category: "best_thinking_room",
    patternId: "pat-tuesday-research",
    suggestion: "Research synthesis may land well in a quiet thinking block.",
  },
  {
    category: "best_implementation",
    patternId: "pat-short-sessions",
    suggestion: "Ship one prepared packet — defer the second initiative.",
  },
];

export function buildRecommendations(): FounderRecommendation[] {
  const patterns = listPatterns();
  const friction = listFrictionPatterns();
  const strengths = listStrengths();

  const fromHooks: FounderRecommendation[] = ADAPTATION_HOOKS.map((hook) => {
    const pattern = patterns.find((p) => p.id === hook.patternId);
    return {
      id: `rec-${hook.category}`,
      noticedPhrase: pattern?.noticedPhrase ?? "I've noticed patterns are still forming.",
      suggestion: hook.suggestion,
      category: hook.category,
      confidence: pattern?.confidence ?? 50,
      evidencePatternIds: pattern ? [pattern.id] : [],
      architectureOnly: true as const,
    };
  });

  if (friction[0]) {
    fromHooks.push({
      id: "rec-reduce-friction",
      noticedPhrase: friction[0].noticedPhrase,
      suggestion: friction[0].reduction,
      category: "best_work_today",
      confidence: 70,
      evidencePatternIds: [],
      architectureOnly: true,
    });
  }

  if (strengths[0]) {
    fromHooks.push({
      id: "rec-repeat-strength",
      noticedPhrase: strengths[0].noticedPhrase,
      suggestion: "Repeat what already produced momentum — don't redesign the rhythm.",
      category: "best_implementation",
      confidence: strengths[0].repeatability,
      evidencePatternIds: [],
      architectureOnly: true,
    });
  }

  return fromHooks.filter((r) => isObservationalPhrase(r.noticedPhrase));
}

export function topRecommendation(): FounderRecommendation | null {
  const recs = buildRecommendations();
  return recs.sort((a, b) => b.confidence - a.confidence)[0] ?? null;
}
