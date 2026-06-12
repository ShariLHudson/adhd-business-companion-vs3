import type { ApiUsageRecord } from "@/lib/founderWorkspace/analytics/types";

const RATES_PER_TOKEN: Record<string, { prompt: number; completion: number }> = {
  "gpt-4o-mini": { prompt: 0.15 / 1_000_000, completion: 0.6 / 1_000_000 },
  "gpt-4o": { prompt: 2.5 / 1_000_000, completion: 10 / 1_000_000 },
  default: { prompt: 0.5 / 1_000_000, completion: 1.5 / 1_000_000 },
};

export function estimateApiCostUsd(record: ApiUsageRecord): number {
  const rates = RATES_PER_TOKEN[record.model] ?? RATES_PER_TOKEN.default;
  return (
    record.promptTokens * rates.prompt + record.completionTokens * rates.completion
  );
}

export function sumApiCost(records: ApiUsageRecord[]): number {
  const total = records.reduce((s, r) => s + estimateApiCostUsd(r), 0);
  return Math.round(total * 1000) / 1000;
}
