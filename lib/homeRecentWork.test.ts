import { describe, expect, it } from "vitest";
import { sortHomeRecentWorkForDisplay } from "./homeRecentWork";
import type { RecentWorkItem } from "./companionStore";

function item(
  partial: Partial<RecentWorkItem> & Pick<RecentWorkItem, "id" | "title" | "kind">,
): RecentWorkItem {
  return {
    ts: "2026-06-10T12:00:00.000Z",
    ...partial,
  };
}

describe("homeRecentWork", () => {
  it("sorts resume list by most recently active first", () => {
    const sorted = sortHomeRecentWorkForDisplay([
      item({
        id: "1",
        kind: "project",
        title: "VIP Offer",
        ts: "2026-06-08T12:00:00.000Z",
      }),
      item({
        id: "2",
        kind: "project",
        title: "ADHD Workshop",
        ts: "2026-06-12T12:00:00.000Z",
      }),
      item({
        id: "3",
        kind: "chat",
        title: "Membership Launch",
        ts: "2026-06-10T12:00:00.000Z",
      }),
    ]);
    expect(sorted.map((i) => i.title)).toEqual([
      "ADHD Workshop",
      "Membership Launch",
      "VIP Offer",
    ]);
  });
});
