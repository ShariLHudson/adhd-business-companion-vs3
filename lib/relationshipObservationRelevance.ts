/**
 * Observation Relevance Intelligence™ (P0.6)
 * Ranks observations by intent, workspace, and diversity — not raw score alone.
 */

import { buildWhatIveLearnedProfile } from "./phase2ProgressiveDiscovery";
import type {
  ObservationConfidence,
  RelationshipObservation,
} from "./relationshipObservationEngine";

export type ObservationRelevanceTag =
  | "decision_making"
  | "follow_through"
  | "focus"
  | "motivation"
  | "energy"
  | "confidence"
  | "business_building"
  | "marketing"
  | "content_creation"
  | "sales"
  | "offers"
  | "visibility"
  | "operations"
  | "systems"
  | "planning"
  | "execution"
  | "learning_style"
  | "communication_style"
  | "creativity"
  | "relationships"
  | "transformation"
  | "wisdom"
  | "identity"
  | "adhd_patterns"
  | "emotional_regulation"
  | "project_management"
  | "time_management"
  | "leadership";

export type ObservationRankingContext = {
  userText?: string;
  workspace?: string | null;
  now?: Date;
};

export type RankedRelationshipObservation = RelationshipObservation & {
  relevanceTags: ObservationRelevanceTag[];
  relevanceScore: number;
  intentMatchScore: number;
};

const USAGE_STORAGE_KEY = "companion-relationship-observation-usage-v1";
const RECENT_TURN_PENALTY_WINDOW = 5;
const MAX_USAGE_ENTRIES = 24;

type UsageEntry = { id: string; usedAt: string };

type UsageState = { entries: UsageEntry[] };

const INTENT_RULES: { tags: ObservationRelevanceTag[]; patterns: RegExp[] }[] = [
  {
    tags: ["follow_through", "adhd_patterns", "execution", "creativity"],
    patterns: [
      /\b(?:new (?:things|projects|ideas)|building new|instead of finishing|finish what|keep starting|shiny|unfinished)\b/i,
      /\b(?:good starter|poor finisher|bad finisher|trouble finishing|can'?t finish)\b/i,
      /\bwhy do i keep\b/i,
      /\bwhy am i a good starter\b/i,
    ],
  },
  {
    tags: ["decision_making", "confidence", "wisdom"],
    patterns: [
      /\b(?:patterns?|noticed|observe).*(?:decision|decide|choos)/i,
      /\bhow i make decisions?\b/i,
      /\bcan'?t decide\b/i,
      /\bdecision fatigue\b/i,
    ],
  },
  {
    tags: ["identity", "transformation", "confidence", "creativity"],
    patterns: [
      /\b(?:biggest|greatest|main|core) strength\b/i,
      /\bwhat am i good at\b/i,
      /\bmy strength\b/i,
      /\bwhat stands out about me\b/i,
    ],
  },
  {
    tags: ["marketing", "business_building", "visibility", "content_creation"],
    patterns: [
      /\bmarketing plan\b/i,
      /\bmarketing strategy\b/i,
      /\bpromot(?:e|ing)\b/i,
      /\bcontent (?:plan|strategy|calendar)\b/i,
      /\baudience\b/i,
      /\bvisibility\b/i,
      /\blead magnet\b/i,
    ],
  },
  {
    tags: ["systems", "operations", "execution", "project_management", "planning"],
    patterns: [
      /\bsop\b/i,
      /\bstandard operating\b/i,
      /\bprocess(?:es)?\b/i,
      /\bworkflow\b/i,
      /\bsystem(?:s|ize|izing)?\b/i,
      /\boperational\b/i,
      /\bchecklist\b/i,
    ],
  },
  {
    tags: ["transformation", "wisdom", "identity"],
    patterns: [
      /\bhow have i changed\b/i,
      /\bchanged over time\b/i,
      /\bgrowth (?:journey|over time)\b/i,
      /\bwho i(?:'ve| have) become\b/i,
    ],
  },
  {
    tags: ["sales", "offers", "business_building", "confidence"],
    patterns: [/\bsales?\b/i, /\bpricing\b/i, /\boffer\b/i, /\bclient outreach\b/i],
  },
  {
    tags: ["energy", "focus", "time_management", "planning"],
    patterns: [
      /\bplan my day\b/i,
      /\bschedule\b/i,
      /\boverwhelm\b/i,
      /\bfocus\b/i,
      /\benergy\b/i,
    ],
  },
  {
    tags: ["leadership", "business_building", "identity"],
    patterns: [/\blead(?:er|ership)\b/i, /\bteam\b/i, /\bdelegate\b/i],
  },
];

const WORKSPACE_RELEVANCE: Record<string, ObservationRelevanceTag[]> = {
  "plan-my-day": ["energy", "focus", "follow_through", "time_management", "planning"],
  "decision-compass": ["decision_making", "confidence", "wisdom", "planning"],
  projects: ["execution", "follow_through", "planning", "systems", "project_management"],
  "content-generator": ["marketing", "visibility", "content_creation", "creativity", "business_building"],
  "content-types": ["content_creation", "marketing", "creativity"],
  playbook: ["systems", "operations", "execution", "business_building"],
  "email-generator": ["marketing", "sales", "content_creation", "communication_style"],
  "business-profile": ["business_building", "offers", "identity", "marketing"],
  "client-avatars": ["marketing", "offers", "business_building", "identity"],
  "saved-work": ["execution", "project_management", "follow_through"],
  "my-work": ["execution", "project_management", "creativity"],
  focus: ["focus", "energy", "execution", "adhd_patterns"],
  "focus-timer": ["focus", "energy", "time_management"],
  "brain-dump": ["focus", "emotional_regulation", "planning", "operations"],
  today: ["planning", "execution", "energy", "follow_through"],
  growth: ["transformation", "confidence", "identity", "wisdom"],
  "confidence-vault": ["confidence", "identity", "transformation"],
  "my-journey": ["transformation", "wisdom", "identity"],
};

const CATEGORY_TAG_MAP: Record<
  RelationshipObservation["category"],
  ObservationRelevanceTag[]
> = {
  decision_making: ["decision_making", "confidence", "wisdom"],
  work_style: ["planning", "execution", "learning_style"],
  business_building: ["business_building", "offers", "marketing", "execution"],
  energy_patterns: ["energy", "focus", "time_management", "emotional_regulation"],
  adhd_patterns: ["adhd_patterns", "creativity", "focus", "follow_through"],
  focus_patterns: ["focus", "execution", "adhd_patterns"],
  learning_style: ["learning_style", "communication_style"],
  relationship_style: ["relationships", "communication_style", "emotional_regulation"],
  growth_patterns: ["motivation", "execution", "confidence", "follow_through"],
  strengths: ["identity", "confidence", "creativity", "leadership"],
  recurring_obstacles: ["follow_through", "emotional_regulation", "execution"],
  transformation_signals: ["transformation", "wisdom", "identity"],
};

const SOURCE_TAG_MAP: Record<string, ObservationRelevanceTag[]> = {
  shiny_object_syndrome: ["adhd_patterns", "creativity", "follow_through", "content_creation", "marketing"],
  follow_through_challenges: ["follow_through", "execution", "project_management"],
  perfectionism: ["follow_through", "execution", "confidence"],
  planning_addiction: ["planning", "systems", "execution"],
  launch_avoidance: ["visibility", "offers", "execution", "confidence"],
  visibility_resistance: ["visibility", "marketing", "confidence", "emotional_regulation"],
  pricing_anxiety: ["sales", "offers", "confidence"],
  overwhelm_cycles: ["energy", "emotional_regulation", "focus"],
  decision_overload_after_ideas: ["decision_making", "adhd_patterns", "creativity"],
  cognitive_overload: ["focus", "energy", "emotional_regulation"],
  decision_compass: ["decision_making", "planning", "systems"],
  clear_my_mind: ["focus", "operations", "emotional_regulation", "planning"],
  content_tools: ["content_creation", "marketing", "creativity"],
  conversational: ["communication_style", "learning_style", "relationships"],
  visual: ["learning_style", "planning", "systems"],
  momentum: ["motivation", "execution", "business_building"],
  "os:completion": ["follow_through", "execution", "adhd_patterns", "project_management"],
  "os:momentum_builder": ["motivation", "execution", "creativity", "business_building"],
  "os:momentum_killer": ["energy", "emotional_regulation", "focus", "follow_through"],
  "os:decision": ["decision_making", "confidence", "wisdom"],
  "os:attention": ["focus", "energy", "adhd_patterns"],
  "os:business": ["business_building", "execution", "follow_through", "marketing"],
};

function readUsageState(): UsageState {
  if (typeof window === "undefined") return { entries: [] };
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as UsageState;
    return Array.isArray(parsed.entries) ? parsed : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

function writeUsageState(state: UsageState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(state));
}

export function getRecentlyUsedObservationIds(limit = RECENT_TURN_PENALTY_WINDOW): string[] {
  const entries = readUsageState().entries;
  return entries.slice(0, limit).map((entry) => entry.id);
}

export function recordUsedObservations(
  observationIds: string[],
  now = new Date(),
): void {
  if (!observationIds.length || typeof window === "undefined") return;
  const usedAt = now.toISOString();
  const existing = readUsageState().entries.filter(
    (entry) => !observationIds.includes(entry.id),
  );
  const next = [
    ...observationIds.map((id) => ({ id, usedAt })),
    ...existing,
  ].slice(0, MAX_USAGE_ENTRIES);
  writeUsageState({ entries: next });
}

export function resetObservationUsageForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USAGE_STORAGE_KEY);
}

function confidenceWeight(confidence: ObservationConfidence): number {
  if (confidence === "strong") return 1;
  if (confidence === "forming") return 0.65;
  return 0.35;
}

function recencyWeight(recencyDays: number): number {
  if (recencyDays <= 7) return 1;
  if (recencyDays <= 30) return 0.85;
  if (recencyDays <= 90) return 0.65;
  return 0.4;
}

function overlapScore(
  tags: ObservationRelevanceTag[],
  intentTags: ObservationRelevanceTag[],
): number {
  if (!intentTags.length || !tags.length) return 0;
  const intent = new Set(intentTags);
  let matches = 0;
  for (const tag of tags) {
    if (intent.has(tag)) matches += 1;
  }
  return matches / Math.max(intentTags.length, 1);
}

export function inferRelevanceTags(
  observation: RelationshipObservation,
): ObservationRelevanceTag[] {
  const tags = new Set<ObservationRelevanceTag>(
    CATEGORY_TAG_MAP[observation.category] ?? [],
  );

  for (const tag of SOURCE_TAG_MAP[observation.source] ?? []) {
    tags.add(tag);
  }

  const text = `${observation.text} ${observation.source}`.toLowerCase();
  if (/talk|conversation|clarity by talking/.test(text)) {
    tags.add("communication_style");
    tags.add("learning_style");
  }
  if (/visual|mapped|side by side|options/.test(text)) {
    tags.add("decision_making");
    tags.add("planning");
    tags.add("systems");
  }
  if (/ideas|generate|novelty|new project/.test(text)) {
    tags.add("creativity");
    tags.add("content_creation");
    tags.add("marketing");
  }
  if (/finish|finishing|follow.?through|ready|refining/.test(text)) {
    tags.add("follow_through");
    tags.add("execution");
  }
  if (/marketing|audience|visible|seen|share/.test(text)) {
    tags.add("marketing");
    tags.add("visibility");
  }
  if (/process|steps|repeat|system|workflow|sop/.test(text)) {
    tags.add("systems");
    tags.add("operations");
  }
  if (/strength|asset|connect ideas|possibilities/.test(text)) {
    tags.add("identity");
    tags.add("confidence");
  }
  if (/\b(?:changed|earlier|lately|wisdom|grown)\b/.test(text)) {
    tags.add("transformation");
    tags.add("wisdom");
  }
  if (/energy|morning|afternoon|evening|overload|maintenance|administrative|repetitive/.test(text)) {
    tags.add("energy");
  }
  if (/momentum|creative phase|novelty|upkeep/.test(text)) {
    tags.add("follow_through");
    tags.add("execution");
  }

  return [...tags];
}

export function detectTurnIntent(userText?: string): ObservationRelevanceTag[] {
  const text = userText?.trim() ?? "";
  if (!text) return [];

  const tags = new Set<ObservationRelevanceTag>();
  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      for (const tag of rule.tags) tags.add(tag);
    }
  }
  return [...tags];
}

export function detectWorkspaceIntent(
  workspace?: string | null,
): ObservationRelevanceTag[] {
  if (!workspace) return [];
  return WORKSPACE_RELEVANCE[workspace] ?? [];
}

export function mergeTurnIntents(
  userText?: string,
  workspace?: string | null,
): ObservationRelevanceTag[] {
  const tags = new Set<ObservationRelevanceTag>([
    ...detectTurnIntent(userText),
    ...detectWorkspaceIntent(workspace),
  ]);
  return [...tags];
}

function synthesizeIntentObservations(
  intentTags: ObservationRelevanceTag[],
  now: Date,
): RelationshipObservation[] {
  if (!intentTags.length) return [];

  const profile = buildWhatIveLearnedProfile();
  const synthesized: RelationshipObservation[] = [];
  const intent = new Set(intentTags);

  if (
    intent.has("marketing") ||
    intent.has("content_creation") ||
    intent.has("visibility")
  ) {
    synthesized.push({
      id: "intent-marketing-focus",
      category: "business_building",
      text:
        "You often generate more ideas than you can realistically pursue at once. Marketing tends to work best when you focus on one audience, one message, and one next step rather than trying to build everything at the same time.",
      evidence: "Intent-aligned pattern from your business history",
      confidence: "forming",
      frequency: 3,
      recencyDays: 0,
      score: 0.72,
      source: "intent_synthesis",
    });
  }

  if (intent.has("systems") || intent.has("operations") || intent.has("project_management")) {
    synthesized.push({
      id: "intent-systems-visibility",
      category: "work_style",
      text:
        "When a process exists only in your head, it becomes harder to repeat consistently. Turning a process into visible steps tends to reduce overwhelm and make follow-through easier.",
      evidence: "Intent-aligned pattern from how you work",
      confidence: "forming",
      frequency: 3,
      recencyDays: 0,
      score: 0.72,
      source: "intent_synthesis",
    });
  }

  if (intent.has("identity") || intent.has("confidence")) {
    const strength = profile.strengths[0];
    const text = strength
      ? `One thing that stands out is ${strength.charAt(0).toLowerCase()}${strength.slice(1)} — it shows up as a real asset in how you work, not just something you aspire to.`
      : "One thing that stands out is your ability to connect ideas from different areas and turn them into something useful for other people. You often see possibilities that others miss.";
    synthesized.push({
      id: "intent-strength-identity",
      category: "strengths",
      text,
      evidence: "Intent-aligned strength signal",
      confidence: profile.strengths.length ? "strong" : "forming",
      frequency: profile.strengths.length ? 4 : 2,
      recencyDays: 0,
      score: 0.75,
      source: "intent_synthesis",
    });
  }

  if (intent.has("transformation") || intent.has("wisdom")) {
    synthesized.push({
      id: "intent-transformation-shift",
      category: "transformation_signals",
      text:
        "You often grow in visible steps — first by naming what feels stuck, then by choosing a smaller move that fits the season you're actually in.",
      evidence: "Intent-aligned transformation signal",
      confidence: "forming",
      frequency: 3,
      recencyDays: 0,
      score: 0.7,
      source: "intent_synthesis",
    });
  }

  if (intent.has("follow_through") || intent.has("execution")) {
    synthesized.push({
      id: "intent-follow-through-tension",
      category: "recurring_obstacles",
      text:
        "Finishing often competes with starting something new — not because you lack commitment, but because open loops pull attention.",
      evidence: "Intent-aligned follow-through signal",
      confidence: "forming",
      frequency: 3,
      recencyDays: 0,
      score: 0.7,
      source: "intent_synthesis",
    });
  }

  if (intent.has("decision_making")) {
    synthesized.push({
      id: "intent-decision-options",
      category: "decision_making",
      text:
        "When several good options exist, choosing one path can become harder because you can see value in multiple directions.",
      evidence: "Intent-aligned decision pattern",
      confidence: "forming",
      frequency: 3,
      recencyDays: 0,
      score: 0.7,
      source: "intent_synthesis",
    });
  }

  if (intent.has("energy") || intent.has("focus") || intent.has("time_management")) {
    synthesized.push({
      id: "intent-energy-focus",
      category: "energy_patterns",
      text:
        "You often move best when the day has one protected focus thread — splitting attention across too many open loops drains momentum faster than the work itself.",
      evidence: "Intent-aligned energy and focus signal",
      confidence: "forming",
      frequency: 3,
      recencyDays: 0,
      score: 0.7,
      source: "intent_synthesis",
    });
  }

  return synthesized.filter((observation) => {
    const tags = inferRelevanceTags(observation);
    return overlapScore(tags, intentTags) > 0;
  });
}

function scoreObservationRelevance(
  observation: RelationshipObservation,
  tags: ObservationRelevanceTag[],
  turnIntent: ObservationRelevanceTag[],
  workspaceIntent: ObservationRelevanceTag[],
  recentIds: string[],
): { relevanceScore: number; intentMatchScore: number } {
  const intentMatch = overlapScore(tags, turnIntent);
  const workspaceMatch = overlapScore(tags, workspaceIntent);
  const combinedIntent = [...new Set([...turnIntent, ...workspaceIntent])];
  const combinedMatch = overlapScore(tags, combinedIntent);

  let relevanceScore =
    observation.score * 0.18 +
    intentMatch * 0.42 +
    workspaceMatch * 0.18 +
    combinedMatch * 0.1 +
    confidenceWeight(observation.confidence) * 0.07 +
    recencyWeight(observation.recencyDays) * 0.05;

  if (turnIntent.length > 0 && intentMatch === 0) {
    relevanceScore -= 0.28;
  }
  if (combinedIntent.length > 0 && combinedMatch === 0) {
    relevanceScore -= 0.12;
  }

  const recentIndex = recentIds.indexOf(observation.id);
  if (recentIndex >= 0) {
    relevanceScore -= 0.55 - recentIndex * 0.06;
  }

  const repeatCount = recentIds.filter((id) => id === observation.id).length;
  if (repeatCount > 1) {
    relevanceScore -= 0.2 * (repeatCount - 1);
  }

  if (
    turnIntent.length > 0 &&
    (observation.source === "conversational" || observation.id.startsWith("learning-conversational")) &&
    !turnIntent.includes("communication_style") &&
    !turnIntent.includes("learning_style") &&
    !turnIntent.includes("relationships")
  ) {
    relevanceScore -= 0.35;
  }

  if (observation.source === "intent_synthesis" && combinedMatch > 0) {
    relevanceScore += 0.12;
  }

  if (
    observation.source?.startsWith("os:") &&
    combinedMatch > 0 &&
    (observation.source !== "os:completion" ||
      turnIntent.some((tag) =>
        ["follow_through", "execution", "adhd_patterns", "creativity"].includes(tag),
      ))
  ) {
    relevanceScore += 0.2;
  }

  if (
    turnIntent.some((tag) =>
      ["follow_through", "execution", "adhd_patterns"].includes(tag),
    ) &&
    (observation.source === "os:completion" ||
      observation.source === "os:momentum_killer" ||
      observation.source === "os:momentum_builder")
  ) {
    relevanceScore += 0.15;
  }

  return { relevanceScore, intentMatchScore: combinedMatch };
}

function isSystemsWorkflowQuestion(userText?: string): boolean {
  return /\b(?:sop|standard operating|workflow|checklist|operational)\b/i.test(
    userText?.trim() ?? "",
  );
}

export function rankObservationsByRelevance(
  observations: RelationshipObservation[],
  context: ObservationRankingContext = {},
): RankedRelationshipObservation[] {
  const turnIntent = detectTurnIntent(context.userText);
  const workspaceIntent = detectWorkspaceIntent(context.workspace);
  const recentIds = getRecentlyUsedObservationIds();
  const now = context.now ?? new Date();

  const synthesized =
    turnIntent.length || workspaceIntent.length
      ? synthesizeIntentObservations(
          mergeTurnIntents(context.userText, context.workspace),
          now,
        )
      : [];

  const pool = observations.filter((observation) => {
    if (observation.source !== "os:completion") return true;
    return !isSystemsWorkflowQuestion(context.userText);
  });
  const seenIds = new Set(pool.map((observation) => observation.id));
  for (const candidate of synthesized) {
    if (!seenIds.has(candidate.id)) {
      pool.push(candidate);
      seenIds.add(candidate.id);
    }
  }

  const ranked = pool
    .map((observation) => {
      const relevanceTags = inferRelevanceTags(observation);
      const { relevanceScore, intentMatchScore } = scoreObservationRelevance(
        observation,
        relevanceTags,
        turnIntent,
        workspaceIntent,
        recentIds,
      );
      return {
        ...observation,
        relevanceTags,
        relevanceScore,
        intentMatchScore,
        score: relevanceScore,
      };
    })
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      if (b.intentMatchScore !== a.intentMatchScore) {
        return b.intentMatchScore - a.intentMatchScore;
      }
      return b.frequency - a.frequency;
    });

  if (turnIntent.length > 0 && ranked[0] && ranked[0].intentMatchScore <= 0) {
    const better = ranked.find((observation) => observation.intentMatchScore > 0);
    if (better) {
      return [
        better,
        ...ranked.filter((observation) => observation.id !== better.id),
      ];
    }
  }

  return ranked;
}

export function selectLeadObservation(
  observations: RelationshipObservation[],
  context: ObservationRankingContext = {},
): RelationshipObservation | null {
  const ranked = rankObservationsByRelevance(observations, context);
  return ranked[0] ?? null;
}

export function topRelevantObservations(
  observations: RelationshipObservation[],
  context: ObservationRankingContext = {},
  limit = 7,
): RelationshipObservation[] {
  return rankObservationsByRelevance(observations, context).slice(0, limit);
}
