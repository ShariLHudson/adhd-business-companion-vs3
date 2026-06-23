import { describe, expect, it } from "vitest";
import {
  detectEcosystemProblemIntent,
  ecosystemIntentToWorkspaceOffer,
} from "./companionEcosystemIntent";

describe("companionEcosystemIntent", () => {
  it("routes mental load to Clear My Mind", () => {
    const match = detectEcosystemProblemIntent(
      "I have too much on my mind right now",
    );
    expect(match?.section).toBe("brain-dump");
    expect(match?.workflowKind).toBe("open_clear_my_mind");
    expect(match?.offerLine).toMatch(/Clear My Mind/i);
    expect(match?.offerLine).toMatch(/stay in chat/i);
  });

  it("routes indecision to Decision Compass", () => {
    const match = detectEcosystemProblemIntent(
      "I can't decide which offer to launch",
    );
    expect(match?.section).toBe("decision-compass");
    expect(match?.offerLine).not.toMatch(/pros and cons/i);
  });

  it("routes focus confusion to Plan My Day", () => {
    const match = detectEcosystemProblemIntent(
      "I don't know what to focus on today",
    );
    expect(match?.section).toBe("plan-my-day");
  });

  it("routes content ideas to Create", () => {
    const match = detectEcosystemProblemIntent("I need content ideas for LinkedIn");
    expect(match?.section).toBe("content-generator");
  });

  it("does not intercept explicit write requests", () => {
    expect(
      detectEcosystemProblemIntent("help me write a newsletter draft"),
    ).toBeNull();
  });

  it("builds workspace offer shape", () => {
    const match = detectEcosystemProblemIntent("my head is full of stuff")!;
    const offer = ecosystemIntentToWorkspaceOffer(match);
    expect(offer.buttonLabel).toMatch(/Open/);
    expect(offer.section).toBe("brain-dump");
  });
});
