import { describe, expect, it } from "vitest";

import {
  prepareFounderBuildSession,
  prepareFounderExecutiveBuilder,
} from "./executiveBuilderBridge";

describe("Founder Executive Builder bridge", () => {
  it("prepareFounderExecutiveBuilder returns bootstrap", () => {
    const builder = prepareFounderExecutiveBuilder();
    expect(builder.bootstrap.entryPoints.length).toBeGreaterThan(5);
  });

  it("prepareFounderBuildSession returns blueprint with leverage", () => {
    const result = prepareFounderBuildSession("Research to Build Pipeline", "standard-build");
    expect(result.session?.blueprint.leverage.founderHoursSaved).toBeGreaterThan(0);
    expect(result.session?.blueprint.executiveQuestions.length).toBeGreaterThan(0);
  });
});
