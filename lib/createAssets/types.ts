/**
 * 047 — Create Ecosystem & Asset Generation types
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";

export type AssetProjectWorkMode =
  | "none"
  | "reference_only"
  | "suggested_tasks"
  | "required_tasks";

export type CreateAssetDefinition = {
  id: string;
  name: string;
  purpose: string;
  /** Editable builder / template key inside Create */
  templateId: string;
  editable: boolean;
  /** Default requiredness — ecosystems may override */
  defaultRequired: boolean;
  /** Asset ids that unlock this one when present/complete */
  dependencyAssetIds: readonly string[];
  /** Section / planning signals that unlock this asset */
  unlockSignals: readonly string[];
  primaryChamberMemberId: ChamberMemberId | null;
  supportingChamberMemberIds: readonly ChamberMemberId[];
  boardAdvisorIds: readonly ChamberMemberId[];
  projectWorkMode: AssetProjectWorkMode;
  cartographyEligible: boolean;
  completionHint: string;
};

/** Blueprint-specific view of a registry asset */
export type EcosystemAssetRef = {
  assetId: string;
  /** Override required for this ecosystem */
  required?: boolean;
  /** Phase / signal when this asset becomes suggestible */
  suggestAfterSignals: readonly string[];
  /** Context label override (e.g. "Retreat Welcome Guide") */
  contextLabel?: string;
};

export type CreationEcosystemDefinition = {
  id: string;
  /** Links to 046 blueprint id */
  blueprintId: string;
  label: string;
  primaryAssetId: string;
  assets: readonly EcosystemAssetRef[];
};

export type CreationAssetInstance = {
  assetId: string;
  label: string;
  status: "suggested" | "accepted" | "drafting" | "complete" | "skipped";
  createdAt: string;
  updatedAt: string;
};

/** Living ecosystem attached to one canonical Creation Record */
export type CreationEcosystemRecord = {
  id: string;
  ecosystemId: string;
  blueprintId: string;
  title: string;
  canonicalWorkId: string | null;
  projectHomeId: string | null;
  eventRecordId: string | null;
  completedSignals: string[];
  instances: CreationAssetInstance[];
  /** Last max-3 offer — used for one-click accept */
  pendingSuggestionIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type AssetSuggestion = {
  assetId: string;
  name: string;
  purpose: string;
  contextLabel: string;
  primaryChamberMemberId: ChamberMemberId | null;
  /** Ready for one-click generate */
  canGenerate: boolean;
};

export type AssetSuggestionResult = {
  suggestions: AssetSuggestion[];
  /** Shari-facing offer (max 3) — never a dump */
  offerLine: string | null;
};
