/**
 * 049 — Universal Prompt Rule (internal)
 * Before creating anything, ask these questions — then connect automatically.
 */

import { getCreateAssetById } from "@/lib/createAssets";
import {
  resolveLargerCreation,
  similarAssetAlreadyExists,
  type ResolvedCreationEcosystem,
} from "./resolveCreation";

export type PreCreateCheckResult = {
  belongsToExisting: boolean;
  creation: ResolvedCreationEcosystem | null;
  similarExists: boolean;
  shouldCreateNewAsset: boolean;
  blueprintId: string | null;
  chamberOwnerId: string | null;
  projectHomeId: string | null;
  shouldUpdateCartography: boolean;
  shouldUpdateReadiness: boolean;
  shouldInjectConversationContext: boolean;
  /** Internal rationale for logs / Iceberg */
  reasons: string[];
};

/**
 * Internal gate before any Create / Chamber / Board asset generation.
 */
export function runPreCreateChecks(input: {
  assetDefId: string;
  creationId?: string | null;
  eventRecordId?: string | null;
  canonicalWorkId?: string | null;
  projectHomeId?: string | null;
  createWorkflowId?: string | null;
}): PreCreateCheckResult {
  const reasons: string[] = [];
  const creation = resolveLargerCreation({
    creationId: input.creationId,
    eventRecordId: input.eventRecordId,
    canonicalWorkId: input.canonicalWorkId,
    projectHomeId: input.projectHomeId,
    createWorkflowId: input.createWorkflowId,
    preferActiveEvent: true,
  });

  const def = getCreateAssetById(input.assetDefId);
  const belongsToExisting = Boolean(creation);
  if (belongsToExisting) {
    reasons.push("Belongs to existing Creation Workspace — connect, do not orphan.");
  } else {
    reasons.push("No existing creation found — new asset may start a creation.");
  }

  const similarExists = creation
    ? similarAssetAlreadyExists(creation, input.assetDefId)
    : false;
  if (similarExists) {
    reasons.push("Similar asset already exists — reuse, do not duplicate.");
  }

  const shouldCreateNewAsset = !similarExists;
  const chamberOwnerId = def?.primaryChamberMemberId ?? null;
  const blueprintId = creation?.blueprintId ?? null;
  const projectHomeId =
    creation?.projectHomeId ?? input.projectHomeId ?? null;

  return {
    belongsToExisting,
    creation,
    similarExists,
    shouldCreateNewAsset,
    blueprintId,
    chamberOwnerId,
    projectHomeId,
    shouldUpdateCartography: Boolean(def?.cartographyEligible && creation),
    shouldUpdateReadiness: Boolean(creation),
    shouldInjectConversationContext: Boolean(creation),
    reasons,
  };
}
