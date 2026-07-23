import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildChamberSpecialistPrimaryTurn,
  chamberSpecialistBlocksGenericHandlers,
  isChamberMemberConversationActive,
} from "./chamberConversationLock";

describe("isChamberMemberConversationActive", () => {
  it("locks navigation while a chamber member is selected", () => {
    expect(
      isChamberMemberConversationActive({
        activeSection: "chamber-of-momentum",
        activeMemberId: "spark-strategist",
      }),
    ).toBe(true);
  });

  it("does not lock when browsing the gallery without a member", () => {
    expect(
      isChamberMemberConversationActive({
        activeSection: "chamber-of-momentum",
        activeMemberId: null,
      }),
    ).toBe(false);
  });
});

describe("chamber specialist routing lock", () => {
  it("builds a primary turn that stays in companion chat", () => {
    const turn = buildChamberSpecialistPrimaryTurn("finance");
    expect(turn.owner).toBe("chamber:finance");
    expect(turn.type).toBe("RELATIONSHIP_CHAT");
    expect(turn.blockKernelNavigation).toBe(true);
    expect(turn.blockSecondaryResponders).toBe(true);
    expect(turn.reason).toMatch(/no research\/frictionless divert/i);
  });

  it("blocks generic handlers only while a member conversation is active", () => {
    expect(
      chamberSpecialistBlocksGenericHandlers({
        activeSection: "chamber-of-momentum",
        activeMemberId: "content",
      }),
    ).toBe(true);
    expect(
      chamberSpecialistBlocksGenericHandlers({
        activeSection: "welcome-home",
        activeMemberId: "content",
      }),
    ).toBe(false);
  });
});

describe("CompanionPageClient Chamber routing wiring", () => {
  it("wires chamber lock before frictionless local replies and kernel", () => {
    const source = readFileSync(
      join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain("buildChamberSpecialistPrimaryTurn");
    expect(source).toContain("chamberSpecialistBlocksGenericHandlers");
    expect(source).toContain("chamber_specialist_owns_turn");
    expect(source).toMatch(
      /chamberMemberConversationLocked[\s\S]*?return false;/,
    );
    expect(source).toMatch(
      /chamberConversationLocked[\s\S]*?\? false[\s\S]*?executeCompanionIntent/,
    );
    expect(source).toMatch(
      /suppressRelationshipIntelligence =\s*[\s\S]*?chamberConversationLocked/,
    );
  });
});
