import { describe, expect, it } from "vitest";
import { classifyHelpDiscoveryIntent } from "./classifyHelpDiscoveryIntent";
import { matchFeatureHowToGuide } from "./featureHowTo";
import {
  isResolvedHelpDiscovery,
  resolveHelpDiscoveryQuery,
} from "./resolveHelpDiscoveryQuery";

describe("Estate Help & Discovery Intelligence™", () => {
  it("classifies location questions", () => {
    expect(classifyHelpDiscoveryIntent("Where is the pool?")?.route).toBe(
      "location",
    );
  });

  it("classifies feature how-to questions", () => {
    expect(
      classifyHelpDiscoveryIntent("How do I set a reminder?")?.route,
    ).toBe("feature_how_to");
  });

  it("explains reminders with what · why · how — not a manual", () => {
    const guide = matchFeatureHowToGuide("How do I set a reminder?");
    expect(guide?.guide.guideId).toBe("reminders");

    const decision = resolveHelpDiscoveryQuery("How do I set a reminder?");
    expect(isResolvedHelpDiscovery(decision)).toBe(true);
    expect(decision.memberFacingResponse).toContain("mental space");
    expect(decision.memberFacingResponse).toContain("remind me");
  });

  it("routes voice change to settings how-to", () => {
    const decision = resolveHelpDiscoveryQuery("Can I change the voice?");
    expect(decision.route).toBe("feature_how_to");
    expect(decision.memberFacingResponse).toContain("Settings");
  });

  it("routes treehouse to navigation intelligence", () => {
    const decision = resolveHelpDiscoveryQuery("Show me the treehouse");
    expect(decision.route).toBe("location");
    expect(decision.navigation?.kind).toBe("navigate_direct");
  });

  it("offers progressive discovery for what can I do", () => {
    const decision = resolveHelpDiscoveryQuery("What can I do?", {
      memberStage: "new",
    });
    expect(decision.route).toBe("discovery");
    expect(decision.memberFacingResponse).toContain("starting points");
    expect(decision.progressiveItems?.length).toBeLessThanOrEqual(3);
  });

  it("surfaces Discovery Key content for show me something new", () => {
    const decision = resolveHelpDiscoveryQuery("Show me something new");
    expect(decision.route).toBe("discovery");
    expect(decision.discoveryNote?.id).toMatch(/^DISC-/);
    expect(decision.memberFacingResponse).not.toMatch(/DISC-/);
  });

  it("routes experience need to recommendation intelligence with why-now", () => {
    const decision = resolveHelpDiscoveryQuery("I need inspiration");
    expect(decision.route).toBe("experience");
    expect(decision.recommendation?.primary?.whyNow).toBeTruthy();
  });

  it("routes object questions to object intelligence", () => {
    const decision = resolveHelpDiscoveryQuery("What is that telescope?");
    expect(decision.route).toBe("object");
    expect(decision.objectResolution?.object?.objectId).toBe(
      "observatory-telescope",
    );
  });

  it("routes music listening to audio experience foundation", () => {
    const decision = resolveHelpDiscoveryQuery("Where can I listen to music?");
    expect(decision.route).toBe("audio");
    expect(decision.audioExperiences?.[0]?.audioExperienceId).toBeTruthy();
    expect(decision.memberFacingResponse).toContain("Would you like");
  });

  it("returns unresolved for unrelated business chat", () => {
    const decision = resolveHelpDiscoveryQuery(
      "Write a sales email for my course launch",
    );
    expect(decision.kind).toBe("unresolved");
  });
});
