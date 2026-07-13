/**
 * Staged Guidance framework tests
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  assertStagesWithinQuestionLimit,
  getGuidedAreaStages,
  listAllGuidedStages,
  resolveConditionalOfferFields,
} from "@/lib/profile/guidedStageRegistry";
import {
  clearStageEnoughForNowMarkers,
  countFilledPrimaryFields,
  deriveStageStatus,
  fieldPathHasValue,
  isQuickStartSatisfied,
  listAreaStageStatuses,
  markStageEnoughForNow,
} from "@/lib/profile/guidedStageCompletion";
import {
  buildStageTalkThroughPrompt,
  requestStageTalkThrough,
} from "@/lib/profile/guidedStageTalkThrough";
import {
  GUIDED_STAGES_MAY_AUTO_NAVIGATE,
  GUIDED_STAGES_MAY_AUTO_SAVE,
  MAX_PRIMARY_QUESTIONS_PER_STAGE,
} from "@/lib/profile/guidedStageTypes";
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";
import { getGuidedFieldDef } from "@/lib/profile/guidedFieldRegistry";
import { clearPendingGuidedFieldHelp } from "@/lib/profile/guidedFieldHelp";

describe("Staged Guidance", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearStageEnoughForNowMarkers();
    clearPendingGuidedFieldHelp();
  });

  it("never auto-saves or auto-navigates", () => {
    expect(GUIDED_STAGES_MAY_AUTO_SAVE).toBe(false);
    expect(GUIDED_STAGES_MAY_AUTO_NAVIGATE).toBe(false);
  });

  it("no stage has more than four primary questions", () => {
    const result = assertStagesWithinQuestionLimit();
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
    for (const stage of listAllGuidedStages()) {
      expect(stage.fieldPaths.length).toBeLessThanOrEqual(
        MAX_PRIMARY_QUESTIONS_PER_STAGE,
      );
      expect(stage.fieldPaths.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("defines stages for all Business Estate areas and People I Help", () => {
    for (const areaId of [
      "identity",
      "offers",
      "brand",
      "direction",
      "work-style",
      "tools",
      "people-i-help",
    ] as const) {
      const area = getGuidedAreaStages(areaId);
      expect(area.stages.length).toBeGreaterThanOrEqual(2);
      expect(area.quickStartFieldPaths.length).toBeGreaterThanOrEqual(2);
      expect(area.quickStartFieldPaths.length).toBeLessThanOrEqual(3);
    }
  });

  it("Identity Quick Start uses name, description, stage", () => {
    const area = getGuidedAreaStages("identity");
    expect(area.quickStartFieldPaths).toEqual([
      "identity.businessName",
      "identity.shortDescription",
      "identity.businessStage",
    ]);
  });

  it("People I Help Quick Start uses who, problem, desired change", () => {
    const area = getGuidedAreaStages("people-i-help");
    expect(area.quickStartFieldPaths).toEqual([
      "people-i-help.who",
      "people-i-help.painPoints",
      "people-i-help.goals",
    ]);
  });

  it("Working Style Quick Start uses time, friction, support style", () => {
    const area = getGuidedAreaStages("work-style");
    expect(area.quickStartFieldPaths).toEqual([
      "work-style.preferredTimeOfDay",
      "work-style.commonFriction",
      "work-style.shariSupportStyle",
    ]);
  });

  it("Identity Purpose links People I Help instead of duplicating audience fields", () => {
    const purpose = getGuidedAreaStages("identity").stages.find(
      (s) => s.id === "identity-purpose",
    );
    expect(purpose?.fieldPaths).toContain("people-i-help.link");
    expect(purpose?.fieldPaths.some((p) => p.startsWith("people-i-help.") && p !== "people-i-help.link")).toBe(
      false,
    );
  });

  it("derives stage completion from saved fields without new storage", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Lantern Studio",
      shortDescription: "Calm coaching for founders",
      businessStage: "Growing",
    });
    const basics = getGuidedAreaStages("identity").stages[0]!;
    expect(countFilledPrimaryFields(basics).filled).toBe(3);
    expect(deriveStageStatus(basics)).toBe("explored");
    expect(isQuickStartSatisfied("identity")).toBe(true);
    // Profile storage unchanged key
    expect(getBusinessEstateEnvelope().sections.identity.businessName).toBe(
      "Lantern Studio",
    );
  });

  it("Enough for Now is session-only and calm", () => {
    const stage = getGuidedAreaStages("brand").stages[0]!;
    expect(deriveStageStatus(stage)).toBe("ready_to_begin");
    markStageEnoughForNow(stage.id);
    expect(deriveStageStatus(stage)).toBe("enough_for_now");
  });

  it("status list uses calm language labels", () => {
    const list = listAreaStageStatuses("direction");
    for (const row of list) {
      expect(row.label).not.toMatch(/incomplete|missing|required|behind|failed/i);
    }
  });

  it("conditional offer fields stay hidden until relevant", () => {
    expect(resolveConditionalOfferFields({})).toEqual([]);
    expect(
      resolveConditionalOfferFields({ offersInDevelopment: "A workshop series" }),
    ).toEqual([
      "offers.programs",
      "offers.workshops",
      "offers.memberships",
      "offers.speakingTopics",
    ]);
  });

  it("Talk This Through builds stage context without auto-save", () => {
    const stage = getGuidedAreaStages("identity").stages[0]!;
    const prompt = buildStageTalkThroughPrompt(stage, {
      businessName: "Lantern",
    });
    expect(prompt).toContain("Talk This Through With Shari");
    expect(prompt).toContain("ONE question");
    expect(prompt).toContain("autoSave=false");
    requestStageTalkThrough(stage, { businessName: "Lantern" });
    expect(sessionStorage.getItem("companion-guided-stage-talk-v1")).toContain(
      "Business Basics",
    );
  });

  it("draft values count toward stage progress before save", () => {
    const stage = getGuidedAreaStages("tools").stages[0]!;
    expect(fieldPathHasValue("tools.calendar", { calendar: "Google" })).toBe(
      true,
    );
    expect(countFilledPrimaryFields(stage, { calendar: "Google" }).filled).toBe(
      1,
    );
    expect(deriveStageStatus(stage, { calendar: "Google" })).toBe("started");
  });

  it("existing guided fields still resolve", () => {
    expect(getGuidedFieldDef("identity", "mission")).toBeTruthy();
    expect(getGuidedFieldDef("work-style", "decisionStyle")).toBeTruthy();
  });

  it("work-style stage 4 is optional", () => {
    const extra = getGuidedAreaStages("work-style").stages.find(
      (s) => s.id === "work-style-additional",
    );
    expect(extra?.optional).toBe(true);
    expect(deriveStageStatus(extra!)).toBe("ready_when_you_are");
  });
});
