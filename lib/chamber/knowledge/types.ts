/**
 * Chamber knowledge pack contracts — registry + retrieval types.
 * Domain expertise packs attach to existing Chamber chat persona path;
 * platform still owns conversation, routing, and Shari's final voice.
 */

import type { ChamberMemberId } from "../chamberMemberRegistry";

/** How far a member's knowledge is wired into runtime retrieval. */
export type ChamberKnowledgeWiringStatus =
  | "fully"
  | "partially"
  | "docs-only"
  | "specialty-prompt-only";

/** Approval / readiness of the knowledge library itself. */
export type ChamberKnowledgeLibraryStatus =
  | "founder-approved"
  | "runtime-canonical"
  | "architecture-pack-only"
  | "not-built";

export type ChamberKnowledgeDocRef = {
  /** Repo-relative path from process.cwd() */
  path: string;
  /** Short role for retrieval selection */
  role: string;
};

/**
 * Structured contracts injected into Chamber chat (not raw full-library dump).
 * Mirrors thin-line rule: structured contribution → Shari composes.
 */
export type ChamberKnowledgeRuntimeContract = {
  memberId: ChamberMemberId;
  libraryVersion: string;
  primaryOwns: readonly string[];
  doesNotOwn: readonly string[];
  retrievalSignals: readonly string[];
  negativeSignals: readonly string[];
  safetyRules: readonly string[];
  productionCompletionRules: readonly string[];
  collaborationBridges: readonly string[];
  /** Preferred file roles for default chat retrieval slice */
  defaultRetrievalRoles: readonly string[];
};

export type ChamberKnowledgePack = {
  memberId: ChamberMemberId;
  displayName: string;
  libraryStatus: ChamberKnowledgeLibraryStatus;
  wiringStatus: ChamberKnowledgeWiringStatus;
  /** Root folder for markdown library when present */
  docsRoot: string | null;
  /** Architecture-v2 pack range note (completion packs) */
  architecturePackNote: string | null;
  docs: readonly ChamberKnowledgeDocRef[];
  /** Present when a runtime contract is coded for chat retrieval */
  contract: ChamberKnowledgeRuntimeContract | null;
  /**
   * Alternate runtime knowledge owner (e.g. Events → eventsIntelligence).
   * Chamber registry bridges; does not invent a second Events stack.
   */
  runtimeBridge?: "eventsIntelligence" | null;
};

export type ChamberKnowledgeRetrievalSlice = {
  memberId: ChamberMemberId;
  wiringStatus: ChamberKnowledgeWiringStatus;
  libraryVersion: string | null;
  docsRoot: string | null;
  /** Paths selected for this turn (may be empty if docs-only / specialty-only) */
  selectedPaths: readonly string[];
  /** Whether selectedPaths were verified on disk */
  filesVerified: boolean;
  missingPaths: readonly string[];
  contract: ChamberKnowledgeRuntimeContract | null;
  runtimeBridge: "eventsIntelligence" | null;
};

export type LoadChamberKnowledgeOptions = {
  /** Optional domain hint to prefer certain doc roles (e.g. "safety", "frameworks") */
  domainHint?: string | null;
  /** When true, skip fs.existsSync (unit tests with mocked pack) */
  skipFilesystemCheck?: boolean;
};
