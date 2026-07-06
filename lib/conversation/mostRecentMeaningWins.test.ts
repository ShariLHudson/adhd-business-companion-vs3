import { describe, expect, it } from "vitest";
import {
  affirmationAlignsWithRecentMeaning,
  inferMeaningTopicFromAssistant,
  recentAssistantOfferOverridesPendingMenu,
} from "./mostRecentMeaningWins";
import type { PendingAction } from "../pendingAction";

const salesFunnelPending: PendingAction = {
  kind: "workspace",
  offer: {
    section: "content-generator",
    buttonLabel: "Create together",
    line: "Want to build your sales funnel together?",
  },
};

describe("mostRecentMeaningWins", () => {
  it("infers clear my mind from last assistant offer", () => {
    expect(
      inferMeaningTopicFromAssistant(
        "Would you like to clear your mind together for a few minutes?",
      ),
    ).toBe("clear_my_mind");
  });

  it('generic yes binds to clear my mind — not stale sales funnel pending', () => {
    const aligned = affirmationAlignsWithRecentMeaning({
      userText: "yes",
      lastAssistantText:
        "Let's clear your mind together — would that help right now?",
      pendingAction: salesFunnelPending,
      pendingOfferSummary: "Create sales funnel",
      pendingOfferedAtTurn: 2,
      currentTurn: 8,
    });
    expect(aligned).toBe(false);
  });

  it("infers create from funnel discovery question", () => {
    expect(
      inferMeaningTopicFromAssistant(
        "Let's map a funnel that moves people naturally toward your offer.\n\nOne question at a time.\n\nWhat offer sits at the bottom of this funnel?",
      ),
    ).toBe("create");
  });

  it("generic yes aligns during active funnel discovery — not stale reminder", () => {
    const aligned = affirmationAlignsWithRecentMeaning({
      userText: "yes",
      lastAssistantText:
        "Let's map a funnel that moves people naturally toward your offer.\n\nWhat offer sits at the bottom of this funnel?",
      pendingAction: salesFunnelPending,
      pendingOfferSummary: "Create sales funnel",
      pendingOfferedAtTurn: 1,
      currentTurn: 2,
    });
    expect(aligned).toBe(true);
  });

  it("generic yes aligns when last assistant is active create discovery", () => {
    const aligned = affirmationAlignsWithRecentMeaning({
      userText: "yes please",
      lastAssistantText:
        "Would you like me to draft that sales funnel with you in Create?",
      pendingAction: salesFunnelPending,
      pendingOfferSummary: "Create sales funnel",
      pendingOfferedAtTurn: 7,
      currentTurn: 8,
    });
    expect(aligned).toBe(true);
  });

  it("generic yes aligns for clear my mind pending after clear my mind offer", () => {
    const pending: PendingAction = {
      kind: "tool",
      suggestion: {
        kind: "focus-session",
        line: "Clear My Mind",
        toolLabel: "Clear My Mind",
        toolObjectId: "brain-dump",
        keepTalkingLabel: "Keep Talking",
        action: { type: "tool", tool: "brain-dump" },
      },
    };
    expect(
      affirmationAlignsWithRecentMeaning({
        userText: "sure",
        lastAssistantText: "Want to open Clear My Mind beside us?",
        pendingAction: pending,
        pendingOfferedAtTurn: 7,
        currentTurn: 8,
      }),
    ).toBe(true);
  });

  it("recent assistant offer overrides stale estate menu on bare yes", () => {
    expect(
      recentAssistantOfferOverridesPendingMenu({
        userText: "yes",
        lastAssistantText: "Would you like to clear your mind together?",
        menuOfferedAtTurn: 3,
        currentTurn: 9,
      }),
    ).toBe(true);
  });
});
