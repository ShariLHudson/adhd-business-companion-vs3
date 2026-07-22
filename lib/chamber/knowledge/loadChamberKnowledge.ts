/**
 * Load Chamber knowledge retrieval slice for an active member conversation.
 * Extends existing Chamber persona path — selects paths + contracts; does not
 * dump entire libraries into the prompt.
 *
 * Browser-safe: no node:fs / node:path. Disk verification lives in
 * verifyChamberKnowledgePaths.ts (Node / tests only).
 */

import { getChamberKnowledgePack } from "./chamberKnowledgeRegistry";
import { clientRelationshipsRolesForHint } from "./clientRelationshipsContracts";
import { knowledgeManagementSelectPaths } from "./knowledgeManagementContracts";
import {
  eventsIntelligenceRetrievalPath,
} from "@/lib/eventsIntelligence/knowledgeManifest";
import type {
  ChamberKnowledgeRetrievalSlice,
  LoadChamberKnowledgeOptions,
} from "./types";

function selectPathsForMember(
  memberId: string,
  domainHint?: string | null,
): string[] {
  const pack = getChamberKnowledgePack(memberId);
  if (!pack || pack.docs.length === 0) return [];

  if (pack.runtimeBridge === "eventsIntelligence") {
    return eventsIntelligenceRetrievalPath({
      phase: domainHint?.trim() || "discovery",
      domainHint: domainHint ?? null,
    });
  }

  if (pack.memberId === "client-relationships") {
    const roles = new Set(clientRelationshipsRolesForHint(domainHint));
    return pack.docs.filter((d) => roles.has(d.role)).map((d) => d.path);
  }

  if (pack.memberId === "knowledge-management") {
    return knowledgeManagementSelectPaths(pack.docs, domainHint);
  }

  if (pack.contract?.defaultRetrievalRoles?.length) {
    const roles = new Set(pack.contract.defaultRetrievalRoles);
    return pack.docs
      .filter((d) => d.status !== "exclude-from-retrieval")
      .filter((d) => d.status !== "unavailable")
      .filter((d) => roles.has(d.role))
      .map((d) => d.path);
  }

  return pack.docs
    .filter((d) => d.status !== "exclude-from-retrieval")
    .filter((d) => d.status !== "unavailable")
    .map((d) => d.path);
}

/**
 * Resolve the knowledge slice for Chamber chat / tests.
 * Safe when pack is docs-only: returns empty paths + null contract.
 *
 * Does not touch the filesystem. For disk verification in Node, use
 * `loadChamberKnowledgeVerified` from `./verifyChamberKnowledgePaths`.
 */
export function loadChamberKnowledge(
  memberId: string,
  options: LoadChamberKnowledgeOptions = {},
): ChamberKnowledgeRetrievalSlice {
  const pack = getChamberKnowledgePack(memberId);
  if (!pack) {
    return {
      memberId: memberId as ChamberKnowledgeRetrievalSlice["memberId"],
      wiringStatus: "specialty-prompt-only",
      libraryVersion: null,
      docsRoot: null,
      selectedPaths: [],
      filesVerified: true,
      missingPaths: [],
      contract: null,
      runtimeBridge: null,
    };
  }

  const selectedPaths = selectPathsForMember(memberId, options.domainHint);

  return {
    memberId: pack.memberId,
    wiringStatus: pack.wiringStatus,
    libraryVersion: pack.contract?.libraryVersion ?? null,
    docsRoot: pack.docsRoot,
    selectedPaths,
    // Client-safe default: skip disk I/O. Callers that need verification
    // must use loadChamberKnowledgeVerified (Node-only module).
    filesVerified: true,
    missingPaths: [],
    contract: pack.contract,
    runtimeBridge: pack.runtimeBridge ?? null,
  };
}

/**
 * True when this member has a runtime contract that should augment chat hints.
 */
export function chamberKnowledgeShouldAugmentChat(memberId: string): boolean {
  const pack = getChamberKnowledgePack(memberId);
  return Boolean(
    pack &&
      pack.contract &&
      (pack.wiringStatus === "fully" || pack.wiringStatus === "partially"),
  );
}
