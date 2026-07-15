import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("@/lib/companionLedContinue", () => ({
  resolveCompanionContinue: vi.fn(() => ({
    mode: "empty",
    prompt: "What would help most right now?",
  })),
  continueDestinationAvailable: undefined,
}));

vi.mock("@/lib/companionStore", () => ({
  getPrefs: () => ({ name: "Shari" }),
}));

vi.mock("@/lib/profile/businessEstateProfile", () => ({
  getApprovedFieldValue: () => "",
}));

import { resolveCompanionContinue } from "@/lib/companionLedContinue";
import {
  continueDestinationAvailable,
  resolveWelcomeHomeDailyChoices,
} from "./resolveWelcomeHomeDailyChoices";

describe("resolveWelcomeHomeDailyChoices (retired choice list)", () => {
  beforeEach(() => {
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "empty",
      prompt: "What would help most right now?",
    });
  });

  it("no longer returns plain-text daily choices — Today's Welcome Card owns that", () => {
    const result = resolveWelcomeHomeDailyChoices({
      experienceVisitorKind: "first_visit",
      existingGreeting: null,
    });
    expect(result.visitorKind).toBe("new");
    expect(result.choices).toEqual([]);
    expect(result.discoveryInvitation.show).toBe(false);
    expect(result.preferredWelcomeMessage).toContain("Welcome to Spark Estate");
  });

  it("keeps continueAvailable metadata but never surfaces Check My Day / Help Me Restart", () => {
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "single",
      option: {
        id: "project:1",
        kind: "project",
        title: "Client profile",
        subtitle: "Continue",
        priority: 2,
        lastTouchedAt: new Date().toISOString(),
      },
    });
    const result = resolveWelcomeHomeDailyChoices({
      experienceVisitorKind: "returning",
      existingGreeting: "Welcome back.",
    });
    expect(result.continueAvailable).toBe(true);
    expect(result.choices).toEqual([]);
    expect(JSON.stringify(result)).not.toMatch(/Help Me Restart|Check My Day/i);
  });

  it("hides discovery invite from the retired Welcome Home list", () => {
    const result = resolveWelcomeHomeDailyChoices({
      experienceVisitorKind: "returning",
      arrival: {
        visitorKind: "long_absence",
        returnIntervalDays: 20,
      } as never,
    });
    expect(result.visitorKind).toBe("absence");
    expect(result.choices).toEqual([]);
    expect(result.discoveryInvitation.show).toBe(false);
  });

  it("continueDestinationAvailable mirrors resolution modes", () => {
    expect(
      continueDestinationAvailable({ mode: "empty", prompt: "x" }),
    ).toBe(false);
    expect(continueDestinationAvailable({ mode: "onboarding" })).toBe(false);
  });
});
