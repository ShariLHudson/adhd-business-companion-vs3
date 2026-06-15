import { describe, expect, it } from "vitest";
import type { TimeBlock } from "./companionStore";
import {
  DEFAULT_TIME_BANK_FILTERS,
  filterTimeBankBlocks,
  isTimeBankBlock,
} from "./timeBank";

function block(partial: Partial<TimeBlock>): TimeBlock {
  return {
    id: "b1",
    title: "Write slides",
    date: "",
    startTime: "09:00",
    durationMin: 60,
    energy: "medium",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("timeBank", () => {
  it("treats empty date as Time Bank", () => {
    expect(isTimeBankBlock(block({ date: "" }))).toBe(true);
    expect(isTimeBankBlock(block({ date: "2026-06-12" }))).toBe(false);
  });

  it("keeps assigned blocks in the bank", () => {
    const list = [
      block({ id: "a", projectId: "p1" }),
      block({ id: "b", projectId: undefined }),
    ];
    expect(filterTimeBankBlocks(list, DEFAULT_TIME_BANK_FILTERS)).toHaveLength(2);
    expect(
      filterTimeBankBlocks(list, { ...DEFAULT_TIME_BANK_FILTERS, assignment: "assigned" }),
    ).toHaveLength(1);
  });
});
