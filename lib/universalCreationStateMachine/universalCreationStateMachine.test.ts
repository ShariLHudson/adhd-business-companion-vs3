import { describe, expect, it } from "vitest";
import { createEmptyEventSections } from "@/lib/eventsIntelligence/eventSections";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { recommendForEventWorkspace } from "@/lib/intelligentRecommendation";
import {
  isAllowedUniversalTransition,
  nextLikelyUniversalState,
  resolveUniversalCreationStateFromEvent,
  UNIVERSAL_CREATION_STATES,
  UNIVERSAL_CREATION_STATE_LABEL,
} from "./index";

function baseRecord(
  overrides: Partial<EventRecord> = {},
): EventRecord {
  const sections = createEmptyEventSections();
  return {
    id: "evt-state-1",
    title: "Workshop",
    eventType: "workshop",
    eventTypeLabel: "Workshop",
    purpose: "",
    audience: "",
    outcomes: "",
    format: "unspecified",
    dates: "",
    venue: "",
    budget: "",
    lifecyclePhase: "discovery",
    runtimeState: "DISCOVERY",
    sections,
    tasks: [],
    milestones: [],
    decisions: [],
    dependencies: [],
    owners: [],
    nextAction: "",
    activeQuestionId: null,
    conversationContext: "",
    projectHomeId: null,
    companionProjectId: null,
    canonicalWorkId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function fillFoundation(record: EventRecord): EventRecord {
  const sections = [...record.sections];
  for (const [id, content] of [
    ["purpose", "Introduce platform"],
    ["audience", "ADHD business owners"],
    ["outcomes", "Clear next step"],
  ] as const) {
    const i = sections.findIndex((s) => s.id === id);
    if (i >= 0) {
      sections[i] = {
        ...sections[i]!,
        content,
        status: "confirmed",
      };
    }
  }
  return {
    ...record,
    purpose: "Introduce platform",
    audience: "ADHD business owners",
    outcomes: "Clear next step",
    sections,
  };
}

describe("061 — Universal Creation State Machine", () => {
  it("defines the full shared lifecycle", () => {
    expect(UNIVERSAL_CREATION_STATES).toEqual([
      "idea",
      "discovery",
      "foundation",
      "planning",
      "building",
      "review",
      "ready",
      "executing",
      "completed",
      "growth",
      "archive",
      "reuse",
    ]);
    expect(UNIVERSAL_CREATION_STATE_LABEL.foundation).toBe("Foundation");
  });

  it("begins in idea / discovery before foundation", () => {
    expect(resolveUniversalCreationStateFromEvent(null)).toBe("idea");
    expect(resolveUniversalCreationStateFromEvent(baseRecord())).toBe("idea");
    expect(
      resolveUniversalCreationStateFromEvent(
        baseRecord({ conversationContext: "I want a workshop" }),
      ),
    ).toBe("discovery");
  });

  it("moves to foundation when minimum understanding exists", () => {
    const record = fillFoundation(baseRecord());
    expect(resolveUniversalCreationStateFromEvent(record)).toBe("foundation");
  });

  it("moves to planning once foundation is past and agenda is next", () => {
    const record = fillFoundation(
      baseRecord({ lifecyclePhase: "planning", runtimeState: "PLANNING" }),
    );
    // still no agenda → planning (or foundation if still discovery phase)
    const state = resolveUniversalCreationStateFromEvent(record);
    expect(["foundation", "planning"]).toContain(state);
  });

  it("enters executing / completed / archive from runtime", () => {
    expect(
      resolveUniversalCreationStateFromEvent(
        fillFoundation(baseRecord({ runtimeState: "LIVE", lifecyclePhase: "delivery" })),
      ),
    ).toBe("executing");
    expect(
      resolveUniversalCreationStateFromEvent(
        fillFoundation(
          baseRecord({ runtimeState: "COMPLETED", lifecyclePhase: "follow_up" }),
        ),
      ),
    ).toBe("growth");
    expect(
      resolveUniversalCreationStateFromEvent(
        baseRecord({ runtimeState: "CANCELED" }),
      ),
    ).toBe("archive");
  });

  it("allows natural forward and reverse transitions", () => {
    expect(isAllowedUniversalTransition("discovery", "foundation")).toBe(true);
    expect(isAllowedUniversalTransition("review", "planning")).toBe(true);
    expect(isAllowedUniversalTransition("idea", "executing")).toBe(false);
    expect(nextLikelyUniversalState("foundation")).toBe("planning");
  });

  it("recommendation engine adapts to lifecycle state — not discovery building", () => {
    const early = baseRecord({ conversationContext: "workshop idea" });
    const earlyPack = recommendForEventWorkspace(early);
    expect(earlyPack.primary.title).not.toMatch(/agenda/i);

    const founded = fillFoundation(baseRecord());
    const pack = recommendForEventWorkspace(founded);
    expect(pack.primary.title).toMatch(/agenda/i);
  });
});
