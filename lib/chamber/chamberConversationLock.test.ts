import { describe, expect, it } from "vitest";
import { isChamberMemberConversationActive } from "./chamberConversationLock";

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
