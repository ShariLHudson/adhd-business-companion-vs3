import { describe, expect, it } from "vitest";
import {
  isWorkspaceOpen,
  scrubFalseWorkspaceClaims,
  workspaceOpenAckVerified,
  workspaceOpenFailureAck,
  workspaceOpenSuccessAck,
} from "./workspaceExecution";

describe("workspaceExecution", () => {
  it("confirms open only when panel, home, and reveal seq match", () => {
    const snap = {
      panel: "content-generator" as const,
      activeSection: "home" as const,
      revealSeq: 1,
    };
    expect(isWorkspaceOpen("content-generator", snap)).toBe(true);
    expect(isWorkspaceOpen("projects", snap)).toBe(false);
    expect(
      isWorkspaceOpen("content-generator", { ...snap, revealSeq: 0 }),
    ).toBe(false);
  });

  it("never returns success ack when not verified", () => {
    const snap = {
      panel: null,
      activeSection: "home" as const,
      revealSeq: 0,
    };
    expect(workspaceOpenAckVerified("time-block", snap)).toBe(
      workspaceOpenFailureAck("time-block"),
    );
    expect(
      workspaceOpenAckVerified("time-block", {
        panel: "time-block",
        activeSection: "home",
        revealSeq: 2,
      }),
    ).toBe(workspaceOpenSuccessAck("time-block"));
  });

  it("strips false Google open claims when workspace is not verified", () => {
    const snap = {
      panel: "content-generator" as const,
      activeSection: "home" as const,
      revealSeq: 1,
    };
    const msg =
      "Great!\n\n**Google Forms** is open beside us — tell me what to add, change, or move.";
    expect(scrubFalseWorkspaceClaims(msg, snap)).toBe("Great!");
  });
});
