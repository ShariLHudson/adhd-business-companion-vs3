/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearActiveEventRecord,
  clearEventAssetInstancesForTests,
  processEventsIntelligenceTurn,
  upsertEventRecord,
} from "@/lib/eventsIntelligence";
import { resolveBlueprintFromText } from "@/lib/platformIntent";
import { applyEventTypeChangeRequest } from "@/lib/eventsIntelligence/changeEventType";
import {
  persistDiscoveryTurn,
  readCreationContinuityHint,
} from "./persistDiscoveryTurn";

describe("Hardening Sprint 1 — continuity + classifier", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearActiveEventRecord();
    clearEventAssetInstancesForTests();
  });

  it("product launch event classifies as Event Plan", () => {
    const bp = resolveBlueprintFromText(
      "I want to plan a product launch event",
    );
    expect(bp?.specialtyRuntime).toBe("events");
    expect(bp?.catalogType).toBe("Event Plan");
  });

  it("persists Discovery answers immediately", () => {
    const start = processEventsIntelligenceTurn({
      userText: "I'd like to plan a workshop.",
      forceStart: true,
    });
    expect(start.record).toBeTruthy();
    const result = persistDiscoveryTurn({
      eventRecordId: start.record!.id,
      userText: "ADHD business owners",
      assistantReply: "Who is this for?",
    });
    expect(result.persisted).toBe(true);
    expect(result.record?.conversationContext).toMatch(/ADHD business owners/);
    expect(readCreationContinuityHint()?.eventRecordId).toBe(start.record!.id);
    expect(localStorage.getItem("companion-creation-continuity-v1")).toBeTruthy();
    expect(readCreationContinuityHint()?.currentFocusTitle).toBeTruthy();
  });

  it("type change updates same record", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me create a workshop.",
      forceStart: true,
    });
    const record = start.record!;
    const next = applyEventTypeChangeRequest(
      record,
      "This should be a webinar.",
    );
    expect(next?.id).toBe(record.id);
    expect(next?.eventType).toBe("webinar");
    expect(upsertEventRecord(next!).id).toBe(record.id);
  });
});
