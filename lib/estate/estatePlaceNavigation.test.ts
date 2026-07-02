import { beforeEach, describe, expect, it } from "vitest";

import { formatEstatePlaceSuggestionMenu } from "./estatePlaceIdentityLock";
import {
  clearPendingEstatePlaceMenu,
  evaluateEstatePlaceTurn,
  savePendingEstatePlaceMenu,
} from "./estatePlaceNavigation";

describe("evaluateEstatePlaceTurn — numbered menu selection", () => {
  beforeEach(() => {
    clearPendingEstatePlaceMenu();
  });

  it("maps #1 and #2 to the visible menu order, not stale pending", () => {
    savePendingEstatePlaceMenu({
      placeIds: ["library", "observatory", "momentum-institute"],
      offeredAtTurn: 4,
    });

    const currentMenu = formatEstatePlaceSuggestionMenu([
      "reading-nook",
      "greenhouse",
      "back-deck",
    ]);

    const first = evaluateEstatePlaceTurn({
      userText: "1",
      lastAssistantText: currentMenu,
    });
    expect(first.type).toBe("navigate");
    if (first.type === "navigate") {
      expect(first.command.roomId ?? first.command.entryId).toBe("reading-nook");
    }

    const second = evaluateEstatePlaceTurn({
      userText: "2",
      lastAssistantText: currentMenu,
    });
    expect(second.type).toBe("navigate");
    if (second.type === "navigate") {
      expect(second.command.roomId ?? second.command.entryId).toBe("greenhouse");
    }
  });
});
