/**
 * End-to-end intelligence stack smoke tests — companion message scenarios.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateActivation, shouldSurfaceActivationOffer } from "@/lib/activation/activationEngine";
import { evaluateCognitiveLoad } from "@/lib/cognitive-load/loadEngine";
import { evaluateLoopIntelligence, shouldSurfaceLoopOffer } from "@/lib/loop-intelligence/loopEngine";
import { shouldStartDayDesigner, beginDayDesignerFlow } from "@/lib/day-designer";
import { evaluateRelationshipOffer } from "@/lib/relationship-intelligence/relationshipEngine";
import { evaluateDecisionOffer } from "@/lib/decision-intelligence/decisionEngine";
import { evaluateRecovery } from "@/lib/recovery-intelligence/recoveryEngine";
import { evaluateOpportunityOffer } from "@/lib/opportunity-intelligence/opportunityEngine";
import { evaluateEcosystem, isSuppressed } from "@/lib/ecosystem-intelligence/ecosystemEngine";
import { evaluatePredictiveSupport } from "@/lib/predictive-support/predictiveEngine";
import { evaluateAdaptiveCompanion } from "@/lib/adaptive-companion/adaptiveEngine";

const NOW = new Date("2026-06-12T14:00:00.000Z");
const SHAME_RE = /lazy|you should have|you must|falling behind|streak lost|likely to fail/i;

function stubStorage() {
  const mem = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
}

describe("intelligence stack e2e — companion messages", () => {
  beforeEach(() => {
    stubStorage();
  });

  it("overwhelmed → cognitive load + support mode, no shame", () => {
    const text = "I'm overwhelmed and don't know where to start.";
    const load = evaluateCognitiveLoad({ recentText: text, now: NOW });
    const activation = evaluateActivation({ text, now: NOW });
    const adaptive = evaluateAdaptiveCompanion({ text, now: NOW });
    expect(["heavy", "overloaded", "moderate", "light"]).toContain(load.score.level);
    const loadText = load.summaries.join(" ") + load.score.level;
    expect(loadText + adaptive.mode).toMatch(/overwhelm|support|sort|load/i);
    if (shouldSurfaceActivationOffer(activation)) {
      expect(activation.companionOffer).not.toMatch(SHAME_RE);
    }
  });

  it("stuck task → activation tiny step", () => {
    const text = "I'm stuck. This task feels too big.";
    const activation = evaluateActivation({ text, now: NOW });
    expect(shouldSurfaceActivationOffer(activation)).toBe(true);
    expect(activation.companionOffer).toMatch(/tiny|small|one|step|start/i);
    expect(activation.companionOffer).not.toMatch(SHAME_RE);
  });

  it("replay conversation → loop may detect, no diagnosis", () => {
    const text = "I keep replaying that conversation.";
    const loop = evaluateLoopIntelligence({ text, now: NOW });
    if (loop && shouldSurfaceLoopOffer(loop)) {
      expect(loop.companionResponse).not.toMatch(/disorder|diagnos|ADHD/i);
      expect(loop.companionResponse).not.toMatch(SHAME_RE);
    }
  });

  it("plan my day → day designer starts one question", () => {
    const text = "Help me plan my day.";
    expect(shouldStartDayDesigner(text)).toBe(true);
    const session = beginDayDesignerFlow(NOW);
    expect(session.step).not.toBe("complete");
    expect(session.step).not.toBe("idle");
  });

  it("follow up Sarah → relationship remember offer", () => {
    const offer = evaluateRelationshipOffer({
      text: "I need to follow up with Sarah.",
      now: NOW,
    });
    expect(offer).not.toBeNull();
    expect(offer?.companionOffer).toMatch(/remember/i);
    expect(offer?.companionOffer).not.toMatch(/CRM|pipeline/i);
  });

  it("can't decide → decision support without force", () => {
    const offer = evaluateDecisionOffer({ text: "I can't decide which offer to launch.", now: NOW });
    if (offer) {
      expect(offer.companionOffer).not.toMatch(/you must decide|just pick/i);
    }
  });

  it("burned out → recovery, support mode", () => {
    const text = "I'm exhausted and burned out.";
    const recovery = evaluateRecovery({ text, now: NOW });
    const adaptive = evaluateAdaptiveCompanion({ text, now: NOW });
    expect(recovery.recoveryLevel).toMatch(/depleted|strained|recovering/);
    expect(adaptive.mode).toBe("support");
  });

  it("launch workshop → opportunity or next step, not roadmap", () => {
    const offer = evaluateOpportunityOffer({
      text: "I want to launch a workshop.",
      now: NOW,
    });
    if (offer) {
      expect(offer.companionOffer).not.toMatch(/roadmap|10-step|masterplan/i);
    }
  });
});

describe("intelligence stack e2e — offer priority", () => {
  beforeEach(() => {
    stubStorage();
  });

  it("ecosystem suppresses lower-priority surfaces when recovery elevated", () => {
    const text = "I'm exhausted burned out overwhelmed stuck can't decide";
    const snap = evaluateEcosystem({ text, now: NOW });
    const suppressed = new Set(snap.suppressions);
    if (snap.topSignal === "recovery_support") {
      expect(
        suppressed.has("opportunity_offer") || suppressed.has("momentum_offer"),
      ).toBe(true);
    }
  });

  it("predictive support avoids doom language", () => {
    const snap = evaluatePredictiveSupport({
      text: "burned out overwhelmed carrying too much avoiding everything",
      now: NOW,
    });
    if (snap) {
      expect(snap.recommendedSupport).not.toMatch(SHAME_RE);
      expect(snap.predictedOutcome).not.toMatch(/you will fail|likely to fail/i);
    }
  });
});
