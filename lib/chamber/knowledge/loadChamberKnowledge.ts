/**
 * Load Chamber knowledge retrieval slice for an active member conversation.
 * Extends existing Chamber persona path — selects paths + contracts; does not
 * dump entire libraries into the prompt.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getChamberKnowledgePack } from "./chamberKnowledgeRegistry";
import { clientRelationshipsRolesForHint } from "./clientRelationshipsContracts";
import {
  eventsIntelligenceRetrievalPath,
} from "@/lib/eventsIntelligence/knowledgeManifest";
import type {
  ChamberKnowledgeRetrievalSlice,
  LoadChamberKnowledgeOptions,
} from "./types";

function verifyPaths(paths: readonly string[]): {
  filesVerified: boolean;
  missingPaths: string[];
} {
  const missing: string[] = [];
  for (const rel of paths) {
    const abs = resolve(process.cwd(), rel);
    if (!existsSync(abs)) missing.push(rel);
  }
  return {
    filesVerified: missing.length === 0,
    missingPaths: missing,
  };
}

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

  if (pack.contract?.defaultRetrievalRoles?.length) {
    const roles = new Set(pack.contract.defaultRetrievalRoles);
    return pack.docs.filter((d) => roles.has(d.role)).map((d) => d.path);
  }

  return pack.docs.map((d) => d.path);
}

/**
 * Resolve the knowledge slice for Chamber chat / tests.
 * Safe when pack is docs-only: returns empty paths + null contract.
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
  const check =
    options.skipFilesystemCheck || selectedPaths.length === 0
      ? { filesVerified: true, missingPaths: [] as string[] }
      : verifyPaths(selectedPaths);

  return {
    memberId: pack.memberId,
    wiringStatus: pack.wiringStatus,
    libraryVersion: pack.contract?.libraryVersion ?? null,
    docsRoot: pack.docsRoot,
    selectedPaths,
    filesVerified: check.filesVerified,
    missingPaths: check.missingPaths,
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
