import { describe, expect, it } from "vitest";
import {
  evidenceVaultContextReply,
  isEvidenceVaultLeaveRequest,
  looksLikeEvidenceVaultDiscoveryShare,
} from "./evidenceVaultContextLock";

describe("evidenceVaultContextLock", () => {
  it("treats discovery shares as preservable", () => {
    expect(
      looksLikeEvidenceVaultDiscoveryShare(
        "i discovered that probably more business people have adhd than i thought",
      ),
    ).toBe(true);
    expect(
      looksLikeEvidenceVaultDiscoveryShare("I realized clients need simpler steps."),
    ).toBe(true);
  });

  it("does not treat leave requests as discovery shares", () => {
    expect(isEvidenceVaultLeaveRequest("back to the estate")).toBe(true);
    expect(looksLikeEvidenceVaultDiscoveryShare("return to estate")).toBe(
      false,
    );
  });

  it("does not invent vault replies when not in vault context", () => {
    expect(
      evidenceVaultContextReply(
        "i discovered that probably more business people have adhd than i thought",
      ),
    ).toBeNull();
  });
});
