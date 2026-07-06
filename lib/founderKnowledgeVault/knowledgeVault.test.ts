import { describe, expect, it } from "vitest";

import {
  ALL_KNOWLEDGE_VAULT_ITEMS,
  composeKnowledgeVaultView,
  KNOWLEDGE_VAULT_SECTIONS,
} from "./index";

describe("Founder Knowledge Vault™", () => {
  it("composeKnowledgeVaultView includes all archive sections", () => {
    const view = composeKnowledgeVaultView();
    expect(view.sections).toHaveLength(15);
    expect(view.sections.map((s) => s.label)).toContain("Constitutions");
    expect(view.sections.map((s) => s.label)).toContain("Recovery / Handoff Docs");
  });

  it("vault items include required metadata", () => {
    const item = ALL_KNOWLEDGE_VAULT_ITEMS.find((i) => i.id === "kv-founder-constitution");
    expect(item).toMatchObject({
      title: "Founder Experience Constitution™",
      purpose: expect.any(String),
      lastUpdated: expect.any(String),
      status: "active",
      documentPath: "docs/founder/FOUNDER_EXPERIENCE_CONSTITUTION.md",
    });
  });

  it("sections contain at least one item each", () => {
    for (const section of KNOWLEDGE_VAULT_SECTIONS) {
      expect(section.items.length).toBeGreaterThan(0);
    }
  });
});
