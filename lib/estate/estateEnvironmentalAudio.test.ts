import { describe, expect, it } from "vitest";
import {
  isStopEstateAmbienceRequest,
  stopEstateAmbienceReply,
} from "./estateEnvironmentalAudio";
import { resolveEstatePresenceRoomId } from "./estatePresence/registry";

describe("isStopEstateAmbienceRequest", () => {
  it("recognizes stop coffee house chatter", () => {
    expect(isStopEstateAmbienceRequest("stop with the coffee house chatter")).toBe(
      true,
    );
  });

  it("recognizes direct stop ambience phrasing", () => {
    expect(isStopEstateAmbienceRequest("please stop the coffee house music")).toBe(
      true,
    );
  });

  it("ignores unrelated chat", () => {
    expect(isStopEstateAmbienceRequest("I need coffee for my meeting")).toBe(
      false,
    );
  });
});

describe("stopEstateAmbienceReply", () => {
  it("is calm and brief", () => {
    expect(stopEstateAmbienceReply()).toMatch(/quiet/i);
  });
});

describe("resolveEstatePresenceRoomId", () => {
  it("prefers section room over stale coffee-house memory on brain-dump", () => {
    expect(
      resolveEstatePresenceRoomId({
        activeSection: "brain-dump",
        memoryRoomId: "coffee-house",
      }),
    ).toBe("clear-my-mind");
  });

  it("keeps direct coffee-house overlay while visit is active", () => {
    expect(
      resolveEstatePresenceRoomId({
        activeSection: "focus-audio",
        showDirectEstateOverlay: true,
        directEstateVisit: { roomId: "coffee-house" },
        memoryRoomId: "peaceful-places",
      }),
    ).toBe("coffee-house");
  });

  it("maps evidence-bank section to evidence-vault presence", () => {
    expect(
      resolveEstatePresenceRoomId({
        activeSection: "evidence-bank",
        memoryRoomId: "coffee-house",
      }),
    ).toBe("evidence-vault");
  });

  it("falls back to memory when section has no mapped room", () => {
    expect(
      resolveEstatePresenceRoomId({
        activeSection: "games",
        memoryRoomId: "coffee-house",
      }),
    ).toBe("coffee-house");
  });
});
