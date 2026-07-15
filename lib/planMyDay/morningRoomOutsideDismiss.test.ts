/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { handleMorningRoomOutsideClick } from "./morningRoomOutsideDismiss";

describe("handleMorningRoomOutsideClick", () => {
  it("dismisses when the click is outside the frosted workspace", () => {
    const scroll = document.createElement("div");
    const workspace = document.createElement("div");
    workspace.setAttribute("data-morning-room-workspace", "true");
    scroll.appendChild(workspace);
    const outside = document.createElement("div");
    scroll.appendChild(outside);

    const onOutsideDismiss = vi.fn();
    handleMorningRoomOutsideClick(
      { currentTarget: scroll, target: outside },
      onOutsideDismiss,
    );
    expect(onOutsideDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss when the click is inside the frosted workspace", () => {
    const scroll = document.createElement("div");
    const workspace = document.createElement("div");
    workspace.setAttribute("data-morning-room-workspace", "true");
    const inner = document.createElement("button");
    workspace.appendChild(inner);
    scroll.appendChild(workspace);

    const onOutsideDismiss = vi.fn();
    handleMorningRoomOutsideClick(
      { currentTarget: scroll, target: inner },
      onOutsideDismiss,
    );
    expect(onOutsideDismiss).not.toHaveBeenCalled();
  });

  it("no-ops when dismiss handler is omitted", () => {
    const scroll = document.createElement("div");
    expect(() =>
      handleMorningRoomOutsideClick({ currentTarget: scroll, target: scroll }),
    ).not.toThrow();
  });
});
