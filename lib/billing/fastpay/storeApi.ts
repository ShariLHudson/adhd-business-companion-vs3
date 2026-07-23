/**
 * Thin store API surface for index exports (avoids circular imports in tests).
 */

import {
  createMemoryVoiceEntitlementStore,
  getVoiceEntitlementStore,
  resetMemoryVoiceEntitlementStoreForTests,
  setVoiceEntitlementStoreForTests,
} from "./entitlementStore";
import { publicViewFromRecord } from "./syncRules";
import type { VoiceEntitlementPublicView } from "./types";

export {
  createMemoryVoiceEntitlementStore,
  getVoiceEntitlementStore,
  resetMemoryVoiceEntitlementStoreForTests,
  setVoiceEntitlementStoreForTests,
};

export async function publicViewSafe(
  userId: string,
): Promise<VoiceEntitlementPublicView> {
  const record = await getVoiceEntitlementStore().getByUserId(userId);
  return publicViewFromRecord(record);
}
