import { beforeEach, describe, expect, it } from "vitest";
import {
  clearActiveEventRecord,
  clearEventAssetInstancesForTests,
  processEventsIntelligenceTurn,
  upsertEventRecord,
} from "@/lib/eventsIntelligence";
import {
  buildWelcomeBackBridge,
  naturalNextStepPhrase,
} from "./welcomeBackBridge";

describe("Sprint 3 — welcome-back conversation bridge", () => {
  beforeEach(() => {
    clearActiveEventRecord();
    clearEventAssetInstancesForTests();
  });

  it("phrases Create Agenda as the agenda", () => {
    expect(naturalNextStepPhrase("Create Agenda")).toBe("the agenda");
  });

  it("never says Continue?", () => {
    const start = processEventsIntelligenceTurn({
      userText: "I'd like to plan a workshop.",
      forceStart: true,
    });
    let record = start.record!;
    record = upsertEventRecord({
      ...record,
      audience: "ADHD business owners",
      purpose: "Help them plan their first workshop",
      outcomes: "Leave with a simple agenda",
    });
    const bridge = buildWelcomeBackBridge(record);
    expect(bridge).toMatch(/Welcome back/i);
    expect(bridge).toMatch(/audience|purpose|outcome/i);
    expect(bridge).not.toMatch(/^Continue\?$/i);
    expect(bridge).not.toBe("Continue?");
    expect(bridge.toLowerCase()).toContain("next step");
  });
});
