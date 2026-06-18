import { describe, expect, it } from "vitest";

import {
  matchesDurationFollowUp,
  shouldAutoLaunchAfterAssistantOffer,
  shouldAutoLaunchPendingAction,
  shouldAutoOpenWorkspaceFromIntent,
} from "./companionAutoLaunch";
import type { PendingAction } from "./pendingAction";

const focusBridge: PendingAction = {
  kind: "action-bridge",
  bridge: {
    id: "focus-session",
    emoji: "🎯",
    label: "Start 10-Min Focus Session",
    tool: "focus-timer",
    minutes: 10,
  },
};

describe("companionAutoLaunch", () => {
  it("auto-launches on duration follow-up after a minutes question", () => {
    expect(
      matchesDurationFollowUp(
        "10",
        "Would 10 or 15 minutes work for a focus session?",
        focusBridge,
      ),
    ).toBe(true);
    expect(
      shouldAutoLaunchPendingAction(
        "10",
        "Would 10 or 15 minutes work?",
        focusBridge,
      ),
    ).toBe(true);
  });

  it("auto-opens brain dump when user clearly asked for it", () => {
    expect(
      shouldAutoOpenWorkspaceFromIntent("I need to clear my mind", {
        section: "brain-dump",
        line: "",
        buttonLabel: "Open Clear My Mind",
      }),
    ).toBe(true);
  });

  it("does not auto-launch after assistant mentions a tool in the same turn", () => {
    expect(
      shouldAutoLaunchAfterAssistantOffer(
        "10",
        "Would 10 or 15 minutes work?",
        "Great — starting a 10-minute focus session.",
        focusBridge,
      ),
    ).toBe(false);
  });
});
