import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  EVIDENCE_VAULT_KEY_OPEN_INSTRUCTION,
  EVIDENCE_VAULT_DOOR_ACTION_LABEL,
} from "./evidenceVaultExperience";

describe("Evidence Vault locked-state copy (155–157)", () => {
  it("shows only the moving-key instruction", () => {
    expect(EVIDENCE_VAULT_KEY_OPEN_INSTRUCTION).toBe(
      "Click the moving key to open the Vault.",
    );
    expect(EVIDENCE_VAULT_DOOR_ACTION_LABEL).toBe("Unlock the Evidence Vault");
  });

  it("wires key-only locked UI — no Begin Discovery or Learn Why", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/estate-collection/VaultKeyInteraction.tsx",
      ),
      "utf8",
    );
    expect(source).toContain("evidence-vault-key-instruction");
    expect(source).toContain("EVIDENCE_VAULT_KEY_OPEN_INSTRUCTION");
    expect(source).toContain("evidence-vault-use-key");
    expect(source).not.toContain("evidence-vault-begin-discovery");
    expect(source).not.toContain("evidence-vault-learn-why");
    expect(source).not.toContain("Begin Evidence Discovery");
    expect(source).not.toContain("Learn Why This Helps");
  });

  it("opens discovery without Discovery File cover or co-mounted home", () => {
    const engine = readFileSync(
      resolve(
        process.cwd(),
        "components/estate-collection/EstateCollectionRoomEngine.tsx",
      ),
      "utf8",
    );
    const discovery = readFileSync(
      resolve(
        process.cwd(),
        "components/estate-collection/DiscoveryFileExperience.tsx",
      ),
      "utf8",
    );
    expect(engine).toContain('setVaultPanel("discovery")');
    expect(engine).toContain('setFilePhase("open")');
    expect(discovery).toContain("evidence-vault-discovery-how-do-i");
    expect(discovery).not.toContain("discovery-file-folder");
    expect(discovery).not.toContain("Open today's Discovery File");
  });
});
