// Founder Ecosystem — Phase 17 Aggregation Engine.
// Extracts anonymized Digital Twin signals and aggregates cohort patterns.
// Strips PII; retains behavioral traits only.

import type { FounderEvent } from "../events";
import type { ID } from "../models";
import { buildCompanionProfile } from "../companion/companionProfile";
import { detectFounderJourney } from "../journey/founderJourneyEngine";
import type { BusinessStage } from "../journey/journeyTypes";
import { parseAutomationRecords } from "../learning/founderEcosystemTracker";
import { generalizeProjectTitle, messageToCategoryTags } from "./privacyGuard";
import type {
  AnonymizedFounderSnapshot,
  DecisionSpeed,
  ExecutionStyle,
  HighImpactBehavior,
  NetworkAggregate,
  RareEffectiveStrategy,
  RecurringChallenge,
} from "./networkTypes";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** One-way cohort token — not reversible to founderId in exported network views. */
export function anonymizeFounderId(founderId: ID): string {
  let h = 2166136261;
  for (let i = 0; i < founderId.length; i += 1) {
    h ^= founderId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `anon-${(h >>> 0).toString(16)}`;
}

function inLastWeek(ts: string, now: Date): boolean {
  return new Date(ts).getTime() >= now.getTime() - WEEK_MS;
}

function decisionSpeedFromStyle(style: string | null, events: FounderEvent[]): DecisionSpeed {
  if (style === "decisive") return "fast";
  if (style === "avoidant" || style === "deliberate") return "slow";
  const decisions = events.filter((e) => e.type === "decision.created").length;
  const completed = events.filter((e) => e.type === "decision.updated").length;
  if (decisions >= 3 && completed / decisions >= 0.6) return "fast";
  if (decisions >= 3 && completed / decisions < 0.3) return "slow";
  return "moderate";
}

function detectProductivityHabits(events: FounderEvent[], now: Date): string[] {
  const habits = new Set<string>();
  const recent = events.filter((e) => inLastWeek(e.ts, now));

  const completions = recent.filter(
    (e) => e.type === "task.completed" || e.type === "action.completed",
  );
  const mondayCompletions = completions.filter((e) => new Date(e.ts).getUTCDay() === 1).length;
  const otherCompletions = completions.length - mondayCompletions;
  const mondayChat = recent.some(
    (e) =>
      e.type === "chat.coaching" &&
      /monday|batch/i.test(String(e.userMessage ?? e.data?.text ?? "")),
  );
  if (
    mondayCompletions >= 2 &&
    (mondayCompletions > otherCompletions || mondayCompletions >= otherCompletions)
  ) {
    habits.add("monday-batching");
  } else if (mondayChat && mondayCompletions >= 1) {
    habits.add("monday-batching");
  }

  const morningFocus = recent.filter(
    (e) => e.type === "focus.completed" && new Date(e.ts).getUTCHours() < 12,
  ).length;
  if (morningFocus >= 2) habits.add("morning-focus");

  const timeBlocks = recent.filter((e) => e.type === "timeblock.created").length;
  if (timeBlocks >= 2) habits.add("time-blocking");

  const automations = parseAutomationRecords(recent).filter((r) => r.lifecycle === "executed");
  if (automations.length >= 2) habits.add("automation-adoption");

  const outreachBlocks = recent.filter(
    (e) =>
      e.type === "timeblock.created" &&
      /follow|outreach|sales/i.test(String(e.data?.title ?? "")),
  ).length;
  if (outreachBlocks >= 1) habits.add("scripted-outreach-block");

  return [...habits];
}

function detectChallengeTags(events: FounderEvent[]): string[] {
  const tags = new Set<string>();
  for (const e of events.filter(
    (ev) => ev.type === "chat.coaching" || ev.type === "painpoint.observed",
  )) {
    const raw = String(e.userMessage ?? e.data?.text ?? "");
    for (const tag of messageToCategoryTags(raw)) {
      if (tag === "campaign-launch") tags.add("campaign-launch-delay");
      else if (tag === "sales-follow-up") tags.add("lead-follow-up");
      else if (tag === "priority-overload") tags.add("priority-overload");
      else if (tag === "task-delay") tags.add("task-delay");
      else if (tag === "content-work") tags.add("content-consistency");
      else tags.add(tag);
    }
  }

  const postponed = events.filter((e) => e.type === "action.postponed").length;
  if (postponed >= 2) tags.add("action-postponement");

  return [...tags];
}

function detectExecutionStyle(habits: string[], events: FounderEvent[]): ExecutionStyle {
  if (habits.includes("monday-batching")) return "batch";
  if (habits.includes("morning-focus") || habits.includes("time-blocking")) return "steady";
  const sprints = events.filter((e) => e.type === "focus.completed").length;
  if (sprints >= 4) return "sprint";
  return "reactive";
}

function recommendationRates(events: FounderEvent[]): {
  acceptanceRate: number;
  dismissed: number;
  ignored: number;
} {
  const offered = events.filter((e) => e.type === "action.offered").length;
  const completed = events.filter((e) => e.type === "action.completed").length;
  const dismissed = events.filter((e) => e.type === "action.dismissed").length;
  const postponed = events.filter((e) => e.type === "action.postponed").length;
  const ignored = dismissed + postponed;
  const acceptanceRate = offered > 0 ? Math.round((completed / offered) * 100) : 0;
  return { acceptanceRate, dismissed, ignored };
}

function safeMomentumLabel(factor: string): string {
  const lower = factor.toLowerCase();
  if (lower.includes("working on")) {
    const title = factor.replace(/^working on\s+/i, "");
    return `Focused work (${generalizeProjectTitle(title)})`;
  }
  if (lower.includes("focus session")) return "Focus sessions";
  if (lower.includes("time block")) return "Time blocks";
  if (lower.includes("morning")) return "Morning work";
  if (lower.includes("completing tasks")) return "Completing tasks";
  return factor.replace(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g, "[project-category]");
}

function projectStallRate(events: FounderEvent[]): number {
  const created = events.filter((e) => e.type === "project.created").length;
  const advanced =
    events.filter((e) => e.type === "project.stage_changed" || e.type === "task.completed")
      .length;
  if (created === 0) return 0;
  const stalled = Math.max(0, created * 2 - advanced);
  return Math.min(100, Math.round((stalled / (created * 2)) * 100));
}

function progressScore(events: FounderEvent[], now: Date): number {
  const recent = events.filter((e) => inLastWeek(e.ts, now));
  const wins =
    recent.filter((e) => e.type === "task.completed").length * 8 +
    recent.filter((e) => e.type === "project.completed").length * 25 +
    recent.filter((e) => e.type === "focus.completed").length * 10 +
    recent.filter((e) => e.type === "action.completed").length * 12;
  return Math.min(100, wins);
}

function automationExecutionRate(events: FounderEvent[]): number {
  const rows = parseAutomationRecords(events);
  const suggested = rows.filter((r) => r.lifecycle === "suggested").length;
  const executed = rows.filter((r) => r.lifecycle === "executed").length;
  if (suggested === 0) return executed > 0 ? 100 : 0;
  return Math.round((executed / suggested) * 100);
}

/** Extract a privacy-safe snapshot from one founder's event stream. */
export function extractAnonymizedSnapshot(
  events: FounderEvent[],
  founderId: ID,
  now: Date = new Date(),
): AnonymizedFounderSnapshot {
  const mine = events.filter((e) => e.founderId === founderId);
  const profile = buildCompanionProfile(mine, founderId, { includePatterns: true });
  const journey = detectFounderJourney(mine, founderId, { now });
  const recent = mine.filter((e) => inLastWeek(e.ts, now));

  const overwhelmTriggers =
    profile.overwhelmPatterns?.triggers.map((t) => t.trigger) ?? [];
  const productivityHabits = detectProductivityHabits(mine, now);
  const rates = recommendationRates(mine);
  const docsCreated = recent.filter((e) => e.type === "document.created").length;
  const docsExported = recent.filter((e) => e.type === "document.exported").length;
  const momentumDrivers = (profile.momentumPatterns?.positive.map((d) => d.factor) ?? []).map(
    safeMomentumLabel,
  );

  return {
    anonId: anonymizeFounderId(founderId),
    stage: journey.currentStage,
    primaryFocus: journey.primaryFocus,
    workStyle: profile.workStyles[0]?.value ?? null,
    decisionStyle: profile.decisionStyle.value,
    decisionSpeed: decisionSpeedFromStyle(profile.decisionStyle.value, mine),
    executionStyle: detectExecutionStyle(productivityHabits, mine),
    focusStyle: profile.focusStyle.value,
    planningStyle: profile.planningStyle.value,
    momentumDrivers,
    successfulWorkflows: productivityHabits,
    tasksCompletedPerWeek: recent.filter((e) => e.type === "task.completed").length,
    focusSessionsPerWeek: recent.filter((e) => e.type === "focus.completed").length,
    projectsAdvancedPerWeek: recent.filter(
      (e) => e.type === "project.stage_changed" || e.type === "task.completed",
    ).length,
    timeBlocksCompletedPerWeek: recent.filter((e) => e.type === "timeblock.completed").length,
    documentsCreatedPerWeek: docsCreated,
    projectsCompleted: mine.filter((e) => e.type === "project.completed").length,
    recommendationAcceptanceRate: rates.acceptanceRate,
    recommendationsDismissed: rates.dismissed,
    ignoredRecommendations: rates.ignored,
    completedActions: mine.filter((e) => e.type === "action.completed").length,
    projectStallRate: projectStallRate(mine),
    documentCompletionRate: docsCreated > 0 ? Math.round((docsExported / docsCreated) * 100) : 0,
    automationExecutionRate: automationExecutionRate(mine),
    productivityHabits,
    overwhelmTriggers,
    challengeTags: detectChallengeTags(mine),
    progressScore: progressScore(mine, now),
  };
}

function pct(n: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((n / total) * 100);
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

function correlateHabitLift(
  snapshots: AnonymizedFounderSnapshot[],
  habit: string,
): { lift: number; n: number } {
  const withHabit = snapshots.filter((s) => s.productivityHabits.includes(habit));
  const without = snapshots.filter((s) => !s.productivityHabits.includes(habit));
  if (withHabit.length === 0 || without.length === 0) return { lift: 0, n: withHabit.length };
  const avgWith = withHabit.reduce((a, s) => a + s.progressScore, 0) / withHabit.length;
  const avgWithout = without.reduce((a, s) => a + s.progressScore, 0) / without.length;
  if (avgWithout <= 0) return { lift: 0, n: withHabit.length };
  return { lift: Math.round(((avgWith - avgWithout) / avgWithout) * 100), n: withHabit.length };
}

function confidenceFromSample(n: number): "low" | "medium" | "high" {
  if (n >= 5) return "high";
  if (n >= 3) return "medium";
  return "low";
}

export function detectRecurringChallenges(
  snapshots: AnonymizedFounderSnapshot[],
): RecurringChallenge[] {
  const total = snapshots.length;
  const tagCounts = new Map<string, { count: number; stages: BusinessStage[] }>();

  for (const s of snapshots) {
    for (const tag of s.challengeTags) {
      const bucket = tagCounts.get(tag) ?? { count: 0, stages: [] };
      bucket.count += 1;
      bucket.stages.push(s.stage);
      tagCounts.set(tag, bucket);
    }
    for (const trigger of s.overwhelmTriggers) {
      const key = `overwhelm:${trigger}`;
      const bucket = tagCounts.get(key) ?? { count: 0, stages: [] };
      bucket.count += 1;
      bucket.stages.push(s.stage);
      tagCounts.set(key, bucket);
    }
  }

  return [...tagCounts.entries()]
    .map(([tag, { count, stages }]) => ({
      tag,
      founderCount: count,
      prevalence: pct(count, total),
      typicalStage: stages.sort(
        (a, b) => stages.filter((x) => x === b).length - stages.filter((x) => x === a).length,
      )[0] ?? null,
    }))
    .filter((c) => c.founderCount >= 1)
    .sort((a, b) => b.prevalence - a.prevalence);
}

export function detectHighImpactBehaviors(
  snapshots: AnonymizedFounderSnapshot[],
): HighImpactBehavior[] {
  const habits = new Set(snapshots.flatMap((s) => s.productivityHabits));
  const behaviors: HighImpactBehavior[] = [];

  for (const habit of habits) {
    const { lift, n } = correlateHabitLift(snapshots, habit);
    if (lift <= 0 || n === 0) continue;
    const label =
      habit === "monday-batching"
        ? "Batching tasks on Mondays"
        : habit === "morning-focus"
          ? "Morning focus sessions"
          : habit === "time-blocking"
            ? "Consistent time blocking"
            : habit === "automation-adoption"
              ? "Using approved automations"
              : habit === "scripted-outreach-block"
                ? "Short scripted outreach blocks"
                : habit;
    behaviors.push({
      habit,
      correlatedProgressLift: lift,
      sampleSize: n,
      confidence: confidenceFromSample(n),
      framing: `Trend data suggests founders who ${label.toLowerCase()} may see roughly ${lift}% higher weekly progress scores (not a guarantee).`,
    });
  }

  return behaviors.sort((a, b) => b.correlatedProgressLift - a.correlatedProgressLift);
}

export function detectRareEffectiveStrategies(
  snapshots: AnonymizedFounderSnapshot[],
): RareEffectiveStrategy[] {
  const total = snapshots.length;
  if (total === 0) return [];

  const strategies: RareEffectiveStrategy[] = [];
  const habitStats = new Map<string, { adopters: number; progressSum: number }>();

  for (const s of snapshots) {
    for (const habit of s.productivityHabits) {
      const stat = habitStats.get(habit) ?? { adopters: 0, progressSum: 0 };
      stat.adopters += 1;
      stat.progressSum += s.progressScore;
      habitStats.set(habit, stat);
    }
  }

  for (const [habit, stat] of habitStats) {
    const rate = pct(stat.adopters, total);
    if (rate > 35 || rate < 5) continue;
    const avgProgress = Math.round(stat.progressSum / stat.adopters);
    strategies.push({
      strategy: habit,
      adoptionRate: rate,
      avgProgressAmongAdopters: avgProgress,
      framing: `A smaller subset (~${rate}%) uses this approach with relatively strong progress signals — worth experimenting with.`,
    });
  }

  return strategies.sort((a, b) => b.avgProgressAmongAdopters - a.avgProgressAmongAdopters);
}

export function aggregateSnapshots(
  snapshots: AnonymizedFounderSnapshot[],
  now: Date = new Date(),
): NetworkAggregate {
  const total = snapshots.length;
  const stageDistribution: Partial<Record<BusinessStage, number>> = {};
  for (const s of snapshots) {
    stageDistribution[s.stage] = (stageDistribution[s.stage] ?? 0) + 1;
  }

  const habitCounts = new Map<string, number>();
  const triggerCounts = new Map<string, number>();
  for (const s of snapshots) {
    for (const h of s.productivityHabits) habitCounts.set(h, (habitCounts.get(h) ?? 0) + 1);
    for (const t of s.overwhelmTriggers) triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1);
  }

  const driverCounts = new Map<string, number>();
  for (const s of snapshots) {
    for (const d of s.momentumDrivers) driverCounts.set(d, (driverCounts.get(d) ?? 0) + 1);
  }

  const stageRisks: NetworkAggregate["stageSpecificRisks"] = [];
  const stageOpps: NetworkAggregate["stageSpecificOpportunities"] = [];
  for (const [stage, count] of Object.entries(stageDistribution) as [BusinessStage, number][]) {
    const stageSnaps = snapshots.filter((s) => s.stage === stage);
    const stallAvg = average(stageSnaps.map((s) => s.projectStallRate));
    if (stallAvg > 30) {
      stageRisks.push({
        stage,
        risk: "Project switching without weekly advancement",
        prevalence: stallAvg,
      });
    }
    if (stage === "launching" || stage === "growing") {
      stageOpps.push({
        stage,
        opportunity: "Scheduled sales follow-up blocks",
        prevalence: pct(
          stageSnaps.filter((s) => s.productivityHabits.includes("time-blocking")).length,
          count,
        ),
      });
    }
  }

  const lowCompletion = snapshots.filter((s) => s.tasksCompletedPerWeek < 2).length;

  return {
    generatedAt: now.toISOString(),
    cohortSize: total,
    stageDistribution,
    recurringChallenges: detectRecurringChallenges(snapshots),
    highImpactBehaviors: detectHighImpactBehaviors(snapshots),
    rareStrategies: detectRareEffectiveStrategies(snapshots),
    commonProductivityHabits: [...habitCounts.entries()]
      .map(([habit, count]) => ({ habit, rate: pct(count, total) }))
      .sort((a, b) => b.rate - a.rate),
    commonOverwhelmTriggers: [...triggerCounts.entries()]
      .map(([trigger, count]) => ({ trigger, rate: pct(count, total) }))
      .sort((a, b) => b.rate - a.rate),
    commonMomentumDrivers: [...driverCounts.entries()]
      .map(([driver, count]) => ({ driver, rate: pct(count, total) }))
      .sort((a, b) => b.rate - a.rate),
    stageSpecificRisks: stageRisks,
    stageSpecificOpportunities: stageOpps,
    lowCompletionWarningSigns: [
      {
        sign: "Fewer than 2 tasks completed per week",
        rate: pct(lowCompletion, total),
      },
    ],
  };
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function extractCohortSnapshots(
  events: FounderEvent[],
  founderIds: ID[],
  now: Date = new Date(),
): AnonymizedFounderSnapshot[] {
  return founderIds.map((id) => extractAnonymizedSnapshot(events, id, now));
}
