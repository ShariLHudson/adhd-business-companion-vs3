import { describe, expect, it } from "vitest";
import {
  consultBestCapability,
  consultEstateCapabilities,
  capabilityById,
} from "./consult";
import { recommendCapabilitiesForGoal } from "./goalRecommendations";
import { resolveEstateConcierge } from "./estateConcierge";
import { ESTATE_CAPABILITY_CATALOG } from "./catalog";

describe("estateCapabilityRegistry", () => {
  it("catalog is non-empty and includes SOP", () => {
    expect(ESTATE_CAPABILITY_CATALOG.length).toBeGreaterThan(40);
    const sop = capabilityById("create.sop");
    expect(sop?.name).toBe("SOP");
    expect(sop?.requiresDiscovery).toBe(true);
    expect(sop?.requiredRoomId).toBe("creative-studio");
    expect(sop?.relatedCapabilityIds).toContain("create.template");
  });

  it("consult finds SOP from natural language", () => {
    const matches = consultEstateCapabilities("Help me create an SOP");
    expect(matches[0]?.entry.id).toBe("create.sop");
  });

  it("consultBestCapability resolves newsletter", () => {
    expect(consultBestCapability("I need to write a newsletter")?.id).toBe(
      "create.newsletter",
    );
  });

  it("recommends 2–4 focus options for I need to focus", () => {
    const rec = recommendCapabilitiesForGoal("I need to focus");
    expect(rec).not.toBeNull();
    expect(rec!.options.length).toBeGreaterThanOrEqual(2);
    expect(rec!.options.length).toBeLessThanOrEqual(4);
    const names = rec!.options.map((o) => o.name);
    expect(names.some((n) => /time block|quiet music|clear my mind|breathing/i.test(n))).toBe(
      true,
    );
  });

  it("concierge recommends for focus without overwhelming", () => {
    const decision = resolveEstateConcierge({ userText: "I need to focus" });
    expect(decision?.kind).toBe("recommend");
    if (decision?.kind === "recommend") {
      expect(decision.options.length).toBeGreaterThanOrEqual(2);
      expect(decision.line).not.toMatch(/\*\*/);
    }
  });

  it("concierge routes single creation to discovery path", () => {
    const decision = resolveEstateConcierge({
      userText: "Help me create an SOP for onboarding",
    });
    expect(decision?.kind).toBe("single");
    if (decision?.kind === "single") {
      expect(decision.capability.id).toBe("create.sop");
      expect(decision.launchDiscovery).toBe(true);
    }
  });

  it("concierge handles direct navigation command", () => {
    const decision = resolveEstateConcierge({
      userText: "Take me to the Coffee House",
      isDirectCommand: true,
    });
    expect(decision?.kind).toBe("single");
    if (decision?.kind === "single") {
      expect(decision.capability.id).toBe("place.coffee-house");
    }
  });
});
