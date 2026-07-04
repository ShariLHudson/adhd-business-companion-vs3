import { describe, expect, it } from "vitest";
import { resolveEstateAction } from "@/lib/estate/decisionKernel";
import { evaluateEstateRoomAction } from "./evaluateEstateRoomAction";
import { resolveCurrentEstateRoom } from "./resolveCurrentEstateRoom";

describe("estate room context", () => {
  it("resolves current room from direct visit first", () => {
    expect(
      resolveCurrentEstateRoom({
        directVisitRoomId: "journal",
        activeSection: "home",
        memoryRoomId: "coffee-house",
      }),
    ).toBe("journal");
  });

  it("resolves journal section to journal gazebo room", () => {
    expect(
      resolveCurrentEstateRoom({
        directVisitRoomId: null,
        activeSection: "growth-journal",
        memoryRoomId: null,
      }),
    ).toBe("journal");
  });

  it("journal gazebo — journal intent opens journal, does not navigate", () => {
    const action = evaluateEstateRoomAction({
      userText: "I'd like to journal for a few minutes.",
      currentPlaceId: "journal",
    });
    expect(action?.action.kind).toBe("open_journal");
    expect(action?.reply).toMatch(/open your journal/i);
  });

  it("journal gazebo — show my journal opens journal", () => {
    const action = evaluateEstateRoomAction({
      userText: "Show me my journal.",
      currentPlaceId: "journal",
    });
    expect(action?.action.kind).toBe("open_journal");
    expect(action?.reply).toMatch(/Opening your current journal/i);
  });

  it("journal gazebo — create new journal opens selector", () => {
    const action = evaluateEstateRoomAction({
      userText: "Create a new journal.",
      currentPlaceId: "journal",
    });
    expect(action?.action.kind).toBe("create_journal");
  });

  it("kernel blocks re-navigation when already in journal", () => {
    const result = resolveEstateAction({
      userText: "Show me my journal.",
      currentPlaceId: "journal",
    });
    expect(result.action).toBe("ROOM_ACTION");
    if (result.action === "ROOM_ACTION") {
      expect(result.roomAction.kind).toBe("open_journal");
    }
  });

  it("kernel still navigates when not in target room", () => {
    const result = resolveEstateAction({
      userText: "Take me to the Journal Gazebo.",
      currentPlaceId: "coffee-house",
    });
    expect(result.action).toBe("NAVIGATE");
  });

  it("creative studio — SOP request stays in room", () => {
    const action = evaluateEstateRoomAction({
      userText: "Help me create an SOP.",
      currentPlaceId: "creative-studio",
    });
    expect(action?.action.kind).toBe("launch_creation");
    expect(action?.action.creationIntent).toBe("sop");
  });

  it("coffee house — sit here remains", () => {
    const action = evaluateEstateRoomAction({
      userText: "Let's sit here.",
      currentPlaceId: "coffee-house",
    });
    expect(action?.action.kind).toBe("remain_in_room");
  });

  it("momentum room — show projects opens projects", () => {
    const action = evaluateEstateRoomAction({
      userText: "Show my projects.",
      currentPlaceId: "momentum-institute",
    });
    expect(action?.action.kind).toBe("open_projects");
  });
});
