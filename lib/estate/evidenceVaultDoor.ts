/**
 * Evidence Vault — door unlock state, persistence, and timing.
 * Separate from “Vault contains evidence” and “first entry completed.”
 *
 * Future (not built): Memory Center / Settings toggle to replay entrance.
 */

/** Official closed-door plate (approved Estate entrance). */
export const EVIDENCE_VAULT_CLOSED_DOOR_BG =
  "/backgrounds/evidence-vault-background.png" as const;

/** Stationary room plate — doors removed / open portal (never rotates). */
export const EVIDENCE_VAULT_ROOM_STATIC_BG =
  "/backgrounds/evidence-vault-room-static.png" as const;

/** Left door leaf crop (hinge at outer left; seam at x≈745). */
export const EVIDENCE_VAULT_DOOR_LEFT_BG =
  "/backgrounds/evidence-vault-door-left.png" as const;

/** Right door leaf crop (hinge at outer right). */
export const EVIDENCE_VAULT_DOOR_RIGHT_BG =
  "/backgrounds/evidence-vault-door-right.png" as const;

/** Soft interior atmosphere revealed behind opening doors. */
export const EVIDENCE_VAULT_INTERIOR_REVEAL_BG =
  "/backgrounds/evidence-vault-interior-reveal.png" as const;

/** Room plate after entrance — existing vault atmosphere. */
export const EVIDENCE_VAULT_INTERIOR_BG =
  "/backgrounds/evidence-vault-background.png" as const;

/** Art plate size used for door geometry (must match source PNG). */
export const EVIDENCE_VAULT_ART_WIDTH = 1535;
export const EVIDENCE_VAULT_ART_HEIGHT = 1024;
/** Vertical seam between door leaves (not image center). */
export const EVIDENCE_VAULT_DOOR_SEAM_X = 745;
/** Door leaf crop bounds in source pixels [left, top, right, bottom]. */
export const EVIDENCE_VAULT_DOOR_LEFT_BOUNDS = [390, 200, 745, 910] as const;
export const EVIDENCE_VAULT_DOOR_RIGHT_BOUNDS = [745, 200, 1075, 910] as const;

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

/** Arrival settle before key glow (State 1). */
export const EVIDENCE_VAULT_ARRIVAL_MS = 400;
/** Key turn / unlock (State 2). */
export const EVIDENCE_VAULT_UNLOCK_MS = 500;
/** Hinged door open (State 3). */
export const EVIDENCE_VAULT_OPEN_MS = 1200;
/** Right door starts slightly after left. */
export const EVIDENCE_VAULT_DOOR_STAGGER_MS = 100;
/** Existing UI fade / settle (State 4). */
export const EVIDENCE_VAULT_SETTLE_MS = 250;

/** Reduced-motion: brief fade into vault. */
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

/** Percent geometry for door leaves inside the art frame. */
export function evidenceVaultDoorLeafStyle(
  bounds: readonly [number, number, number, number],
): { left: string; top: string; width: string; height: string } {
  const [l, t, r, b] = bounds;
  return {
    left: `${(l / EVIDENCE_VAULT_ART_WIDTH) * 100}%`,
    top: `${(t / EVIDENCE_VAULT_ART_HEIGHT) * 100}%`,
    width: `${((r - l) / EVIDENCE_VAULT_ART_WIDTH) * 100}%`,
    height: `${((b - t) / EVIDENCE_VAULT_ART_HEIGHT) * 100}%`,
  };
}
