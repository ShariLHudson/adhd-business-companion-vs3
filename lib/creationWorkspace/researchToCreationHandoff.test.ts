import { describe, expect, it } from "vitest";

import { runRequestIntoCreationWorkspace } from "./runRequestIntoCreationWorkspace";
import { understandUniversalRequest } from "@/lib/universalRequestOutcome/understandRequest";
import { isExplicitCreationRequest } from "@/lib/messageClassification";

const ADVISORY =
  "Use this research to help me build an advisory board for my business.";

describe("research-to-creation explicit handoff (fromResearchUse)", () => {
  it("1. fromResearchUse + build-an-advisory-board opens the creation workspace", () => {
    const r = runRequestIntoCreationWorkspace(ADVISORY, {
      persist: false,
      fromResearchUse: true,
    });
    expect(r.openDecision.open).toBe(true);
    expect(r.workspace).toBeTruthy();
  });

  it("2. the same wording WITHOUT fromResearchUse follows the strict classifier", () => {
    const r = runRequestIntoCreationWorkspace(ADVISORY, { persist: false });
    expect(r.openDecision.open).toBe(false);
    expect(r.workspace).toBeNull();
    // Strict understanding: not create without a deliverable noun.
    expect(understandUniversalRequest(ADVISORY).primaryIntent).not.toBe("create");
  });

  it("3. 'Tell me about advisory boards' does not open Create (no create verb, even with a handoff)", () => {
    const q = "Tell me about advisory boards.";
    expect(runRequestIntoCreationWorkspace(q, { persist: false }).openDecision.open).toBe(false);
    expect(
      runRequestIntoCreationWorkspace(q, { persist: false, fromResearchUse: true })
        .openDecision.open,
    ).toBe(false);
  });

  it("4. 'Should I form an advisory board?' does not open Create", () => {
    const q = "Should I form an advisory board?";
    expect(runRequestIntoCreationWorkspace(q, { persist: false }).openDecision.open).toBe(false);
    expect(
      runRequestIntoCreationWorkspace(q, { persist: false, fromResearchUse: true })
        .openDecision.open,
    ).toBe(false);
  });

  it("5. existing valid research-to-creation examples still open Create", () => {
    const r = runRequestIntoCreationWorkspace(
      "Use this research to write a marketing plan for my business.",
      { persist: false, fromResearchUse: true },
    );
    expect(r.openDecision.open).toBe(true);
    expect(r.workspace).toBeTruthy();
  });

  it("6. dinner / decisions / Create-rejection from 2a34c232 remain protected", () => {
    // The default (no-handoff) classifier is unchanged.
    expect(
      isExplicitCreationRequest("What should I make for dinner for a family of four?"),
    ).toBe(false);
    expect(isExplicitCreationRequest("help me make a decision")).toBe(false);
    expect(isExplicitCreationRequest("I don't need the create room")).toBe(false);
    expect(
      understandUniversalRequest(
        "What should I make for dinner for a family of four?",
      ).primaryIntent,
    ).not.toBe("create");
    expect(
      understandUniversalRequest("help me make a decision").primaryIntent,
    ).not.toBe("create");
  });
});
