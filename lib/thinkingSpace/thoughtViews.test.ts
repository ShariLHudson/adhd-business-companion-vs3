import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  applyThoughtFilter,
  applyThoughtView,
  THOUGHT_FILTER_OPTIONS,
  THOUGHT_VIEW_OPTIONS,
  thoughtMatchesTimeView,
} from "./thoughtViews";

function thought(
  partial: Partial<BrainDumpEntry> & { id: string; createdAt: string },
): BrainDumpEntry {
  return {
    text: "Sample",
    sorted: false,
    ...partial,
  } as BrainDumpEntry;
}

describe("thoughtViews", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-25T15:00:00.000Z"));
  });

  it("keeps view and filter options distinct", () => {
    const viewIds = new Set(THOUGHT_VIEW_OPTIONS.map((o) => o.id));
    const filterIds = new Set(
      THOUGHT_FILTER_OPTIONS.filter((o) => o.id !== "all").map((o) => o.id),
    );
    for (const id of filterIds) {
      expect(viewIds.has(id as never)).toBe(false);
    }
    expect(viewIds.has("pinned" as never)).toBe(false);
    expect(viewIds.has("archived" as never)).toBe(false);
    expect(filterIds.has("today" as never)).toBe(false);
  });

  it("applies time view then filter — collection → view → filter", () => {
    const thoughts = [
      thought({
        id: "1",
        createdAt: "2026-06-25T10:00:00.000Z",
        pinned: true,
        text: "Today pinned",
      }),
      thought({
        id: "2",
        createdAt: "2026-06-25T11:00:00.000Z",
        pinned: false,
        text: "Today not pinned",
      }),
      thought({
        id: "3",
        createdAt: "2026-06-10T10:00:00.000Z",
        pinned: true,
        text: "Older pinned",
      }),
    ];

    const viewed = applyThoughtView(thoughts, "today");
    const filtered = applyThoughtFilter(viewed, "pinned");

    expect(filtered.map((t) => t.id)).toEqual(["1"]);
  });

  it("filters waiting thoughts without a time view", () => {
    const thoughts = [
      thought({
        id: "w",
        createdAt: "2026-06-20T10:00:00.000Z",
        schedulingIntent: "later",
      }),
      thought({
        id: "n",
        createdAt: "2026-06-24T10:00:00.000Z",
        pinned: true,
      }),
    ];
    const result = applyThoughtFilter(
      applyThoughtView(thoughts, "recently-added"),
      "waiting",
    );
    expect(result.map((t) => t.id)).toEqual(["w"]);
  });

  it("matches calendar time windows", () => {
    const now = new Date("2026-06-25T15:00:00.000Z");
    expect(
      thoughtMatchesTimeView(
        thought({ id: "t", createdAt: "2026-06-25T08:00:00.000Z" }),
        "today",
        now,
      ),
    ).toBe(true);
    expect(
      thoughtMatchesTimeView(
        thought({ id: "o", createdAt: "2026-01-01T08:00:00.000Z" }),
        "older",
        now,
      ),
    ).toBe(true);
  });
});
