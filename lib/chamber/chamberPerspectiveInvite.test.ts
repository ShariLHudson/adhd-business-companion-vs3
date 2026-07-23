import { describe, expect, it } from "vitest";
import {
  LEGAL_RISK_CHAMBER_INVITE,
  buildChamberPerspectiveInvite,
} from "./chamberPerspectiveInvite";

describe("chamberPerspectiveInvite", () => {
  it("acknowledges Legal & Risk without denial language", () => {
    expect(LEGAL_RISK_CHAMBER_INVITE).toMatch(/Legal & Risk Intelligence/i);
    expect(LEGAL_RISK_CHAMBER_INVITE).toMatch(/Would you like me to bring/i);
    expect(LEGAL_RISK_CHAMBER_INVITE).not.toMatch(/can'?t connect/i);
  });

  it("builds a soft invite for a known member", () => {
    const line = buildChamberPerspectiveInvite({ memberId: "marketing" });
    expect(line).toMatch(/Marketing/i);
    expect(line).toMatch(/Would you like me to bring that perspective/i);
  });
});
