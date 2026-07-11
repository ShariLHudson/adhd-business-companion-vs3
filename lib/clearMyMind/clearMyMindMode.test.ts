import { describe, expect, it, beforeEach } from "vitest";
import {
  enterClearMyMindMode,
  exitClearMyMindMode,
  getClearMyMindMode,
  isClearMyMindExitRequest,
  isClearMyMindModeActive,
  isClearMyMindOrganizeRequest,
  noteClearMyMindCapture,
  resetClearMyMindModeForTests,
  setClearMyMindModePhase,
  shouldStayInClearMyMindMode,
} from "./clearMyMindMode";
import { isDedicatedEstateRoomPanelSection } from "@/lib/estate/directEstateVisit";
import { shouldShowDirectEstateVisitOverlay } from "@/lib/estate/directEstateVisit";
import { CLEAR_MY_MIND_WELCOME_LINES } from "@/lib/clearMyMindCopy";
import {
  estateCommandAckLine,
  estateDirectCommandArrivalLine,
} from "@/lib/estateIntelligence/estateCommandRouter";

describe("Clear My Mind Mode", () => {
  beforeEach(() => {
    resetClearMyMindModeForTests();
  });

  it("enters capture mode and stays active until exit", () => {
    enterClearMyMindMode();
    expect(isClearMyMindModeActive()).toBe(true);
    expect(getClearMyMindMode().phase).toBe("capture");
    noteClearMyMindCapture(3);
    expect(getClearMyMindMode().captureCount).toBe(3);
    setClearMyMindModePhase("organize");
    expect(getClearMyMindMode().phase).toBe("organize");
    exitClearMyMindMode();
    expect(isClearMyMindModeActive()).toBe(false);
  });

  it("locks the workspace while brain-dump is active", () => {
    expect(
      shouldStayInClearMyMindMode({ activeSection: "brain-dump" }),
    ).toBe(true);
    enterClearMyMindMode();
    expect(shouldStayInClearMyMindMode({})).toBe(true);
  });

  it("keeps mode active until explicit exit even if section drifts", () => {
    enterClearMyMindMode();
    expect(isClearMyMindModeActive()).toBe(true);
    expect(
      shouldStayInClearMyMindMode({ activeSection: "home" }),
    ).toBe(true);
    exitClearMyMindMode();
    expect(shouldStayInClearMyMindMode({ activeSection: "home" })).toBe(false);
  });

  it("recognizes organize and exit phrases", () => {
    expect(isClearMyMindOrganizeRequest("organize")).toBe(true);
    expect(isClearMyMindOrganizeRequest("I'm done")).toBe(true);
    expect(isClearMyMindExitRequest("return home")).toBe(true);
    expect(isClearMyMindExitRequest("save for later")).toBe(true);
  });

  it("uses the capture-first entry greeting", () => {
    expect(CLEAR_MY_MIND_WELCOME_LINES[0]).toMatch(/Nothing has to be organized yet/);
    expect(estateDirectCommandArrivalLine("clear-my-mind")).toBe(
      CLEAR_MY_MIND_WELCOME_LINES[0],
    );
    expect(
      estateCommandAckLine({
        kind: "direct",
        executeImmediately: true,
        entryId: "clear-my-mind",
        roomId: "clear-my-mind",
        section: "brain-dump",
        entry: { id: "clear-my-mind", name: "Clear My Mind" } as never,
        workspaceOffer: {
          section: "brain-dump",
          line: "Clear My Mind",
          reason: "direct",
        } as never,
      }),
    ).toBe(CLEAR_MY_MIND_WELCOME_LINES[0]);
  });

  it("treats brain-dump as a dedicated panel — never frosted chat overlay", () => {
    expect(isDedicatedEstateRoomPanelSection("brain-dump")).toBe(true);
    expect(
      shouldShowDirectEstateVisitOverlay(
        {
          roomId: "clear-my-mind",
          section: "brain-dump",
          userIntent: "clear my mind",
          userMessageCountAtArrival: 1,
        },
        "brain-dump",
      ),
    ).toBe(false);
  });
});
