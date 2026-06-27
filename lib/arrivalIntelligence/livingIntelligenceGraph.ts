/**
 * Living Intelligence Graph — arrival foundations.
 * Captures rhythm and continuation patterns without exposing complexity.
 */

import type { ArrivalGreetingStrategy, ArrivalVisitorKind } from "./arrivalTypes";
import type { CompanionContinueResolution } from "@/lib/companionLedContinue";
import {
  legacyTimeOfDayFromPeriod,
  resolveHomesteadTimePeriod,
} from "@/lib/homesteadTime";

const STORAGE_KEY = "companion-living-graph-arrivals-v1";
const MAX_RECORDS = 48;

export type ArrivalGraphRecord = {
  at: string;
  returnIntervalHours: number | null;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  dayOfWeek: number;
  visitorKind: ArrivalVisitorKind;
  greetingStrategy: ArrivalGreetingStrategy;
  continueMode: CompanionContinueResolution["mode"];
  sessionVisitIndex: number;
  firstAction: string | null;
};

export type LivingIntelligenceGraph = {
  arrivals: ArrivalGraphRecord[];
  lastArrivalAt: string | null;
};

function readGraph(): LivingIntelligenceGraph {
  if (typeof window === "undefined") {
    return { arrivals: [], lastArrivalAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { arrivals: [], lastArrivalAt: null };
    const parsed = JSON.parse(raw) as LivingIntelligenceGraph;
    return {
      arrivals: Array.isArray(parsed.arrivals) ? parsed.arrivals : [],
      lastArrivalAt: parsed.lastArrivalAt ?? null,
    };
  } catch {
    return { arrivals: [], lastArrivalAt: null };
  }
}

function writeGraph(graph: LivingIntelligenceGraph) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
    window.dispatchEvent(new Event("companion-arrival-updated"));
  } catch {
    /* quota */
  }
}

export function timeOfDayBucket(
  now = new Date(),
): ArrivalGraphRecord["timeOfDay"] {
  return legacyTimeOfDayFromPeriod(resolveHomesteadTimePeriod(now));
}

export function hoursSinceLastArrival(now = new Date()): number | null {
  const graph = readGraph();
  if (!graph.lastArrivalAt) return null;
  const then = new Date(graph.lastArrivalAt).getTime();
  if (!Number.isFinite(then)) return null;
  return Math.max(0, (now.getTime() - then) / (1000 * 60 * 60));
}

export function recordArrival(input: {
  visitorKind: ArrivalVisitorKind;
  greetingStrategy: ArrivalGreetingStrategy;
  continue: CompanionContinueResolution;
  sessionVisitIndex: number;
  now?: Date;
}): ArrivalGraphRecord {
  const now = input.now ?? new Date();
  const returnIntervalHours = hoursSinceLastArrival(now);

  const record: ArrivalGraphRecord = {
    at: now.toISOString(),
    returnIntervalHours,
    timeOfDay: timeOfDayBucket(now),
    dayOfWeek: now.getDay(),
    visitorKind: input.visitorKind,
    greetingStrategy: input.greetingStrategy,
    continueMode: input.continue.mode,
    sessionVisitIndex: input.sessionVisitIndex,
    firstAction: null,
  };

  const graph = readGraph();
  graph.arrivals = [record, ...graph.arrivals].slice(0, MAX_RECORDS);
  graph.lastArrivalAt = record.at;
  writeGraph(graph);
  return record;
}

export function recordArrivalFirstAction(action: string) {
  const graph = readGraph();
  if (graph.arrivals.length === 0) return;
  const [latest, ...rest] = graph.arrivals;
  if (latest.firstAction) return;
  graph.arrivals = [{ ...latest, firstAction: action }, ...rest];
  writeGraph(graph);
}

export function getLivingIntelligenceGraph(): LivingIntelligenceGraph {
  return readGraph();
}
