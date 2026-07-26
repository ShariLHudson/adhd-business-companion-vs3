/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EstateWorkspaceOfferCard } from "./EstateWorkspaceOfferCard";
import type { WorkspaceOffer } from "@/lib/workspaceMode";

const offer: WorkspaceOffer = {
  section: "client-avatars",
  buttonLabel: "Open the Client Avatar Builder",
  line: "That's exactly what the Client Avatar Builder is designed to help with…",
};

describe("EstateWorkspaceOfferCard", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const btn = (label: string) =>
    [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === label,
    ) as HTMLButtonElement | undefined;

  it("hides 'Show map' when onShowMap is omitted (Client Avatar invitation)", () => {
    const onAccept = vi.fn();
    const onStayHere = vi.fn();
    act(() =>
      root.render(
        <EstateWorkspaceOfferCard
          offer={offer}
          onAccept={onAccept}
          onStayHere={onStayHere}
        />,
      ),
    );
    expect(btn("Show map")).toBeUndefined();
    // Only the two intended choices remain, and they work.
    expect(btn("Open the Client Avatar Builder")).toBeTruthy();
    expect(btn("Stay here")).toBeTruthy();
    act(() => btn("Open the Client Avatar Builder")!.click());
    expect(onAccept).toHaveBeenCalledTimes(1);
    act(() => btn("Stay here")!.click());
    expect(onStayHere).toHaveBeenCalledTimes(1);
  });

  it("shows 'Show map' when onShowMap is provided (other estate offers)", () => {
    const onShowMap = vi.fn();
    act(() =>
      root.render(
        <EstateWorkspaceOfferCard
          offer={offer}
          onAccept={vi.fn()}
          onStayHere={vi.fn()}
          onShowMap={onShowMap}
        />,
      ),
    );
    const showMap = btn("Show map");
    expect(showMap).toBeTruthy();
    act(() => showMap!.click());
    expect(onShowMap).toHaveBeenCalledTimes(1);
  });
});
