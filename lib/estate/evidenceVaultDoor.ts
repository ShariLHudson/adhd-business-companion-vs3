/**
 * Evidence Vault — door unlock state, persistence, and timing.
 * Separate from “Vault contains evidence” and “first entry completed.”
 */

/** Official closed-door plate (approved Estate entrance). */
export const EVIDENCE_VAULT_CLOSED_DOOR_BG =
  "/backgrounds/evidence-vault-background(1).png" as const;

/** Interior plate — same Estate atmosphere until a dedicated open-interior asset ships. */
export const EVIDENCE_VAULT_INTERIOR_BG =
  "/backgrounds/evidence-vault-background.png" as const;

export type EvidenceVaultDoorState =
  | "locked"
  | "key_ready"
  | "unlocking"
  | "opening"
  | "open"
  | "error";

/** Door has been unlocked at least once (skip full ritual on return). */
export const EVIDENCE_VAULT_UNLOCKED_KEY =
  "spark:estate:evidence-vault-unlocked:v1";

/** Member completed first-entry choices inside the vault. */
export const EVIDENCE_VAULT_FIRST_ENTRY_DONE_KEY =
  "spark:estate:evidence-vault-first-entry-done:v1";

/** Legacy key — still honored so older sessions stay unlocked. */
export const EVIDENCE_VAULT_ENTRANCE_COMPLETED_KEY =
  "spark:estate:evidence-vault-entrance-completed:v1";

/** Normal unlock sequence (~2.4s). */
export const EVIDENCE_VAULT_UNLOCK_MS = 700;
export const EVIDENCE_VAULT_OPEN_MS = 1400;
export const EVIDENCE_VAULT_SETTLE_MS = 300;

/** Reduced-motion: brief status then open. */
export const EVIDENCE_VAULT_REDUCED_MOTION_MS = 280;

export const EVIDENCE_VAULT_DOOR_STATUS = {
  locked: "Evidence Vault locked",
  key_ready: "Evidence Vault locked",
  unlocking: "Unlocking Evidence Vault",
  opening: "Opening Evidence Vault",
  open: "Evidence Vault open",
  error: "Something got tangled unlocking the vault",
} as const;

export function hasEvidenceVaultUnlocked(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return (
      localStorage.getItem(EVIDENCE_VAULT_UNLOCKED_KEY) === "1" ||
      localStorage.getItem(EVIDENCE_VAULT_ENTRANCE_COMPLETED_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function markEvidenceVaultUnlocked(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(EVIDENCE_VAULT_UNLOCKED_KEY, "1");
    localStorage.setItem(EVIDENCE_VAULT_ENTRANCE_COMPLETED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function hasEvidenceVaultFirstEntryDone(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(EVIDENCE_VAULT_FIRST_ENTRY_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markEvidenceVaultFirstEntryDone(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(EVIDENCE_VAULT_FIRST_ENTRY_DONE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Development-only — clears unlock + first-entry access flags.
 * Does not delete evidence storage.
 */
export function resetEvidenceVaultAccessStateForDev(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(EVIDENCE_VAULT_UNLOCKED_KEY);
    localStorage.removeItem(EVIDENCE_VAULT_FIRST_ENTRY_DONE_KEY);
    localStorage.removeItem(EVIDENCE_VAULT_ENTRANCE_COMPLETED_KEY);
  } catch {
    /* ignore */
  }
}

export function prefersEvidenceVaultReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Initial door state for a vault visit. */
export function resolveInitialEvidenceVaultDoorState(opts: {
  skipEntrance: boolean;
  viewEntrance?: boolean;
}): EvidenceVaultDoorState {
  if (opts.skipEntrance) return "open";
  if (opts.viewEntrance && hasEvidenceVaultUnlocked()) return "key_ready";
  if (hasEvidenceVaultUnlocked() && !opts.viewEntrance) return "open";
  return "key_ready";
}

export function isEvidenceVaultDoorBusy(state: EvidenceVaultDoorState): boolean {
  return state === "unlocking" || state === "opening";
}
