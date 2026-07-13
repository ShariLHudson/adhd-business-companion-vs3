/**
 * Universal Guided Assistance — field help registry + no dead ends
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  FIELD_HELP_REGISTRY,
  acceptExpertInvite,
  assertNoImNotSureDeadEnds,
  clearExpertInvite,
  formatExpertJoinedBanner,
  getFieldHelpEntry,
  GUIDED_ASSISTANCE_MAY_AUTO_NAVIGATE,
  GUIDED_ASSISTANCE_MAY_AUTO_OPEN_BOARDROOM,
  GUIDED_ASSISTANCE_MAY_AUTO_OPEN_CHAMBER,
  GUIDED_ASSISTANCE_MAY_AUTO_SAVE,
  helpActionToMode,
  listFieldHelpEntries,
  readActiveExpertInvite,
  readExpertSessionPrompt,
  resolveExpertInvite,
  writeExpertSessionPrompt,
} from "@/lib/profile/fieldHelpRegistry";
import {
  buildPeopleIHelpFieldHelpContext,
  clearPendingGuidedFieldHelp,
  formatGuidedFieldHelpPrompt,
  readPendingGuidedFieldHelp,
  requestGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import { getGuidedFieldDef } from "@/lib/profile/guidedFieldRegistry";
import { getPeopleIHelpGuidedField } from "@/lib/profile/peopleIHelpGuidedFields";

describe("Universal Guided Assistance", () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearPendingGuidedFieldHelp();
    clearExpertInvite();
  });

  it("never auto-saves or auto-navigates", () => {
    expect(GUIDED_ASSISTANCE_MAY_AUTO_SAVE).toBe(false);
    expect(GUIDED_ASSISTANCE_MAY_AUTO_NAVIGATE).toBe(false);
    expect(GUIDED_ASSISTANCE_MAY_AUTO_OPEN_CHAMBER).toBe(false);
    expect(GUIDED_ASSISTANCE_MAY_AUTO_OPEN_BOARDROOM).toBe(false);
  });

  it("every registry entry has an I'm-not-sure continuation opener", () => {
    const result = assertNoImNotSureDeadEnds();
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
    for (const entry of FIELD_HELP_REGISTRY) {
      expect(entry.imNotSureOpener.trim().length).toBeGreaterThan(10);
    }
  });

  it("Business Estate Slice 1 guided fields have registry help entries", () => {
    for (const key of ["businessStage", "mission", "vision", "coreValues"]) {
      const def = getGuidedFieldDef("identity", key);
      expect(def?.allowImNotSure).toBe(true);
      const help = getFieldHelpEntry(`identity.${key}`);
      expect(help?.imNotSureOpener).toBeTruthy();
      expect(help?.availableActions.length).toBeGreaterThan(0);
    }
  });

  it("People I Help difficult fields are registered with help actions", () => {
    const people = listFieldHelpEntries("people-i-help");
    expect(people.length).toBeGreaterThanOrEqual(10);
    for (const entry of people) {
      expect(entry.availableActions).toContain("explain_this");
      expect(entry.imNotSureOpener.trim()).toBeTruthy();
      const meta = getPeopleIHelpGuidedField(
        entry.fieldPath.replace("people-i-help.", ""),
      );
      expect(meta?.definition).toBeTruthy();
      expect(meta?.whyItMatters).toBeTruthy();
      expect(meta?.howThisHelpsShari).toBeTruthy();
    }
  });

  it("routes Ideal Client to Marketing Advisor without navigation", () => {
    const invite = resolveExpertInvite("people-i-help.who");
    expect(invite?.expertId).toBe("marketing");
    expect(invite?.accepted).toBe(false);
    const accepted = acceptExpertInvite("people-i-help.who");
    expect(accepted?.accepted).toBe(true);
    expect(formatExpertJoinedBanner(accepted!)).toMatch(
      /has joined the conversation/,
    );
    writeExpertSessionPrompt(accepted!, "");
    const prompt = readExpertSessionPrompt();
    expect(prompt).toContain("do not navigate away");
    expect(prompt).toContain("Do NOT open Chamber");
    expect(readActiveExpertInvite()?.expertId).toBe("marketing");
    clearExpertInvite();
    expect(readActiveExpertInvite()).toBeNull();
    expect(readExpertSessionPrompt()).toBeNull();
  });

  it("routes Mission to Strategy Advisor and Vision to Innovations", () => {
    expect(resolveExpertInvite("identity.mission")?.expertId).toBe("strategy");
    expect(resolveExpertInvite("identity.vision")?.expertId).toBe("innovations");
    expect(resolveExpertInvite("identity.businessStage")?.expertId).toBe(
      "strategy",
    );
    // businessStage has chamber expert mapped but ask_an_expert is opt-in via actions
    expect(
      getFieldHelpEntry("identity.businessStage")?.availableActions.includes(
        "ask_an_expert",
      ),
    ).toBe(false);
  });

  it("decision style marks Boardroom/Cartography as appropriate without auto-open", () => {
    const entry = getFieldHelpEntry("work-style.decisionStyle");
    expect(entry?.boardroomAppropriate).toBe(true);
    expect(entry?.cartographyAppropriate).toBe(true);
    expect(GUIDED_ASSISTANCE_MAY_AUTO_OPEN_BOARDROOM).toBe(false);
  });

  it("People I Help help packets reuse Business Estate context and do not auto-save", () => {
    const ctx = buildPeopleIHelpFieldHelpContext({
      fieldKey: "who",
      helpMode: "help_me_develop",
      currentValue: "",
    });
    expect(ctx.sectionId).toBe("people-i-help");
    expect(ctx.fieldPath).toBe("people-i-help.who");
    const prompt = formatGuidedFieldHelpPrompt(ctx);
    expect(prompt).toContain("GUIDED PEOPLE I HELP");
    expect(prompt).toContain("Do NOT save wording");
    requestGuidedFieldHelp(ctx);
    expect(readPendingGuidedFieldHelp()?.fieldKey).toBe("who");
  });

  it("helpActionToMode never invents a save mode", () => {
    expect(helpActionToMode("ask_an_expert")).toBe("help_me_develop");
    expect(helpActionToMode("research_with_shari")).toBe("research_with_shari");
  });

  it("example openers match product language for key fields", () => {
    expect(getFieldHelpEntry("identity.businessStage")?.imNotSureOpener).toMatch(
      /figure it out together/i,
    );
    expect(getFieldHelpEntry("identity.mission")?.imNotSureOpener).toMatch(
      /mission together/i,
    );
    expect(getFieldHelpEntry("people-i-help.who")?.imNotSureOpener).toMatch(
      /enjoy helping/i,
    );
    expect(getFieldHelpEntry("brand.tone")?.imNotSureOpener).toMatch(
      /feels natural/i,
    );
  });
});
