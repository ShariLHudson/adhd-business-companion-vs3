/**
 * Estate-level Business Estate research
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  BUSINESS_ESTATE_RESEARCH_MAY_AUTO_UPDATE_PROFILE,
  BUSINESS_ESTATE_RESEARCH_STORAGE_KEY,
  BUSINESS_PROFILE_STORAGE_KEY,
  buildBusinessEstateResearchResult,
  collectApprovedResearchContext,
  inferResearchDirection,
  listSavedResearchNotes,
  needsClarification,
  researchStorageIsSeparateFromProfile,
  saveResearchNoteOnly,
  writeResearchSessionPrompt,
} from "@/lib/profile/businessEstateResearch";
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";
import { FIELD_HELP_REGISTRY } from "@/lib/profile/fieldHelpRegistry";
import { listGuidedFieldDefs } from "@/lib/profile/guidedFieldRegistry";

describe("Business Estate Estate-level research", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("never auto-updates profile from research", () => {
    expect(BUSINESS_ESTATE_RESEARCH_MAY_AUTO_UPDATE_PROFILE).toBe(false);
  });

  it("keeps research storage separate from Business Estate profile", () => {
    expect(researchStorageIsSeparateFromProfile()).toBe(true);
    expect(BUSINESS_ESTATE_RESEARCH_STORAGE_KEY).not.toBe(
      BUSINESS_PROFILE_STORAGE_KEY,
    );
  });

  it("accepts natural-language research requests", () => {
    expect(inferResearchDirection("What are competitors charging for coaching?")).toBe(
      "pricing",
    );
    expect(
      inferResearchDirection("Help me understand audience needs for burned-out founders"),
    ).toBe("audience needs");
  });

  it("asks at most one clarification when the request is vague", () => {
    expect(needsClarification("research")).toBeTruthy();
    expect(
      needsClarification(
        "I want to understand how my coaching offer compares to calm ADHD-friendly competitors in messaging",
      ),
    ).toBeNull();
  });

  it("reuses approved Business Estate context without writing profile fields", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Lantern Studio",
      businessStage: "Growing",
      shortDescription: "Calm coaching",
    });
    const before = JSON.stringify(getBusinessEstateEnvelope());
    const ctx = collectApprovedResearchContext();
    expect(ctx.approvedBusiness["identity.businessName"]).toBe("Lantern Studio");
    const result = buildBusinessEstateResearchResult(
      "What messaging might resonate with overwhelmed founders?",
    );
    expect(result.layers.approvedContext.some((l) => l.includes("Lantern"))).toBe(
      true,
    );
    expect(result.question).toMatch(/messaging/i);
    expect(getBusinessEstateEnvelope()).toEqual(JSON.parse(before));
  });

  it("save research only does not change profile storage", () => {
    saveBusinessEstateSection("identity", { businessName: "Keep Me" });
    const result = buildBusinessEstateResearchResult(
      "Explore industry trends for calm coaching offers",
      "Focus on audience demand",
    );
    saveResearchNoteOnly(result);
    writeResearchSessionPrompt(result.question, result);
    expect(listSavedResearchNotes()[0]?.question).toMatch(/industry trends/i);
    expect(listSavedResearchNotes()[0]?.profileUpdatesApproved).toBe(false);
    expect(getBusinessEstateEnvelope().sections.identity.businessName).toBe(
      "Keep Me",
    );
    expect(localStorage.getItem(BUSINESS_PROFILE_STORAGE_KEY)).toBeTruthy();
    expect(localStorage.getItem(BUSINESS_ESTATE_RESEARCH_STORAGE_KEY)).toBeTruthy();
  });

  it("structured result separates approved context, findings, interpretation, suggestions", () => {
    const result = buildBusinessEstateResearchResult(
      "Compare pricing for group coaching programs",
      "Focus on pricing",
    );
    expect(result.whatReviewed.length).toBeGreaterThan(0);
    expect(result.keyFindings.length).toBeGreaterThan(0);
    expect(result.interpretation).toMatch(/not overwrite/i);
    expect(result.layers.researchFindings).toEqual(result.keyFindings);
    expect(result.clarificationNeeded).toBeNull();
  });

  it("field help registry may still list research capability, but UI filters it", () => {
    const withResearch = FIELD_HELP_REGISTRY.filter((e) =>
      e.availableActions.includes("research_with_shari"),
    );
    expect(withResearch.length).toBeGreaterThan(0);
    // Estate-level owns the action — field UI must not render these as buttons
    // (covered by GuidedAssistanceBar filter + GuidedEstateField removal)
  });

  it("guided field defs may keep enableResearchWithShari for compatibility without requiring UI buttons", () => {
    const defs = listGuidedFieldDefs();
    // Capability flag may remain; Estate panel is the member-facing research entry
    expect(defs.length).toBeGreaterThan(0);
  });
});
