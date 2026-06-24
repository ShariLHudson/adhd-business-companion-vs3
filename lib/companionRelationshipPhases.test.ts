import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetPhase1OnboardingForTests } from "./phase1Onboarding";
import { resetPhase2DiscoveryForTests } from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import {
  getCurrentRelationshipPhase,
  RELATIONSHIP_PHASES,
} from "./companionRelationshipPhases";

describe("companionRelationshipPhases", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
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
  });

  it("registers all ten relationship phases", () => {
    expect(RELATIONSHIP_PHASES).toHaveLength(10);
    expect(RELATIONSHIP_PHASES[4]?.name).toBe("Companion Intelligence Ecosystem");
    expect(RELATIONSHIP_PHASES[4]?.status).toBe("active");
  });

  it("starts at phase 1 before onboarding completes", () => {
    expect(getCurrentRelationshipPhase().number).toBe(1);
  });
});
