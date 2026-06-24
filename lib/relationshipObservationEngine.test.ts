import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import {
  patchPhase2DiscoveryState,
  resetPhase2DiscoveryForTests,
} from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import { resetPhase6NetworkForTests } from "./phase6CompanionIntelligenceNetwork";
import { resetPhase7BusinessIntelligenceForTests } from "./businessIntelligenceEcosystem";
import {
  buildRelationshipObservations,
  buildTransformationNarrative,
  containsRawSignalName,
  formatObservationsForPrompt,
  isCompanionGradeObservation,
} from "./relationshipObservationEngine";
import { buildRelationshipIntelligencePriorityBlock } from "./relationshipIntelligencePrompt";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("relationshipObservationEngine", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetPhase1OnboardingForTests();
    resetPhase2DiscoveryForTests();
    resetPhase3RelationshipForTests();
    resetPhase4PartnerForTests();
    resetPhase5EcosystemForTests();
    resetPhase6NetworkForTests();
    resetPhase7BusinessIntelligenceForTests();
    vi.restoreAllMocks();
  });

  function seedHistory() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm and finishing projects" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More confidence" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });

    const started = "2024-06-01T10:00:00.000Z";
    patchPhase2DiscoveryState({
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop", recordedAt: started }],
      learningStyle: { primary: "conversational", confidence: 0.75, signals: { conversational: 7 } },
      adhdPatterns: [
        { id: "shiny_object_syndrome", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 4, lastSeen: started },
      ],
      challenges: [{ label: "Finishing projects", count: 5, lastSeen: started }],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 85,
          ignoredCount: 0,
        },
      ],
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop",
        goal: "Launch",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Plan",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue({
      role: "Coach",
      sells: "Workshop",
      goals: ["Launch"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);
  }

  it("converts follow-through pattern into operating insight, not a symptom label", () => {
    seedHistory();
    const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"));
    const operating = observations.find((o) => o.source?.startsWith("os:completion"));
    expect(operating).toBeTruthy();
    expect(operating!.text).toMatch(/maintenance|creative phase|momentum/i);
    expect(operating!.text).not.toMatch(/shiny object syndrome/i);
    expect(operating!.text).not.toMatch(/You have/i);
    expect(observations.some((o) => o.source === "shiny_object_syndrome")).toBe(false);
  });

  it("returns 3–7 ranked observations with evidence", () => {
    seedHistory();
    const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"));
    expect(observations.length).toBeGreaterThanOrEqual(3);
    expect(observations.length).toBeLessThanOrEqual(7);
    expect(observations[0]!.score).toBeGreaterThanOrEqual(observations.at(-1)!.score);
    expect(observations.every((o) => o.text.length > 20)).toBe(true);
    expect(observations.some((o) => o.evidence)).toBe(true);
  });

  it("prioritizes decision observations for decision-pattern questions", () => {
    seedHistory();
    const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"), {
      userText: "What patterns have you noticed about how I make decisions?",
    });
    const top = observations[0]!;
    expect(
      top.category === "decision_making" ||
        /clarity|options|talking/i.test(top.text),
    ).toBe(true);
    expect(top.text).not.toMatch(/decision overload/i);
  });

  it("prioritizes novelty/completion observations for finishing question", () => {
    seedHistory();
    const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"), {
      userText: "Why do I keep building new things instead of finishing what I already started?",
    });
    const combined = observations.map((o) => o.text).join(" ");
    expect(combined).toMatch(/maintenance|creative phase|momentum|novelty|finishing/i);
    expect(combined).not.toMatch(/You have shiny object/i);
    expect(observations[0]!.source?.startsWith("os:")).toBe(true);
  });

  it("builds transformation narrative as change-over-time, not label summary", () => {
    seedHistory();
    const narrative = buildTransformationNarrative(new Date("2025-06-01T10:00:00.000Z"));
    expect(narrative).not.toMatch(/User improved/i);
    expect(narrative.length).toBeGreaterThan(40);
  });

  it("integrates observations into priority prompt block", () => {
    seedHistory();
    const block = buildRelationshipIntelligencePriorityBlock(
      "Why do I keep building new things instead of finishing what I already started?",
      new Date("2025-06-01T10:00:00.000Z"),
    );
    expect(block).toMatch(/Observed behaviors/i);
    expect(block).toMatch(/OBSERVATION/i);
    expect(block).toMatch(/maintenance|creative phase|momentum|Operating insight/i);
    expect(block).toMatch(/FAIL: "You have shiny object syndrome/i);
    expect(block).not.toMatch(/## Observed patterns \(cite these first\)/);
  });

  describe("P0.5 observation quality", () => {
    function assertCompanionObservation(text: string) {
      expect(isCompanionGradeObservation(text)).toBe(true);
      expect(containsRawSignalName(text)).toBe(false);
    }

    it("FAIL regression: never emits raw operating-manual labels", () => {
      seedHistory();
      const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"));
      for (const observation of observations) {
        assertCompanionObservation(observation.text);
        expect(observation.text).not.toMatch(/\bdecision compass\b/i);
        expect(observation.text).not.toMatch(/\bcontent creation\b/i);
        expect(observation.text).not.toMatch(/\bconversational clarity\b/i);
        expect(observation.text).not.toMatch(/\bcontent creation\.\s*$/i);
      }
    });

    it("PASS: decision signals read like companion language", () => {
      seedHistory();
      const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"), {
        userText: "What patterns have you noticed about how I make decisions?",
      });
      const decisionObs = observations.filter((o) => o.category === "decision_making");
      expect(decisionObs.length).toBeGreaterThan(0);
      for (const observation of decisionObs) {
        assertCompanionObservation(observation.text);
        expect(observation.text).toMatch(/you|your/i);
      }
      expect(decisionObs.some((o) => /talk|visual|options|narrow/i.test(o.text))).toBe(
        true,
      );
    });

    it("PASS: momentum signals are behavioral, not activity labels", () => {
      seedHistory();
      const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"));
      const momentumObs = observations.filter((o) => o.source === "momentum");
      if (momentumObs.length) {
        for (const observation of momentumObs) {
          assertCompanionObservation(observation.text);
        }
      } else {
        expect(
          observations.some((o) => /ideas|momentum|conversation|priorities/i.test(o.text)),
        ).toBe(true);
      }
    });

    it("samples top observation outputs for QA review", () => {
      seedHistory();
      const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"));
      const top = observations.slice(0, 20);
      expect(top.length).toBeGreaterThanOrEqual(3);
      for (const observation of top) {
        assertCompanionObservation(observation.text);
      }
      expect(top.map((o) => o.text).join("\n")).not.toMatch(
        /\bdecision compass\b|\bcontent creation\b|\bconversational clarity\b/i,
      );
    });
  });

  describe("response quality examples", () => {
    it("PASS: decision question uses observed behavior language", () => {
      seedHistory();
      const formatted = formatObservationsForPrompt(
        buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"), {
          userText: "What patterns have you noticed about how I make decisions?",
        }),
      );
      expect(formatted).toMatch(/clarity|options|talking|visual/i);
      expect(formatted).not.toMatch(/You have decision overload/i);
      expect(formatted).not.toMatch(/\[decision making\]/i);
    });

    it("PASS: finishing question uses tension language, not syndrome label", () => {
      seedHistory();
      const formatted = formatObservationsForPrompt(
        buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"), {
          userText: "Why do I keep building new things instead of finishing?",
        }),
      );
      expect(formatted).toMatch(/energy|unfinished|ready|finishing/i);
      const behavioralSection = formatted.split("\n").slice(0, 4).join("\n");
      expect(behavioralSection).not.toMatch(/shiny object syndrome/i);
    });
  });
});
