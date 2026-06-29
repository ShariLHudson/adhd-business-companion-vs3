/**
 * Asset Library — single source of truth for uploaded media and documents.
 * Capture once. Store once. Reference everywhere.
 */

import type { EcosystemObjectKind } from "@/lib/intelligence/intelligenceReadyTypes";

export type AssetCategory =
  | "image"
  | "screenshot"
  | "document"
  | "pdf"
  | "video"
  | "audio"
  | "voice-note"
  | "certificate"
  | "email"
  | "other";

/** Growth records that may reference library assets (extend as ecosystem grows). */
export type AssetRecordKind =
  | "portfolio"
  | "evidence-bank"
  | "journal"
  | "capture-session"
  | "win"
  | "journey"
  | "confidence-vault"
  | "report";

export type AssetRecord = {
  id: string;
  filename: string;
  title: string;
  description: string;
  tags: string[];
  category: AssetCategory;
  mimeType: string;
  /** Blob location — data URL in V1 localStorage; object storage URL later. */
  url: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  /** Content fingerprint for deduplication within this browser. */
  contentHash?: string;
};

export type AssetReference = {
  id: string;
  assetId: string;
  recordId: string;
  recordKind: AssetRecordKind;
  /** Optional ecosystem lineage */
  recordObjectKind?: EcosystemObjectKind;
  createdAt: string;
};

export type AssetSearchFilters = {
  query?: string;
  category?: AssetCategory;
  favorite?: boolean;
  recordKind?: AssetRecordKind;
  recordId?: string;
  unattachedOnly?: boolean;
};

export const ASSET_LIBRARY_DISPLAY_NAME = "Asset Library" as const;
