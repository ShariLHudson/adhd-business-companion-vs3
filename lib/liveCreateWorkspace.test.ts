import { describe, expect, it } from "vitest";
import {
  mergeChatContentIntoDraft,
  userAffirmedApplyToDraft,
  liveCreateWorkflowState,
} from "./liveCreateWorkspace";

describe("liveCreateWorkspace", () => {
  it("detects apply-to-draft affirmation", () => {
    expect(
      userAffirmedApplyToDraft(
        "yes",
        "Would you like me to apply this to the draft?",
      ),
    ).toBe(true);
    expect(userAffirmedApplyToDraft("yes", "Here is your proposal draft.")).toBe(
      false,
    );
  });

  it("uses improve workflow state for live drafts", () => {
    const wf = liveCreateWorkflowState("Proposal");
    expect(wf.step).toBe("improve");
    expect(wf.buildApproved).toBe(true);
    expect(wf.draftStatus).toBe("ready");
  });

  it("keeps incremental drafts in building state", () => {
    const wf = liveCreateWorkflowState("Social Post", null, { incremental: true });
    expect(wf.step).toBe("improve");
    expect(wf.buildApproved).toBe(false);
    expect(wf.draftStatus).toBe("building");
  });

  it("replaces empty draft with chat artifact", () => {
    const result = mergeChatContentIntoDraft("", "# Proposal\n\nOverview\nHello");
    expect(result.draft).toContain("Proposal");
    expect(result.mode).toBe("replace");
  });

  it("appends incremental facts to an existing draft", () => {
    const existing = "Proposal Title\n\nOverview\nVA affiliate program";
    const result = mergeChatContentIntoDraft(
      existing,
      "Commission is $10 after 3 paid months.",
    );
    expect(result.draft).toContain("Commission is $10");
    expect(result.mode).toBe("append");
  });
});
