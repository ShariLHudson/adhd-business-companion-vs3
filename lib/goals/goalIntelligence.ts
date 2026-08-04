/**
 * P0.34 — Outcome Intelligence™: supporting activity, momentum, goal-aware prioritization.
 */

import { sanitizeIntelligenceInsight } from "../emotionalSafetyIntelligence";
import { getProjects } from "../companionStore";
import { getEvidenceEntries } from "../evidenceBankStore";
import { getSavedGrowthWins } from "../growthWinsStore";
import { getJourneyEntries, type JourneyEntry } from "../myJourneyStore";
import {
  getPlanCompletionHistory,
  type PlanTaskCompletionRecord,
} from "../planMyDay/planTaskCompletion";
import { readTodayPlanItems } from "../planMyDay/planDayItems";
import type { PlanDayItem } from "../planMyDay/types";
import {
  evidenceSupportsGoal,
  getLinkedGoalIds,
  journeySupportsGoal,
  planItemSupportsGoal,
  projectSupportsGoal,
  winSupportsGoal,
} from "./goalLinking";
import {
  goalHealthStatus,
  goalProgressPercent,
  listOutcomeGoals,
  progressInDateRange,
  type OutcomeGoal,
} from "./outcomeGoals";

export type GoalSupportingActivity = {
  projects: number;
  tasks: number;
  wins: number;
  evidence: number;
  decisions: number;
  lessons: number;
};

export type GoalMomentumLevel = "strong" | "moderate" | "stalled";

export type GoalMomentum = {
  level: GoalMomentumLevel;
  label: string;
  emoji: string;
  score: number;
};

export type GoalWorkRecommendation = {
  goal: OutcomeGoal;
  momentum: GoalMomentum;
  reason: string;
  supportingProjects: string[];
  stalled: boolean;
};

export function isDecisionEntry(entry: JourneyEntry): boolean {
  return (
    entry.category === "Major Life Events" ||
    /\bdecid(?:ed|ing|e|ion)\b/i.test(`${entry.title} ${entry.whatHappened}`)
  );
}

export function isLessonEntry(entry: JourneyEntry): boolean {
  return (
    entry.category === "Lessons Learned" ||
    Boolean(entry.whatDidILearn?.trim())
  );
}

export function decisionSupportsGoal(
  entry: JourneyEntry,
  goal: OutcomeGoal,
): boolean {
  if (!isDecisionEntry(entry)) return false;
  return journeySupportsGoal(entry, goal);
}

export function lessonSupportsGoal(
  entry: JourneyEntry,
  goal: OutcomeGoal,
): boolean {
  if (!isLessonEntry(entry)) return false;
  return journeySupportsGoal(entry, goal);
}

export function planCompletionSupportsGoal(
  record: PlanTaskCompletionRecord,
  goal: OutcomeGoal,
): boolean {
  if (record.outcomeGoalId && record.outcomeGoalId === goal.id) return true;
  if (record.outcomeGoalIds?.includes(goal.id)) return true;
  return growthItemTitleSupportsGoal(record.taskName, goal);
}

function growthItemTitleSupportsGoal(title: string, goal: OutcomeGoal): boolean {
  const t = title.toLowerCase();
  const tokens = goal.statement
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  return tokens.some((token) => t.includes(token));
}

function linkedPlanItems(goal: OutcomeGoal, items: PlanDayItem[]): PlanDayItem[] {
  return items.filter((item) => planItemSupportsGoal(item, goal));
}

export function buildGoalSupportingActivity(
  goal: OutcomeGoal,
  options?: {
    wins?: ReturnType<typeof getSavedGrowthWins>;
    evidence?: ReturnType<typeof getEvidenceEntries>;
    journey?: ReturnType<typeof getJourneyEntries>;
    projects?: ReturnType<typeof getProjects>;
    planItems?: PlanDayItem[];
    completions?: PlanTaskCompletionRecord[];
  },
): GoalSupportingActivity {
  const wins = options?.wins ?? getSavedGrowthWins();
  const evidence = options?.evidence ?? getEvidenceEntries();
  const journey = options?.journey ?? getJourneyEntries();
  const projects = options?.projects ?? getProjects();
  const planItems = options?.planItems ?? readTodayPlanItems();
  const completions = options?.completions ?? getPlanCompletionHistory();

  const linkedCompletions = completions.filter((r) =>
    planCompletionSupportsGoal(r, goal),
  );

  return {
    projects: projects.filter((p) => projectSupportsGoal(p, goal)).length,
    tasks: linkedPlanItems(goal, planItems).length + linkedCompletions.length,
    wins: wins.filter((w) => winSupportsGoal(w, goal)).length,
    evidence: evidence.filter((e) => evidenceSupportsGoal(e, goal)).length,
    decisions: journey.filter((j) => decisionSupportsGoal(j, goal)).length,
    lessons: journey.filter((j) => lessonSupportsGoal(j, goal)).length,
  };
}

const MOMENTUM_LABELS: Record<GoalMomentumLevel, { label: string; emoji: string }> =
  {
    strong: { label: "Strong Momentum", emoji: "🟢" },
    moderate: { label: "Moderate Momentum", emoji: "🟡" },
    stalled: { label: "Quieter Lately", emoji: "🟡" },
  };

export function calculateGoalMomentum(
  goal: OutcomeGoal,
  now = new Date(),
): GoalMomentum {
  const health = goalHealthStatus(goal, now);
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 14);

  const progressDelta = progressInDateRange(goal, periodStart, now);
  const activity = buildGoalSupportingActivity(goal);
  const recentWins = getSavedGrowthWins().filter(
    (w) =>
      winSupportsGoal(w, goal) &&
      new Date(w.ts).getTime() >= periodStart.getTime(),
  ).length;
  const recentCompletions = getPlanCompletionHistory().filter(
    (r) =>
      planCompletionSupportsGoal(r, goal) &&
      new Date(r.completedAt).getTime() >= periodStart.getTime(),
  ).length;

  let score = 0;
  if (progressDelta > 0) score += 3;
  if (recentWins > 0) score += 2;
  if (recentCompletions > 0) score += 2;
  if (activity.projects > 0) score += 1;
  if (activity.evidence > 0) score += 1;
  if (health === "on_track") score += 2;
  if (health === "needs_attention") score -= 1;
  if (health === "stalled") score -= 3;

  let level: GoalMomentumLevel;
  if (health === "stalled" || score <= 1) {
    level = "stalled";
  } else if (score >= 6) {
    level = "strong";
  } else {
    level = "moderate";
  }

  const meta = MOMENTUM_LABELS[level];
  return { level, label: meta.label, emoji: meta.emoji, score };
}

/** Goal-centered companion prioritization — active goals ordered by attention need. */
export function prioritizeGoalsForCompanionWork(
  goals: OutcomeGoal[] = listOutcomeGoals(),
  now = new Date(),
): GoalWorkRecommendation[] {
  return goals
    .map((goal) => {
      const momentum = calculateGoalMomentum(goal, now);
      const projects = getProjects()
        .filter((p) => projectSupportsGoal(p, goal))
        .map((p) => p.name);
      const pct = goalProgressPercent(goal);
      const health = goalHealthStatus(goal, now);

      let reason: string;
      if (health === "stalled") {
        reason =
          "This goal has been quieter than usual — would you like to pick it back up?";
      } else if (momentum.level === "strong") {
        reason = "Momentum is building — keep going when it feels right.";
      } else if (pct < 40) {
        reason = "Early stage — one small step could help if you want.";
      } else {
        reason = "Steady movement — there are a few ways forward if helpful.";
      }

      return {
        goal,
        momentum,
        reason: sanitizeIntelligenceInsight(reason),
        supportingProjects: projects,
        stalled: health === "stalled",
      };
    })
    .sort((a, b) => {
      if (a.stalled !== b.stalled) return a.stalled ? -1 : 1;
      const levelOrder = { stalled: 0, moderate: 1, strong: 2 };
      const la = levelOrder[a.momentum.level];
      const lb = levelOrder[b.momentum.level];
      if (la !== lb) return la - lb;
      return goalProgressPercent(a.goal) - goalProgressPercent(b.goal);
    });
}

export function planCompletionsForGoalInRange(
  goal: OutcomeGoal,
  from: Date,
  to: Date,
  completions: PlanTaskCompletionRecord[] = getPlanCompletionHistory(),
): PlanTaskCompletionRecord[] {
  return completions.filter((r) => {
    if (!planCompletionSupportsGoal(r, goal)) return false;
    const t = new Date(r.completedAt).getTime();
    return t >= from.getTime() && t <= to.getTime();
  });
}
