import { beforeEach, describe, expect, it } from "vitest";
import "@/lib/universalWorkEngine";
import {
  clearSectionIdeasCatalogsForTests,
  clearSectionIdeasSessionsForTests,
  generateSectionIdeas,
} from "./sectionIdeas";
import { ensureEventPlanWorkTypeRegistered } from "../packages/eventPlan/registerEventPlanWorkType";
import { ensureMarketingPlanWorkTypeRegistered } from "../packages/marketingPlan/registerMarketingPlanWorkType";
import { ensureBusinessPlanWorkTypeRegistered } from "../packages/businessPlan/registerBusinessPlanWorkType";
import { ensureFacebookCommunityWorkTypeRegistered } from "../packages/facebookCommunity/registerFacebookCommunityWorkType";

describe("UWE section ideas — shared across guided work types", () => {
  beforeEach(() => {
    clearSectionIdeasCatalogsForTests();
    clearSectionIdeasSessionsForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureMarketingPlanWorkTypeRegistered();
    ensureBusinessPlanWorkTypeRegistered();
    ensureFacebookCommunityWorkTypeRegistered();
  });

  it("uses Event Plan catalog for workshop/event sections", () => {
    const result = generateSectionIdeas({
      workTypeId: "event_plan",
      sectionId: "attendee_experience",
      title: "Attendee Experience",
    });
    expect(result.ok).toBe(true);
    expect(result.ideas.join(" ").toLowerCase()).toMatch(/welcom|spacious|takeaway/);
  });

  it("uses Marketing Plan catalog (not generic-only)", () => {
    const result = generateSectionIdeas({
      workTypeId: "marketing_plan",
      sectionId: "purpose_outcome",
      title: "Purpose and Desired Outcome",
    });
    expect(result.ok).toBe(true);
    expect(result.ideas.join(" ").toLowerCase()).toMatch(/offer|visibility|trust/);
  });

  it("uses Business Plan catalog", () => {
    const result = generateSectionIdeas({
      workTypeId: "business_plan",
      sectionId: "purpose_vision",
      title: "Business Vision",
    });
    expect(result.ok).toBe(true);
    expect(result.ideas.join(" ").toLowerCase()).toMatch(/business|season|friend/);
  });

  it("uses Facebook Community catalog", () => {
    const result = generateSectionIdeas({
      workTypeId: "facebook_community",
      sectionId: "purpose_and_audience",
      title: "Purpose and Who It's For",
    });
    expect(result.ok).toBe(true);
    expect(result.ideas.join(" ").toLowerCase()).toMatch(/belong|member|community|growth/);
  });

  it("never auto-claims to overwrite — intro requires choice", () => {
    const result = generateSectionIdeas(
      {
        workTypeId: "marketing_plan",
        sectionId: "channels",
        title: "Channels",
      },
      "I already wrote something",
    );
    expect(result.intro.toLowerCase()).toMatch(/nothing is applied|choose/);
  });
});
