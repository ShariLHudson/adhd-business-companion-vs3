/**
 * Chamber vs Board assistance separation
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { CHAMBER_MEMBER_IDS } from "@/lib/chamber/chamberMemberRegistry";
import { ADVISORY_BOARD_MEMBERS } from "@/lib/advisory/members/boardMembers";
import { listAllBoardMembers } from "@/lib/boardroom";
import {
  buildAdvisoryContext,
  dispatchAdvisoryChamberInvite,
  listSavedAdvisoryAdvice,
  saveAdvisoryAdvice,
  advisoryStorageIsSeparateFromProfile,
} from "@/lib/profile/advisoryHelpContext";
import {
  assertChamberAndBoardSystemsAreSeparate,
  assertChamberRecommendationsAreChamberOnly,
  getRecommendedChamberMembers,
  recommendAssistancePath,
  recommendChamberSpecialists,
  AREA_CHAMBER_RECOMMENDATIONS,
} from "@/lib/profile/advisoryHelpRecommendations";
import { startAdvisoryBoardDiscussion } from "@/lib/profile/advisoryHelpBoard";
import {
  ADVISORY_HELP_MAY_AUTO_LAUNCH_PATH,
  ADVISORY_HELP_MAY_AUTO_UPDATE_PROFILE,
  ADVISORY_INVITE_CHAMBER_EVENT,
  ASSISTANCE_ACTION_LABEL,
  BOARD_PATH_LABEL,
  CHAMBER_PATH_LABEL,
  MAX_CHAMBER_SPECIALISTS_PER_SESSION,
} from "@/lib/profile/advisoryHelpTypes";
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";

describe("Chamber / Board assistance separation", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("uses distinct action labels (not Ask Expert)", () => {
    expect(ASSISTANCE_ACTION_LABEL).toBe("Need Another Perspective?");
    expect(CHAMBER_PATH_LABEL).toBe("Ask a Chamber Specialist");
    expect(BOARD_PATH_LABEL).toBe("Take This to the Board");
    expect(ASSISTANCE_ACTION_LABEL).not.toMatch(/ask expert/i);
  });

  it("never auto-updates profile or auto-launches a path", () => {
    expect(ADVISORY_HELP_MAY_AUTO_UPDATE_PROFILE).toBe(false);
    expect(ADVISORY_HELP_MAY_AUTO_LAUNCH_PATH).toBe(false);
  });

  it("Chamber and Board use different registries / member records", () => {
    const sep = assertChamberAndBoardSystemsAreSeparate();
    expect(sep.ok).toBe(true);
    expect(sep.chamberUsesBoardRecords).toBe(false);
    expect(sep.boardUsesChamberRecords).toBe(false);

    const chamberOnly = assertChamberRecommendationsAreChamberOnly();
    expect(chamberOnly.ok).toBe(true);

    const boardIds = new Set(ADVISORY_BOARD_MEMBERS.map((m) => m.id));
    for (const id of getRecommendedChamberMembers("offers")) {
      expect(CHAMBER_MEMBER_IDS).toContain(id);
    }
    // Board records use Board shape — never Chamber card fields
    for (const b of listAllBoardMembers()) {
      expect(b).toHaveProperty("role");
      expect(b).toHaveProperty("name");
      expect(b).not.toHaveProperty("activationOpener");
      expect(b).not.toHaveProperty("cardImagePath");
    }
    expect(boardIds.size).toBeGreaterThan(5);
  });

  it("Chamber specialists never appear as Board member records in Board flow", () => {
    const board = listAllBoardMembers();
    for (const member of board) {
      expect(member).not.toHaveProperty("cardImagePath");
      expect(member).not.toHaveProperty("activationOpener");
    }
  });

  it("Board discussion uses Board member IDs only", () => {
    const ctx = buildAdvisoryContext({
      sourceType: "business_estate",
      areaId: "direction",
      userQuestion: "Should I launch this offer now or wait?",
    });
    const { discussion, didNavigate } = startAdvisoryBoardDiscussion(ctx);
    expect(didNavigate).toBe(false);
    const boardIdSet = new Set(ADVISORY_BOARD_MEMBERS.map((m) => m.id));
    for (const id of discussion.memberIds) {
      expect(boardIdSet.has(id)).toBe(true);
    }
    // Chamber specialist list must not be used as discussion.memberIds source
    const chamberOnlyIds = AREA_CHAMBER_RECOMMENDATIONS.direction;
    const allChamber = chamberOnlyIds.every((id) =>
      discussion.memberIds.includes(id as never),
    );
    expect(allChamber).toBe(false);
  });

  it("Shari recommendations distinguish continue / Chamber / Board / Research", () => {
    const boardPath = recommendAssistancePath(
      buildAdvisoryContext({
        sourceType: "business_estate",
        areaId: "offers",
        userQuestion: "Should I launch this offer or wait — major decision?",
      }),
    );
    expect(boardPath.path).toBe("take_to_board");

    const researchPath = recommendAssistancePath(
      buildAdvisoryContext({
        sourceType: "business_estate",
        areaId: "brand",
        userQuestion: "Look up market trends and competitor messaging",
      }),
    );
    expect(researchPath.path).toBe("research_with_shari");

    const chamberPath = recommendAssistancePath(
      buildAdvisoryContext({
        sourceType: "business_estate",
        areaId: "offers",
        userQuestion: "I need a marketing specialist for offer wording",
      }),
    );
    expect(chamberPath.path).toBe("ask_chamber_specialist");
    expect(chamberPath.chamberHint?.primary).toBeTruthy();

    const stay = recommendAssistancePath(
      buildAdvisoryContext({
        sourceType: "business_estate",
        areaId: "identity",
        userQuestion: "hi",
      }),
    );
    expect(stay.path).toBe("continue_with_shari");
  });

  it("Chamber invite event uses Chamber IDs only", () => {
    const ctx = buildAdvisoryContext({
      sourceType: "business_estate",
      areaId: "brand",
      userQuestion: "Tone help",
    });
    let invited: string[] = [];
    const handler = (e: Event) => {
      invited = (e as CustomEvent).detail.memberIds;
    };
    window.addEventListener(ADVISORY_INVITE_CHAMBER_EVENT, handler);
    dispatchAdvisoryChamberInvite({ memberIds: ["content"], context: ctx });
    window.removeEventListener(ADVISORY_INVITE_CHAMBER_EVENT, handler);
    expect(invited).toEqual(["content"]);
    expect(CHAMBER_MEMBER_IDS).toContain("content");
  });

  it("Chamber specialist cap is two — not a Board assembly", () => {
    expect(MAX_CHAMBER_SPECIALISTS_PER_SESSION).toBe(2);
    const rec = recommendChamberSpecialists(
      buildAdvisoryContext({
        sourceType: "people_i_help",
        areaId: "people-i-help",
        userQuestion: "Audience messaging help from a specialist",
      }),
    );
    expect(rec.primary).toBeTruthy();
  });

  it("saving Chamber or Board advice does not change profile", () => {
    saveBusinessEstateSection("identity", { businessName: "Keep Me" });
    const before = JSON.stringify(getBusinessEstateEnvelope());
    const ctx = buildAdvisoryContext({
      sourceType: "business_estate",
      areaId: "identity",
      userQuestion: "Mission",
    });
    saveAdvisoryAdvice({
      context: ctx,
      mode: "chamber_specialist",
      chamberMemberIds: ["strategy"],
      summary: "Chamber note",
    });
    saveAdvisoryAdvice({
      context: ctx,
      mode: "board_discussion",
      boardMemberIds: ["ceo", "strategist"],
      summary: "Board note",
    });
    expect(listSavedAdvisoryAdvice()[0]?.boardMemberIds).toContain("ceo");
    expect(listSavedAdvisoryAdvice()[1]?.chamberMemberIds).toContain("strategy");
    expect(JSON.stringify(getBusinessEstateEnvelope())).toBe(before);
    expect(advisoryStorageIsSeparateFromProfile()).toBe(true);
  });

  it("People I Help chamber recommendations match the approved specialist set", () => {
    expect(AREA_CHAMBER_RECOMMENDATIONS["people-i-help"]).toEqual([
      "marketing",
      "client-relationships",
      "research",
      "sales",
      "content",
    ]);
  });
});
