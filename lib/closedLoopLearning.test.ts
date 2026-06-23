import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  attributeOutcomeToIntervention,
  buildCompanionEffectivenessDashboard,
  captureBehaviorEvent,
  getAdaptiveRecommendationWeights,
  getBehaviorEvents,
  getInterventionAttributions,
  recordBusinessOutcome,
  resetClosedLoopLearningForTests,
} from "./closedLoopLearning";
import {
  getUserInterventionEffectiveness,
  resetInterventionLearningForTests,
} from "./companionInterventionLearning";
import { resetEffectivenessForTests } from "./companionEffectiveness";

describe("closedLoopLearning", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetClosedLoopLearningForTests();
    resetInterventionLearningForTests();
    resetEffectivenessForTests();
  });

  it("emits behavior events through the offer lifecycle", () => {
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "offer_shown",
      context: { userState: "overwhelmed", actualNeed: "mental_clarity" },
    });
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "offer_accepted",
      context: { userState: "overwhelmed" },
    });
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "workspace_opened",
      context: { routingReason: "workspace_offer" },
    });
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "workspace_used",
      metadata: { action: "entered_thoughts" },
    });
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "workspace_completed",
    });

    const events = getBehaviorEvents();
    expect(events).toHaveLength(5);
    expect(events.map((e) => e.eventType)).toEqual([
      "workspace_completed",
      "workspace_used",
      "workspace_opened",
      "offer_accepted",
      "offer_shown",
    ]);
    expect(events.find((e) => e.eventType === "offer_accepted")?.timeToAcceptMs).toBeTypeOf(
      "number",
    );
  });

  it("records dismissal as valuable negative signal", () => {
    captureBehaviorEvent({
      capability: "decision_compass",
      eventType: "offer_shown",
      context: { userState: "unclear" },
    });
    captureBehaviorEvent({
      capability: "decision_compass",
      eventType: "offer_dismissed",
      context: { userState: "unclear" },
    });

    const entries = getUserInterventionEffectiveness();
    const compass = entries.find((e) => e.id === "decision_compass");
    expect(compass?.counts.recommended).toBe(1);
    expect(compass?.counts.dismissed).toBe(1);
  });

  it("attributes outcomes to prior interventions", () => {
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "offer_shown",
      context: { userState: "overwhelmed" },
    });
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "workspace_opened",
    });
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "workspace_completed",
    });

    const attribution = attributeOutcomeToIntervention({
      outcomeEventId: "outcome-1",
      outcomeCategory: "momentum",
      capabilityHint: "clear_my_mind",
      momentumImproved: true,
      confidenceImproved: true,
    });

    expect(attribution).not.toBeNull();
    expect(attribution!.interventionId).toBe("clear_my_mind");
    expect(attribution!.contributionScore).toBeGreaterThanOrEqual(75);
    expect(getInterventionAttributions()).toHaveLength(1);
  });

  it("records business outcomes with intervention attribution", () => {
    captureBehaviorEvent({
      capability: "create_workspace",
      eventType: "offer_shown",
    });
    captureBehaviorEvent({
      capability: "create_workspace",
      eventType: "workspace_opened",
    });

    recordBusinessOutcome({
      businessType: "post_published",
      label: "Published LinkedIn post",
      capabilityHint: "create_workspace",
      momentumImproved: true,
    });

    const events = getBehaviorEvents();
    expect(events.some((e) => e.eventType === "outcome_recorded")).toBe(true);
    expect(getInterventionAttributions().length).toBeGreaterThan(0);
  });

  it("updates adaptive weights from real behavior evidence", () => {
    for (let i = 0; i < 5; i++) {
      captureBehaviorEvent({
        capability: "clear_my_mind",
        eventType: "offer_shown",
        context: { userState: "overwhelmed" },
      });
      captureBehaviorEvent({
        capability: "clear_my_mind",
        eventType: "offer_accepted",
      });
      captureBehaviorEvent({
        capability: "clear_my_mind",
        eventType: "workspace_completed",
      });
    }

    for (let i = 0; i < 5; i++) {
      captureBehaviorEvent({
        capability: "decision_compass",
        eventType: "offer_shown",
      });
      captureBehaviorEvent({
        capability: "decision_compass",
        eventType: "offer_dismissed",
      });
    }

    const weights = getAdaptiveRecommendationWeights();
    expect(weights.clear_my_mind).toBeGreaterThan(weights.decision_compass ?? 0);
  });

  it("builds founder effectiveness dashboard summaries", () => {
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "offer_shown",
    });
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "offer_accepted",
    });
    captureBehaviorEvent({
      capability: "clear_my_mind",
      eventType: "workspace_completed",
    });
    captureBehaviorEvent({
      capability: "decision_compass",
      eventType: "offer_shown",
    });
    captureBehaviorEvent({
      capability: "decision_compass",
      eventType: "offer_dismissed",
    });

    const dashboard = buildCompanionEffectivenessDashboard();
    expect(dashboard.totalEvents).toBe(5);
    expect(dashboard.topInterventions.length).toBeGreaterThan(0);
    expect(dashboard.acceptanceRates.clear_my_mind).toBeGreaterThan(
      dashboard.acceptanceRates.decision_compass ?? 0,
    );
    expect(dashboard.recentEvents.length).toBeGreaterThan(0);
  });
});
