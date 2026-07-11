import { describe, expect, it } from "vitest";
import {
  CHAMBER_MEMBER_ASSET_BASE,
  CHAMBER_MEMBER_IDS,
  CHAMBER_MEMBERS,
  getChamberMemberById,
  isChamberMemberId,
} from "./chamberMemberRegistry";
import { activateChamberMember, stripChamberMemberActivationMessages } from "./chamberMemberActivation";

describe("chamberMemberRegistry", () => {
  it("registers exactly 24 unique members", () => {
    expect(CHAMBER_MEMBERS).toHaveLength(24);
    expect(CHAMBER_MEMBER_IDS).toHaveLength(24);
    const ids = CHAMBER_MEMBERS.map((member) => member.id);
    expect(new Set(ids).size).toBe(24);
  });

  it("uses browser-safe public image paths", () => {
    for (const member of CHAMBER_MEMBERS) {
      expect(member.cardImagePath.startsWith(`${CHAMBER_MEMBER_ASSET_BASE}/`)).toBe(
        true,
      );
      expect(member.cardImagePath).not.toContain(" ");
      expect(member.cardImagePath).not.toContain("\\");
      expect(member.cardImagePath.endsWith(".png")).toBe(true);
    }
  });

  it("has no duplicate image paths", () => {
    const paths = CHAMBER_MEMBERS.map((member) => member.cardImagePath);
    expect(new Set(paths).size).toBe(24);
  });

  it("includes required member fields", () => {
    for (const member of CHAMBER_MEMBERS) {
      expect(member.displayName.length).toBeGreaterThan(0);
      expect(member.specialty.length).toBeGreaterThan(0);
      expect(member.bio.length).toBeGreaterThan(0);
      expect(member.howTheyHelp.length).toBeGreaterThan(0);
      expect(member.activationOpener.length).toBeGreaterThan(0);
      expect(getChamberMemberById(member.id)).toEqual(member);
      expect(isChamberMemberId(member.id)).toBe(true);
    }
  });

  it("activates a member with invite messages", () => {
    const result = activateChamberMember("momentum");
    expect(result?.member.displayName).toBe("Momentum Intelligence");
    expect(result?.messages.system).toContain("Momentum Intelligence");
    expect(result?.messages.assistant).toContain("Momentum Intelligence");
  });

  it("strips prior chamber join messages when switching members", () => {
    const first = activateChamberMember("momentum");
    const second = activateChamberMember("finance");
    const messages = [
      { role: "user", content: "Hello" },
      { role: "system", content: first!.messages.system },
      { role: "assistant", content: first!.messages.assistant },
    ];
    const stripped = stripChamberMemberActivationMessages(messages);
    expect(stripped).toHaveLength(2);
    expect(stripped[0]?.role).toBe("user");
    expect(second?.messages.system).toContain("Finance");
  });
});
