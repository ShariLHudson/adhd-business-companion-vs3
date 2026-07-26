/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getBusinessEstateSections,
  saveBusinessEstateSection,
  hasStartedBusinessProfile,
} from "./businessEstateProfile";

describe("Business Profile foundation fields (Phase B)", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it("persists the new business image + pricing/revenue fields on the estate envelope", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Rivera Studio",
      businessImage: "data:image/webp;base64,LOGO",
    });
    saveBusinessEstateSection("offers", {
      pricing: "$2k packages",
      revenueSources: "Retainers + workshops",
    });
    const s = getBusinessEstateSections();
    expect(s.identity.businessImage).toBe("data:image/webp;base64,LOGO");
    expect(s.identity.businessName).toBe("Rivera Studio");
    expect(s.offers.pricing).toBe("$2k packages");
    expect(s.offers.revenueSources).toBe("Retainers + workshops");
  });

  it("hasStartedBusinessProfile reflects estate content", () => {
    expect(hasStartedBusinessProfile()).toBe(false);
    saveBusinessEstateSection("identity", { businessName: "Rivera Studio" });
    expect(hasStartedBusinessProfile()).toBe(true);
  });

  it("saving one section does not clobber another (single-store, no duplication)", () => {
    saveBusinessEstateSection("identity", { businessName: "Rivera Studio" });
    saveBusinessEstateSection("offers", { mainOffer: "Coaching" });
    const s = getBusinessEstateSections();
    expect(s.identity.businessName).toBe("Rivera Studio");
    expect(s.offers.mainOffer).toBe("Coaching");
  });
});
