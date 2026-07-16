import { describe, expect, it } from "vitest";
import {
  detectUniversalCapabilityRequest,
  isUniversalCapabilityRequest,
} from "./detectUniversalCapabilityRequest";
import { resolveExplicitCapabilityIntent } from "./resolveExplicitCapabilityIntent";
import { violatesUniversalAccessBlockLanguage } from "./universalAccessStandard";

describe("detectUniversalCapabilityRequest", () => {
  it("fulfills explicit mind map / visual requests", () => {
    expect(detectUniversalCapabilityRequest("Create a mind map")?.capabilityId).toBe(
      "visual-thinking",
    );
    expect(detectUniversalCapabilityRequest("Make this visual")?.capabilityId).toBe(
      "visual-thinking",
    );
    expect(detectUniversalCapabilityRequest("Open Visual Thinking")?.section).toBe(
      "visual-focus",
    );
    expect(
      detectUniversalCapabilityRequest("Make a flowchart")?.visualStudioViewId,
    ).toBe("process-flow");
    expect(
      detectUniversalCapabilityRequest("Map this out")?.capabilityId,
    ).toBe("visual-thinking");
  });

  it("does not treat bare mind-map mention as navigation", () => {
    expect(
      detectUniversalCapabilityRequest("mind map ideas for the launch"),
    ).toBeNull();
  });

  it("opens timer, calendar, projects, journal from explicit asks", () => {
    expect(detectUniversalCapabilityRequest("Start a timer")?.capabilityId).toBe(
      "focus-timer",
    );
    expect(detectUniversalCapabilityRequest("Schedule this")?.capabilityId).toBe(
      "calendar",
    );
    expect(detectUniversalCapabilityRequest("Open my calendar")?.section).toBe(
      "calendar",
    );
    expect(detectUniversalCapabilityRequest("Show calendar")?.nav).toBe(
      "plan-my-day",
    );
    expect(detectUniversalCapabilityRequest("Show my projects")?.section).toBe(
      "project-homes",
    );
    expect(detectUniversalCapabilityRequest("Open my journal")?.section).toBe(
      "growth-journal",
    );
  });

  it("opens Destination Gallery and Evidence Vault by name", () => {
    expect(
      detectUniversalCapabilityRequest("Open Destination Gallery")?.section,
    ).toBe("destination-gallery");
    expect(
      detectUniversalCapabilityRequest("Save this to Google Docs")?.capabilityId,
    ).toBe("destination-gallery");
    expect(
      detectUniversalCapabilityRequest("Evidence Vault")?.section,
    ).toBe("evidence-bank");
    expect(detectUniversalCapabilityRequest("google drive login")).toBeNull();
  });

  it("opens Breathe from explicit breathe phrases; calm-down stays conversational", () => {
    expect(detectUniversalCapabilityRequest("Help me breathe")?.capabilityId).toBe(
      "breathe",
    );
    expect(detectUniversalCapabilityRequest("Let's breathe")?.capabilityId).toBe(
      "breathe",
    );
    expect(detectUniversalCapabilityRequest("I need a minute")).toBeNull();
    // Calm-down / overwhelm language offers conversation — never auto-launch Breathe.
    expect(detectUniversalCapabilityRequest("I need to calm down")).toBeNull();
    expect(detectUniversalCapabilityRequest("Calm me down")).toBeNull();
    expect(detectUniversalCapabilityRequest("Help me reset")).toBeNull();
    expect(detectUniversalCapabilityRequest("Help me calm down")).toBeNull();
    expect(detectUniversalCapabilityRequest("I need a reset")).toBeNull();
    expect(detectUniversalCapabilityRequest("I'm overwhelmed")).toBeNull();
    expect(detectUniversalCapabilityRequest("I'm overwhelmed today.")).toBeNull();
    // Explicit breathe / breathing-exercise language still opens Breathe.
    expect(
      detectUniversalCapabilityRequest("Start a breathing exercise")?.capabilityId,
    ).toBe("breathe");
    expect(detectUniversalCapabilityRequest("Open Breathe")?.capabilityId).toBe(
      "breathe",
    );
    expect(detectUniversalCapabilityRequest("Box breathing")?.breathePatternId).toBe(
      "box",
    );
    expect(
      detectUniversalCapabilityRequest("Four seven eight breathing")
        ?.breathePatternId,
    ).toBe("relax478");
    expect(
      detectUniversalCapabilityRequest("4-7-8 breathing")?.breathePatternId,
    ).toBe("relax478");
    expect(
      detectUniversalCapabilityRequest("Take me to Breathe")?.capabilityId,
    ).toBe("breathe");
    expect(
      detectUniversalCapabilityRequest("I need to breathe")?.capabilityId,
    ).toBe("breathe");
    expect(
      detectUniversalCapabilityRequest("Take me to Breathe")?.ack,
    ).not.toMatch(/bring that up/i);
  });
});

describe("resolveExplicitCapabilityIntent", () => {
  it("resolves open-section phrases via intent-first bridge", () => {
    expect(resolveExplicitCapabilityIntent("open strategies")?.section).toBe(
      "playbook",
    );
    expect(resolveExplicitCapabilityIntent("open saved work")?.section).toBe(
      "saved-work",
    );
    expect(resolveExplicitCapabilityIntent("open client avatars")?.section).toBe(
      "client-avatars",
    );
  });

  it("still ignores soft capture chatter", () => {
    expect(resolveExplicitCapabilityIntent("thinking about payroll again")).toBeNull();
  });
});

describe("violatesUniversalAccessBlockLanguage", () => {
  it("flags never-say block phrases", () => {
    expect(violatesUniversalAccessBlockLanguage("You can't do that here.")).toBe(
      true,
    );
    expect(
      violatesUniversalAccessBlockLanguage("This feature is not available in this room."),
    ).toBe(true);
    expect(violatesUniversalAccessBlockLanguage("I can do that.")).toBe(false);
  });
});
