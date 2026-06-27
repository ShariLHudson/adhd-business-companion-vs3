import { describe, expect, it } from "vitest";
import {
  inferClearMyMindViewFromText,
  sectionForWorkspaceInvitation,
  shouldClaimBesideUsCopy,
  workspaceOpenBesideSuccessCopy,
  workspaceOpenCopyVerified,
  WORKSPACE_OPENING_CONSTITUTION,
} from "./workspaceOpeningRule";
import { isWorkspaceOpen } from "./workspaceExecution";

describe("workspaceOpeningRule", () => {
  const openSnap = {
    panel: "brain-dump" as const,
    activeSection: "home" as const,
    revealSeq: 2,
  };

  it("declares constitutional rule", () => {
    expect(WORKSPACE_OPENING_CONSTITUTION).toMatch(/beside chat/i);
  });

  it("opens My Thoughts view from chat invitation copy", () => {
    expect(
      inferClearMyMindViewFromText(
        "Would you like to choose one small task from My Thoughts?",
      ),
    ).toBe("my-thoughts");
    expect(
      inferClearMyMindViewFromText("Want to see what's in Clear My Mind?"),
    ).toBe("my-thoughts");
  });

  it("maps chat invitations to sections", () => {
    expect(
      sectionForWorkspaceInvitation("Want to open Plan My Day beside us?"),
    ).toBe("plan-my-day");
    expect(sectionForWorkspaceInvitation("Open Create for this draft")).toBe(
      "content-generator",
    );
    expect(sectionForWorkspaceInvitation("Open My Thoughts")).toBe("brain-dump");
  });

  it("uses beside-us copy only when workspace is verified open", () => {
    expect(shouldClaimBesideUsCopy("brain-dump", openSnap)).toBe(true);
    expect(
      shouldClaimBesideUsCopy("brain-dump", {
        panel: null,
        activeSection: "home",
        revealSeq: 0,
      }),
    ).toBe(false);
    expect(workspaceOpenCopyVerified("brain-dump", openSnap)).toMatch(
      /still here|on your mind/i,
    );
    expect(workspaceOpenCopyVerified("brain-dump", openSnap)).not.toMatch(
      /is open beside us/i,
    );
    expect(
      workspaceOpenCopyVerified("brain-dump", {
        panel: null,
        activeSection: "home",
        revealSeq: 0,
      }),
    ).not.toMatch(/beside us/i);
  });

  it("opens My Thoughts beside chat with natural continuation copy", () => {
    const copy = workspaceOpenBesideSuccessCopy("brain-dump", {
      view: "my-thoughts",
      isAffirmative: true,
    });
    expect(copy).not.toMatch(/is open beside us/i);
    expect(copy).toMatch(/doable|smallest honest start/i);
  });

  it("confirms split open state for plan my day and create", () => {
    expect(
      isWorkspaceOpen("plan-my-day", {
        panel: "plan-my-day",
        activeSection: "home",
        revealSeq: 1,
      }),
    ).toBe(true);
    expect(
      isWorkspaceOpen("content-generator", {
        panel: "content-generator",
        activeSection: "home",
        revealSeq: 1,
      }),
    ).toBe(true);
  });

  it("uses mobile-safe copy without false beside claim when stacked", () => {
    const copy = workspaceOpenBesideSuccessCopy("plan-my-day", { mobile: true });
    expect(copy).not.toMatch(/is open beside us/i);
    expect(copy).toMatch(/Chat/i);
    expect(copy).toMatch(/still here/i);
  });
});
