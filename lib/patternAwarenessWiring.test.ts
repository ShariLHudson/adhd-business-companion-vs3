import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildRelationshipIntelligencePriorityBlock } from "./relationshipIntelligencePrompt";
import { savePrefs } from "./companionStore";
import { resetTransformationIntelligenceForTests } from "./transformationIntelligence";

describe("pattern awareness wiring", () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
    });
  });

  afterEach(() => {
    resetTransformationIntelligenceForTests();
    vi.unstubAllGlobals();
  });

  it("suppresses relationship priority block when pattern awareness is off", () => {
    savePrefs({ patternAwareness: "off" });
    expect(buildRelationshipIntelligencePriorityBlock("hello")).toBeNull();
  });
});
