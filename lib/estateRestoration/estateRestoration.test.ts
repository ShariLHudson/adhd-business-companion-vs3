/**
 * Intentional Restoration tests
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bestRestorationTrigger,
  buildRestorationOffer,
  buildStoryPick,
  evaluateRestorationOpportunity,
  formatRestorationOfferReply,
  isRestorationAcceptance,
  isRestorationOfferMessage,
  resolveRestorationReturn,
  saveRestorationStore,
} from "./index";

describe("estateRestoration", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    saveRestorationStore({
      version: 1,
      readSpreadIds: [],
      favoriteSpreadIds: [],
      declinedAtTurns: [],
      lastOfferAtTurn: null,
      lastOfferAt: null,
    });
  });

  it("detects mental fatigue and stuck signals", () => {
    expect(bestRestorationTrigger({ userText: "I feel stuck on this" })).toBe(
      "stuck",
    );
    expect(
      bestRestorationTrigger({ userText: "my brain is fried" }),
    ).toBe("mental_fatigue");
    expect(
      bestRestorationTrigger({ userText: "help me write an email" }),
    ).toBeNull();
  });

  it("builds butterfly conservatory story snippet", () => {
    const pick = buildStoryPick(
      "butterfly-conservatory",
      "overwhelmed context",
    );
    expect(pick?.title).toMatch(/Butterfly Conservatory/i);
    expect(pick?.conversationalSnippet).toMatch(/Eleanor|butterflies/i);
  });

  it("selects overwhelmed stories when overwhelmed", () => {
    const eval_ = evaluateRestorationOpportunity({
      userText: "I'm mentally exhausted",
      currentTurn: 10,
      overwhelmed: true,
    });
    expect(eval_?.story.spreadId).toBeTruthy();
    expect(["butterfly-conservatory", "lakeside-hammock", "estate-gardens"]).toContain(
      eval_?.story.spreadId,
    );
  });

  it("formats warm restoration offer without break language", () => {
    const eval_ = evaluateRestorationOpportunity({
      userText: "I keep revising this and it's not working",
      currentTurn: 12,
    });
    expect(eval_).not.toBeNull();
    const offer = buildRestorationOffer(eval_!);
    const reply = formatRestorationOfferReply(offer);
    expect(reply).not.toMatch(/take a break|you should rest/i);
    expect(reply).toMatch(/Gardens|Conservatory|pages|story/i);
  });

  it("recognizes restoration acceptance", () => {
    expect(isRestorationAcceptance("yes I'd love that")).toBe(true);
    expect(isRestorationAcceptance("tell me the story")).toBe(true);
  });

  it("resolves return to work warmly", () => {
    const result = resolveRestorationReturn("your SOP");
    expect(result.welcomeBack).toMatch(/really glad you're here/i);
    expect(result.reconnectQuestion).toMatch(/SOP/i);
  });

  it("detects restoration offer in assistant message", () => {
    expect(
      isRestorationOfferMessage(
        "Would you like to read a couple of pages from the Estate Guide?",
      ),
    ).toBe(true);
  });
});
