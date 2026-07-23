import { describe, expect, it } from "vitest";
import { planChamberMemberInvite } from "./inviteChamberMember";

describe("planChamberMemberInvite", () => {
  it("starts a fresh empty thread when selecting a different member", () => {
    const plan = planChamberMemberInvite({
      previousMemberId: "finance",
      nextMemberId: "client-relationships",
    });
    expect(plan.mode).toBe("fresh");
    expect(plan.clearMessages).toBe(true);
    expect(plan.clearActiveTopic).toBe(true);
    expect(plan.abortInFlight).toBe(true);
    expect(plan.resetThreadSnapshot).toBe(true);
  });

  it("starts fresh when opening the first member (no prior estate chat)", () => {
    const plan = planChamberMemberInvite({
      previousMemberId: null,
      nextMemberId: "finance",
    });
    expect(plan.mode).toBe("fresh");
    expect(plan.clearMessages).toBe(true);
    expect(plan.clearActiveTopic).toBe(true);
  });

  it("keeps the thread when another member is explicitly added", () => {
    const plan = planChamberMemberInvite({
      previousMemberId: "finance",
      nextMemberId: "client-relationships",
      addToConversation: true,
    });
    expect(plan.mode).toBe("add");
    expect(plan.clearMessages).toBe(false);
    expect(plan.clearActiveTopic).toBe(false);
    expect(plan.abortInFlight).toBe(true);
    expect(plan.resetThreadSnapshot).toBe(false);
  });

  it("is a no-op for re-selecting the same member", () => {
    const plan = planChamberMemberInvite({
      previousMemberId: "finance",
      nextMemberId: "finance",
    });
    expect(plan.mode).toBe("same");
    expect(plan.clearMessages).toBe(false);
    expect(plan.clearActiveTopic).toBe(false);
    expect(plan.abortInFlight).toBe(false);
  });

  it("ignores addToConversation when there is no prior member", () => {
    const plan = planChamberMemberInvite({
      previousMemberId: null,
      nextMemberId: "finance",
      addToConversation: true,
    });
    expect(plan.mode).toBe("fresh");
    expect(plan.clearMessages).toBe(true);
    expect(plan.clearActiveTopic).toBe(true);
  });
});
