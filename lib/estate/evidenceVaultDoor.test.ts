import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EVIDENCE_VAULT_ARRIVAL_MS,
  EVIDENCE_VAULT_CLOSED_DOOR_BG,
  EVIDENCE_VAULT_DOOR_LEFT_BG,
  EVIDENCE_VAULT_DOOR_LEFT_BOUNDS,
  EVIDENCE_VAULT_DOOR_RIGHT_BG,
  EVIDENCE_VAULT_DOOR_RIGHT_BOUNDS,
  EVIDENCE_VAULT_DOOR_SEAM_X,
  EVIDENCE_VAULT_DOOR_STATUS,
  EVIDENCE_VAULT_DOOR_STAGGER_MS,
  EVIDENCE_VAULT_INTERIOR_REVEAL_BG,
  EVIDENCE_VAULT_OPEN_MS,
  EVIDENCE_VAULT_REDUCED_MOTION_MS,
  EVIDENCE_VAULT_ROOM_STATIC_BG,
  EVIDENCE_VAULT_SETTLE_MS,
  EVIDENCE_VAULT_UNLOCK_MS,
  evidenceVaultDoorLeafStyle,
  evidenceVaultShellBackground,
  hasEvidenceVaultFirstEntryDone,
  hasEvidenceVaultUnlocked,
  isEvidenceVaultDoorBusy,
  isEvidenceVaultEntranceComplete,
  markEvidenceVaultFirstEntryDone,
  markEvidenceVaultUnlocked,
  resetEvidenceVaultAccessStateForDev,
  resolveInitialEvidenceVaultDoorState,
  shouldMountEvidenceVaultHome,
  shouldShowEvidenceVaultEntrance,
} from "./evidenceVaultDoor";
import { EVIDENCE_VAULT_ENTRANCE_BG, EVIDENCE_VAULT_ROOM_BG } from "@/lib/growth/growthRoom";
import {
  EVIDENCE_VAULT_DOOR_ACTION_LABEL,
  EVIDENCE_VAULT_FIRST_ENTRY_CHOICES,
  EVIDENCE_VAULT_KEY_ACTION_LABEL,
} from "./evidenceVaultExperience";

const local = new Map<string, string>();

beforeEach(() => {
  local.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => local.get(key) ?? null,
    setItem: (key: string, value: string) => {
      local.set(key, value);
    },
    removeItem: (key: string) => {
      local.delete(key);
    },
    clear: () => local.clear(),
  });
});

describe("evidenceVaultDoor", () => {
  it("uses the approved closed-door background and door leaf assets", () => {
    expect(EVIDENCE_VAULT_CLOSED_DOOR_BG).toBe(
      "/backgrounds/evidence-vault-background.png",
    );
    expect(EVIDENCE_VAULT_ENTRANCE_BG).toBe(EVIDENCE_VAULT_CLOSED_DOOR_BG);
    expect(EVIDENCE_VAULT_ROOM_BG).toBe(EVIDENCE_VAULT_ROOM_STATIC_BG);
    expect(EVIDENCE_VAULT_ROOM_STATIC_BG).toContain("room-static");
    expect(EVIDENCE_VAULT_DOOR_LEFT_BG).toContain("door-left");
    expect(EVIDENCE_VAULT_DOOR_RIGHT_BG).toContain("door-right");
    expect(EVIDENCE_VAULT_INTERIOR_REVEAL_BG).toContain("interior-reveal");
  });

  it("places the door seam off-center at the inspected x≈745", () => {
    expect(EVIDENCE_VAULT_DOOR_SEAM_X).toBe(745);
    expect(EVIDENCE_VAULT_DOOR_LEFT_BOUNDS[2]).toBe(EVIDENCE_VAULT_DOOR_SEAM_X);
    expect(EVIDENCE_VAULT_DOOR_RIGHT_BOUNDS[0]).toBe(EVIDENCE_VAULT_DOOR_SEAM_X);
    const left = evidenceVaultDoorLeafStyle(EVIDENCE_VAULT_DOOR_LEFT_BOUNDS);
    const right = evidenceVaultDoorLeafStyle(EVIDENCE_VAULT_DOOR_RIGHT_BOUNDS);
    expect(parseFloat(left.left)).toBeCloseTo((390 / 1535) * 100, 1);
    expect(parseFloat(right.left)).toBeCloseTo((745 / 1535) * 100, 1);
  });

  it("starts locked with key ready for first visit", () => {
    expect(
      resolveInitialEvidenceVaultDoorState({ skipEntrance: false }),
    ).toBe("key_ready");
  });

  it("does not auto-open for new members", () => {
    expect(hasEvidenceVaultUnlocked()).toBe(false);
    expect(
      resolveInitialEvidenceVaultDoorState({ skipEntrance: false }),
    ).not.toBe("open");
  });

  it("opens immediately after unlock persists (return visits skip ritual)", () => {
    markEvidenceVaultUnlocked();
    expect(hasEvidenceVaultUnlocked()).toBe(true);
    expect(
      resolveInitialEvidenceVaultDoorState({ skipEntrance: false }),
    ).toBe("open");
  });

  it("can show entrance again when viewing vault entrance while unlocked", () => {
    markEvidenceVaultUnlocked();
    expect(
      resolveInitialEvidenceVaultDoorState({
        skipEntrance: false,
        viewEntrance: true,
      }),
    ).toBe("key_ready");
  });

  it("prevents busy re-entry during unlocking and opening", () => {
    expect(isEvidenceVaultDoorBusy("key_ready")).toBe(false);
    expect(isEvidenceVaultDoorBusy("unlocking")).toBe(true);
    expect(isEvidenceVaultDoorBusy("opening")).toBe(true);
    expect(isEvidenceVaultDoorBusy("open")).toBe(false);
  });

  it("does not mount home until entranceComplete (open)", () => {
    const panel = null;
    for (const doorState of [
      "locked",
      "key_ready",
      "unlocking",
      "opening",
    ] as const) {
      expect(isEvidenceVaultEntranceComplete(doorState)).toBe(false);
      expect(
        shouldMountEvidenceVaultHome({
          doorState,
          vaultMode: "arrive",
          vaultPanel: panel,
        }),
      ).toBe(false);
      expect(
        shouldShowEvidenceVaultEntrance({
          doorState,
          vaultMode: "arrive",
        }),
      ).toBe(true);
    }
    expect(isEvidenceVaultEntranceComplete("open")).toBe(true);
    expect(
      shouldMountEvidenceVaultHome({
        doorState: "open",
        vaultMode: "arrive",
        vaultPanel: null,
      }),
    ).toBe(true);
    expect(
      shouldShowEvidenceVaultEntrance({
        doorState: "open",
        vaultMode: "arrive",
      }),
    ).toBe(false);
  });

  it("keeps closed-door shell plate until doors open", () => {
    expect(evidenceVaultShellBackground("key_ready")).toBe(
      EVIDENCE_VAULT_CLOSED_DOOR_BG,
    );
    expect(evidenceVaultShellBackground("unlocking")).toBe(
      EVIDENCE_VAULT_CLOSED_DOOR_BG,
    );
    expect(evidenceVaultShellBackground("opening")).toBe(
      EVIDENCE_VAULT_ROOM_STATIC_BG,
    );
    expect(evidenceVaultShellBackground("open")).toBe(
      EVIDENCE_VAULT_ROOM_STATIC_BG,
    );
  });

  it("aligns unlock timings to the approved entrance sequence", () => {
    expect(EVIDENCE_VAULT_ARRIVAL_MS).toBeGreaterThanOrEqual(300);
    expect(EVIDENCE_VAULT_ARRIVAL_MS).toBeLessThanOrEqual(500);
    expect(EVIDENCE_VAULT_UNLOCK_MS).toBe(500);
    expect(EVIDENCE_VAULT_OPEN_MS).toBe(1200);
    expect(EVIDENCE_VAULT_DOOR_STAGGER_MS).toBe(100);
    expect(EVIDENCE_VAULT_SETTLE_MS).toBeGreaterThanOrEqual(200);
    expect(EVIDENCE_VAULT_SETTLE_MS).toBeLessThanOrEqual(300);
    expect(EVIDENCE_VAULT_UNLOCK_MS + EVIDENCE_VAULT_OPEN_MS).toBeGreaterThanOrEqual(
      1500,
    );
    expect(EVIDENCE_VAULT_UNLOCK_MS + EVIDENCE_VAULT_OPEN_MS).toBeLessThanOrEqual(
      2000,
    );
    expect(EVIDENCE_VAULT_REDUCED_MOTION_MS).toBeLessThan(500);
  });

  it("announces locked / unlocking / open status", () => {
    expect(EVIDENCE_VAULT_DOOR_STATUS.key_ready).toBe("Evidence Vault locked");
    expect(EVIDENCE_VAULT_DOOR_STATUS.unlocking).toBe(
      "Unlocking Evidence Vault",
    );
    expect(EVIDENCE_VAULT_DOOR_STATUS.open).toBe("Evidence Vault open");
  });

  it("separates unlocked from first-entry completion", () => {
    markEvidenceVaultUnlocked();
    expect(hasEvidenceVaultFirstEntryDone()).toBe(false);
    markEvidenceVaultFirstEntryDone();
    expect(hasEvidenceVaultFirstEntryDone()).toBe(true);
  });

  it("supports development access reset without touching evidence data", () => {
    markEvidenceVaultUnlocked();
    markEvidenceVaultFirstEntryDone();
    resetEvidenceVaultAccessStateForDev();
    expect(hasEvidenceVaultUnlocked()).toBe(false);
    expect(hasEvidenceVaultFirstEntryDone()).toBe(false);
  });

  it("exposes Unlock the Evidence Vault as the accessible action label", () => {
    expect(EVIDENCE_VAULT_DOOR_ACTION_LABEL).toBe("Unlock the Evidence Vault");
    expect(EVIDENCE_VAULT_KEY_ACTION_LABEL).toBe("Unlock the Evidence Vault");
  });

  it("offers exactly three first-entry choices", () => {
    expect(EVIDENCE_VAULT_FIRST_ENTRY_CHOICES).toHaveLength(3);
    expect(EVIDENCE_VAULT_FIRST_ENTRY_CHOICES.map((c) => c.label)).toEqual([
      "Add Evidence",
      "Surprise Me",
      "Browse My Evidence",
    ]);
  });
});
