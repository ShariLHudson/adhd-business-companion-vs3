/**
 * ModalSheet — first adopter of the shared dismiss policy.
 * Escape, outside click, and Close must all take the same guarded path.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ModalSheet } from "@/components/companion/ModalSheet";
import { beginUploadInProgress } from "@/lib/windowDismiss/dismissPolicy";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function mount(node: React.ReactNode) {
  act(() => {
    root.render(node);
  });
}

function byTestId(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`missing [data-testid="${id}"]`);
  return el;
}

function pressEscape() {
  act(() => {
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
}

function pressPointerOn(el: EventTarget) {
  act(() => {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  });
}

function clickOn(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

beforeEach(() => {
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
});

function sheet(onClose: () => void, open = true) {
  return (
    <ModalSheet open={open} onClose={onClose} title="Settings">
      <button type="button" data-testid="sheet-content">
        content
      </button>
    </ModalSheet>
  );
}

describe("ModalSheet dismissal", () => {
  it("closes on Escape", () => {
    const onClose = vi.fn();
    mount(sheet(onClose));

    pressEscape();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the pointer presses the backdrop", () => {
    const onClose = vi.fn();
    mount(sheet(onClose));

    pressPointerOn(byTestId("modal-sheet-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the sheet", () => {
    const onClose = vi.fn();
    mount(sheet(onClose));

    pressPointerOn(byTestId("sheet-content"));
    clickOn(byTestId("sheet-content"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes from the header Close button", () => {
    const onClose = vi.fn();
    mount(sheet(onClose));

    clickOn(byTestId("modal-sheet-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stays open while a blocking operation is in progress", () => {
    const onClose = vi.fn();
    const endUpload = beginUploadInProgress();
    mount(sheet(onClose));

    pressEscape();
    pressPointerOn(byTestId("modal-sheet-backdrop"));
    clickOn(byTestId("modal-sheet-close"));
    expect(onClose).not.toHaveBeenCalled();

    endUpload();
    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing and ignores Escape when closed", () => {
    const onClose = vi.fn();
    mount(sheet(onClose, false));

    expect(document.querySelector('[data-testid="modal-sheet"]')).toBeNull();
    pressEscape();

    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps the backdrop out of the accessibility tree", () => {
    mount(sheet(vi.fn()));

    const backdrop = byTestId("modal-sheet-backdrop");
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(backdrop.tagName).toBe("DIV");
  });
});
