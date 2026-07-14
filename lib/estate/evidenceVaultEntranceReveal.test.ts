import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("Evidence Vault entrance reveal wiring", () => {
  it("ships separate door leaf and room-static assets", () => {
    const files = [
      "public/backgrounds/evidence-vault-door-left.png",
      "public/backgrounds/evidence-vault-door-right.png",
      "public/backgrounds/evidence-vault-room-static.png",
      "public/backgrounds/evidence-vault-interior-reveal.png",
      "public/backgrounds/evidence-vault-background.png",
    ];
    for (const file of files) {
      expect(existsSync(join(root, file)), file).toBe(true);
    }
  });

  it("entrance component uses hinged doors, skip, and key-in-lock affordance", () => {
    const src = readFileSync(
      join(root, "components/estate-collection/EvidenceVaultEntrance.tsx"),
      "utf8",
    );
    expect(src).toContain("framer-motion");
    expect(src).toContain("rotateY");
    expect(src).toContain("onSkip");
    expect(src).toContain("EVIDENCE_VAULT_ARRIVAL_MS");
    expect(src).toContain('data-testid="evidence-vault-use-key"');
    expect(src).toContain('data-testid="evidence-vault-entrance-skip"');
    expect(src).toContain("playEvidenceVaultUnlockSound");
    expect(src).toContain("EVIDENCE_VAULT_DOOR_LEFT_BG");
    expect(src).toContain("EVIDENCE_VAULT_DOOR_RIGHT_BG");
  });

  it("engine mounts interior only after entrance completes — not during opening", () => {
    const src = readFileSync(
      join(root, "components/estate-collection/EstateCollectionRoomEngine.tsx"),
      "utf8",
    );
    expect(src).toContain("skipVaultEntrance");
    expect(src).toContain("onSkip={skipVaultEntrance}");
    expect(src).toContain("shouldMountEvidenceVaultHome");
    expect(src).toContain("isEvidenceVaultEntranceComplete");
    expect(src).toContain("evidence-vault-interior-mount");
    expect(src).toContain("completeVaultEntrance");
    expect(src).not.toMatch(
      /showVaultInterior[\s\S]*doorState === "opening"/,
    );
    expect(src).not.toMatch(
      /\(doorState === "open" \|\| doorState === "opening"\)/,
    );
  });

  it("does not touch authentication modules", () => {
    const authGlobs = [
      "lib/auth",
      "components/auth",
      "app/api/auth",
    ];
    // Presence of auth folders is fine; this feature must not modify them.
    // Guard: entrance files never import auth.
    const entrance = readFileSync(
      join(root, "components/estate-collection/EvidenceVaultEntrance.tsx"),
      "utf8",
    );
    const door = readFileSync(join(root, "lib/estate/evidenceVaultDoor.ts"), "utf8");
    expect(entrance.toLowerCase()).not.toMatch(/supabase|next-auth|clerk/);
    expect(door.toLowerCase()).not.toMatch(/supabase|next-auth|clerk/);
    for (const _ of authGlobs) {
      /* structural note only */
    }
  });
});
