import { describe, expect, it } from "vitest";

import { resolvePersonalSpark } from "./personalSparks";

describe("resolvePersonalSpark", () => {
  it("selects celebration spark for workshop on matching date", () => {
    const now = new Date("2026-09-12T10:00:00");
    const card = resolvePersonalSpark({
      now,
      firstName: "Jordan",
      personalDates: [
        {
          id: "workshop-day",
          label: "Creative Workshop Day",
          month: 9,
          day: 12,
          kind: "workshop",
        },
      ],
    });
    expect(card?.source).toBe("personal");
    expect(card?.title).toBe("Creative Workshop Day");
    expect(card?.id).toContain("personal-celebration");
  });

  it("selects celebration spark when vacation target date is today", () => {
    const now = new Date("2026-07-04T10:00:00");
    const card = resolvePersonalSpark({
      now,
      personalDates: [
        {
          id: "summer-trip",
          label: "Summer Adventure",
          month: 1,
          day: 1,
          kind: "vacation",
          targetDate: "2026-07-04",
        },
      ],
    });
    expect(card?.source).toBe("personal");
    expect(card?.title).toBe("Summer Adventure");
  });
});
