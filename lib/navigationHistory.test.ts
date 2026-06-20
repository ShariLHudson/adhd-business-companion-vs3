import { describe, expect, it } from "vitest";

import { createNavigationHistoryStack } from "./navigationHistory";

describe("navigationHistory", () => {
  it("pops restore callbacks in LIFO order", () => {
    const stack = createNavigationHistoryStack();
    const order: number[] = [];
    stack.push(() => order.push(1));
    stack.push(() => order.push(2));
    stack.pop()?.();
    stack.pop()?.();
    expect(order).toEqual([2, 1]);
  });
});
