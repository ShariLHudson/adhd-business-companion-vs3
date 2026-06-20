import { describe, expect, it } from "vitest";
import {
  CREATE_THINKING_PARTNER_PRINCIPLES,
  DRAFT_WITH_WHAT_WE_HAVE_PROMPT,
  createThinkingPartnerHint,
  fieldExplorationCoachHint,
} from "./createVision";
import { isCreateExplorationRequest } from "./createExplorationMode";
import {
  shouldBypassCreateBuilderForSectionHelp,
  draftWithWhatWeHaveConfirmation,
} from "./createSectionDiscovery";
import {
  bootstrapCreateBuilderSession,
  processCreateBuilderTurn,
} from "./createBuilderChat";

describe("createVision", () => {
  it("states thinking-partner principles", () => {
    expect(CREATE_THINKING_PARTNER_PRINCIPLES).toMatch(/byproduct/i);
    expect(CREATE_THINKING_PARTNER_PRINCIPLES).toMatch(/approved decisions/i);
  });

  it("matches research and thinking phrases from the vision", () => {
    expect(isCreateExplorationRequest("What do you think their biggest problems are?")).toBe(
      true,
    );
    expect(isCreateExplorationRequest("What outcomes would they want?")).toBe(true);
    expect(isCreateExplorationRequest("What would make a good lead magnet?")).toBe(
      true,
    );
    expect(isCreateExplorationRequest("Can you help me think through this?")).toBe(
      true,
    );
  });

  it("I don't know on problem routes to thinking — not field capture", () => {
    let { session } = bootstrapCreateBuilderSession("Lead Magnet");
    const offered = processCreateBuilderTurn(session, "ADHD business owners");
    session = processCreateBuilderTurn(offered.session, "yes").session;

    expect(
      shouldBypassCreateBuilderForSectionHelp(session, "I don't know"),
    ).toBe(true);

    const turn = processCreateBuilderTurn(session, "I don't know");
    expect(turn.session.workflow.discoveryAnswers.problem).toBeUndefined();
    expect(turn.session.workflow.pendingFieldApproval).toBeFalsy();
  });

  it("coach hint for ADHD audience problem exploration includes common challenges", () => {
    const hint = fieldExplorationCoachHint("problem", {
      discoveryAnswers: { audience: "ADHD business owners" },
    } as Parameters<typeof fieldExplorationCoachHint>[1]);
    expect(hint).toMatch(/Let's explore that/i);
    expect(hint).toMatch(/Overwhelm/);
    expect(hint).toMatch(/prioritizing/i);
  });

  it("thinking partner hint names current topic not form field", () => {
    const hint = createThinkingPartnerHint(
      "Lead Magnet",
      { discoveryAnswers: { audience: "Coaches" } } as Parameters<
        typeof createThinkingPartnerHint
      >[1],
      "I don't know",
    );
    expect(hint).toMatch(/CURRENT TOPIC \(think together/i);
  });

  it("draft-with-what-we-have uses vision wording", () => {
    expect(draftWithWhatWeHaveConfirmation()).toBe(DRAFT_WITH_WHAT_WE_HAVE_PROMPT);
    expect(DRAFT_WITH_WHAT_WE_HAVE_PROMPT).toMatch(/lighter than others/i);
  });
});
