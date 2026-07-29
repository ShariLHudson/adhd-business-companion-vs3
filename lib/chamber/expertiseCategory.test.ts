import { describe, expect, it } from "vitest";

import {
  CHAMBER_EXPERTISE_OWNERSHIP,
  resolveExpertiseCategory,
  selectGeneralChatExpertiseMember,
} from "./expertiseCategory";
import { CHAMBER_MEMBERS } from "./chamberMemberRegistry";

const PROMOTION =
  "I want to promote a team member to assistant manager, but she is not highly thought of by the rest of the team. She is the most qualified. What should I do?";
const FINANCE = "Should I spend $100 on a finance class for my business?";
const MARKETING = "I've never advertised before. Where should I start?";
const DINNER = "What should I make for dinner for a family of four?";
const OVERWHELM = "I'm overwhelmed and don't know where to start today.";
const VAGUE = "I need some help with my business.";

describe("expertiseCategory — ownership map", () => {
  it("assigns exactly one primary category to every current Chamber member", () => {
    const owned = CHAMBER_EXPERTISE_OWNERSHIP.map((e) => e.memberId);
    expect(new Set(owned).size).toBe(owned.length); // no duplicates
    expect(owned.length).toBe(CHAMBER_MEMBERS.length);
    const ownedSet = new Set(owned);
    for (const m of CHAMBER_MEMBERS) {
      expect(ownedSet.has(m.id), `missing ownership for ${m.id}`).toBe(true);
    }
  });

  it("auto-routes only the ready-enough / usable members", () => {
    const autoRouted = new Set(
      CHAMBER_EXPERTISE_OWNERSHIP.filter((e) => e.autoRoute).map((e) => e.memberId),
    );
    const expected = new Set([
      "client-relationships",
      "knowledge-management",
      "events",
      "people-culture",
      "leadership",
      "finance",
      "marketing",
      "sales",
      "strategy",
      "systems",
      "project-management",
    ]);
    expect(autoRouted).toEqual(expected);
    // Underdeveloped members are present but not auto-routed.
    const notAuto = CHAMBER_EXPERTISE_OWNERSHIP.filter((e) => !e.autoRoute).map(
      (e) => e.memberId,
    );
    expect(notAuto).toContain("wellness");
    expect(notAuto).toContain("content");
    expect(notAuto).toContain("ai-technology");
  });
});

describe("expertiseCategory — resolveExpertiseCategory (specialist)", () => {
  it("resolves HR / people-leadership to people-culture", () => {
    expect(resolveExpertiseCategory(PROMOTION)).toEqual({
      category: "people-culture",
      memberId: "people-culture",
    });
  });

  it("resolves a finance decision to finance", () => {
    expect(resolveExpertiseCategory(FINANCE)).toEqual({
      category: "finance",
      memberId: "finance",
    });
  });

  it("resolves a first-time advertising question to marketing", () => {
    expect(resolveExpertiseCategory(MARKETING)).toEqual({
      category: "marketing",
      memberId: "marketing",
    });
  });

  it("resolves conservative sales / strategy / operations signals to their owners", () => {
    expect(resolveExpertiseCategory("How do I close more deals on my sales calls?")).toEqual({
      category: "sales",
      memberId: "sales",
    });
    expect(
      resolveExpertiseCategory("I need help with my overall business strategy."),
    ).toEqual({ category: "strategy", memberId: "strategy" });
    expect(
      resolveExpertiseCategory("I want to systemize my business process with an SOP."),
    ).toEqual({ category: "operations", memberId: "systems" });
  });
});

describe("expertiseCategory — defaults to Shari / general chat", () => {
  it("returns null for a general dinner question", () => {
    expect(resolveExpertiseCategory(DINNER)).toBeNull();
  });

  it("returns null for general emotional overwhelm", () => {
    expect(resolveExpertiseCategory(OVERWHELM)).toBeNull();
  });

  it("returns null for a vague business request", () => {
    expect(resolveExpertiseCategory(VAGUE)).toBeNull();
  });

  it("returns null for an ambiguous multi-category question (no dominant category)", () => {
    // finance ("should i spend $") vs marketing ("ads") — tie → null.
    expect(resolveExpertiseCategory("Should I spend $100 on ads?")).toBeNull();
  });

  it("does not treat a Create request as expertise routing", () => {
    expect(resolveExpertiseCategory("Write me a marketing email to my clients.")).toBeNull();
    expect(resolveExpertiseCategory("Make me a marketing plan.")).toBeNull();
  });

  it("does not treat a Create rejection as expertise routing", () => {
    expect(resolveExpertiseCategory("I don't need the create room.")).toBeNull();
    expect(resolveExpertiseCategory("Just answer me here.")).toBeNull();
  });

  it("returns null for an underdeveloped/unsupported specialist area", () => {
    // wellness owner is autoRoute:false → never auto-selected.
    expect(resolveExpertiseCategory("How do I manage my energy and avoid burnout?")).toBeNull();
  });
});

describe("expertiseCategory — integration boundary", () => {
  it("selects the specialist member for a clear specialist general-chat turn", () => {
    expect(
      selectGeneralChatExpertiseMember({
        userText: PROMOTION,
        hasActiveOrNamedMember: false,
      }),
    ).toBe("people-culture");
    expect(
      selectGeneralChatExpertiseMember({
        userText: FINANCE,
        hasActiveOrNamedMember: false,
      }),
    ).toBe("finance");
  });

  it("returns null for a general turn (no hint injected)", () => {
    expect(
      selectGeneralChatExpertiseMember({
        userText: DINNER,
        hasActiveOrNamedMember: false,
      }),
    ).toBeNull();
  });

  it("preserves an already active or explicitly named member", () => {
    // Even a strongly specialist message must not override existing ownership.
    expect(
      selectGeneralChatExpertiseMember({
        userText: PROMOTION,
        hasActiveOrNamedMember: true,
      }),
    ).toBeNull();
  });
});
