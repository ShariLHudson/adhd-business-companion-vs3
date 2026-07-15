import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  EVIDENCE_VAULT_BEGIN_DISCOVERY_LABEL,
  EVIDENCE_VAULT_KEY_INVITATION,
  EVIDENCE_VAULT_LEARN_WHY_LABEL,
  EVIDENCE_VAULT_WHAT_IT_IS,
  EVIDENCE_VAULT_WHY_LOCKED,
} from "./evidenceVaultExperience";

describe("Evidence Vault locked-state copy", () => {
  it("explains what the vault is and why it is locked", () => {
    expect(EVIDENCE_VAULT_WHAT_IT_IS.toLowerCase()).toContain("progress");
    expect(EVIDENCE_VAULT_WHY_LOCKED.toLowerCase()).toContain(
      "six short discovery",
    );
    expect(EVIDENCE_VAULT_KEY_INVITATION).not.toBe(
      "The key is waiting when you are ready.",
    );
    expect(EVIDENCE_VAULT_BEGIN_DISCOVERY_LABEL).toBe(
      "Begin Evidence Discovery",
    );
    expect(EVIDENCE_VAULT_LEARN_WHY_LABEL).toBe("Learn Why This Helps");
  });

  it("wires locked CTAs into VaultKeyInteraction", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/estate-collection/VaultKeyInteraction.tsx",
      ),
      "utf8",
    );
    expect(source).toContain("evidence-vault-begin-discovery");
    expect(source).toContain("evidence-vault-learn-why");
    expect(source).not.toContain("The key is waiting when you are ready.");
  });
});
