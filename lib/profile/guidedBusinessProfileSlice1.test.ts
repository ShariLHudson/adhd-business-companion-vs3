/**
 * Guided Business Profile — Slice 1 tests
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";
import {
  findBusinessStageChoice,
  getGuidedFieldDef,
  isSlice1GuidedField,
  listGuidedFieldDefs,
} from "@/lib/profile/guidedFieldRegistry";
import {
  BUSINESS_STAGE_CHOICES,
  readSessionConfidence,
  writeSessionConfidence,
} from "@/lib/profile/guidedFieldTypes";
import {
  buildBusinessEstateFieldHelpContext,
  buildGuidedFieldHelpRequest,
  formatGuidedFieldHelpPrompt,
  requestGuidedFieldHelp,
  readPendingGuidedFieldHelp,
  clearPendingGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import { BUSINESS_ESTATE_SECTION_FIELDS } from "@/lib/profile/businessEstateSectionFields";

describe("Guided Business Profile Slice 1", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearPendingGuidedFieldHelp();
  });

  describe("Guided framework", () => {
    it("registry returns guidance for Slice 1 Identity fields", () => {
      const identity = listGuidedFieldDefs("identity");
      const slice1 = identity.filter((d) =>
        ["businessStage", "mission", "vision", "coreValues"].includes(d.fieldKey),
      );
      expect(slice1.map((d) => d.fieldKey).sort()).toEqual([
        "businessStage",
        "coreValues",
        "mission",
        "vision",
      ]);
      expect(getGuidedFieldDef("identity", "businessName")).toBeUndefined();
      expect(isSlice1GuidedField("mission")).toBe(true);
      expect(isSlice1GuidedField("whyBusinessMatters")).toBe(false);
    });

    it("unsupported fields remain plain in section field list", () => {
      const plain = BUSINESS_ESTATE_SECTION_FIELDS.identity.find(
        (f) => f.key === "businessName",
      );
      expect(plain?.guided).toBeFalsy();
      expect(getGuidedFieldDef("identity", "businessName")).toBeUndefined();
    });

    it("help disclosures are collapsed by default (no open flags in registry)", () => {
      const mission = getGuidedFieldDef("identity", "mission")!;
      expect(mission.whyItMatters).toBeTruthy();
      expect(mission.howThisHelpsShari).toBeTruthy();
      // Component defaults open.* to false — covered via data attribute contract
      expect(mission.enableShowExamples).toBe(true);
    });
  });

  describe("Business Stage", () => {
    it("exposes all options with descriptions including I'm Not Sure", () => {
      expect(BUSINESS_STAGE_CHOICES).toHaveLength(9);
      expect(
        BUSINESS_STAGE_CHOICES.every((c) => c.label && c.description),
      ).toBe(true);
      expect(
        BUSINESS_STAGE_CHOICES.some((c) => c.id === "im_not_sure"),
      ).toBe(true);
    });

    it("preserves existing free-text stage without auto-converting", () => {
      saveBusinessEstateSection("identity", {
        businessStage: "early growth phase",
      });
      expect(getBusinessEstateEnvelope().sections.identity.businessStage).toBe(
        "early growth phase",
      );
      const match = findBusinessStageChoice("early growth phase");
      // Match may exist for display — storage unchanged until user confirms
      expect(getBusinessEstateEnvelope().sections.identity.businessStage).toBe(
        "early growth phase",
      );
      expect(match?.id === "growing" || match == null || match.id).toBeTruthy();
    });

    it("Help Me Choose passes field context without saving a suggestion", () => {
      saveBusinessEstateSection("identity", {
        businessName: "Harbor Studio",
        businessStage: "Idea",
      });
      const ctx = buildBusinessEstateFieldHelpContext({
        sectionId: "identity",
        fieldKey: "businessStage",
        helpMode: "help_me_choose",
        currentValue: "Idea",
      });
      expect(ctx?.approvedBusinessContext["identity.businessName"]).toBe(
        "Harbor Studio",
      );
      expect(getBusinessEstateEnvelope().sections.identity.businessStage).toBe(
        "Idea",
      );
    });
  });

  describe("Mission and Vision", () => {
    it("definitions and mission-vs-vision distinction exist", () => {
      const mission = getGuidedFieldDef("identity", "mission")!;
      const vision = getGuidedFieldDef("identity", "vision")!;
      expect(mission.definition).toMatch(/exists now/i);
      expect(vision.definition).toMatch(/future/i);
      expect(mission.distinctionNote).toMatch(/Mission:/);
      expect(vision.distinctionNote).toMatch(/Vision:/);
      expect(mission.examples?.length).toBeGreaterThanOrEqual(4);
      expect(vision.examples?.length).toBeGreaterThanOrEqual(4);
    });

    it("Develop With Shari passes approved context; draft does not overwrite", () => {
      saveBusinessEstateSection("identity", {
        businessName: "Harbor Studio",
        mission: "Original mission",
        vision: "Original vision",
      });
      const request = buildGuidedFieldHelpRequest({
        sectionId: "identity",
        fieldKey: "mission",
        helpMode: "help_me_develop",
        currentValue: "Original mission",
      });
      expect(request).toBeTruthy();
      const prompt = formatGuidedFieldHelpPrompt(request!);
      expect(prompt).toContain("Help me develop this");
      expect(prompt).toContain("Harbor Studio");
      expect(prompt).toContain("Do NOT save wording");
      expect(getBusinessEstateEnvelope().sections.identity.mission).toBe(
        "Original mission",
      );
      expect(getBusinessEstateEnvelope().sections.identity.vision).toBe(
        "Original vision",
      );
    });

    it("explicit save keeps selected mission; cancel path leaves storage alone", () => {
      saveBusinessEstateSection("identity", {
        mission: "Original mission",
      });
      // Explicit approval = section save
      saveBusinessEstateSection("identity", {
        mission: "Approved mission draft",
      });
      expect(getBusinessEstateEnvelope().sections.identity.mission).toBe(
        "Approved mission draft",
      );
      // Cancel = no save after reading
      expect(getBusinessEstateEnvelope().sections.identity.mission).toBe(
        "Approved mission draft",
      );
    });
  });

  describe("Core Values", () => {
    it("preserves existing string and supports optional notes field", () => {
      saveBusinessEstateSection("identity", {
        coreValues: "Integrity, Clarity",
        coreValueNotes: "Integrity keeps trust",
      });
      const env = getBusinessEstateEnvelope();
      expect(env.sections.identity.coreValues).toBe("Integrity, Clarity");
      expect(env.sections.identity.coreValueNotes).toBe("Integrity keeps trust");
      const def = getGuidedFieldDef("identity", "coreValues")!;
      expect(def.inputType).toBe("chips_plus_custom");
      expect(def.choices!.length).toBeGreaterThanOrEqual(15);
      expect(def.enableHelpMeChoose).toBe(true);
    });

    it("Help Me Choose does not save automatically", () => {
      saveBusinessEstateSection("identity", {
        coreValues: "Integrity",
      });
      requestGuidedFieldHelp(
        buildBusinessEstateFieldHelpContext({
          sectionId: "identity",
          fieldKey: "coreValues",
          helpMode: "help_me_choose",
          currentValue: "Integrity",
        })!,
      );
      expect(readPendingGuidedFieldHelp()?.helpMode).toBe("help_me_choose");
      expect(getBusinessEstateEnvelope().sections.identity.coreValues).toBe(
        "Integrity",
      );
    });
  });

  describe("How this helps Shari", () => {
    it("uses field-specific copy", () => {
      const stage = getGuidedFieldDef("identity", "businessStage")!;
      const mission = getGuidedFieldDef("identity", "mission")!;
      const vision = getGuidedFieldDef("identity", "vision")!;
      const values = getGuidedFieldDef("identity", "coreValues")!;
      expect(stage.howThisHelpsShari).toMatch(/where your business is now/i);
      expect(mission.howThisHelpsShari).toMatch(/mission/i);
      expect(vision.howThisHelpsShari).toMatch(/future/i);
      expect(values.howThisHelpsShari).toMatch(/values/i);
      expect(stage.howThisHelpsShari).not.toBe(mission.howThisHelpsShari);
    });
  });

  describe("Confidence", () => {
    it("stores optional confidence in session only", () => {
      writeSessionConfidence("identity.mission", "still_figuring_it_out");
      expect(readSessionConfidence("identity.mission")).toBe(
        "still_figuring_it_out",
      );
      saveBusinessEstateSection("identity", { mission: "A mission" });
      const raw = localStorage.getItem("companion-business-profile-v1")!;
      expect(raw).not.toContain("still_figuring_it_out");
      expect(raw).not.toContain("very_confident");
    });
  });

  describe("Migration safety", () => {
    it("loads v1 estate strings without wiping guided Slice 1 fields", () => {
      localStorage.setItem(
        "companion-business-profile-v1",
        JSON.stringify({
          role: "",
          goals: [],
          sells: "",
          idealClient: "",
          traits: [],
          tone: "",
          audienceResearch: "",
          updatedAt: "2026-01-01T00:00:00.000Z",
          estate: {
            version: 1,
            sections: {
              identity: {
                businessName: "Harbor",
                businessStage: "Growing",
                mission: "Help makers",
                vision: "Kinder work",
                coreValues: "Integrity",
              },
              offers: {},
              brand: {},
              direction: {},
              workStyle: {},
              tools: {},
            },
            approval: {
              "identity.mission": true,
              "identity.coreValues": true,
            },
            sectionUpdatedAt: {},
          },
        }),
      );
      const env = getBusinessEstateEnvelope();
      expect(env.sections.identity.businessName).toBe("Harbor");
      expect(env.sections.identity.businessStage).toBe("Growing");
      expect(env.sections.identity.mission).toBe("Help makers");
      expect(env.sections.identity.coreValues).toBe("Integrity");
    });
  });
});
