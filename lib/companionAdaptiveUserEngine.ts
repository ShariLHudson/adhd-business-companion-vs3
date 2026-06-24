/**
 * Sprint 5 — Adaptive User Intelligence™
 * Living model: work rhythms, learning style, intervention effectiveness, prediction.
 */

import { getIntelligenceProfile } from "./intelligence-layer/profileStore";
import { getTrustAuditLog } from "./intelligence-layer/trustEvolutionAudit";
import { formatCompanionIntelligenceForPrompt } from "./intelligence-layer/companionConsumer";
import { topTraitsFromMap } from "./intelligence-layer/profileEvolution";
import type { OutcomeThread } from "./companionOutcomeThread";
import type { MultiTurnPatternAnalysis } from "./adhdMultiTurnPatterns";
import { buildCompanionPlanObservations } from "./planMyDay/planBehaviorLearning";
import { getRecentConfidenceWins } from "./companionConfidenceEngine";

export type LearningStyleId =
  | "visual"
  | "audio"
  | "kinesthetic"
  | "read_write"
  | "conversational";

export type LearningStyleScore = {
  id: LearningStyleId;
  score: number;
  confidence: number;
};

export type InterventionEffectiveness = {
  bucket: string;
  label: string;
  successRate: number;
  attempts: number;
};

export type RelationshipMemory = {
  projects: string[];
  goals: string[];
  challenges: string[];
  wins: string[];
  priorities: string[];
  updatedAt: string;
};

const MEMORY_KEY = "companion-relationship-memory-v1";

const BUCKET_LABELS: Record<string, string> = {
  clear_mind: "Clear My Mind",
  brain_dump: "Clear My Mind",
  plan_my_day: "Plan My Day",
  create: "Create",
  breathing: "Breathe & Reset",
  workspace_open: "Workspace beside chat",
  momentum_prompt: "Conversation momentum",
  generic_tip: "Conversation-only",
};

function readMemory(): RelationshipMemory {
  if (typeof window === "undefined") {
    return emptyMemory();
  }
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return emptyMemory();
    const parsed = JSON.parse(raw) as RelationshipMemory;
    return parsed?.updatedAt ? parsed : emptyMemory();
  } catch {
    return emptyMemory();
  }
}

function emptyMemory(): RelationshipMemory {
  return {
    projects: [],
    goals: [],
    challenges: [],
    wins: [],
    priorities: [],
    updatedAt: new Date().toISOString(),
  };
}

function writeMemory(mem: RelationshipMemory) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(mem));
  } catch {
    /* noop */
  }
}

function pushUnique(list: string[], value: string, max = 8): string[] {
  const v = value.trim();
  if (!v) return list;
  return [v, ...list.filter((x) => x !== v)].slice(0, max);
}

export function updateRelationshipMemory(patch: Partial<RelationshipMemory>) {
  const cur = readMemory();
  writeMemory({
    projects: patch.projects ?? cur.projects,
    goals: patch.goals ?? cur.goals,
    challenges: patch.challenges ?? cur.challenges,
    wins: patch.wins ?? cur.wins,
    priorities: patch.priorities ?? cur.priorities,
    updatedAt: new Date().toISOString(),
  });
}

export function syncRelationshipMemoryFromThread(thread: OutcomeThread | null) {
  if (!thread) return;
  const cur = readMemory();
  writeMemory({
    projects: thread.currentProject
      ? pushUnique(cur.projects, thread.currentProject)
      : cur.projects,
    goals: thread.currentGoal
      ? pushUnique(cur.goals, thread.currentGoal)
      : cur.goals,
    challenges: thread.currentProblem
      ? pushUnique(cur.challenges, thread.currentProblem)
      : cur.challenges,
    wins: cur.wins,
    priorities: thread.desiredOutcome
      ? pushUnique(cur.priorities, thread.desiredOutcome)
      : cur.priorities,
    updatedAt: new Date().toISOString(),
  });
}

export function getRelationshipMemory(): RelationshipMemory {
  return readMemory();
}

export function computeLearningStyleScores(): LearningStyleScore[] {
  const learning = getIntelligenceProfile().human.learning;
  const comm = getIntelligenceProfile().relationship.communicationStyle;

  const scores: LearningStyleScore[] = [
    {
      id: "visual",
      score: learning.visual_learner?.score ?? 40,
      confidence: learning.visual_learner?.confidence ?? 0,
    },
    {
      id: "audio",
      score: learning.auditory_learner?.score ?? 40,
      confidence: learning.auditory_learner?.confidence ?? 0,
    },
    {
      id: "kinesthetic",
      score: learning.kinesthetic_learner?.score ?? 40,
      confidence: learning.kinesthetic_learner?.confidence ?? 0,
    },
    {
      id: "read_write",
      score: Math.max(
        learning.step_by_step_preference?.score ?? 35,
        comm.prefers_detailed?.score ?? 35,
      ),
      confidence: Math.max(
        learning.step_by_step_preference?.confidence ?? 0,
        comm.prefers_detailed?.confidence ?? 0,
      ),
    },
    {
      id: "conversational",
      score: Math.max(
        comm.action_oriented?.score ?? 45,
        comm.strategy_oriented?.score ?? 40,
      ),
      confidence: comm.action_oriented?.confidence ?? 0,
    },
  ];

  return scores.sort((a, b) => b.score - a.score);
}

export function topLearningStyle(): LearningStyleScore {
  return computeLearningStyleScores()[0] ?? {
    id: "conversational",
    score: 50,
    confidence: 0,
  };
}

import { getUserInterventionEffectiveness } from "./companionInterventionLearning";

export function computeInterventionEffectiveness(): InterventionEffectiveness[] {
  const fromLearning = getUserInterventionEffectiveness();
  if (fromLearning.length > 0) {
    return fromLearning.map((e) => ({
      bucket: String(e.id),
      label: e.label,
      successRate: e.rates.adaptiveWeight,
      attempts: e.counts.recommended,
    }));
  }

  const stats = new Map<string, { accepted: number; dismissed: number }>();
  for (const entry of getTrustAuditLog()) {
    const bucket = entry.interventionBucket;
    if (!bucket) continue;
    const cur = stats.get(bucket) ?? { accepted: 0, dismissed: 0 };
    if (/accepted|completed/i.test(entry.trustCategory)) cur.accepted += 1;
    if (/dismissed|abandoned|ignored/i.test(entry.trustCategory)) cur.dismissed += 1;
    stats.set(bucket, cur);
  }

  return [...stats.entries()]
    .map(([bucket, { accepted, dismissed }]) => {
      const attempts = accepted + dismissed;
      return {
        bucket,
        label: BUCKET_LABELS[bucket] ?? bucket.replace(/_/g, " "),
        successRate: attempts ? Math.round((accepted / attempts) * 100) : 0,
        attempts,
      };
    })
    .filter((e) => e.attempts >= 1)
    .sort((a, b) => b.successRate - a.successRate);
}

export function inferWorkRhythmHint(now = new Date()): string | null {
  const energy = getIntelligenceProfile().human.energy;
  const hour = now.getHours();
  const top = topTraitsFromMap(energy, 1, 0.1)[0]?.trait;

  if (top === "morning_creator" && hour >= 8 && hour < 12) {
    return "You often do your best creative work in the morning — this may be a good window for content or ideas.";
  }
  if (top === "afternoon_strategist" && hour >= 13 && hour < 17) {
    return "Afternoons may work well for planning and decisions for you.";
  }
  if (top === "evening_thinker" && hour >= 17) {
    return "Evenings may be when reflection and thinking come easier.";
  }
  if (top === "low_energy_mornings" && hour < 11) {
    return "Mornings can be lower energy — keep asks small until you warm up.";
  }
  return null;
}

export function buildPredictiveHints(input: {
  multiTurn?: MultiTurnPatternAnalysis | null;
  now?: Date;
}): string[] {
  const hints: string[] = [];
  const rhythm = inferWorkRhythmHint(input.now);
  if (rhythm) hints.push(rhythm);

  const primary = input.multiTurn?.primary;
  if (primary?.pattern === "planning_addiction" && primary.confidence !== "low") {
    hints.push(
      "You often get stuck after planning — want to identify the first action before momentum fades?",
    );
  }
  if (primary?.pattern === "overwhelm_from_volume" && primary.confidence !== "low") {
    hints.push(
      "Volume tends to build up for you — would it help to unload before adding more?",
    );
  }

  const effectiveness = computeInterventionEffectiveness();
  const best = effectiveness[0];
  if (best && best.attempts >= 2 && best.successRate >= 70) {
    hints.push(
      `${best.label} has been working well for you — consider it when similar friction appears.`,
    );
  }

  for (const observation of buildCompanionPlanObservations(
    input.now?.getTime(),
  )) {
    hints.push(observation);
  }

  return hints.slice(0, 2);
}

export function adaptiveUserIntelligenceSprint5HintForChat(input: {
  outcomeThread?: OutcomeThread | null;
  multiTurn?: MultiTurnPatternAnalysis | null;
}): string {
  const legacy = formatCompanionIntelligenceForPrompt();
  const styles = computeLearningStyleScores();
  const topStyle = styles[0];
  const interventions = computeInterventionEffectiveness();
  const memory = getRelationshipMemory();
  const predictive = buildPredictiveHints({
    multiTurn: input.multiTurn,
  });

  const parts: string[] = [
    "ADAPTIVE USER INTELLIGENCE™ (Sprint 5 — Layer 2 — invisible living model):",
    "Learn continuously — never announce scores or internal systems.",
    `Top learning style signal: ${topStyle.id.replace(/_/g, " ")} (internal only).`,
  ];

  if (legacy) parts.push(legacy);

  const businessTop = topTraitsFromMap(
    getIntelligenceProfile().business.visibility,
    2,
    0.1,
  );
  if (businessTop.length) {
    parts.push(
      `Business patterns: ${businessTop.map((t) => t.trait.replace(/_/g, " ")).join(", ")}.`,
    );
  }

  const adhdTop = topTraitsFromMap(getIntelligenceProfile().adhd.resistance, 2, 0.1);
  if (adhdTop.length) {
    parts.push(
      `Recurring ADHD friction: ${adhdTop.map((t) => t.trait.replace(/_/g, " ")).join(", ")}.`,
    );
  }

  if (interventions.length) {
    const summary = interventions
      .slice(0, 3)
      .map((i) => `${i.label} ${i.successRate}% (${i.attempts} tries)`)
      .join("; ");
    parts.push(`Intervention effectiveness (internal): ${summary}. Prefer what works for THIS user.`);
  }

  if (memory.challenges[0]) {
    parts.push(`Relationship memory — recurring challenge: "${memory.challenges[0]}".`);
  }
  if (memory.goals[0]) {
    parts.push(`Relationship memory — goal: "${memory.goals[0]}".`);
  }

  const recentWins = getRecentConfidenceWins(3).map((w) => w.label);
  if (recentWins.length) {
    parts.push(`Recent wins to remember: ${recentWins.join("; ")}.`);
  }

  if (predictive.length) {
    parts.push(
      "PREDICTIVE COMPANION (insight only — never auto-act):",
      ...predictive.map((p) => `May offer insight: "${p}"`),
    );
  }

  parts.push(
    "Observe learning style — do not ask. Match delivery to what works.",
    "User should feel: I don't have to start over every time.",
  );

  return parts.join("\n");
}
