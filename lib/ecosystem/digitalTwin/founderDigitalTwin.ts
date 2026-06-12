// Founder Ecosystem — Phase 16 Founder Digital Twin (composer).
// A living, behavioral model of the founder, assembled from the work / decision
// / execution / momentum / overwhelm / success sub-models + twin memory +
// predictions. ETHICS: behavior not personality; observe, never diagnose,
// never claim certainty. Pure.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { detectFounderJourney } from "../journey/founderJourneyEngine";
import { buildWorkStyleModel } from "./workStyleModel";
import { buildDecisionModel } from "./decisionModel";
import { buildExecutionModel } from "./executionModel";
import { buildMomentumModel } from "./momentumModel";
import { buildOverwhelmModel } from "./overwhelmModel";
import { buildSuccessModel } from "./successModel";
import { buildPredictions, twinMaturity } from "./predictionEngine";
import { countType, hourOf } from "./digitalTwinUtil";
import type {
  DigitalTwinMemory,
  FounderDigitalTwin,
  TwinMention,
  WorkHourPreference,
} from "./digitalTwinTypes";

function toMentions(m: { label: string; mentions: number }[]): TwinMention[] {
  return m.map((x) => ({ label: x.label, count: x.mentions }));
}

function topMap(map: Map<string, number>, n = 5): TwinMention[] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));
}

function preferredWorkHours(events: FounderEvent[]): WorkHourPreference {
  const completions = events.filter(
    (e) => e.type === "task.completed" || e.type === "focus.completed",
  );
  if (!completions.length) return { bestTimeOfDay: null, evidence: 0 };
  const b = { morning: 0, afternoon: 0, evening: 0 };
  for (const e of completions) {
    const h = hourOf(e.ts);
    if (h < 12) b.morning += 1;
    else if (h < 17) b.afternoon += 1;
    else b.evening += 1;
  }
  const [best, evidence] = Object.entries(b).sort((a, b2) => b2[1] - a[1])[0] as [
    "morning" | "afternoon" | "evening",
    number,
  ];
  return { bestTimeOfDay: best, evidence };
}

export type BuildTwinOptions = { now?: Date; intel?: FounderIntelligence };

export function buildFounderDigitalTwin(
  events: FounderEvent[],
  founderId: ID,
  opts: BuildTwinOptions = {},
): FounderDigitalTwin {
  const now = opts.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = opts.intel ?? getFounderIntelligence(mine, founderId, now.toISOString());
  const journey = detectFounderJourney(mine, founderId, { now });

  const workStyle = buildWorkStyleModel(mine);
  const decisionStyle = buildDecisionModel(mine);
  const executionStyle = buildExecutionModel(mine);
  const momentum = buildMomentumModel(mine);
  const overwhelm = buildOverwhelmModel(mine, intel);
  const success = buildSuccessModel(mine);
  const predictions = buildPredictions(mine, founderId, { now, intel });

  // Workspace preferences.
  const wsMap = new Map<string, number>();
  for (const e of mine.filter((e) => e.type === "workspace.opened")) {
    const k = (e.refs?.workspace as string) ?? (e.data?.kind as string) ?? "workspace";
    wsMap.set(k, (wsMap.get(k) ?? 0) + 1);
  }

  // Successful activities + projects (completed work).
  const activityMap = new Map<string, number>();
  const projectWinMap = new Map<string, number>();
  for (const e of mine.filter((e) => e.type === "task.completed")) {
    const title =
      (e.data?.title as string) ??
      mine.find((x) => x.type === "task.created" && x.refs?.taskId === e.refs?.taskId)?.data?.title;
    if (typeof title === "string") activityMap.set(title, (activityMap.get(title) ?? 0) + 1);
    const pid = e.refs?.projectId;
    if (pid) {
      const pTitle =
        (mine.find((x) => x.type === "project.created" && x.refs?.projectId === pid)?.data
          ?.title as string) ?? pid;
      projectWinMap.set(pTitle, (projectWinMap.get(pTitle) ?? 0) + 1);
    }
  }

  // Advisor history (from intel insights/recommendations referencing advisors is
  // not tracked here; use coaching mentions as a proxy of engaged topics).
  const advisorMap = new Map<string, number>();
  for (const p of intel.patterns) advisorMap.set(p.type, (advisorMap.get(p.type) ?? 0) + 1);

  const memory: DigitalTwinMemory = {
    projects: toMentions(intel.memory.frequentProjects),
    goals: toMentions(intel.memory.frequentGoals),
    decisions: mine
      .filter((e) => e.type === "decision.created" && e.refs?.decisionId)
      .slice(0, 8)
      .map((e) => ({ id: e.refs!.decisionId!, text: String(e.data?.text ?? "Decision") })),
    wins: intel.wins.length,
    patterns: intel.patterns.map((p) => p.label),
    challenges: toMentions(intel.memory.frequentStruggles),
    opportunities: toMentions(intel.memory.frequentOpportunities),
    advisorHistory: topMap(advisorMap),
  };

  const observations = [
    workStyle.observation,
    executionStyle.observation,
    momentum.observation,
    overwhelm.observation,
    success.observation,
  ].filter(Boolean);

  return {
    founderId,
    generatedAt: now.toISOString(),
    maturity: twinMaturity(mine.length),
    observedEventCount: mine.length,
    businessStage: journey.currentStage,
    businessFocus: journey.primaryFocus,
    workStyle,
    decisionStyle,
    executionStyle,
    momentum,
    overwhelm,
    success,
    preferredWorkHours: preferredWorkHours(mine),
    preferredWorkspaceTypes: topMap(wsMap),
    mostSuccessfulActivities: topMap(activityMap),
    mostSuccessfulProjects: topMap(projectWinMap),
    memory,
    predictions,
    observations,
  };
}
