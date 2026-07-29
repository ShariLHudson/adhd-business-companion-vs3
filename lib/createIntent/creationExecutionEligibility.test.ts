/**
 * Canonical Create eligibility authority — shared predicate + every production
 * caller must agree. Proves the exploratory guard is no longer split across
 * paths (audit: goal-arbitration bypassed the understandUniversalRequest guard).
 */
import { describe, expect, it } from "vitest";

import {
  isCreationExecutionRequest,
  isExploratoryCreation,
} from "./creationExecutionEligibility";
import { classifyConversationGoal } from "@/lib/conversationStabilization/goalClassifier";
import { understandUniversalRequest } from "@/lib/universalRequestOutcome/understandRequest";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";
import { shouldAutoOpenWorkspaceBeforeChat } from "@/lib/messageClassification";
import { runRequestIntoCreationWorkspace } from "@/lib/creationWorkspace/runRequestIntoCreationWorkspace";

const INELIGIBLE = [
  "What kinds of things could I create that would help ADHD entrepreneurs?",
  "I create handmade journals. How could I market them better?",
  "What would it take to create an advisory board for my company?",
  "I want to create AI innovations for my business.",
  "What kind of report could I create from this?",
  "I'm thinking about creating a membership site.",
  "Help me decide whether to create a course.",
  "How can I create recurring revenue?",
];

const ELIGIBLE = [
  "Create a marketing plan for my ADHD business.",
  "Draft an advisory-board charter.",
  "Turn these notes into a report.",
  "Make a client onboarding checklist.",
];

describe("shared predicate — isCreationExecutionRequest", () => {
  it.each(INELIGIBLE)("ineligible: %s", (text) => {
    expect(isCreationExecutionRequest(text).eligible).toBe(false);
  });

  it.each(ELIGIBLE)("eligible: %s", (text) => {
    expect(isCreationExecutionRequest(text).eligible).toBe(true);
  });

  it("12. 'Create this for me' is eligible only with a concrete referent", () => {
    expect(isCreationExecutionRequest("Create this for me.").eligible).toBe(true);
    expect(isCreationExecutionRequest("Create for me.").eligible).toBe(false);
  });

  it("13. explicit 'Open Create' is eligible (explicit navigation)", () => {
    const r = isCreationExecutionRequest("Open Create.");
    expect(r.eligible).toBe(true);
    expect(r.provenance).toBe("explicit_navigation");
  });

  it("14. a trusted UI-action handoff is eligible by provenance", () => {
    const r = isCreationExecutionRequest(
      "I'm thinking about a course", // exploratory text …
      { uiActionHandoff: true }, // … but trusted provenance overrides
    );
    expect(r.eligible).toBe(true);
    expect(r.provenance).toBe("ui_handoff");
  });

  it("15. a trusted research→creation handoff is eligible by provenance", () => {
    const r = isCreationExecutionRequest("build an advisory board", {
      researchHandoff: true,
    });
    expect(r.eligible).toBe(true);
    expect(r.provenance).toBe("research_handoff");
  });

  it("a concrete deliverable noun does not override exploratory framing", () => {
    const r = isCreationExecutionRequest(
      "What kind of report could I create from this?",
    );
    expect(r.concreteDeliverable).toBe(true); // "report"
    expect(r.exploratory).toBe(true);
    expect(r.eligible).toBe(false);
  });
});

describe("every production caller honors the shared authority", () => {
  it("16. classifyConversationGoal cannot return 'create' for exploratory turns", () => {
    for (const t of INELIGIBLE) {
      expect(classifyConversationGoal(t), t).not.toBe("create");
    }
  });

  it("17. understandUniversalRequest agrees — primaryIntent is not create", () => {
    for (const t of INELIGIBLE) {
      expect(understandUniversalRequest(t).primaryIntent, t).not.toBe("create");
    }
  });

  it("18. shouldEnterUniversalCreation cannot bypass the shared guard", () => {
    for (const t of INELIGIBLE) {
      expect(shouldEnterUniversalCreation(t), t).toBe(false);
    }
  });

  it("19. messageClassification auto-open cannot bypass the shared guard", () => {
    for (const t of INELIGIBLE) {
      expect(shouldAutoOpenWorkspaceBeforeChat(t), t).toBe(false);
    }
  });

  it("the creation-workspace pipeline stays closed for exploratory turns", () => {
    for (const t of INELIGIBLE) {
      expect(
        runRequestIntoCreationWorkspace(t, { persist: false }).openDecision.open,
        t,
      ).toBe(false);
    }
  });
});

describe("execution requests still open (at least one deterministic path)", () => {
  it("marketing plan opens via arbitration and/or workspace", () => {
    const t = "Create a marketing plan for my ADHD business.";
    const opened =
      classifyConversationGoal(t) === "create" ||
      runRequestIntoCreationWorkspace(t, { persist: false }).openDecision.open;
    expect(opened).toBe(true);
  });

  it("turn-into-deliverable opens via the workspace pipeline", () => {
    expect(
      runRequestIntoCreationWorkspace("Turn these notes into a report.", {
        persist: false,
      }).openDecision.open,
    ).toBe(true);
  });

  it("21. explicit research→creation handoff still opens the workspace", () => {
    expect(
      runRequestIntoCreationWorkspace(
        "Use this research to write a marketing plan.",
        { persist: false, fromResearchUse: true },
      ).openDecision.open,
    ).toBe(true);
  });
});

describe("24. no deterministic caller disagrees on the exploratory corpus", () => {
  it("all four deterministic paths + predicate agree = closed", () => {
    for (const t of INELIGIBLE) {
      const decisions = {
        predicate: isCreationExecutionRequest(t).eligible,
        goal: classifyConversationGoal(t) === "create",
        understand: understandUniversalRequest(t).primaryIntent === "create",
        universalCreation: shouldEnterUniversalCreation(t),
        autoOpen: shouldAutoOpenWorkspaceBeforeChat(t),
        workspace: runRequestIntoCreationWorkspace(t, { persist: false })
          .openDecision.open,
      };
      // Every path must agree the turn is NOT a create-open.
      expect(Object.values(decisions).some(Boolean), `${t} → ${JSON.stringify(decisions)}`).toBe(false);
    }
  });

  it("exploratory veto is the single canonical predicate", () => {
    expect(isExploratoryCreation("what would it take to create an advisory board")).toBe(true);
    expect(isExploratoryCreation("i create handmade journals")).toBe(true);
    expect(isExploratoryCreation("create a marketing plan")).toBe(false);
  });
});
