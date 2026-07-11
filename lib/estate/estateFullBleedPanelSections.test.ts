import { describe, expect, it } from "vitest";
import {
  ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS,
  isEstateFullBleedPanelSection,
} from "./estateFullBleedPanelSections";

describe("estateFullBleedPanelSections", () => {
  it("includes Chamber of Momentum as full-bleed", () => {
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("chamber-of-momentum");
    expect(isEstateFullBleedPanelSection("chamber-of-momentum")).toBe(true);
  });

  it("includes Cartographer's Studio route", () => {
    expect(isEstateFullBleedPanelSection("visual-focus")).toBe(true);
  });

  it("does not treat generic home as full-bleed", () => {
    expect(isEstateFullBleedPanelSection("home")).toBe(false);
  });
});
