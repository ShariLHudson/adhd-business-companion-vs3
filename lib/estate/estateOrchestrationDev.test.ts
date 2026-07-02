import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearActiveTaskLockState } from "./activeTaskLock";
import {
  exposeEstateOrchestrationShadowToWindow,
  getEstateOrchestrationShadowMetrics,
  observeEstateOrchestrationShadowTurn,
  resetEstateOrchestrationShadowDevState,
} from "./estateOrchestrationDev";
import { applyEstateTaskLockTurn } from "./estateTaskLockGate";
import { getOrchestrationShadowLog } from "./estateOrchestrationShadow";

describe("estateOrchestrationDev", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    resetEstateOrchestrationShadowDevState();
    clearActiveTaskLockState();
  });

  afterEach(() => {
    vi.stubEnv("NODE_ENV", originalEnv ?? "test");
    resetEstateOrchestrationShadowDevState();
  });

  it("tracks multi-turn shadow task state in dev", () => {
    applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });

    observeEstateOrchestrationShadowTurn({
      userText: "What did you find?",
      lastAssistantText: "I'll look into that — give me a moment.",
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 4,
    });

    const log = getOrchestrationShadowLog();
    expect(log.length).toBe(1);
    expect(log[0]?.shadowDecision).toBe("continue_task");
    expect(log[0]?.suppressRoomRouting).toBe(true);
  });

  it("exposes window API in development", () => {
    vi.stubGlobal("window", globalThis);

    exposeEstateOrchestrationShadowToWindow();
    const api = (
      globalThis as unknown as {
        __sparkEstateOrchestrationShadow?: {
          getMetrics: () => ReturnType<typeof getEstateOrchestrationShadowMetrics>;
        };
      }
    ).__sparkEstateOrchestrationShadow;

    expect(api).toBeTruthy();
    observeEstateOrchestrationShadowTurn({
      userText: "I don't want a room",
      conversationTurn: 2,
    });
    expect(api?.getMetrics().observedTurns).toBe(1);
  });

  it("is a no-op in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const result = observeEstateOrchestrationShadowTurn({
      userText: "research AI",
      conversationTurn: 1,
    });
    expect(result).toBeNull();
    expect(getOrchestrationShadowLog().length).toBe(0);
  });
});
