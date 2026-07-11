import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getEstateSceneTransitionState,
  prepareEstateSceneTransition,
} from "./estateSceneTransition";

describe("estateSceneTransition", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "Image",
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("commits first plate without crossfade when no active scene", async () => {
    await prepareEstateSceneTransition({
      toSection: "evidence-bank",
      imageUrl: "/backgrounds/evidence-vault-background.png",
    });
    const state = getEstateSceneTransitionState();
    expect(state.active?.imageUrl).toBe(
      "/backgrounds/evidence-vault-background.png",
    );
    expect(state.phase).toBe("ready");
  });

  it("uses contain fit when showFullPlate is set (Change background)", async () => {
    vi.useFakeTimers();
    await prepareEstateSceneTransition({
      toRoomId: "fireside-deck",
      imageUrl: "/backgrounds/fireside-deck-background.PNG",
      showFullPlate: true,
    });
    let state = getEstateSceneTransitionState();
    expect(state.plateObjectFit).toBe("contain");
    expect(state.incoming?.imageUrl).toBe(
      "/backgrounds/fireside-deck-background.PNG",
    );
    await vi.advanceTimersByTimeAsync(700);
    state = getEstateSceneTransitionState();
    expect(state.active?.imageUrl).toBe(
      "/backgrounds/fireside-deck-background.PNG",
    );
    vi.useRealTimers();
  });
});
