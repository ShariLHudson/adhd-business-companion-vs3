import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProject } from "@/lib/companionStore";
import {
  buildSparkEstateIntelligenceRoutingCompanionHint,
  formatSparkEstateIntelligenceRoutingReport,
  resolveSparkEstateIntelligenceRoute,
  selectSparkEstateCard,
  SPARK_ESTATE_CLARIFY_QUESTION,
  SPARK_ESTATE_ROUTING_PRINCIPLE,
  SPARK_ESTATE_ROUTING_SUCCESS_TEST,
  SPARK_ESTATE_ROOM_INDEPENDENCE_RULE,
  verifySparkEstateIntelligenceRouting,
} from "./sparkEstateIntelligenceRoutingMap";

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
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
  });
}

describe("sparkEstateIntelligenceRoutingMap", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  it("defines primary routing paths from member language", () => {
    const verification = verifySparkEstateIntelligenceRouting();
    expect(SPARK_ESTATE_ROUTING_PRINCIPLE).toContain("One companion");
    expect(verification.primaryPaths).toEqual([
      "clear-mind",
      "move-forward",
      "learn",
      "create",
      "execute",
      "decide",
      "review",
    ]);
    expect(verification.routesResolve).toBe(true);
    expect(verification.clarifyBeforeRoom).toBe(true);
    expect(verification.energyAdaptation).toBe(true);
    expect(verification.roomIndependence).toBe(true);
    expect(SPARK_ESTATE_ROUTING_SUCCESS_TEST).toContain("understands");
  });

  it("routes clear mind, move forward, learn, create, execute, and decide", () => {
    expect(
      resolveSparkEstateIntelligenceRoute({ text: "I have too much in my head" })
        ?.section,
    ).toBe("brain-dump");
    expect(
      resolveSparkEstateIntelligenceRoute({ text: "I'm stuck on this" })?.need,
    ).toBe("move-forward");
    expect(
      resolveSparkEstateIntelligenceRoute({ text: "Teach me pricing" })?.section,
    ).toBe("momentum-institute");
    expect(
      resolveSparkEstateIntelligenceRoute({ text: "Help me write an email" })?.need,
    ).toBe("create");
    expect(
      resolveSparkEstateIntelligenceRoute({ text: "Help me finish my project" })
        ?.section,
    ).toBe("chamber-project-entry");
    expect(
      resolveSparkEstateIntelligenceRoute({ text: "I have two choices" })?.section,
    ).toBe("decision-compass");
  });

  it("asks a clarifying question instead of routing to a room", () => {
    const route = resolveSparkEstateIntelligenceRoute({
      text: "I need help with my business",
    });
    expect(route?.source).toBe("clarify");
    expect(route?.memberQuestion).toBe(SPARK_ESTATE_CLARIFY_QUESTION);
    expect(route?.section).toBeNull();
  });

  it("selects cards based on context and need", () => {
    expect(
      selectSparkEstateCard({ text: "I need to learn how this works" }),
    ).toBe("knowledge-card");

    saveProject({
      name: "Website",
      goal: "Launch site",
      nextAction: "Write homepage headline",
      status: "active-focus",
    });
    expect(selectSparkEstateCard()).toBe("project-card");
  });

  it("adapts low-energy move-forward routing toward smaller support", () => {
    const route = resolveSparkEstateIntelligenceRoute({
      text: "I'm tired and stuck",
    });
    expect(route?.energy).toBe("low");
    expect(route?.section).toBe("brain-dump");
  });

  it("routes from any room without locking to current location", () => {
    const route = resolveSparkEstateIntelligenceRoute({
      text: "I don't know where to start",
      currentSection: "content-generator",
    });
    expect(route?.need).toBe("move-forward");
    expect(route?.intelligence).toMatch(/momentum/i);
    expect(SPARK_ESTATE_ROOM_INDEPENDENCE_RULE).toContain("any room");
  });

  it("formats a readable routing report", () => {
    const report = formatSparkEstateIntelligenceRoutingReport();
    expect(report).toContain(SPARK_ESTATE_ROUTING_PRINCIPLE);
    expect(report).toContain("Primary paths");
    expect(report).toContain("Integration checks");
  });

  it("builds companion routing hints for clarify and create paths", () => {
    expect(
      buildSparkEstateIntelligenceRoutingCompanionHint({
        text: "I need help with my business",
      }),
    ).toContain(SPARK_ESTATE_CLARIFY_QUESTION);
    expect(
      buildSparkEstateIntelligenceRoutingCompanionHint({
        text: "Help me write an email",
      }),
    ).toContain("Universal Creation Journey");
  });
});
