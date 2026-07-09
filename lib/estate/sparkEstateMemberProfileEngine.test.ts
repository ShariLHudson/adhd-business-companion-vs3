import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProject } from "@/lib/companionStore";
import {
  buildSparkEstateMemberProfileCompanionHint,
  buildSparkEstatePersonalizationContext,
  clearSparkEstateEditableProfile,
  formatSparkEstateMemberProfileReport,
  formatSparkEstateMemberProfileSummary,
  formatSparkEstatePersonalizedGreeting,
  getSparkEstateMemberProfile,
  observeSparkEstateEnergyFromText,
  personalizeSparkEstateCreationQuestion,
  removeSparkEstateProfileField,
  SPARK_ESTATE_PRIVACY_PRINCIPLE,
  SPARK_ESTATE_PROFILE_LAYER_DEFINITIONS,
  SPARK_ESTATE_PROFILE_PRINCIPLE,
  SPARK_ESTATE_PROFILE_SUCCESS_TEST,
  SPARK_ESTATE_UNIVERSAL_EXPERIENCE_RULE,
  updateSparkEstateMemberProfile,
  verifySparkEstateMemberProfile,
} from "./sparkEstateMemberProfileEngine";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => {
      mem.clear();
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
    sessionStorage: storage,
  });
}

describe("sparkEstateMemberProfileEngine", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
    sessionStorage.clear();
    clearSparkEstateEditableProfile();
  });

  it("organizes seven profile layers", () => {
    const profile = getSparkEstateMemberProfile();
    expect(SPARK_ESTATE_PROFILE_LAYER_DEFINITIONS).toHaveLength(7);
    expect(SPARK_ESTATE_PROFILE_PRINCIPLE).toContain("work best");
    expect(profile.layers).toEqual([
      "identity",
      "goals-vision",
      "working-style",
      "energy-patterns",
      "progress-history",
      "friction-patterns",
      "successful-strategies",
    ]);
    expect(SPARK_ESTATE_PROFILE_SUCCESS_TEST).toContain("understands");
  });

  it("lets members view, edit, and remove profile information", () => {
    updateSparkEstateMemberProfile({
      identity: { preferredName: "Shari", businessName: "Spark Estate" },
      goalsVision: { currentPriorities: ["Launch workshop"] },
      workingStyle: { communicationStyle: "warm and practical" },
    });

    const summary = formatSparkEstateMemberProfileSummary();
    expect(summary.some((line) => line.includes("Shari"))).toBe(true);
    expect(summary.some((line) => line.includes("Launch workshop"))).toBe(true);

    removeSparkEstateProfileField("identity", "businessName");
    const cleared = getSparkEstateMemberProfile();
    expect(cleared.identity.businessName).toBeUndefined();
  });

  it("personalizes greetings for new, returning, low-energy, and celebrating members", () => {
    const welcome = formatSparkEstatePersonalizedGreeting({
      ...buildSparkEstatePersonalizationContext(),
      greetingTone: "welcome",
      preferredName: null,
      explanationLength: "balanced",
      useExamples: false,
      stepByStep: false,
      encouragementLevel: "normal",
      suggestedFirstAction: null,
      continuityLine: null,
      preferenceConfirmation: null,
    });
    expect(welcome).toContain("working toward");

    updateSparkEstateMemberProfile({ identity: { preferredName: "Alex" } });
    saveProject({
      name: "Workshop",
      goal: "Launch",
      nextAction: "Outline session one",
      status: "active-focus",
    });

    const returning = formatSparkEstatePersonalizedGreeting(
      buildSparkEstatePersonalizationContext({ text: "I'm back" }),
    );
    expect(returning).toContain("Workshop");

    const lowEnergy = formatSparkEstatePersonalizedGreeting({
      ...buildSparkEstatePersonalizationContext({ text: "I'm tired today" }),
      greetingTone: "low-energy",
    });
    expect(lowEnergy).toContain("small step");

    const celebration = formatSparkEstatePersonalizedGreeting({
      ...buildSparkEstatePersonalizationContext({ celebrating: true }),
      greetingTone: "celebration",
    });
    expect(celebration).toContain("milestone");
  });

  it("adapts creation support with examples and step-by-step guidance", () => {
    updateSparkEstateMemberProfile({
      workingStyle: {
        learningPreference: "examples first",
        pacePreference: "step-by-step guidance",
      },
    });

    const question = personalizeSparkEstateCreationQuestion("Who is this for?");
    expect(question).toContain("example");
    expect(question).toContain("one step at a time");
  });

  it("observes energy patterns without labeling the member", () => {
    observeSparkEstateEnergyFromText("I'm tired and have too much happening");
    const profile = getSparkEstateMemberProfile();
    expect(profile.energyPatterns.typicalEnergy).toBe("low");
    expect(profile.energyPatterns.stressSignals.length).toBeGreaterThan(0);
    expect(profile.frictionPatterns.every((entry) => entry.supportApproach.length > 0)).toBe(
      true,
    );
  });

  it("verifies personalization and member control", () => {
    const verification = verifySparkEstateMemberProfile();
    expect(verification.layers).toHaveLength(7);
    expect(verification.personalizationReady).toBe(true);
    expect(verification.memberControlReady).toBe(true);
    expect(verification.gradualLearningReady).toBe(true);
    expect(verification.privacyPrincipleReady).toBe(true);
    expect(verification.universalExperienceReady).toBe(true);
  });

  it("formats a readable member profile report", () => {
    const report = formatSparkEstateMemberProfileReport();
    expect(report).toContain(SPARK_ESTATE_PROFILE_SUCCESS_TEST);
    expect(report).toContain(SPARK_ESTATE_PRIVACY_PRINCIPLE);
    expect(report).toContain(SPARK_ESTATE_UNIVERSAL_EXPERIENCE_RULE);
    expect(report).toContain("Integration checks");
  });

  it("builds companion hints for personalization without questionnaires", () => {
    updateSparkEstateMemberProfile({
      workingStyle: {
        learningPreference: "examples first",
        pacePreference: "step-by-step guidance",
      },
    });
    const hint = buildSparkEstateMemberProfileCompanionHint({
      text: "Help me write an email",
    });
    expect(hint).toContain("examples");
    expect(hint).toContain("step-by-step");
  });
});
