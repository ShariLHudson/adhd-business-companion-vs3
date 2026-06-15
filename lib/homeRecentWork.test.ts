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
  it("sorts resume list alphabetically by title", () => {
    const sorted = sortHomeRecentWorkForDisplay([
      item({ id: "1", kind: "project", title: "VIP Offer" }),
      item({ id: "2", kind: "project", title: "ADHD Workshop" }),
      item({ id: "3", kind: "chat", title: "Membership Launch" }),
    ]);
    expect(sorted.map((i) => i.title)).toEqual([
      "ADHD Workshop",
      "Membership Launch",
      "VIP Offer",
    ]);
  });
});
