import { describe, expect, it } from "vitest";
import {
  SHARED_CAPABILITY_IDS,
  assertNeverExposeAsGpt,
  composeSharedCapabilities,
  listSharedCapabilities,
  resolveCompanionCapabilityHelp,
  softAdapterOfferLine,
} from "./index";

describe("sparkSharedCapabilities catalog", () => {
  it("registers exactly the 12 overview capabilities", () => {
    expect(listSharedCapabilities()).toHaveLength(12);
    expect(SHARED_CAPABILITY_IDS).toHaveLength(12);
  });

  it("never lists GPT product names as official names", () => {
    for (const cap of listSharedCapabilities()) {
      expect(cap.officialName.toLowerCase()).not.toMatch(/gpt/);
      expect(cap.neverExposeAs.length).toBeGreaterThan(0);
    }
  });
});

describe("sparkSharedCapabilities composition", () => {
  it("composes decide_and_plan from decision language", () => {
    const result = composeSharedCapabilities({
      userText: "I can't decide which offer to launch — help me choose",
    });
    expect(result).not.toBeNull();
    expect(result!.primaryId).toBe("decision_making");
    expect(result!.hiddenBehindCompanion).toBe(true);
    expect(result!.forbiddenExposures.some((x) => /gpt/i.test(x))).toBe(true);
  });

  it("composes notice_and_honor for celebration language", () => {
    const result = composeSharedCapabilities({
      userText: "I finally shipped the launch — worth celebrating!",
    });
    expect(result?.primaryId).toBe("celebration");
    expect(result?.supportIds).toContain("reflection");
    expect(result?.recipeId).toBe("notice_and_honor");
  });

  it("composes sort_the_pile for overwhelm", () => {
    const result = composeSharedCapabilities({
      userText: "I'm overwhelmed — too much to organize, brain dump please",
    });
    expect(result?.primaryId).toBe("organization");
  });

  it("honors member override immediately", () => {
    const result = composeSharedCapabilities({
      userText: "whatever",
      memberOverride: "research",
    });
    expect(result?.primaryId).toBe("research");
    expect(result?.reason).toBe("member_override");
  });

  it("defers to reflection/preserve during recognition preserve flow", () => {
    const result = composeSharedCapabilities({
      userText: "I figured out something important about my VA process",
      activeRecognitionFlowKind: "preserve_discovery",
    });
    expect(result?.primaryId).toBe("reflection");
    expect(result?.optionalAdapter).toBe("evidence_vault");
  });
});

describe("sparkSharedCapabilities facade", () => {
  it("returns one-companion facade with safe speak line", () => {
    const help = resolveCompanionCapabilityHelp({
      userText: "brainstorm ideas for my newsletter",
    });
    expect(help.oneCompanion).toBe(true);
    expect(help.speak).toBeTruthy();
    expect(help.promptHint).toMatch(/one Spark companion/i);
    expect(assertNeverExposeAsGpt(help.speak!)).toBe(true);
  });

  it("rejects GPT exposure in member-facing text", () => {
    expect(assertNeverExposeAsGpt("Open Decision GPT")).toBe(false);
    expect(assertNeverExposeAsGpt("Let's look at your options.")).toBe(true);
  });

  it("soft adapter copy stays companion-voiced", () => {
    const line = softAdapterOfferLine("create_workspace");
    expect(line).toMatch(/I'll stay with you/i);
    expect(line?.toLowerCase()).not.toMatch(/gpt/);
  });
});
