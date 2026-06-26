import { describe, expect, it } from "vitest";
import {
  applySharisPresenceToEngine,
  evaluateSharisPresence,
  presenceStateForPlace,
  shariImageAllowedForState,
} from "./index";

describe("Shari's Presence™", () => {
  it("Living Room™ is Host™ — Shari may appear", () => {
    const verdict = evaluateSharisPresence({ placeId: "living-room" });
    expect(verdict.state).toBe("host");
    expect(verdict.showShariImage).toBe(true);
    expect(verdict.conversationPrimary).toBe(true);
  });

  it("Clear My Mind™ is Beside You™ — no portrait, anchor primary", () => {
    const verdict = evaluateSharisPresence({
      section: "brain-dump",
      workspaceId: "clear-my-mind",
    });
    expect(verdict.state).toBe("beside-you");
    expect(verdict.showShariImage).toBe(false);
    expect(verdict.communicationAnchorPrimary).toBe(true);
    expect(verdict.guestFeelsWatched).toBe(false);
  });

  it("Planning Table™ is Beside You™", () => {
    expect(presenceStateForPlace("planning-table")).toBe("beside-you");
    expect(evaluateSharisPresence({ section: "plan-my-day" }).state).toBe(
      "beside-you",
    );
  });

  it("Decision Compass maps to Beside You™", () => {
    expect(evaluateSharisPresence({ section: "decision-compass" }).state).toBe(
      "beside-you",
    );
  });

  it("Creative Studio™ is Nearby™ with evidence, not Shari image", () => {
    const verdict = evaluateSharisPresence({ placeId: "creative-studio" });
    expect(verdict.state).toBe("nearby");
    expect(verdict.showShariImage).toBe(false);
    expect(verdict.showEvidenceObjects).toBe(true);
    expect(verdict.evidenceObjects).toContain("coffee-mug");
  });

  it("Reading Nook™ is Nearby™", () => {
    expect(evaluateSharisPresence({ placeId: "reading-nook" }).state).toBe(
      "nearby",
    );
  });

  it("hides Shari image when writing in Clear My Mind", () => {
    const verdict = evaluateSharisPresence({
      placeId: "window-seat",
      writingActive: true,
    });
    expect(verdict.showShariImage).toBe(false);
    expect(verdict.showEvidenceObjects).toBe(false);
  });

  it("only Host™ allows Shari photograph", () => {
    expect(shariImageAllowedForState("host")).toBe(true);
    expect(shariImageAllowedForState("beside-you")).toBe(false);
    expect(shariImageAllowedForState("nearby")).toBe(false);
  });

  it("overrides engine showShariImage for Creative Studio", () => {
    const merged = applySharisPresenceToEngine(
      {
        showShariImage: true,
        showEvidenceObjects: false,
        evidenceObjects: [],
        conversationPrimary: true,
      },
      { placeId: "creative-studio" },
    );
    expect(merged.showShariImage).toBe(false);
    expect(merged.sharisPresence.state).toBe("nearby");
  });
});
