/**
 * Estate Intelligence Engine™ — discovery evaluation bridge.
 * Future: Spark Cards™, Momentum™, Estate Guide™ share this entry point.
 */

export {
  evaluateDiscoveryKeySession,
  completeDiscoveryKeySession,
  markDiscoveryKeyShown,
  markDiscoveryKeyOpened,
  buildDiscoveryMemberContextFromEstateMemory,
  selectNextDiscovery,
  listSavedDiscoveries,
  getMemberDiscoveryHistory,
  getDiscoveryHistoryEntry,
  isDiscoveryBlockedByHistory,
} from "@/lib/estateDiscovery";

export type {
  DiscoveryKeySessionState,
  EvaluateDiscoveryKeyInput,
} from "@/lib/estateDiscovery/discoveryKeySystem";

export type { DiscoveryMemberContext } from "@/lib/estateDiscovery/types";

export type {
  MemberDiscoveryHistoryEntry,
  DiscoveryHistoryStatus,
  DiscoveryHistoryContext,
} from "@/lib/estateDiscovery/types";
