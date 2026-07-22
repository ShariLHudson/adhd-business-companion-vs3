import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CREATE_OWNERSHIP_CONTRACT,
  CREATE_QUARANTINED_OR_ADAPTER_STACKS,
  createOwnerRoleForPath,
  isCanonicalCreateEntryOwner,
} from "./createOwnershipContract";

describe("Create ownership contract (P0-03)", () => {
  it("declares a single Create entry owner", () => {
    expect(CREATE_OWNERSHIP_CONTRACT.entryOwner).toBe(
      "lib/universalCreationEntrypoint/",
    );
    expect(CREATE_OWNERSHIP_CONTRACT.entrySymbol).toBe(
      "resolveUniversalCreationEntrypoint",
    );
    expect(CREATE_OWNERSHIP_CONTRACT.workIdentityOwner).toBe(
      "lib/universalWorkEngine/",
    );
    expect(CREATE_OWNERSHIP_CONTRACT.uiAdapter).toBe("lib/createEstate/");
    expect(CREATE_OWNERSHIP_CONTRACT.lifecycleEngine).toBe(
      "lib/universalCreationEngine/",
    );
  });

  it("classifies dual stacks as adapter-only or quarantined", () => {
    expect(createOwnerRoleForPath("lib/universalCreation/orchestrator.ts")).toBe(
      "adapter-only",
    );
    expect(
      createOwnerRoleForPath("lib/platformIntent/blueprintRegistry.ts"),
    ).toBe("adapter-only");
    expect(
      createOwnerRoleForPath("lib/createEstate/legacyCreateShellQuarantine.ts"),
    ).toBe("quarantined");
    expect(isCanonicalCreateEntryOwner("lib/universalCreationEntrypoint/index.ts")).toBe(
      true,
    );
    expect(CREATE_QUARANTINED_OR_ADAPTER_STACKS.length).toBeGreaterThanOrEqual(3);
  });

  it("entrypoint index documents P0-03 ownership", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/universalCreationEntrypoint/index.ts"),
      "utf8",
    );
    expect(src).toContain("canonical Create open/resume API");
    expect(src).toContain("createOwnershipContract");
  });

  it("legacy universalCreation orchestrator is marked adapter-only", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/universalCreation/orchestrator.ts"),
      "utf8",
    );
    expect(src).toContain("@deprecated");
    expect(src).toContain("legacy chat-document adapter");
  });
});
