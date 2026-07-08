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

  it("selects anticipation spark when vacation target date is today", () => {
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
    expect(card?.shortTitle).toBe("Adventure Ahead");
    expect(card?.id).toContain("personal-anticipation");
  });

  it("selects upcoming anticipation spark within seven days", () => {
    const now = new Date("2026-07-01T10:00:00");
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
    expect(card?.shortTitle).toBe("Adventure Ahead");
    expect(card?.teaser).toContain("3 days to go");
  });

  it("selects gentle remembrance spark for remembrance dates", () => {
    const now = new Date("2026-03-10T10:00:00");
    const card = resolvePersonalSpark({
      now,
      personalDates: [
        {
          id: "memorial",
          label: "Dad's Birthday",
          month: 3,
          day: 10,
          kind: "remembrance",
        },
      ],
    });
    expect(card?.title).toBe("A Meaningful Day");
    expect(card?.id).toContain("personal-remembrance");
    expect(card?.sparkApplication).toContain("memory or lesson");
  });

  it("selects business anniversary spark for business milestones", () => {
    const now = new Date("2026-11-20T10:00:00");
    const card = resolvePersonalSpark({
      now,
      personalDates: [
        {
          id: "biz-launch",
          label: "Studio Launch Day",
          month: 11,
          day: 20,
          kind: "launch",
          category: "business",
        },
      ],
    });
    expect(card?.title).toBe("Look How Far You Have Come");
    expect(card?.id).toContain("personal-business");
  });

  it("prioritizes today's personal event over upcoming trip", () => {
    const now = new Date("2026-08-01T10:00:00");
    const card = resolvePersonalSpark({
      now,
      personalDates: [
        {
          id: "keynote",
          label: "Conference Keynote",
          month: 8,
          day: 1,
          kind: "speaking",
        },
        {
          id: "summer-trip",
          label: "Summer Adventure",
          month: 1,
          day: 1,
          kind: "vacation",
          targetDate: "2026-08-05",
        },
      ],
    });
    expect(card?.title).toBe("Conference Keynote");
  });
});
