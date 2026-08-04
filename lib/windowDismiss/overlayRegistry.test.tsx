/**
 * Overlay registry shell — identity, classification, and opt-in exclusivity.
 * @vitest-environment jsdom
 */
import { act, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetOverlayRegistryForTests,
  isOverlayDirty,
  isTemporaryOverlayKind,
  isTopmostOverlay,
  listOpenOverlays,
  openExclusiveOverlay,
  overlayCount,
  registerOverlay,
  topmostOverlay,
  type OverlayKind,
} from "@/lib/windowDismiss/overlayRegistry";
import { useDismissibleWindow } from "@/lib/windowDismiss/useDismissibleWindow";
import {
  __resetUnsavedWorkGuardsForTests,
  registerUnsavedWorkGuard,
} from "@/lib/unsavedWorkGuard";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function open(
  id: string,
  kind: OverlayKind,
  requestDismiss: () => boolean = () => true,
) {
  return registerOverlay({ id, kind, requestDismiss });
}

beforeEach(() => {
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
});

afterEach(() => {
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
});

describe("classification", () => {
  it("treats modal / sheet / popover as temporary", () => {
    expect(isTemporaryOverlayKind("modal")).toBe(true);
    expect(isTemporaryOverlayKind("sheet")).toBe(true);
    expect(isTemporaryOverlayKind("popover")).toBe(true);
  });

  it("does not treat dialog / workspace / utility as temporary", () => {
    expect(isTemporaryOverlayKind("dialog")).toBe(false);
    expect(isTemporaryOverlayKind("workspace")).toBe(false);
    expect(isTemporaryOverlayKind("utility")).toBe(false);
  });
});

describe("registration", () => {
  it("registers and unregisters", () => {
    expect(overlayCount()).toBe(0);
    const close = open("guide", "modal");
    expect(overlayCount()).toBe(1);
    expect(topmostOverlay()).toEqual({ id: "guide", kind: "modal" });
    close();
    expect(overlayCount()).toBe(0);
    expect(topmostOverlay()).toBeNull();
  });

  it("registering never closes anything by itself", () => {
    const dismissA = vi.fn(() => true);
    open("a", "modal", dismissA);
    open("b", "modal");
    expect(overlayCount()).toBe(2);
    expect(dismissA).not.toHaveBeenCalled();
  });

  it("tracks topmost by registration order", () => {
    open("a", "modal");
    open("b", "sheet");
    expect(isTopmostOverlay("b")).toBe(true);
    expect(isTopmostOverlay("a")).toBe(false);
    expect(listOpenOverlays().map((o) => o.id)).toEqual(["a", "b"]);
  });

  it("is idempotent when unregister runs twice", () => {
    const close = open("a", "modal");
    open("b", "modal");
    close();
    close();
    expect(overlayCount()).toBe(1);
  });

  it("a stale unregister cannot drop a newer overlay sharing its id", () => {
    const stale = open("dup", "modal");
    stale();
    open("dup", "modal");
    stale();
    expect(overlayCount()).toBe(1);
  });
});

describe("exclusivity", () => {
  it("closes other clean temporary overlays", () => {
    const dismissA = vi.fn(() => true);
    open("a", "modal", dismissA);
    open("b", "sheet");

    const result = openExclusiveOverlay("b");

    expect(dismissA).toHaveBeenCalledTimes(1);
    expect(result.dismissed).toEqual(["a"]);
    expect(result.kept).toEqual([]);
  });

  it("never closes the overlay claiming focus", () => {
    const dismissSelf = vi.fn(() => true);
    open("self", "modal", dismissSelf);
    openExclusiveOverlay("self");
    expect(dismissSelf).not.toHaveBeenCalled();
  });

  it("never closes a primary workspace", () => {
    const dismissWorkspace = vi.fn(() => true);
    open("projects", "workspace", dismissWorkspace);
    open("guide", "modal");

    const result = openExclusiveOverlay("guide");

    expect(dismissWorkspace).not.toHaveBeenCalled();
    expect(result.kept).toEqual([
      { id: "projects", reason: "not-temporary" },
    ]);
  });

  it("never closes a confirmation dialog — stacking stays possible", () => {
    const dismissDialog = vi.fn(() => true);
    open("confirm-delete", "dialog", dismissDialog);
    open("guide", "modal");

    const result = openExclusiveOverlay("guide");

    expect(dismissDialog).not.toHaveBeenCalled();
    expect(result.kept[0]).toEqual({
      id: "confirm-delete",
      reason: "not-temporary",
    });
  });

  it("never closes a persistent utility", () => {
    const dismissUtility = vi.fn(() => true);
    open("estate-sounds", "utility", dismissUtility);
    open("guide", "modal");
    openExclusiveOverlay("guide");
    expect(dismissUtility).not.toHaveBeenCalled();
  });

  it("never discards a dirty overlay because another opened", () => {
    const dismissDirty = vi.fn(() => true);
    registerOverlay({
      id: "draft",
      kind: "modal",
      requestDismiss: dismissDirty,
      isDirty: () => true,
    });
    open("guide", "modal");

    const result = openExclusiveOverlay("guide");

    expect(dismissDirty).not.toHaveBeenCalled();
    expect(result.kept).toEqual([{ id: "draft", reason: "dirty" }]);
    expect(overlayCount()).toBe(2);
  });

  it("keeps an overlay whose dismissal is refused (upload / operation block)", () => {
    const refuses = vi.fn(() => false);
    open("uploading", "modal", refuses);
    open("guide", "modal");

    const result = openExclusiveOverlay("guide");

    expect(refuses).toHaveBeenCalledTimes(1);
    expect(result.dismissed).toEqual([]);
    expect(result.kept).toEqual([{ id: "uploading", reason: "refused" }]);
  });

  it("treats a throwing requestDismiss as refused", () => {
    open("broken", "modal", () => {
      throw new Error("boom");
    });
    open("guide", "modal");

    const result = openExclusiveOverlay("guide");

    expect(result.kept).toEqual([{ id: "broken", reason: "refused" }]);
  });

  it("closes the clean ones while keeping the dirty one", () => {
    const dismissClean = vi.fn(() => true);
    const dismissDirty = vi.fn(() => true);
    open("clean", "modal", dismissClean);
    registerOverlay({
      id: "dirty",
      kind: "sheet",
      requestDismiss: dismissDirty,
      isDirty: () => true,
    });
    open("guide", "modal");

    const result = openExclusiveOverlay("guide");

    expect(result.dismissed).toEqual(["clean"]);
    expect(result.kept).toEqual([{ id: "dirty", reason: "dirty" }]);
    expect(dismissClean).toHaveBeenCalledTimes(1);
    expect(dismissDirty).not.toHaveBeenCalled();
  });
});

describe("unsaved-work guard integration", () => {
  it("falls back to the guard registered under the same id", () => {
    open("business-estate", "sheet");
    expect(isOverlayDirty("business-estate")).toBe(false);

    const unregister = registerUnsavedWorkGuard({
      id: "business-estate",
      confirmLeave: () => false,
    });

    expect(isOverlayDirty("business-estate")).toBe(true);
    unregister();
    expect(isOverlayDirty("business-estate")).toBe(false);
  });

  it("exclusivity honors a guard registered by id, with no local isDirty", () => {
    const dismissGuarded = vi.fn(() => true);
    open("guarded", "modal", dismissGuarded);
    registerUnsavedWorkGuard({
      id: "guarded",
      confirmLeave: () => false,
    });
    open("guide", "modal");

    const result = openExclusiveOverlay("guide");

    expect(dismissGuarded).not.toHaveBeenCalled();
    expect(result.kept).toEqual([{ id: "guarded", reason: "dirty" }]);
  });
});

describe("useDismissibleWindow membership", () => {
  let container: HTMLDivElement;
  let root: Root;

  function Overlay({
    id,
    kind,
    open: isOpen = true,
    onClose = () => {},
  }: {
    id: string;
    kind: OverlayKind;
    open?: boolean;
    onClose?: () => void;
  }) {
    const ref = useRef<HTMLDivElement>(null);
    useDismissibleWindow({
      open: isOpen,
      onClose,
      outsideClickRef: ref,
      overlayId: id,
      overlayKind: kind,
    });
    if (!isOpen) return null;
    return <div ref={ref} data-testid={id} />;
  }

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("registers while open and unregisters on unmount", () => {
    act(() => {
      root.render(<Overlay id="guide" kind="modal" />);
    });
    expect(overlayCount()).toBe(1);
    expect(topmostOverlay()).toEqual({ id: "guide", kind: "modal" });

    act(() => {
      root.unmount();
    });
    expect(overlayCount()).toBe(0);
  });

  it("does not register when overlayId is omitted", () => {
    function Unregistered() {
      useDismissibleWindow({ open: true, onClose: () => {} });
      return null;
    }
    act(() => {
      root.render(<Unregistered />);
    });
    expect(overlayCount()).toBe(0);
    act(() => {
      root.unmount();
    });
  });

  it("unregisters when the window closes without unmounting", () => {
    act(() => {
      root.render(<Overlay id="guide" kind="modal" open />);
    });
    expect(overlayCount()).toBe(1);

    act(() => {
      root.render(<Overlay id="guide" kind="modal" open={false} />);
    });
    expect(overlayCount()).toBe(0);

    act(() => {
      root.unmount();
    });
  });

  it("exclusivity closes a registered React overlay through its own onClose", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(
        <>
          <Overlay id="old" kind="modal" onClose={onClose} />
          <Overlay id="new" kind="modal" />
        </>,
      );
    });
    expect(overlayCount()).toBe(2);

    act(() => {
      openExclusiveOverlay("new");
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });
});
