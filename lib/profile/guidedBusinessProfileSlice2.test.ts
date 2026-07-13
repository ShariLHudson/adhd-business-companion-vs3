/**
 * Guided Business Profile — Slice 2 tests
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";
import {
  getGuidedFieldDef,
  isSlice1GuidedField,
  listGuidedFieldDefs,
} from "@/lib/profile/guidedFieldRegistry";
import { SLICE2_GUIDED_FIELDS } from "@/lib/profile/guidedFieldRegistrySlice2";
import {
  buildBusinessEstateFieldHelpContext,
  formatGuidedFieldHelpPrompt,
  requestGuidedFieldHelp,
  readPendingGuidedFieldHelp,
  clearPendingGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import {
  readSessionConfidence,
  writeSessionConfidence,
} from "@/lib/profile/guidedFieldTypes";

describe("Guided Business Profile Slice 2", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearPendingGuidedFieldHelp();
  });

  it("registers Motivation, Return Plan, Decision Style, and Work Preferences", () => {
    const keys = SLICE2_GUIDED_FIELDS.map((d) => d.fieldKey);
    expect(keys).toContain("whyBusinessMatters");
    expect(keys).toContain("whatInspiredYou");
    expect(keys).toContain("hopedImpact");
    expect(keys).toContain("whatHelpsYouContinue");
    expect(keys).toContain("overwhelmTriggers");
    expect(keys).toContain("restartHelpers");
    expect(keys).toContain("returnSupportTone");
    expect(keys).toContain("shariShouldAvoid");
    expect(keys).toContain("returnOfferPreferences");
    expect(keys).toContain("decisionStyle");
    expect(keys).toContain("preferredTimeOfDay");
    expect(keys).toContain("collaborationPreference");
    expect(listGuidedFieldDefs("work-style").length).toBeGreaterThan(0);
  });

  it("does not alter Slice 1 mission definition", () => {
    const mission = getGuidedFieldDef("identity", "mission")!;
    expect(mission.question).toBe("What is your business here to do?");
    expect(isSlice1GuidedField("mission")).toBe(true);
  });

  it("Motivation fields use field-specific How this helps Shari copy", () => {
    const why = getGuidedFieldDef("identity", "whyBusinessMatters")!;
    expect(why.howThisHelpsShari).toMatch(/difficult periods/i);
    expect(why.enableHelpMeDevelop).toBe(true);
    expect(why.examples!.length).toBeGreaterThan(0);
  });

  it("Return Plan reuses restart-related work-style fields", () => {
    const restart = getGuidedFieldDef("work-style", "restartHelpers")!;
    const overwhelm = getGuidedFieldDef("work-style", "overwhelmTriggers")!;
    expect(restart.question).toMatch(/smallest action/i);
    expect(overwhelm.question).toMatch(/returning difficult/i);
    expect(restart.howThisHelpsShari).toMatch(/restart/i);
    saveBusinessEstateSection("work-style", {
      restartHelpers: "One tiny task",
      overwhelmTriggers: "Overwhelm",
      returnOfferPreferences: "Summary, Quiet support",
      returnSupportTone: "Calm",
    });
    const env = getBusinessEstateEnvelope();
    expect(env.sections.workStyle.restartHelpers).toBe("One tiny task");
    expect(env.sections.workStyle.returnOfferPreferences).toContain("Summary");
  });

  it("Decision Style allows multi-select storage and does not auto-route", () => {
    const decision = getGuidedFieldDef("work-style", "decisionStyle")!;
    expect(decision.inputType).toBe("multi_select");
    expect(decision.howThisHelpsShari).toMatch(/Cartography|Chamber|Boardroom/i);
    expect(decision.distinctionNote).toMatch(/never automatic|You always choose/i);
    saveBusinessEstateSection("work-style", {
      decisionStyle: "Talk it through, Visual map",
    });
    expect(getBusinessEstateEnvelope().sections.workStyle.decisionStyle).toBe(
      "Talk it through, Visual map",
    );
  });

  it("Work Preferences save structured choices without wiping Slice 1 identity", () => {
    saveBusinessEstateSection("identity", {
      mission: "Help makers stay calm",
      businessStage: "Growing",
      coreValues: "Integrity",
    });
    saveBusinessEstateSection("work-style", {
      preferredTimeOfDay: "Morning",
      preferredSessionLength: "30 minutes",
      soundPreference: "Quiet",
      structurePreference: "Flexible",
      thinkingOrderPreference: "Big picture first",
      collaborationPreference: "Mixed",
    });
    const env = getBusinessEstateEnvelope();
    expect(env.sections.identity.mission).toBe("Help makers stay calm");
    expect(env.sections.identity.businessStage).toBe("Growing");
    expect(env.sections.workStyle.preferredTimeOfDay).toBe("Morning");
    expect(env.sections.workStyle.collaborationPreference).toBe("Mixed");
  });

  it("Guided help passes motivation context without saving drafts", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Harbor Studio",
      whyBusinessMatters: "It gives people steadier company",
      mission: "Help makers",
    });
    const ctx = buildBusinessEstateFieldHelpContext({
      sectionId: "identity",
      fieldKey: "hopedImpact",
      helpMode: "help_me_develop",
      currentValue: "",
    });
    expect(ctx).toBeTruthy();
    expect(ctx!.approvedBusinessContext["identity.businessName"]).toBe(
      "Harbor Studio",
    );
    const prompt = formatGuidedFieldHelpPrompt(ctx!);
    expect(prompt).toContain("Do NOT save wording");
    requestGuidedFieldHelp(ctx!);
    expect(readPendingGuidedFieldHelp()?.fieldKey).toBe("hopedImpact");
    expect(getBusinessEstateEnvelope().sections.identity.hopedImpact).toBe("");
  });

  it("session confidence remains session-only", () => {
    writeSessionConfidence("work-style.decisionStyle", "mostly_confident");
    expect(readSessionConfidence("work-style.decisionStyle")).toBe(
      "mostly_confident",
    );
    saveBusinessEstateSection("work-style", { decisionStyle: "Sleep on it" });
    const raw = localStorage.getItem("companion-business-profile-v1")!;
    expect(raw).not.toContain("mostly_confident");
  });

  it("cancel path leaves storage unchanged when section is not saved", () => {
    saveBusinessEstateSection("identity", {
      whatInspiredYou: "Personal experience",
    });
    expect(getBusinessEstateEnvelope().sections.identity.whatInspiredYou).toBe(
      "Personal experience",
    );
  });
});
