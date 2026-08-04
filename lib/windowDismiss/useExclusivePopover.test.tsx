/**
 * Step 1.3B — shared popover behavior across the first migrated batch.
 * @vitest-environment jsdom
 */
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useExclusivePopover } from "@/lib/windowDismiss/useExclusivePopover";
import {
  __resetOverlayRegistryForTests,
  listOpenOverlays,
  overlayCount,
  registerOverlay,
} from "@/lib/windowDismiss/overlayRegistry";
import {
  __resetUnsavedWorkGuardsForTests,
  registerUnsavedWorkGuard,
} from "@/lib/unsavedWorkGuard";
import {
  beginUploadInProgress,
  registerVoiceSession,
} from "@/lib/windowDismiss/dismissPolicy";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Minimal stand-in with the same shape as the migrated menus. */
function Popover({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useExclusivePopover({
    overlayId: id,
    open,
    onClose: () => setOpen(false),
    rootRef,
    triggerRef,
  });

  return (
    <div ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        data-testid={`trigger-${id}`}
        onClick={() => setOpen((v) => !v)}
      >
        open {id}
      </button>
      {open ? (
        <div role="menu" data-testid={`panel-${id}`}>
          <button type="button" data-testid={`item-${id}`}>
            item
          </button>
        </div>
      ) : null}
    </div>
  );
}

let container: HTMLDivElement;
let root: Root;

function byTestId(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

function need(id: string): HTMLElement {
  const el = byTestId(id);
  if (!el) throw new Error(`missing [data-testid="${id}"]`);
  return el;
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function pressEscape(target: EventTarget = document.body) {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
}

function pointerDownOn(el: EventTarget) {
  act(() => {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  });
}

beforeEach(() => {
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
  container = document.createElement("div");
  container.innerHTML = '<div data-testid="outside">outside</div>';
  document.body.appendChild(container);
  const host = document.createElement("div");
  container.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
});

function renderPair() {
  act(() => {
    root.render(
      <>
        <Popover id="a" />
        <Popover id="b" />
      </>,
    );
  });
}

describe("exclusivity across sibling popovers", () => {
  it("opening B closes A", () => {
    renderPair();

    click(need("trigger-a"));
    expect(byTestId("panel-a")).not.toBeNull();
    expect(overlayCount()).toBe(1);

    click(need("trigger-b"));

    expect(byTestId("panel-a")).toBeNull();
    expect(byTestId("panel-b")).not.toBeNull();
    expect(listOpenOverlays().map((o) => o.id)).toEqual(["b"]);
  });

  it("registers under kind popover while open", () => {
    renderPair();
    click(need("trigger-a"));
    expect(listOpenOverlays()).toEqual([{ id: "a", kind: "popover" }]);
  });

  it("unregisters when closed", () => {
    renderPair();
    click(need("trigger-a"));
    expect(overlayCount()).toBe(1);
    click(need("trigger-a"));
    expect(overlayCount()).toBe(0);
  });

  it("does not disturb a workspace or a dialog", () => {
    renderPair();
    const dismissWorkspace = vi.fn(() => true);
    const dismissDialog = vi.fn(() => true);
    registerOverlay({
      id: "workspace",
      kind: "workspace",
      requestDismiss: dismissWorkspace,
    });
    registerOverlay({
      id: "confirm",
      kind: "dialog",
      requestDismiss: dismissDialog,
    });

    click(need("trigger-a"));

    expect(dismissWorkspace).not.toHaveBeenCalled();
    expect(dismissDialog).not.toHaveBeenCalled();
  });

  it("never closes a dirty overlay when a popover opens", () => {
    renderPair();
    const dismissDirty = vi.fn(() => true);
    registerOverlay({
      id: "draft-sheet",
      kind: "sheet",
      requestDismiss: dismissDirty,
    });
    registerUnsavedWorkGuard({
      id: "draft-sheet",
      confirmLeave: () => false,
    });

    click(need("trigger-a"));

    expect(dismissDirty).not.toHaveBeenCalled();
  });
});

describe("Escape", () => {
  it("closes the active popover", () => {
    renderPair();
    click(need("trigger-a"));

    pressEscape();

    expect(byTestId("panel-a")).toBeNull();
  });

  it("closes only the active popover, not its sibling", () => {
    renderPair();
    click(need("trigger-a"));
    click(need("trigger-b")); // a closed by exclusivity, b now active

    pressEscape();

    expect(byTestId("panel-b")).toBeNull();
    expect(byTestId("panel-a")).toBeNull();
    expect(overlayCount()).toBe(0);
  });

  it("does nothing when no popover is open", () => {
    renderPair();
    pressEscape();
    expect(byTestId("panel-a")).toBeNull();
    expect(byTestId("panel-b")).toBeNull();
  });
});

describe("outside click", () => {
  it("closes the active popover", () => {
    renderPair();
    click(need("trigger-a"));

    pointerDownOn(need("outside"));

    expect(byTestId("panel-a")).toBeNull();
  });

  it("clicking inside the panel does not close it", () => {
    renderPair();
    click(need("trigger-a"));

    pointerDownOn(need("item-a"));

    expect(byTestId("panel-a")).not.toBeNull();
  });

  it("clicking its own trigger again does not leave it stuck open", () => {
    renderPair();
    click(need("trigger-a"));
    click(need("trigger-a"));
    expect(byTestId("panel-a")).toBeNull();
  });
});

describe("focus restoration", () => {
  it("returns focus to the opening control on Escape", () => {
    renderPair();
    const trigger = need("trigger-a");
    click(trigger);

    pressEscape();

    expect(document.activeElement).toBe(trigger);
  });

  it("returns focus to the correct opener when siblings are involved", () => {
    renderPair();
    click(need("trigger-a"));
    click(need("trigger-b"));

    pressEscape();

    // b was the active one, so focus belongs to b's trigger — not a's.
    expect(document.activeElement).toBe(need("trigger-b"));
  });

  it("returns focus after an outside click", () => {
    renderPair();
    const trigger = need("trigger-a");
    click(trigger);

    pointerDownOn(need("outside"));

    expect(document.activeElement).toBe(trigger);
  });
});

describe("existing dismissal protections still apply", () => {
  it("stays open while an upload is in progress", () => {
    renderPair();
    click(need("trigger-a"));
    const endUpload = beginUploadInProgress();

    pressEscape();
    expect(byTestId("panel-a")).not.toBeNull();

    pointerDownOn(need("outside"));
    expect(byTestId("panel-a")).not.toBeNull();

    endUpload();
    pressEscape();
    expect(byTestId("panel-a")).toBeNull();
  });

  it("stops a voice session before closing", () => {
    renderPair();
    click(need("trigger-a"));
    const stopVoice = vi.fn();
    const unregister = registerVoiceSession(stopVoice);

    pressEscape();

    expect(stopVoice).toHaveBeenCalledTimes(1);
    expect(byTestId("panel-a")).toBeNull();
    unregister();
  });

  it("a blocked popover is not closed by another opening either", () => {
    renderPair();
    click(need("trigger-a"));
    const endUpload = beginUploadInProgress();

    click(need("trigger-b"));

    // Exclusivity asked, dismissal refused — A stays open.
    expect(byTestId("panel-a")).not.toBeNull();
    endUpload();
  });
});

describe("single popover behaves as before", () => {
  it("opens and closes normally with no sibling involved", () => {
    act(() => {
      root.render(<Popover id="solo" />);
    });

    click(need("trigger-solo"));
    expect(byTestId("panel-solo")).not.toBeNull();
    expect(overlayCount()).toBe(1);

    pressEscape();
    expect(byTestId("panel-solo")).toBeNull();
    expect(overlayCount()).toBe(0);
    expect(document.activeElement).toBe(need("trigger-solo"));
  });
});
