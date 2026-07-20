import { beforeEach, describe, expect, it } from "vitest";
import { resolveCreateFastPathAction } from "@/lib/frictionlessActionLayer";
import {
  clearUniversalCreationSession,
  loadUniversalCreationSession,
  saveUniversalCreationSession,
} from "@/lib/universalCreation/orchestrator";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import {
  resolveCreateFoundationClassification,
  shouldRouteDirectlyToCreateFoundation,
} from "./createFoundationRouting";

describe("shouldRouteDirectlyToCreateFoundation", () => {
  beforeEach(() => {
    clearUniversalCreationSession();
  });

  it("routes Checklist phrases directly to Create Foundation", () => {
    for (const text of [
      "Client Onboarding Checklist",
      "create a client onboarding checklist",
      "I want a checklist for client onboarding",
    ]) {
      const c = resolveCreateFoundationClassification(text);
      expect(c.routeDirectlyToCreateFoundation).toBe(true);
      expect(c.classificationType).toBe("Checklist");
      expect(
        shouldRouteDirectlyToCreateFoundation({
          classificationType: c.classificationType,
          universalDocumentType: c.universalDocumentType,
          workingIntent: c.workingIntent,
        }),
      ).toBe(true);
    }
  });

  it("keeps email / sales funnel on pre-workspace UC discovery", () => {
    expect(
      resolveCreateFoundationClassification("write an email")
        .routeDirectlyToCreateFoundation,
    ).toBe(false);
    expect(
      resolveCreateFoundationClassification("I need to create a sales funnel")
        .routeDirectlyToCreateFoundation,
    ).toBe(false);
  });

  it("routes SOP and newsletter to Create Foundation (not UC discovery)", () => {
    expect(
      resolveCreateFoundationClassification("help me create an SOP")
        .routeDirectlyToCreateFoundation,
    ).toBe(true);
    expect(
      resolveCreateFoundationClassification("Create a newsletter")
        .routeDirectlyToCreateFoundation,
    ).toBe(true);
  });

  it("Path C — resolveCreateFastPathAction never starts UC for Checklist", () => {
    const decision = resolveCreateFastPathAction(
      {
        userText: "Client Onboarding Checklist",
        currentTurn: 1,
      },
      { learnFastPath: false } as never,
    );
    expect(decision).toBeNull();
    expect(loadUniversalCreationSession()).toBeNull();
  });

  it("Path A — stale checklist UC session cleared; Foundation gate refuses UC", () => {
    const stale: UniversalCreationSession = {
      documentType: "checklist",
      originalUserText: "create a checklist",
      startedAtTurn: 1,
      questionIndex: 1,
      answers: {},
      phase: "discovery",
      confidence: { what: false, why: false, who: false, success: false },
      preparationReady: false,
      pendingEnhancements: [],
    };
    saveUniversalCreationSession(stale);
    expect(loadUniversalCreationSession()?.documentType).toBe("checklist");
    const c = resolveCreateFoundationClassification(
      "Client Onboarding Checklist",
    );
    expect(c.routeDirectlyToCreateFoundation).toBe(true);
    const decision = resolveCreateFastPathAction(
      { userText: "Client Onboarding Checklist", currentTurn: 2 },
      { learnFastPath: false } as never,
    );
    expect(decision).toBeNull();
    expect(loadUniversalCreationSession()).toBeNull();
  });
});
