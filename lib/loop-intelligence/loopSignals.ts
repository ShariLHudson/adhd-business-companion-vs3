/**
 * Loop signal patterns — categorized only, no message text stored.
 */

import type { UserSignalCount } from "@/lib/ecosystem/userIntelligenceEngine";
import type { LoopInput, LoopSignalObservation, LoopType } from "./types";

const MS_DAY = 86_400_000;

function countSignal(
  counts: UserSignalCount[] | undefined,
  kind: "struggle" | "question" | "emotion",
  category: string,
  sinceMs: number,
): number {
  if (!counts?.length) return 0;
  return counts
    .filter((c) => c.kind === kind && c.category === category)
    .reduce((sum, c) => {
      const seen = new Date(c.lastSeen).getTime();
      return seen >= sinceMs ? sum + c.count : sum;
    }, 0);
}

export type LoopPattern = {
  loopType: LoopType;
  signalId: string;
  signalLabel: string;
  re: RegExp;
};

export const LOOP_PATTERNS: LoopPattern[] = [
  // General loops
  {
    loopType: "anxiety_loop",
    signalId: "worry_future",
    signalLabel: "Worry about what might happen",
    re: /\b(what if|worried|worrying|anxious|anxiety|something bad|might go wrong)\b/i,
  },
  {
    loopType: "rumination_loop",
    signalId: "replay_thoughts",
    signalLabel: "Replaying the same thoughts",
    re: /\b(can'?t stop thinking|keep thinking|going over (it|this)|replay(ing)?|ruminat|same thought|over and over)\b/i,
  },
  {
    loopType: "perfectionism_loop",
    signalId: "not_good_enough",
    signalLabel: "Not good enough yet",
    re: /\b(not good enough|has to be perfect|needs to be better|one more pass|keep redoing|still editing)\b/i,
  },
  {
    loopType: "guilt_loop",
    signalId: "should_have",
    signalLabel: "Should-have guilt",
    re: /\b(should have|shouldn'?t have|feel guilty|guilty about|let (them|someone) down)\b/i,
  },
  {
    loopType: "shame_loop",
    signalId: "self_criticism",
    signalLabel: "Self-criticism language",
    re: /\b(ashamed|embarrassed|i'?m terrible|hate myself|so stupid|what'?s wrong with me)\b/i,
  },
  {
    loopType: "comparison_loop",
    signalId: "others_ahead",
    signalLabel: "Comparing to others",
    re: /\b(everyone else|they all|so far behind|behind everyone|compare|comparison|doing better than me)\b/i,
  },
  {
    loopType: "impostor_loop",
    signalId: "fraud_feeling",
    signalLabel: "Impostor / fraud feelings",
    re: /\b(impostor|imposter|fraud|fake it|don'?t belong|who am i to|not qualified)\b/i,
  },
  {
    loopType: "control_loop",
    signalId: "need_control",
    signalLabel: "Need to control outcomes",
    re: /\b(if i don'?t control|need to control|can'?t let go|has to go my way|micromanage|everything depends on me)\b/i,
  },
  {
    loopType: "connection_loop",
    signalId: "fear_disconnect",
    signalLabel: "Fear of disconnection",
    re: /\b(they hate me|don'?t like me|mad at me|ignoring me|left out|don'?t care about me)\b/i,
  },
  {
    loopType: "achievement_loop",
    signalId: "never_enough",
    signalLabel: "Never enough achievement",
    re: /\b(never enough|always more|haven'?t done enough|not accomplished|should be further|more to prove)\b/i,
  },
  // ADHD / business loops
  {
    loopType: "rsd_loop",
    signalId: "rejection_fear",
    signalLabel: "Rejection sensitivity",
    re: /\b(reject(ion|ed)?|criticiz|judg(e|ing)|they'?re mad|disappointed in me|took it personally)\b/i,
  },
  {
    loopType: "certainty_loop",
    signalId: "need_certainty",
    signalLabel: "Need certainty before acting",
    re: /\b(need to know for sure|can'?t be sure|what if i'?m wrong|not certain|need guarantees|sure before)\b/i,
  },
  {
    loopType: "potential_loop",
    signalId: "wasted_potential",
    signalLabel: "Fear of wasting potential",
    re: /\b(wasting (my )?potential|not living up|could be more|so much untapped|gifts wasted|not using my talents)\b/i,
  },
  {
    loopType: "research_loop",
    signalId: "more_research",
    signalLabel: "More research before acting",
    re: /\b(need more research|still researching|read one more|learn more first|not ready to decide|gathering info)\b/i,
  },
  {
    loopType: "planning_loop",
    signalId: "plan_not_do",
    signalLabel: "Planning instead of doing",
    re: /\b(keep planning|planning forever|need a better plan|reorganiz(e|ing)|perfect plan|planning instead)\b/i,
  },
  {
    loopType: "optimization_loop",
    signalId: "optimize_first",
    signalLabel: "Optimizing before shipping",
    re: /\b(optimize|tweak(ing)?|fine-?tun|make it better first|improve before|not optimized)\b/i,
  },
  {
    loopType: "productivity_loop",
    signalId: "should_be_productive",
    signalLabel: "Productivity pressure",
    re: /\b(should be more productive|wasting time|not doing enough|lazy|unproductive|get more done)\b/i,
  },
  {
    loopType: "overwhelm_loop",
    signalId: "too_much_carrying",
    signalLabel: "Overwhelm language",
    re: /\b(overwhelm|too much|so much|can'?t keep up|drowning|everything at once|mental clutter)\b/i,
  },
  {
    loopType: "restart_loop",
    signalId: "start_over",
    signalLabel: "Starting over repeatedly",
    re: /\b(start over|start from scratch|begin again|fresh start|redo everything|scrap (it|this))\b/i,
  },
  {
    loopType: "recovery_loop",
    signalId: "cant_rest",
    signalLabel: "Difficulty resting",
    re: /\b(can'?t rest|should be working|feel guilty resting|don'?t deserve a break|always behind)\b/i,
  },
];

export function scanLoopSignalsFromText(text: string): LoopPattern[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const hits: LoopPattern[] = [];
  const seen = new Set<string>();
  for (const pattern of LOOP_PATTERNS) {
    if (!pattern.re.test(trimmed)) continue;
    const key = `${pattern.loopType}:${pattern.signalId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push(pattern);
  }
  return hits;
}

/** Record observations from current message — one per loop type per message. */
export function observationsFromText(
  text: string,
  now = new Date(),
): LoopSignalObservation[] {
  const dayKey = now.toISOString().slice(0, 10);
  const at = now.toISOString();
  const byType = new Map<LoopType, LoopPattern>();

  for (const hit of scanLoopSignalsFromText(text)) {
    if (!byType.has(hit.loopType)) byType.set(hit.loopType, hit);
  }

  return [...byType.values()].map((p) => ({
    loopType: p.loopType,
    signalId: p.signalId,
    signalLabel: p.signalLabel,
    at,
    dayKey,
  }));
}

/** Contextual signals from cognitive load / activation — no text required. */
export function contextualLoopSignals(
  input: LoopInput = {},
): LoopSignalObservation[] {
  const now = input.now ?? new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const at = now.toISOString();
  const out: LoopSignalObservation[] = [];

  if (
    input.cognitiveLoadLevel === "heavy" ||
    input.cognitiveLoadLevel === "overloaded"
  ) {
    out.push({
      loopType: "overwhelm_loop",
      signalId: "high_cognitive_load",
      signalLabel: "Elevated cognitive load",
      at,
      dayKey,
    });
  }

  if (input.activationState === "stuck" || input.activationState === "frozen") {
    out.push({
      loopType: "rumination_loop",
      signalId: "activation_stuck",
      signalLabel: "Repeated stuck activation state",
      at,
      dayKey,
    });
  }

  return out;
}

type IntelligenceLoopRule = {
  loopType: LoopType;
  signalId: string;
  signalLabel: string;
  minCount: number;
  kind: "struggle" | "question" | "emotion";
  category: string;
};

const INTELLIGENCE_LOOP_RULES: IntelligenceLoopRule[] = [
  {
    loopType: "overwhelm_loop",
    signalId: "repeated_overwhelm",
    signalLabel: "Repeated overwhelm questions",
    minCount: 2,
    kind: "question",
    category: "im_overwhelmed",
  },
  {
    loopType: "certainty_loop",
    signalId: "repeated_priority_questions",
    signalLabel: "Repeated what-to-work-on questions",
    minCount: 2,
    kind: "question",
    category: "what_should_i_work_on",
  },
  {
    loopType: "rumination_loop",
    signalId: "repeated_stuck_emotion",
    signalLabel: "Repeated stuck emotional signals",
    minCount: 2,
    kind: "emotion",
    category: "stuck",
  },
  {
    loopType: "certainty_loop",
    signalId: "repeated_decision_struggle",
    signalLabel: "Repeated decision struggles",
    minCount: 2,
    kind: "struggle",
    category: "decision_making",
  },
  {
    loopType: "productivity_loop",
    signalId: "repeated_follow_through",
    signalLabel: "Repeated follow-through struggles",
    minCount: 2,
    kind: "struggle",
    category: "follow_through",
  },
  {
    loopType: "rsd_loop",
    signalId: "repeated_frustration",
    signalLabel: "Repeated frustration signals",
    minCount: 2,
    kind: "emotion",
    category: "frustrated",
  },
];

/** Repeated categorized signals from user intelligence — no message text. */
export function intelligenceLoopSignals(
  input: LoopInput = {},
): LoopSignalObservation[] {
  const now = input.now ?? new Date();
  const since7d = now.getTime() - 7 * MS_DAY;
  const dayKey = now.toISOString().slice(0, 10);
  const at = now.toISOString();
  const counts = input.signalCounts;
  if (!counts?.length) return [];

  const out: LoopSignalObservation[] = [];
  for (const rule of INTELLIGENCE_LOOP_RULES) {
    const total = countSignal(
      counts,
      rule.kind,
      rule.category,
      since7d,
    );
    if (total < rule.minCount) continue;
    out.push({
      loopType: rule.loopType,
      signalId: rule.signalId,
      signalLabel: rule.signalLabel,
      at,
      dayKey,
    });
  }
  return out;
}
