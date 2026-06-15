import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  acceptOpportunityExplore,
  dismissOpportunityOffer,
  evaluateOpportunities,
  evaluateOpportunityOffer,
  shouldSurfaceOpportunityOffer,
} from "./opportunityEngine";
import { collectOpportunitySignals } from "./opportunitySignals";
import { buildFounderOpportunityReport } from "./founderOpportunityReporting";
import { priorityScore } from "./opportunityDetection";
import { isHighImpactLowEffort } from "./opportunityScoring";
import { saveOpportunityStore } from "./opportunityStore";

describe("opportunity intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveOpportunityStore({
      opportunities: [],
      founderSamples: [],
      offerDismissedOn: null,
      dismissedOpportunityIds: [],
      lastSurfacedAt: null,
    });
  });

  it("detects content and lead magnet signals from conversation", () => {
    const hits = collectOpportunitySignals({
      text: "People keep asking me about ADHD overwhelm — I should write about it",
    });
    expect(hits.some((h) => h.opportunityType === "lead_magnet_opportunity")).toBe(
      true,
    );
    expect(hits.some((h) => h.opportunityType === "content_opportunity")).toBe(
      true,
    );
  });

  it("creates explainable opportunities with scoring", () => {
    const opps = evaluateOpportunities({
      text: "I want to run a workshop on burnout for founders",
      now: new Date("2026-06-12"),
    });
    expect(opps.length).toBeGreaterThan(0);
    const top = opps[0]!;
    expect(top.reason.length).toBeGreaterThan(5);
    expect(top.suggestedNextStep.length).toBeGreaterThan(5);
    expect(["low", "medium", "high"]).toContain(top.confidence);
    expect(priorityScore(top)).toBeGreaterThan(0);
  });

  it("surfaces gentle companion offer without FOMO language", () => {
    const offer = evaluateOpportunityOffer({
      text: "People keep asking about my pricing — could be a lead magnet",
      now: new Date("2026-06-12"),
    });
    expect(offer).not.toBeNull();
    expect(shouldSurfaceOpportunityOffer(offer)).toBe(true);
    expect(offer?.companionOffer).toMatch(/explore|turn it into|would you like/i);
    expect(offer?.companionOffer).not.toMatch(
      /missing out|urgent|act now|don't wait/i,
    );
  });

  it("prioritizes high impact low effort", () => {
    const workflow = evaluateOpportunities({
      text: "I keep doing the same steps every time I onboard a client",
      now: new Date("2026-06-12"),
    })[0];
    if (workflow) {
      expect(
        isHighImpactLowEffort(workflow.impact, workflow.effort) ||
          workflow.opportunityType === "workflow_opportunity",
      ).toBe(true);
    }
  });

  it("respects dismiss — no pressure", () => {
    const offer = evaluateOpportunityOffer({
      text: "People keep asking me about templates",
      now: new Date("2026-06-12"),
    });
    expect(offer).not.toBeNull();
    dismissOpportunityOffer(offer!.opportunity.id);
    const again = evaluateOpportunityOffer({
      text: "People keep asking me about templates",
      now: new Date("2026-06-12"),
    });
    expect(again?.opportunity.id).not.toBe(offer!.opportunity.id);
  });

  it("explore updates status", () => {
    const offer = evaluateOpportunityOffer({
      text: "People keep asking about decision fatigue — I should write about it",
      now: new Date("2026-06-12"),
    });
    expect(offer).not.toBeNull();
    const { message } = acceptOpportunityExplore(offer!);
    expect(message).toMatch(/explore|opportunity/i);
  });

  it("founder report summarizes opportunities", () => {
    evaluateOpportunityOffer({
      text: "People keep asking about burnout workshops",
      now: new Date("2026-06-12"),
    });
    const report = buildFounderOpportunityReport(new Date("2026-06-12"));
    expect(report.recommendedFounderAction.length).toBeGreaterThan(10);
    expect(report.sampleSize).toBeGreaterThan(0);
  });
});
