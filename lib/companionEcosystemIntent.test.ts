import { describe, expect, it } from "vitest";
import {
  detectEcosystemProblemIntent,
  ecosystemIntentToWorkspaceOffer,
} from "./companionEcosystemIntent";

describe("companionEcosystemIntent", () => {
  it("does not match vague overwhelm to Clear My Mind", () => {
    expect(detectEcosystemProblemIntent("I'm overwhelmed")).toBeNull();
  });

  it("does not match many ideas to a workspace instantly", () => {
    expect(detectEcosystemProblemIntent("I have 15 ideas")).toBeNull();
  });

  it("does not match hiring VA to Decision Compass instantly", () => {
    expect(
      detectEcosystemProblemIntent("I'm thinking about hiring a VA"),
    ).toBeNull();
  });

  it("still matches specific mental load phrasing when not deferred", () => {
    const match = detectEcosystemProblemIntent(
      "help me organize my workshop launch checklist in a project",
    );
    expect(match).toBeNull();
  });

  it("builds explain-first workspace offer shape", () => {
    const match = detectEcosystemProblemIntent(
      "I need content ideas for LinkedIn",
    );
    expect(match?.section).toBe("content-generator");
    const offer = ecosystemIntentToWorkspaceOffer(match!);
    expect(offer.buttonLabel).toMatch(/Open/);
    expect(offer.line).toMatch(/When we're finished you'll have/i);
  });

  it("does not intercept explicit write requests", () => {
    expect(
      detectEcosystemProblemIntent("help me write a newsletter draft"),
    ).toBeNull();
  });
});
