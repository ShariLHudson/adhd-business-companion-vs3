/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  activateChamberMember,
  clearActiveChamberMember,
  readActiveChamberMember,
} from "./chamberMemberActivation";
import {
  dismissActiveChamberConversationStorage,
  filterDismissedChamberMessages,
  planDismissActiveChamberConversation,
  shouldClearChamberOnDestination,
} from "./dismissActiveChamberConversation";
import { planWelcomeHomeDestinationSwitch } from "@/lib/estate/welcomeHomeDestinationSwitch";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("dismissActiveChamberConversation planner", () => {
  it("dismisses when leaving Chamber for Plan My Day", () => {
    const plan = planDismissActiveChamberConversation({
      activeMemberId: "marketing",
      previousSection: "chamber-of-momentum",
      nextSection: "plan-my-day",
      destinationId: "plan-my-day",
      chamberThreadStartIndex: 2,
    });
    expect(plan.shouldDismiss).toBe(true);
    expect(plan.abortStream).toBe(true);
    expect(plan.clearActiveMember).toBe(true);
    expect(plan.hideChat).toBe(true);
    expect(plan.restoreMessageIndex).toBe(2);
  });

  it("does not dismiss when staying in Chamber", () => {
    const plan = planDismissActiveChamberConversation({
      activeMemberId: "marketing",
      previousSection: "chamber-of-momentum",
      nextSection: "chamber-of-momentum",
      destinationId: "chamber-of-momentum",
    });
    expect(plan.shouldDismiss).toBe(false);
  });

  it("dismisses when a member is active and destination is Projects / Business Estate / Explore / Settings / Welcome Home", () => {
    for (const destinationId of [
      "project-homes",
      "my-business-estate",
      "explore-estate",
      "settings",
      "welcome-home",
      "home",
      "brain-dump",
    ]) {
      const plan = planDismissActiveChamberConversation({
        activeMemberId: "marketing",
        destinationId,
        previousSection: "chamber-of-momentum",
        nextSection: destinationId === "welcome-home" ? "home" : destinationId,
      });
      expect(plan.shouldDismiss, destinationId).toBe(true);
    }
  });

  it("restores the pre-Chamber message snapshot", () => {
    const messages = [
      { role: "user", content: "Before chamber" },
      { role: "assistant", content: "Shari reply" },
      {
        role: "system",
        content:
          "**Marcus Chen** has joined your conversation. Your current work and context stay exactly where they are.",
      },
      { role: "assistant", content: "Chamber opener" },
      { role: "user", content: "Talk to Marcus" },
    ];
    const restored = filterDismissedChamberMessages(messages, 2);
    expect(restored).toHaveLength(2);
    expect(restored.map((m) => m.content)).toEqual([
      "Before chamber",
      "Shari reply",
    ]);
  });

  it("clears sticky session storage", () => {
    activateChamberMember("marketing");
    expect(readActiveChamberMember()?.id).toBe("marketing");
    dismissActiveChamberConversationStorage();
    expect(readActiveChamberMember()).toBeNull();
  });
});

describe("destination switch includes Chamber teardown", () => {
  beforeEach(() => {
    clearActiveChamberMember();
  });

  it("Welcome Home destination plan clears Chamber for non-Chamber destinations", () => {
    expect(
      planWelcomeHomeDestinationSwitch({
        destinationId: "plan-my-day",
        kind: "section",
      }).clearActiveChamberConversation,
    ).toBe(true);
    expect(
      planWelcomeHomeDestinationSwitch({
        destinationId: "project-homes",
        kind: "section",
      }).clearActiveChamberConversation,
    ).toBe(true);
    expect(
      planWelcomeHomeDestinationSwitch({
        destinationId: "settings",
        kind: "overlay",
      }).clearActiveChamberConversation,
    ).toBe(true);
    expect(
      planWelcomeHomeDestinationSwitch({
        destinationId: "explore-estate",
        kind: "explore-estate",
      }).clearActiveChamberConversation,
    ).toBe(true);
    expect(
      planWelcomeHomeDestinationSwitch({
        destinationId: "welcome-home",
        kind: "welcome-home",
      }).clearActiveChamberConversation,
    ).toBe(true);
    expect(
      planWelcomeHomeDestinationSwitch({
        destinationId: "chamber-of-momentum",
        kind: "section",
      }).clearActiveChamberConversation,
    ).toBe(false);
  });

  it("shouldClearChamberOnDestination matches the plan flag", () => {
    expect(shouldClearChamberOnDestination("plan-my-day")).toBe(true);
    expect(shouldClearChamberOnDestination("chamber-of-momentum")).toBe(false);
  });
});

describe("CompanionPageClient Chamber exit wiring", () => {
  it("wires dismissActiveChamberConversationCore into destination switch and member invite", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain("function dismissActiveChamberConversationCore");
    expect(source).toContain("clearActiveChamberConversation");
    expect(source).toContain("planDismissActiveChamberConversation");
    expect(source).toContain("chamberThreadStartIndexRef");
    expect(source).toContain("dismissActiveChamberConversationCore");
    expect(source).toMatch(
      /if \(plan\.clearActiveChamberConversation\) \{[\s\S]*?dismissActiveChamberConversationCore/,
    );
    expect(source).toMatch(
      /previousId && previousId !== memberId[\s\S]*?supersedeInFlightChatRequest/,
    );
    expect(source).toContain("isChamberMemberConversationActive");
    expect(source).toMatch(
      /chamberConversationActive && activeChamberMemberIdRef\.current/,
    );
    // Do not restore sticky member outside Chamber
    expect(source).toMatch(
      /if \(activeSection !== "chamber-of-momentum"\) return;[\s\S]*?readActiveChamberMember/,
    );
  });

  it("covers New Chat / New Day / Welcome Home / Boardroom openers", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toMatch(
      /function clearTodayContext[\s\S]*?dismissActiveChamberConversationCore\(\{ force: true \}\)/,
    );
    expect(source).toMatch(
      /function returnToWelcomeHomeLobby[\s\S]*?dismissActiveChamberConversationCore/,
    );
    expect(source).toContain('openStandaloneFocusSectionCore("boardroom")');
    expect(source).toContain(
      "dismissTransientEstateExperiencesForDestinationSwitch",
    );
  });
});
