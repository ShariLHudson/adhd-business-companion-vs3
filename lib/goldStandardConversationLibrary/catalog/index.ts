import type { GoldStandardConversation } from "../types";
import { BATCH1_BUSINESS_DECISIONS } from "./batch1BusinessDecisions";
import { BATCH2_COVERAGE } from "./batch2Coverage";
import {
  FEATURED_SAMPLES,
  TIO_GSC_BIZ_HIRING_001,
  TIO_GSC_CORRECTION_001,
  TIO_GSC_REPAIR_001,
} from "./featuredSamples";

/** Deduped full library registry. */
export function listGoldStandardConversations(): GoldStandardConversation[] {
  const byId = new Map<string, GoldStandardConversation>();
  for (const c of [
    ...BATCH1_BUSINESS_DECISIONS,
    ...BATCH2_COVERAGE,
    ...FEATURED_SAMPLES,
  ]) {
    byId.set(c.id, c);
  }
  return [...byId.values()];
}

export function getGoldStandardById(
  id: string,
): GoldStandardConversation | undefined {
  return listGoldStandardConversations().find((c) => c.id === id);
}

export {
  BATCH1_BUSINESS_DECISIONS,
  BATCH2_COVERAGE,
  FEATURED_SAMPLES,
  TIO_GSC_BIZ_HIRING_001,
  TIO_GSC_CORRECTION_001,
  TIO_GSC_REPAIR_001,
};
