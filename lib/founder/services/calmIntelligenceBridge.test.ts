import { describe, expect, it } from "vitest";

import { prepareCalmFocus, prepareCalmOffice, prepareCalmToday } from "./calmIntelligenceBridge";

describe("Founder Calm Intelligence bridge", () => {
  it("prepareCalmOffice composes calm desk with command center", () => {
    const office = prepareCalmOffice("listening-rooms");
    expect(office.architectureOnly).toBe(true);
    expect(office.ruleOfOne.mission?.id).toBe("listening-rooms");
    expect(office.commandCenter.desk).toBeTruthy();
    expect(office.presence.neverUrgentWithoutReason).toBe(true);
  });

  it("prepareCalmToday filters to what Shari needs today", () => {
    const today = prepareCalmToday("listening-rooms");
    expect(today.recommendations.items.length).toBeLessThanOrEqual(3);
    expect(today.simplification.length).toBeGreaterThan(0);
  });

  it("prepareCalmFocus surfaces overload and interruption timing", () => {
    const focus = prepareCalmFocus("listening-rooms");
    expect(focus.focus.label).toBeTruthy();
    expect(focus.risks.items.length).toBeLessThanOrEqual(3);
  });
});
