// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { buildApprovedBusinessSnapshot } from "@/lib/profile/businessSnapshot";
import {
  getBusinessEstateEnvelope,
  looksLikeConversationalImport,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";

describe("businessSnapshot", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows calm empty state when no approved fields exist", () => {
    expect(buildApprovedBusinessSnapshot()).toContain(
      "ready to grow one section at a time",
    );
  });

  it("uses only approved saved section values", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Visual Spark Studios",
      roleTitle: "Creative studio owner",
      shortDescription: "Helps entrepreneurs build calm digital homes.",
    });
    saveBusinessEstateSection("offers", {
      mainOffer: "Spark Estate membership",
    });
    saveBusinessEstateSection("direction", {
      currentPriority: "Profile foundation",
      nextMilestone: "Founder review",
    });

    const snapshot = buildApprovedBusinessSnapshot();
    expect(snapshot).toContain("Visual Spark Studios");
    expect(snapshot).toContain("Spark Estate membership");
    expect(snapshot).toContain("Profile foundation");
    expect(snapshot).not.toContain("I keep putting off");
  });
});

describe("looksLikeConversationalImport", () => {
  it("flags long conversational answers", () => {
    expect(
      looksLikeConversationalImport(
        "I keep putting off my sales calls because I feel overwhelmed every morning.",
      ),
    ).toBe(true);
  });

  it("allows short preset-like values", () => {
    expect(looksLikeConversationalImport("Coach")).toBe(false);
  });
});

describe("businessEstateProfile migration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("marks imported legacy role text for review", () => {
    localStorage.setItem(
      "companion-business-profile-v1",
      JSON.stringify({
        role: "I am trying to figure out what my business should be.",
        sells: "test",
        goals: [],
        traits: [],
        tone: "",
        idealClient: "",
        audienceResearch: "",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    const envelope = getBusinessEstateEnvelope();
    expect(envelope.sections.identity.roleTitle).toContain("trying to figure");
    expect(envelope.approval["identity.roleTitle"]).toBe(false);
  });
});
