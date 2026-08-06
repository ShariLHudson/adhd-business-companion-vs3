import { describe, expect, it } from "vitest";
import { chamberCollaborationBridgeLine } from "./chamberCollaborationLanguage";
import { resolveChamberExpertActivation } from "./resolveChamberExpertActivation";
import { chamberExpertiseHintForChat } from "./chamberExpertiseHintForChat";

describe("chamberCollaborationBridgeLine — Phase D", () => {
  it("returns undefined when there is no primary", () => {
    expect(
      chamberCollaborationBridgeLine({ primary: null, supporting: [] }),
    ).toBeUndefined();
  });

  it("returns undefined when there is a primary but no supporting expert", () => {
    expect(
      chamberCollaborationBridgeLine({ primary: "SYS", supporting: [] }),
    ).toBeUndefined();
  });

  it("weaves one supporting expert into a single integrating sentence", () => {
    const line = chamberCollaborationBridgeLine({
      primary: "SYS",
      supporting: ["CR"],
    });

    expect(line).toBeDefined();
    expect(line).toContain("Systems Intelligence");
    expect(line).toContain("Client Relationships Intelligence");
    expect(line).toContain("one answer");
  });

  it("weaves multiple supporting experts with natural 'and' joining, not a list", () => {
    const line = chamberCollaborationBridgeLine({
      primary: "STR",
      supporting: ["SYS", "FIN", "MKT"],
    });

    expect(line).toBeDefined();
    expect(line).toContain("Strategy Intelligence");
    expect(line).toContain("Systems Intelligence");
    expect(line).toContain("Finance Intelligence");
    expect(line).toMatch(/, and Marketing Intelligence/);
  });

  it("never uses handoff language ('bringing in', 'I think bringing in some ... support')", () => {
    const line = chamberCollaborationBridgeLine({
      primary: "MKT",
      supporting: ["STR", "CR"],
    });

    expect(line).toBeDefined();
    expect(line).not.toMatch(/bringing in/i);
    expect(line).not.toMatch(/i think bringing in some/i);
  });

  it("explicitly instructs against sequential handoffs, a panel of experts, or separate voices", () => {
    const line = chamberCollaborationBridgeLine({
      primary: "EVT",
      supporting: ["MKT", "CR"],
    });

    expect(line).toBeDefined();
    expect(line).toContain("never as sequential handoffs");
    expect(line).toContain("separate voices");
  });
});

describe("chamberCollaborationBridgeLine — integration with real activation", () => {
  it("appears in the full hint for the client onboarding example", () => {
    const activation = resolveChamberExpertActivation({
      userText: "I need to create a client onboarding process.",
      intentCategory: "build",
      estateCategory: "business",
    });
    const line = chamberCollaborationBridgeLine(activation);

    expect(line).toBeDefined();

    const hint = chamberExpertiseHintForChat({
      userText: "I need to create a client onboarding process.",
      intentCategory: "build",
      estateCategory: "business",
    });
    expect(hint).toContain(line!);
  });

  it("returns undefined for the same activation's bridge line when supporting is empty", () => {
    // Direct unit case (not a full-pipeline scenario): confirms the hint
    // builder simply omits the bridge line rather than fabricating one
    // when there is nothing to weave together.
    expect(
      chamberCollaborationBridgeLine({ primary: "RES", supporting: [] }),
    ).toBeUndefined();
  });
});
