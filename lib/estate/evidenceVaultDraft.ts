/**
 * Unfinished Evidence Vault capture draft — session-only, never auto-saves entries.
 */

import type { EstateCollectionCaptureValues } from "@/lib/estate/collectionFramework";

export const EVIDENCE_VAULT_DRAFT_KEY =
  "companion-evidence-vault-capture-draft-v1" as const;

export type EvidenceVaultCaptureDraft = {
  values: EstateCollectionCaptureValues;
  updatedAt: string;
};

function hasMeaningfulDraftValues(values: EstateCollectionCaptureValues): boolean {
  return Object.values(values).some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

export function saveEvidenceVaultDraft(
  values: EstateCollectionCaptureValues,
): void {
  if (typeof window === "undefined") return;
  if (!hasMeaningfulDraftValues(values)) {
    clearEvidenceVaultDraft();
    return;
  }
  try {
    const payload: EvidenceVaultCaptureDraft = {
      values,
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(EVIDENCE_VAULT_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* noop */
  }
}

export function loadEvidenceVaultDraft(): EvidenceVaultCaptureDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EVIDENCE_VAULT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EvidenceVaultCaptureDraft;
    if (!parsed?.values || typeof parsed.values !== "object") return null;
    if (!hasMeaningfulDraftValues(parsed.values)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearEvidenceVaultDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(EVIDENCE_VAULT_DRAFT_KEY);
  } catch {
    /* noop */
  }
}

export function hasEvidenceVaultDraft(): boolean {
  return loadEvidenceVaultDraft() != null;
}
