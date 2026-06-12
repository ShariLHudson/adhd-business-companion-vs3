import type { ApiUsageRecord } from "./types";

const STORAGE_KEY = "founder-analytics-api-v1";
const MAX_RECORDS = 500;

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function loadApiUsageRecords(): ApiUsageRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ApiUsageRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logApiUsage(input: {
  endpoint: string;
  model?: string;
  promptText: string;
  completionText: string;
  ts?: string;
  experimentId?: string;
  projectId?: string;
}): void {
  if (typeof window === "undefined") return;
  const promptTokens = estimateTokens(input.promptText);
  const completionTokens = estimateTokens(input.completionText);
  const record: ApiUsageRecord = {
    id: `api-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    endpoint: input.endpoint,
    model: input.model ?? "gpt-4o-mini",
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    ts: input.ts ?? new Date().toISOString(),
    experimentId: input.experimentId,
    projectId: input.projectId,
  };
  try {
    const next = [record, ...loadApiUsageRecords()].slice(0, MAX_RECORDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}
