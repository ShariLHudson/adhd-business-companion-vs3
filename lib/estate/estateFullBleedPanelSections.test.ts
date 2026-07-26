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

  it("includes Destination Gallery as full-bleed immersive room", () => {
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("destination-gallery");
    expect(isEstateFullBleedPanelSection("destination-gallery")).toBe(true);
  });

  it("includes Round Table Boardroom as full-bleed", () => {
    expect(isEstateFullBleedPanelSection("boardroom")).toBe(true);
  });

  it("includes Strategy Library (playbook) as full-bleed estate destination", () => {
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("playbook");
    expect(isEstateFullBleedPanelSection("playbook")).toBe(true);
  });

  it("includes Create estate entrance as full-bleed", () => {
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("create");
    expect(isEstateFullBleedPanelSection("create")).toBe(true);
  });

  it("includes Client Avatar room as full-bleed so it owns the viewport", () => {
    // Contextual Workspace pattern: the room fills the full height instead of
    // sitting inside the max-w-3xl white/80 companion-panel-surface (gray block).
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("client-avatars");
    expect(isEstateFullBleedPanelSection("client-avatars")).toBe(true);
  });

  it("does not treat generic home as full-bleed", () => {
    expect(isEstateFullBleedPanelSection("home")).toBe(false);
  });
});

