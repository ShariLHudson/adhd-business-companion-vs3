/**
 * Visual Thinking learning — local event store + signal bus + Founder Intelligence feed.
 *
 * The analytics layer learns from interactions; the intelligence layer owns the experience.
 */

import { emitCompanionSignal } from "@/lib/intelligence-layer/signalBus";
import { mapVisualThinkingStageToEcosystem } from "@/lib/companionIntelligenceEcosystem/pipeline";
import { getEcosystemMajorSystem } from "@/lib/companionIntelligenceEcosystem/systems";
import type { EcosystemMajorSystemId } from "@/lib/companionIntelligenceEcosystem/types";

import type {
  VisualThinkingLearningEvent,
  VisualThinkingPipelineStage,
  VisualThinkingSessionCapture,
} from "./types";
import type { VisualThinkingFrameworkId } from "./types";

const STORE_KEY = "companion-visual-thinking-learning-v1";
const MAX_EVENTS = 500;
const EMITTER = "visual_thinking_intelligence";

function uid(): string {
  return `vtl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readEvents(): VisualThinkingLearningEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VisualThinkingLearningEvent[];
  } catch {
    return [];
  }
}

function writeEvents(events: VisualThinkingLearningEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
  } catch {
    /* quota */
  }
}

function signalActionForStage(
  stage: VisualThinkingPipelineStage,
): "opened" | "completed" | "observed" {
  if (stage === "understand") return "opened";
  if (stage === "feed_founder") return "completed";
  if (stage === "learn") return "completed";
  if (stage === "visualize" || stage === "insights" || stage === "recommendations") {
    return "completed";
  }
  return "observed";
}

function ecosystemMetaForFramework(
  frameworkId: VisualThinkingFrameworkId,
  stage: VisualThinkingPipelineStage,
): Record<string, string | number | boolean> {
  const systemId: EcosystemMajorSystemId =
    frameworkId === "what-if-analysis" ? "business-canvas" : (frameworkId as EcosystemMajorSystemId);
  const system = getEcosystemMajorSystem(systemId);
  return {
    ecosystem_stage: mapVisualThinkingStageToEcosystem(stage),
    intelligence_pattern_count: system?.intelligencePatterns.length ?? 0,
  };
}

/** Emit to unified signal bus — no user text in meta. */
export function emitVisualThinkingSignal(capture: VisualThinkingSessionCapture): void {
  emitCompanionSignal({
    domain: "workspace",
    category: "tool_used",
    action: signalActionForStage(capture.stage),
    source: `visual_thinking:${capture.frameworkId}:${capture.stage}`,
    emitter: EMITTER,
    meta: {
      map_id: capture.mapId,
      framework: capture.frameworkId,
      stage: capture.stage,
      ...ecosystemMetaForFramework(capture.frameworkId, capture.stage),
      ...capture.meta,
    },
  });
}

/**
 * Founder Intelligence feed — local aggregation today; ecosystem event stream later.
 * Event shape is stable for future `visual_thinking.*` ecosystem events.
 */
export function feedFounderIntelligenceFromVisualThinking(
  capture: VisualThinkingSessionCapture,
): void {
  const events = readEvents();
  const event: VisualThinkingLearningEvent = {
    id: uid(),
    at: new Date().toISOString(),
    mapId: capture.mapId,
    frameworkId: capture.frameworkId,
    stage: capture.stage,
    meta: capture.meta,
  };
  writeEvents([event, ...events]);
  emitVisualThinkingSignal({ ...capture, stage: "feed_founder" });
}

/** Capture a pipeline stage — learning + future recommendation inputs. */
export function captureVisualThinkingSession(
  capture: VisualThinkingSessionCapture,
): VisualThinkingLearningEvent {
  const event: VisualThinkingLearningEvent = {
    id: uid(),
    at: new Date().toISOString(),
    mapId: capture.mapId,
    frameworkId: capture.frameworkId,
    stage: capture.stage,
    meta: capture.meta,
  };
  const events = readEvents();
  writeEvents([event, ...events]);
  emitVisualThinkingSignal(capture);
  return event;
}

export function listVisualThinkingLearningEvents(): VisualThinkingLearningEvent[] {
  return readEvents();
}

export function resetVisualThinkingLearningForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORE_KEY);
}

export function buildVisualThinkingFounderSummary(): {
  totalSessions: number;
  byFramework: Record<string, number>;
  byStage: Record<string, number>;
  recentFrameworks: VisualThinkingFrameworkId[];
} {
  const events = readEvents();
  const byFramework: Record<string, number> = {};
  const byStage: Record<string, number> = {};
  const recentFrameworks: VisualThinkingFrameworkId[] = [];

  for (const event of events) {
    byFramework[event.frameworkId] = (byFramework[event.frameworkId] ?? 0) + 1;
    byStage[event.stage] = (byStage[event.stage] ?? 0) + 1;
    if (!recentFrameworks.includes(event.frameworkId)) {
      recentFrameworks.push(event.frameworkId);
    }
    if (recentFrameworks.length >= 5) break;
  }

  return {
    totalSessions: events.length,
    byFramework,
    byStage,
    recentFrameworks,
  };
}
