/**
 * @vitest-environment jsdom
 *
 * First-pass Business Estate redesign — overview, recommendation, basics.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  BUSINESS_ESTATE_BROWSE_GROUPS,
  BUSINESS_ESTATE_OPTIONAL_REASSURANCE,
  IDENTITY_SECTION_DEFINITIONS,
  businessBasicsProgress,
  getEstateRecommendation,
  isBusinessBasicsComplete,
  readIdentityField,
  saveBusinessBasicsAnswer,
} from "@/lib/profile/businessEstateRedesign";
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";

describe("Business Estate redesign first slice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps one calm grow-with-you reassurance", () => {
    expect(BUSINESS_ESTATE_OPTIONAL_REASSURANCE).toMatch(/grows with you/i);
    expect(BUSINESS_ESTATE_OPTIONAL_REASSURANCE).toMatch(
      /nothing here has to be completed all at once/i,
    );
    expect(BUSINESS_ESTATE_OPTIONAL_REASSURANCE).not.toMatch(/must complete/i);
    expect(BUSINESS_ESTATE_OPTIONAL_REASSURANCE).not.toMatch(/finish onboarding/i);
  });

  it("defines three browse groups collapsed by default in UI contract", () => {
    expect(BUSINESS_ESTATE_BROWSE_GROUPS).toHaveLength(3);
    expect(BUSINESS_ESTATE_BROWSE_GROUPS.map((g) => g.id)).toEqual([
      "understand",
      "guide",
      "keep-moving",
    ]);
    const understand = BUSINESS_ESTATE_BROWSE_GROUPS.find(
      (g) => g.id === "understand",
    );
    expect(understand?.entries.map((e) => e.id)).toEqual([
      "identity",
      "people-i-help",
      "offers",
      "brand",
    ]);
    const keepMoving = BUSINESS_ESTATE_BROWSE_GROUPS.find(
      (g) => g.id === "keep-moving",
    );
    expect(keepMoving?.entries).toHaveLength(1);
    expect(keepMoving?.entries[0]?.kind).toBe("coming-soon");
    // Main screen must not flatten every subsection — groups hold rooms only
    for (const group of BUSINESS_ESTATE_BROWSE_GROUPS) {
      expect(group.entries.length).toBeGreaterThan(0);
      expect(group.description.length).toBeGreaterThan(10);
    }
  });

  it("recommends Business Basics first for a new user", () => {
    const rec = getEstateRecommendation();
    expect(rec.id).toBe("business-basics");
    expect(rec.primaryLabel).toMatch(/Start Business Basics/i);
  });

  it("skips Business Basics once complete and recommends People I Help next", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Lantern Studio",
      shortDescription: "Helps founders feel clear.",
      businessStage: "Growing",
    });
    expect(isBusinessBasicsComplete()).toBe(true);
    const rec = getEstateRecommendation();
    expect(rec.id).toBe("people-i-help-overview");
    expect(rec.target.kind).toBe("people-i-help");
    expect(rec.primaryLabel).toMatch(/Open People I Help/i);
  });

  it("uses Continue wording when Business Basics is in progress", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Harbor Co",
    });
    const rec = getEstateRecommendation();
    expect(rec.id).toBe("business-basics");
    expect(rec.primaryLabel).toMatch(/Continue Business Basics/i);
  });

  it("defines Identity sections with only Business Basics implemented", () => {
    const basics = IDENTITY_SECTION_DEFINITIONS.find(
      (s) => s.id === "business-basics",
    );
    expect(basics?.implemented).toBe(true);
    expect(
      IDENTITY_SECTION_DEFINITIONS.filter((s) => s.implemented),
    ).toHaveLength(1);
  });

  it("preserves existing Business Basics answers through save helpers", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Keep Me",
      shortDescription: "Original description",
      businessStage: "Idea",
      mission: "Do not erase",
    });
    saveBusinessBasicsAnswer("businessName", "Keep Me Updated");
    expect(readIdentityField("businessName")).toBe("Keep Me Updated");
    expect(readIdentityField("shortDescription")).toBe("Original description");
    expect(getBusinessEstateEnvelope().sections.identity.mission).toBe(
      "Do not erase",
    );
  });

  it("tracks Business Basics progress and resume index", () => {
    expect(businessBasicsProgress()).toEqual({
      answered: 0,
      total: 3,
      nextIndex: 0,
      complete: false,
    });
    saveBusinessBasicsAnswer("businessName", "A");
    saveBusinessBasicsAnswer("shortDescription", "B");
    const mid = businessBasicsProgress();
    expect(mid.answered).toBe(2);
    expect(mid.nextIndex).toBe(2);
    expect(mid.complete).toBe(false);
    saveBusinessBasicsAnswer("businessStage", "Growing");
    expect(isBusinessBasicsComplete()).toBe(true);
  });

  it("does not delete Client Avatar storage when saving estate", () => {
    localStorage.setItem(
      "companion-ideal-clients-v1",
      JSON.stringify([{ id: "avatar-1", name: "Alex", who: "Founders" }]),
    );
    saveBusinessBasicsAnswer("businessName", "Estate Save");
    const raw = localStorage.getItem("companion-ideal-clients-v1");
    expect(raw).toContain("avatar-1");
    expect(raw).toContain("Alex");
  });
});
