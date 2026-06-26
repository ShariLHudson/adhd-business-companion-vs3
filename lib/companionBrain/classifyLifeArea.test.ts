import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { classifyLifeArea } from "./classifyLifeArea";
import { SYSTEM_LIFE_AREAS } from "./lifeAreas/systemLifeAreas";
import {
  normalizeLifeAreaPhrase,
  recordLifeAreaCorrection,
  resetLifeAreaLearningForTests,
} from "./lifeAreas/lifeAreaLearningStore";
import {
  detectSmartLifeAreaSuggestions,
  resetSmartLifeAreaSuppressForTests,
} from "./lifeAreas/smartLifeAreaSuggestions";
import type { LifeAreaCorrection } from "./lifeAreas/types";

describe("classifyLifeArea", () => {
  it("detects Relationships & Networking for LinkedIn outreach", () => {
    const result = classifyLifeArea(
      { taskText: "Connect Caleb on LinkedIn" },
      SYSTEM_LIFE_AREAS,
    );
    expect(result).not.toBeNull();
    expect(result!.primaryLifeAreaId).toBe("sys:relationships-networking");
    expect(result!.primaryLifeAreaName).toBe("Relationships & Networking");
    expect(result!.confidence).toBeGreaterThanOrEqual(0.72);
    expect(result!.needsConfirmation).toBe(false);
  });

  it("asks for confirmation when confidence is low", () => {
    const result = classifyLifeArea(
      { taskText: "Think about things" },
      SYSTEM_LIFE_AREAS,
    );
    expect(result).not.toBeNull();
    expect(result!.needsConfirmation).toBe(true);
  });

  it("learns from user corrections", () => {
    const corrections: LifeAreaCorrection[] = [
      {
        phrase: normalizeLifeAreaPhrase("morning walk"),
        lifeAreaId: "sys:health",
        confidence: 0.9,
        timesConfirmed: 2,
        lastConfirmedAt: new Date().toISOString(),
      },
    ];
    const result = classifyLifeArea(
      {
        taskText: "Morning walk with Roger",
        previousCorrections: corrections,
      },
      SYSTEM_LIFE_AREAS,
    );
    expect(result!.primaryLifeAreaId).toBe("sys:health");
    expect(
      result!.matchedSignals.some(
        (s) => s.includes("remembered") || s.includes("similar"),
      ),
    ).toBe(true);
  });
});

describe("lifeAreaLearningStore", () => {
  beforeEach(() => {
    resetLifeAreaLearningForTests();
  });

  afterEach(() => {
    resetLifeAreaLearningForTests();
  });

  it("records corrections with rising confidence", () => {
    const first = recordLifeAreaCorrection("Email dentist", "sys:health");
    expect(first.timesConfirmed).toBe(1);
    const second = recordLifeAreaCorrection("Email dentist", "sys:health");
    expect(second.timesConfirmed).toBe(2);
    expect(second.confidence).toBeGreaterThan(first.confidence);
  });
});

describe("detectSmartLifeAreaSuggestions", () => {
  beforeEach(() => {
    resetSmartLifeAreaSuppressForTests();
  });

  it("suggests a Smart Life Area when repeated phrases appear", () => {
    const items = [
      { title: "Founder Launch email sequence" },
      { title: "Founder Launch waitlist page" },
      { title: "Founder Launch beta invites" },
      { title: "Founder Launch onboarding doc" },
    ];
    const suggestions = detectSmartLifeAreaSuggestions(items, []);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]!.proposedName.toLowerCase()).toContain("founder");
  });
});
