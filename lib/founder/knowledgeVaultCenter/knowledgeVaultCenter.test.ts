import { describe, expect, it } from "vitest";

import { getKnowledgeVaultBootstrap } from "./index";

describe("knowledgeVaultCenter", () => {
  it("bootstrap returns vault sections", () => {
    const view = getKnowledgeVaultBootstrap();
    expect(view.sections.length).toBe(15);
    expect(view.headline).toContain("Knowledge Vault");
  });
});
