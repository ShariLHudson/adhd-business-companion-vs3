/**
 * Recall decisions — use memory to reduce repeated questions.
 */

import { applyMemoryAging, isStale } from "./aging";
import { listAllForUser, touchRecord } from "./store";
import type { MemoryKey, MemoryRecallDecision, MemoryRecord } from "./types";

const CONTEXT_KEYS: MemoryKey[] = [
  "business_name",
  "industry",
  "audience",
  "offers",
  "products",
  "goals",
  "brand_voice",
  "active_projects",
  "preferred_tone",
  "preferred_response_length",
  "learning_style",
];

const QUESTION_SIGNALS: Array<{ key: MemoryKey; pattern: RegExp }> = [
  { key: "business_name", pattern: /what(?:'s| is) your (?:business|company) name/i },
  { key: "industry", pattern: /what industry|what (?:do you|does your business) do/i },
  { key: "audience", pattern: /who (?:is|are) your (?:target )?audience|who do you serve/i },
  { key: "goals", pattern: /what(?:'s| are) your (?:main )?goals?/i },
  { key: "brand_voice", pattern: /what(?:'s| is) your brand voice/i },
  { key: "preferred_tone", pattern: /what tone|how (?:direct|casual) should/i },
];

export function buildRecallDecision(
  userId: string,
  memberMessage: string,
): MemoryRecallDecision {
  applyMemoryAging(userId);
  const records = listAllForUser(userId);
  const active = records.filter((r) => r.confidence !== "archived" && !r.archivedAt);

  const recalledFacts: MemoryRecord[] = [];
  const staleFacts: MemoryRecord[] = [];
  const missingFacts: MemoryKey[] = [];
  const reduceRepetition: string[] = [];

  for (const key of CONTEXT_KEYS) {
    const record = active.find((r) => r.key === key);
    if (record) {
      touchRecord(userId, record.id);
      if (isStale(record)) staleFacts.push(record);
      else recalledFacts.push(record);
      reduceRepetition.push(key);
    } else {
      missingFacts.push(key);
    }
  }

  let shouldAsk = false;
  let shouldConfirm = staleFacts.length > 0;

  for (const { key, pattern } of QUESTION_SIGNALS) {
    if (!pattern.test(memberMessage)) continue;
    const known = active.find((r) => r.key === key);
    if (known && !isStale(known)) {
      shouldAsk = false;
      shouldConfirm = true;
      reduceRepetition.push(`skip_ask_${key}`);
    }
  }

  if (/\b(update|change) my\b/i.test(memberMessage)) {
    shouldConfirm = true;
  }

  return {
    shouldAsk,
    shouldConfirm,
    recalledFacts,
    staleFacts,
    missingFacts,
    reduceRepetition,
  };
}

export function contextBundleFromRecall(
  recalled: MemoryRecord[],
): Partial<Record<MemoryKey, unknown>> {
  const bundle: Partial<Record<MemoryKey, unknown>> = {};
  for (const record of recalled) {
    bundle[record.key as MemoryKey] = record.value;
  }
  return bundle;
}
