/**
 * Development-only structured tracing for Visual Thinking execution.
 * Shared trace ID per request — never log sensitive user content in production.
 */

export type VisualThinkingTraceStage =
  | "request_received"
  | "resolved_user_request"
  | "requested_deliverable"
  | "requested_presentation"
  | "current_information_requirement"
  | "research_decision"
  | "selected_research_provider"
  | "provider_invocation"
  | "provider_response_count"
  | "normalized_finding_count"
  | "knowledge_item_count_before_merge"
  | "knowledge_item_count_after_merge"
  | "remaining_required_gap_count"
  | "generation_invoked"
  | "generation_input_item_count"
  | "generated_deliverable_count"
  | "generated_section_count"
  | "generated_process_step_count"
  | "generated_thinking_object_count"
  | "validation_result"
  | "workspace_projection_result"
  | "final_execution_state"
  | "final_ui_payload";

export type VisualThinkingTraceEntry = {
  stage: VisualThinkingTraceStage | string;
  at: string;
  data?: Record<string, unknown>;
};

export type VisualThinkingExecutionTrace = {
  id: string;
  startedAt: string;
  entries: VisualThinkingTraceEntry[];
};

const MAX_TRACES = 8;
const traces = new Map<string, VisualThinkingExecutionTrace>();
let lastTraceId: string | null = null;

function isDevTraceEnabled(): boolean {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    return true;
  }
  if (typeof window !== "undefined") {
    try {
      return window.sessionStorage.getItem("vts-execution-trace") === "1";
    } catch {
      return false;
    }
  }
  return false;
}

function newTraceId(): string {
  return `vts-trace-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function beginVisualThinkingExecutionTrace(
  meta?: Record<string, unknown>,
): string {
  const id = newTraceId();
  const trace: VisualThinkingExecutionTrace = {
    id,
    startedAt: new Date().toISOString(),
    entries: [],
  };
  traces.set(id, trace);
  lastTraceId = id;
  if (traces.size > MAX_TRACES) {
    const oldest = traces.keys().next().value;
    if (oldest) traces.delete(oldest);
  }
  recordVisualThinkingTrace(id, "request_received", meta);
  return id;
}

export function recordVisualThinkingTrace(
  traceId: string | null | undefined,
  stage: VisualThinkingTraceStage | string,
  data?: Record<string, unknown>,
): void {
  if (!traceId) return;
  const trace = traces.get(traceId);
  if (!trace) return;
  const safeData = data
    ? Object.fromEntries(
        Object.entries(data).map(([k, v]) => {
          if (typeof v === "string" && v.length > 120) {
            return [k, `${v.slice(0, 80)}…(${v.length} chars)`];
          }
          return [k, v];
        }),
      )
    : undefined;
  trace.entries.push({
    stage,
    at: new Date().toISOString(),
    data: safeData,
  });
  if (isDevTraceEnabled() && typeof console !== "undefined") {
    // eslint-disable-next-line no-console -- intentional development trace
    console.info(`[VTS:${traceId}] ${stage}`, safeData ?? "");
  }
}

export function getVisualThinkingExecutionTrace(
  traceId?: string | null,
): VisualThinkingExecutionTrace | null {
  const id = traceId ?? lastTraceId;
  if (!id) return null;
  return traces.get(id) ?? null;
}

export function getLastVisualThinkingTraceId(): string | null {
  return lastTraceId;
}

export function summarizeVisualThinkingTrace(
  traceId?: string | null,
): {
  traceId: string | null;
  stages: string[];
  counts: Record<string, number | string | boolean | null>;
} {
  const trace = getVisualThinkingExecutionTrace(traceId);
  if (!trace) {
    return { traceId: null, stages: [], counts: {} };
  }
  const byStage = new Map(trace.entries.map((e) => [e.stage, e.data ?? {}]));
  const num = (stage: string, key: string): number | null => {
    const v = byStage.get(stage)?.[key];
    return typeof v === "number" ? v : null;
  };
  return {
    traceId: trace.id,
    stages: trace.entries.map((e) => e.stage),
    counts: {
      researchFindings: num("provider_response_count", "count"),
      normalizedFindings: num("normalized_finding_count", "count"),
      knowledgeBefore: num("knowledge_item_count_before_merge", "count"),
      knowledgeAfter: num("knowledge_item_count_after_merge", "count"),
      remainingGaps: num("remaining_required_gap_count", "count"),
      deliverables: num("generated_deliverable_count", "count"),
      sections: num("generated_section_count", "count"),
      processSteps: num("generated_process_step_count", "count"),
      thinkingObjects: num("generated_thinking_object_count", "count"),
      validationPassed: Boolean(byStage.get("validation_result")?.passed),
      workspaceOpened: Boolean(byStage.get("workspace_projection_result")?.opened),
      finalState:
        (byStage.get("final_execution_state")?.state as string | undefined) ??
        null,
    },
  };
}

/** Test helper — clears in-memory traces. */
export function __resetVisualThinkingExecutionTracesForTests(): void {
  traces.clear();
  lastTraceId = null;
}
