import { describe, expect, it } from "vitest";
import {
  popPanelNavigationFrame,
  pushPanelNavigationFrame,
} from "./panelNavigationStack";

describe("panelNavigationStack", () => {
  it("pushes and restores prior panel state", () => {
    const initial = { view: "garden" as const, query: "" };
    const pushed = pushPanelNavigationFrame(
      [],
      initial,
      { view: "collection", query: "" },
      "My Thoughts™",
    );

    expect(pushed.frames).toHaveLength(1);
    expect(pushed.frames[0]?.backDestination).toBe("My Thoughts™");
    expect(pushed.snapshot.view).toBe("collection");

    const popped = popPanelNavigationFrame(pushed.frames);
    expect(popped.frames).toHaveLength(0);
    expect(popped.snapshot).toEqual(initial);
  });
});
