import { describe, expect, it } from "vitest";

import { getAiExtensionsCenterBootstrap } from "./index";

describe("aiExtensionsCenter", () => {
  it("bootstrap returns AI extension tools", () => {
    const view = getAiExtensionsCenterBootstrap();
    expect(view.tools.length).toBe(7);
    expect(view.headline).toContain("AI Extensions");
  });
});
