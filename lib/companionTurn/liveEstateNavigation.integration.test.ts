import { describe, expect, it } from "vitest";
import { classifyCompanionIntent, executeCompanionIntent } from "@/lib/companionTurn";
import { resolveEstateAction } from "@/lib/estate/decisionKernel";
import { evaluateEstatePlaceTurn } from "@/lib/estate/estatePlaceNavigation";
import { estateNavigateCommandForPlace } from "@/lib/estateIntelligence/estateCommandRouter";
import { applyEstateTaskLockTurn } from "@/lib/estate/estateTaskLockGate";

const LIVE_NAV_PHRASES: { text: string; placeId: string }[] = [
  { text: "take me to the butterfly conservatory", placeId: "conservatory" },
  { text: "take me to the library", placeId: "library" },
  { text: "take me to the coffee house", placeId: "coffee-house" },
  { text: "take me to the Apple Orchard", placeId: "apple-orchard" },
  { text: "take me to the music room", placeId: "music-room" },
];

describe("live estate navigation chain", () => {
  for (const { text, placeId } of LIVE_NAV_PHRASES) {
    it(`kernel NAVIGATE: "${text}"`, () => {
      const action = resolveEstateAction({ userText: text });
      expect(action.action).toBe("NAVIGATE");
      if (action.action !== "NAVIGATE" || action.target.kind !== "place") {
        throw new Error("expected place navigation");
      }
      expect(action.target.command.roomId ?? action.target.command.entryId).toBe(
        placeId,
      );

      const turn = evaluateEstatePlaceTurn({ userText: text });
      expect(turn.type).toBe("navigate");
      if (turn.type === "navigate") {
        expect(turn.command.roomId ?? turn.command.entryId).toBe(placeId);
      }

      const command = estateNavigateCommandForPlace(placeId, text);
      expect(command).not.toBeNull();
      expect(command?.section).toBeTruthy();

      const classified = classifyCompanionIntent({ userText: text });
      expect(classified.kind).toBe("NAVIGATE");

      let navigated = false;
      const handled = executeCompanionIntent(classified, {
        onCaptureWrite: () => {},
        onNavigateMemory: () => {},
        onNavigatePlace: () => {
          navigated = true;
        },
        onSoundscape: () => {},
        onAssistantLine: () => {},
        onPlaceMenu: () => {},
        onCaptureMenu: () => {},
        onRoomAction: () => {},
      });
      expect(handled).toBe(true);
      expect(navigated).toBe(true);
    });
  }

  it("explicit navigation still works while a research task is locked", () => {
    const gate = applyEstateTaskLockTurn({
      userText: "take me to the library",
      lastAssistantText: "Here is what I found about pricing…",
      priorUserText: "help me research pricing",
      conversationTurn: 3,
    });

    expect(gate.allowsExplicitEstateNavigation).toBe(true);
    expect(gate.suppressEstateRoomRouting).toBe(false);

    const classified = classifyCompanionIntent({
      userText: "take me to the library",
      forceChat: gate.suppressEstateRoomRouting,
    });
    expect(classified.kind).toBe("NAVIGATE");
  });
});
