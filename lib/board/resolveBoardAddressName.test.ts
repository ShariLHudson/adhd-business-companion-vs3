/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { savePrefs } from "@/lib/companionStore";
import {
  boardMemberAddressPromptInstruction,
  boardPossessiveMatter,
  resolveAddressNameForBoard,
  resolveBoardAddressName,
} from "@/lib/board/resolveBoardAddressName";
import {
  buildBoardDiscussionTurns,
  buildChairOpeningAndSummary,
  buildDirectorPerspectiveTurns,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";

afterEach(() => {
  savePrefs({
    name: "",
    email: "",
    preferredName: "",
    profileImage: "",
  });
});

describe("resolveBoardAddressName", () => {
  it("prefers preferred name", () => {
    savePrefs({
      preferredName: "Shari",
      name: "Shari Anderson",
      email: "shari@example.com",
    });
    expect(resolveBoardAddressName()).toBe("Shari");
  });

  it("uses first name from legal name when preferred is empty", () => {
    savePrefs({ preferredName: "", name: "Alex Rivera", email: "" });
    expect(resolveBoardAddressName()).toBe("Alex");
  });

  it("uses display name token when that is all that exists", () => {
    savePrefs({ preferredName: "", name: "Madonna", email: "" });
    expect(resolveBoardAddressName()).toBe("Madonna");
  });

  it("never returns email, null literals, or user", () => {
    savePrefs({ preferredName: "", name: "", email: "hello@example.com" });
    expect(resolveBoardAddressName()).toBeNull();

    expect(resolveBoardAddressName({ preferredName: "user" })).toBeNull();
    expect(resolveBoardAddressName({ preferredName: "undefined" })).toBeNull();
    expect(resolveBoardAddressName({ name: "null" })).toBeNull();
  });

  it("honors overrides and null personalization override", () => {
    savePrefs({ preferredName: "Shari", name: "Shari Anderson" });
    expect(resolveAddressNameForBoard()).toBe("Shari");
    expect(resolveAddressNameForBoard({ addressName: "Alex" })).toBe("Alex");
    expect(resolveAddressNameForBoard({ addressName: null })).toBeNull();
  });

  it("builds natural possessive fallbacks", () => {
    expect(boardPossessiveMatter("Shari", "question")).toBe("Shari's question");
    expect(boardPossessiveMatter("James", "decision")).toBe("James's decision");
    expect(boardPossessiveMatter(null, "question")).toBe("your question");
    expect(boardPossessiveMatter(null, "decision")).toBe("your decision");
    expect(boardPossessiveMatter(null, "options")).toBe("your options");
  });

  it("prompt instruction never hard-codes Shari and forbids addressing as user", () => {
    const withName = boardMemberAddressPromptInstruction("Alex");
    expect(withName).toContain("Alex");
    expect(withName).toMatch(/literal word ["']user["']/i);
    expect(withName).not.toContain("Shari");

    const fallback = boardMemberAddressPromptInstruction(null);
    expect(fallback).toContain("your question");
    expect(fallback).toMatch(/literal word ["']user["']/i);
  });
});

describe("Board discussion personalization", () => {
  it("uses preferred name near the start of Chair and Director turns", () => {
    savePrefs({ preferredName: "Shari", name: "Shari Anderson" });
    const turns = buildBoardDiscussionTurns(
      { decision: "Expand into a partnership?" },
      ["board-chair", "customer-market"],
    );
    const text = turns.map((t) => t.text).join("\n");
    expect(text).toMatch(/Shari's question/);
    expect(text).toMatch(/Shari,/);
    expect(text).not.toMatch(/Looking through my lens/i);
    expect(text).not.toMatch(/smallest honest next step that still moves/i);
    expect(text).not.toMatch(/\buser\b/i);
    expect(text).not.toMatch(/undefined|null@|@example/i);
  });

  it("falls back to your question when no name exists", () => {
    savePrefs({ preferredName: "", name: "", email: "" });
    const opening = buildChairOpeningAndSummary(
      { decision: "Hire a VA?" },
      ["board-chair"],
      { addressName: null },
    );
    const text = opening.map((t) => t.text).join("\n");
    expect(text).toMatch(/your question/i);
    expect(text).not.toMatch(/Shari/);
    expect(text).not.toMatch(/\buser\b/i);
  });

  it("updates when preferred name changes", () => {
    savePrefs({ preferredName: "Alex", name: "Alex Rivera" });
    let turns = buildDirectorPerspectiveTurns(
      { decision: "Raise prices?" },
      ["customer-market"],
    );
    expect(turns[0]?.text).toMatch(/Alex's question/);

    savePrefs({ preferredName: "Jordan", name: "Jordan Lee" });
    turns = buildDirectorPerspectiveTurns(
      { decision: "Raise prices?" },
      ["customer-market"],
    );
    expect(turns[0]?.text).toMatch(/Jordan's question/);
    expect(turns[0]?.text).not.toMatch(/Alex/);
  });

  it("personalizes every selected non-Chair Director independently", () => {
    const turns = buildDirectorPerspectiveTurns(
      { decision: "Launch a newsletter?" },
      ["customer-market", "financial-stewardship"],
      { addressName: "Morgan" },
    );
    expect(turns).toHaveLength(2);
    expect(turns[0]?.text).toMatch(/Morgan/);
    expect(turns[1]?.text).toMatch(/Morgan/);
    expect(turns.every((t) => t.speakerName)).toBe(true);
    expect(turns[0]?.text).not.toEqual(turns[1]?.text);
  });
});
