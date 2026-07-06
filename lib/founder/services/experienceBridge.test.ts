import { describe, expect, it } from "vitest";

import {
  prepareFounderExperience,
  prepareFounderExperienceCatalog,
  prepareFounderExperienceFromPhrase,
} from "./experienceBridge";

describe("Founder Experience bridge", () => {
  it("prepareFounderExperience composes a single experience", () => {
    const view = prepareFounderExperience("help_me_decide", "listening-rooms");
    expect(view.architectureOnly).toBe(true);
    expect(view.experience.id).toBe("help_me_decide");
    expect(view.composed).toBeTruthy();
  });

  it("prepareFounderExperienceFromPhrase routes natural language", () => {
    const routed = prepareFounderExperienceFromPhrase("Launch listening rooms next week", "listening-rooms");
    expect(routed.experience.id).toBe("launch_something");
    expect(routed.composed).toBeTruthy();
  });

  it("prepareFounderExperienceCatalog lists all experiences", () => {
    const catalog = prepareFounderExperienceCatalog();
    expect(catalog.experiences.length).toBe(8);
    expect(catalog.rules.length).toBe(5);
  });
});
