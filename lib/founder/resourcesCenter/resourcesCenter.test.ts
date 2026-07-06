import { describe, expect, it } from "vitest";

import { getExecutiveResourcesCenterBootstrap } from "./index";

describe("resourcesCenter", () => {
  it("bootstrap exposes admission questions and links", () => {
    const view = getExecutiveResourcesCenterBootstrap();
    expect(view.admissionQuestions).toHaveLength(5);
    expect(view.integrationCenterHref).toContain("executive-integration-center");
  });
});
