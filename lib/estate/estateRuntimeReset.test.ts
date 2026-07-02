import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingEstatePlaceMenu,
  evaluateEstatePlaceTurn,
  savePendingEstatePlaceMenu,
} from "./estatePlaceNavigation";
import {
  executeSoundscapeIntent,
  planUserIntentExecution,
} from "./executeUserIntent";
import {
  getEstateRuntimeState,
  patchEstateRuntimeState,
  resetEstateRuntimeState,
} from "./estateRuntimeState";
import { resolveUserIntent } from "./resolveUserIntent";
import { recommendedSoundscapeForLegacyCategory } from "@/lib/soundscapes";
import { resolveEstatePlaceAmbientProfile } from "./estatePlaceAmbientSound";
import { tryCommitMicCaptureOnEnd } from "@/lib/voiceMicCommit";
import { isChatEnterWithoutNewline } from "@/lib/chatInputKeyboard";
import type { KeyboardEvent } from "react";

describe("estate runtime system reset", () => {
  beforeEach(() => {
    clearPendingEstatePlaceMenu();
    resetEstateRuntimeState();
  });

  it("1. pricing → conversation only", () => {
    const intent = resolveUserIntent({ userText: "I need help with pricing" });
    expect(intent.kind).toBe("conversation");
    expect(planUserIntentExecution(intent).action).toBe("conversation");
  });

  it("2. stressed suggest place → navigate offer only", () => {
    const intent = resolveUserIntent({
      userText: "I'm stressed, suggest a place",
    });
    expect(intent.kind).toBe("navigate");
    if (intent.kind === "navigate") {
      expect(intent.placeTurn.type).toBe("offer");
    }
    expect(planUserIntentExecution(intent).action).toBe("navigate-offer");
  });

  it("3. numbered pick → navigate only (goToPlace path)", () => {
    savePendingEstatePlaceMenu({
      placeIds: ["reading-nook", "greenhouse", "back-deck"],
    });
    const intent = resolveUserIntent({ userText: "1" });
    expect(intent.kind).toBe("navigate");
    if (intent.kind === "navigate" && intent.placeTurn.type === "navigate") {
      expect(intent.placeTurn.command.roomId ?? intent.placeTurn.command.entryId).toBe(
        "reading-nook",
      );
    }
    const plan = planUserIntentExecution(intent);
    expect(plan.action).toBe("navigate");
  });

  it("4. mic off commit → conversation path, no navigate/soundscape", () => {
    const send = vi.fn();
    tryCommitMicCaptureOnEnd({
      explicitStopRequested: true,
      inputSnapshot: "I need help with pricing",
      send,
    });
    expect(send).toHaveBeenCalledWith("I need help with pricing");
    const intent = resolveUserIntent({
      userText: "I need help with pricing",
      delivery: "mic-commit",
    });
    expect(intent.kind).toBe("conversation");
    expect(planUserIntentExecution(intent).action).toBe("conversation");
  });

  it("5. Enter is input-send gate only (semantic path separate)", () => {
    const e = {
      key: "Enter",
      code: "Enter",
      shiftKey: false,
      nativeEvent: { isComposing: false },
      keyCode: 13,
    } as unknown as KeyboardEvent<HTMLTextAreaElement>;
    expect(isChatEnterWithoutNewline(e)).toBe(true);
    const intent = resolveUserIntent({
      userText: "hello there",
      delivery: "keyboard",
    });
    expect(intent.kind).toBe("conversation");
  });

  it("6. calm soundscape UI → overlay only, not navigation", () => {
    patchEstateRuntimeState({ currentPlaceId: "greenhouse" });
    const intentUi = resolveUserIntent({
      userText: "",
      soundscapeCategoryId: "calming",
    });
    expect(intentUi.kind).toBe("soundscape");
    const plan = planUserIntentExecution(intentUi);
    expect(plan.action).toBe("soundscape");
    if (plan.action === "soundscape") {
      expect(plan.categoryId).toBe("calming");
    }
    expect(getEstateRuntimeState().currentPlaceId).toBe("greenhouse");
  });

  it("7. music request → soundscape not navigate", () => {
    const intent = resolveUserIntent({ userText: "I want music" });
    expect(intent.kind).toBe("soundscape");
    expect(planUserIntentExecution(intent).action).toBe("soundscape");
    expect(evaluateEstatePlaceTurn({ userText: "I want music" }).type).toBe(
      "none",
    );
  });

  it("8. navigate Greenhouse → ambient birds only (no soundscape intent)", () => {
    patchEstateRuntimeState({ currentPlaceId: "reading-nook", activeSoundscape: null });
    const intent = resolveUserIntent({ userText: "Take me to Greenhouse" });
    expect(intent.kind).toBe("navigate");
    const plan = planUserIntentExecution(intent);
    expect(plan.action).toBe("navigate");
    if (plan.action === "navigate") {
      expect(plan.command.roomId ?? plan.command.entryId).toBe("greenhouse");
    }
    const amb = resolveEstatePlaceAmbientProfile("greenhouse");
    expect(amb?.character).toMatch(/glasshouse|water trickle/i);
    expect(getEstateRuntimeState().activeSoundscape).toBeNull();
  });

  it("executeSoundscapeIntent updates runtime overlay id only", async () => {
    patchEstateRuntimeState({ currentPlaceId: "reading-nook" });
    const rec = recommendedSoundscapeForLegacyCategory("calming");
    await executeSoundscapeIntent({
      categoryId: "calming",
      soundscapeId: rec?.id ?? null,
    });
    expect(getEstateRuntimeState().currentPlaceId).toBe("reading-nook");
    expect(getEstateRuntimeState().activeSoundscape).toBeTruthy();
  });
});
