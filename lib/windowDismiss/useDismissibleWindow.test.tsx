/**
 * Shared window dismiss primitive — real behavior, not source-text assertions.
 * Escape and outside-click must take the same guarded path.
 * @vitest-environment jsdom
 */
import { act, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDismissibleWindow } from "@/lib/windowDismiss/useDismissibleWindow";
import {
  beginActiveOperation,
  beginUploadInProgress,
  registerVoiceSession,
} from "@/lib/windowDismiss/dismissPolicy";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type HarnessProps = {
  onClose: () => void;
  open?: boolean;
  label?: string;
  requiresExplicitDecision?: boolean;
  isDirty?: boolean;
  confirmDiscard?: () => boolean;
  closeOnOutsideClick?: boolean;
};

/** Minimal window: a panel plus an outside sibling to press. */
function Harness({
  onClose,
  open = true,
  label = "panel",
  requiresExplicitDecision,
  isDirty,
  confirmDiscard,
  closeOnOutsideClick,
}: HarnessProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDismissibleWindow({
    open,
    onClose,
    outsideClickRef: panelRef,
    requiresExplicitDecision,
    isDirty,
    confirmDiscard,
    closeOnOutsideClick,
  });
  if (!open) return null;
  return (
    <div ref={panelRef} data-testid={label}>
      <button type="button" data-testid={`${label}-inside`}>
        inside
      </button>
    </div>
  );
}

let container: HTMLDivElement;
let root: Root;

function mount(node: React.ReactNode) {
  act(() => {
    root.render(node);
  });
}

function pressEscape(target: EventTarget = document.body) {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
}

function pressPointerOn(el: EventTarget) {
  act(() => {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  });
}

function byTestId(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`missing [data-testid="${id}"]`);
  return el;
}

/** Element outside every window under test. */
function outsideTarget(): HTMLElement {
  return byTestId("outside");
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

describe("useDismissibleWindow — Escape", () => {
  it("dismisses the topmost window on Escape", () => {
    const onClose = vi.fn();
    mount(<Harness onClose={onClose} />);

    pressEscape();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not steal Escape from text inputs", () => {
    const onClose = vi.fn();
    mount(<Harness onClose={onClose} />);

    const input = document.createElement("input");
    container.appendChild(input);
    pressEscape(input);

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("useDismissibleWindow — outside click", () => {
  it("dismisses when the pointer presses outside the panel", () => {
    const onClose = vi.fn();
    mount(<Harness onClose={onClose} />);

    pressPointerOn(outsideTarget());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss when the pointer presses inside the panel", () => {
    const onClose = vi.fn();
    mount(<Harness onClose={onClose} />);

    pressPointerOn(byTestId("panel-inside"));
    pressPointerOn(byTestId("panel"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("stays off for consumers that do not opt in", () => {
    const onClose = vi.fn();
    function NoOptIn() {
      useDismissibleWindow({ open: true, onClose });
      return <div data-testid="panel">panel</div>;
    }
    mount(<NoOptIn />);

    pressPointerOn(outsideTarget());

    expect(onClose).not.toHaveBeenCalled();
  });

  it("honors closeOnOutsideClick={false}", () => {
    const onClose = vi.fn();
    mount(<Harness onClose={onClose} closeOnOutsideClick={false} />);

    pressPointerOn(outsideTarget());

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("useDismissibleWindow — blocked dismissal stays open", () => {
  it("blocks explicit-decision dialogs on both Escape and outside click", () => {
    const onClose = vi.fn();
    mount(<Harness onClose={onClose} requiresExplicitDecision />);

    pressEscape();
    pressPointerOn(outsideTarget());

    expect(onClose).not.toHaveBeenCalled();
  });

  it("blocks while an upload is in progress", () => {
    const onClose = vi.fn();
    const endUpload = beginUploadInProgress();
    mount(<Harness onClose={onClose} />);

    pressEscape();
    pressPointerOn(outsideTarget());
    expect(onClose).not.toHaveBeenCalled();

    endUpload();
    pressPointerOn(outsideTarget());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("blocks while an active operation is running", () => {
    const onClose = vi.fn();
    const endOperation = beginActiveOperation();
    mount(<Harness onClose={onClose} />);

    pressPointerOn(outsideTarget());
    expect(onClose).not.toHaveBeenCalled();

    endOperation();
  });

  it("keeps dirty windows open when the member declines to discard", () => {
    const onClose = vi.fn();
    const confirmDiscard = vi.fn(() => false);
    mount(<Harness onClose={onClose} isDirty confirmDiscard={confirmDiscard} />);

    pressPointerOn(outsideTarget());

    expect(confirmDiscard).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("stops voice sessions before closing", () => {
    const onClose = vi.fn();
    const stopVoice = vi.fn();
    const unregister = registerVoiceSession(stopVoice);
    mount(<Harness onClose={onClose} />);

    pressPointerOn(outsideTarget());

    expect(stopVoice).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    unregister();
  });
});

describe("useDismissibleWindow — stacked windows", () => {
  it("dismisses only the topmost window on Escape", () => {
    const closeLower = vi.fn();
    const closeUpper = vi.fn();
    mount(
      <>
        <Harness onClose={closeLower} label="lower" />
        <Harness onClose={closeUpper} label="upper" />
      </>,
    );

    pressEscape();

    expect(closeUpper).toHaveBeenCalledTimes(1);
    expect(closeLower).not.toHaveBeenCalled();
  });

  it("dismisses only the topmost window on outside click", () => {
    const closeLower = vi.fn();
    const closeUpper = vi.fn();
    mount(
      <>
        <Harness onClose={closeLower} label="lower" />
        <Harness onClose={closeUpper} label="upper" />
      </>,
    );

    pressPointerOn(outsideTarget());

    expect(closeUpper).toHaveBeenCalledTimes(1);
    expect(closeLower).not.toHaveBeenCalled();
  });

  it("keeps stack order stable when a lower window's parent re-renders", () => {
    const closeLower = vi.fn();
    const closeUpper = vi.fn();
    // Only the LOWER window's onClose identity churns (inline arrow); the
    // upper one is stable. Stack position must not follow render churn, or
    // the lower window is silently promoted above the one actually on top.
    const tree = (tick: number) => (
      <>
        <Harness onClose={() => closeLower(tick)} label="lower" />
        <Harness onClose={closeUpper} label="upper" />
      </>
    );
    mount(tree(1));
    mount(tree(2));
    mount(tree(3));

    pressEscape();

    expect(closeUpper).toHaveBeenCalledTimes(1);
    expect(closeLower).not.toHaveBeenCalled();
  });

  it("promotes the next window down once the top one closes", () => {
    const closeLower = vi.fn();
    const closeUpper = vi.fn();
    mount(
      <>
        <Harness onClose={closeLower} label="lower" />
        <Harness onClose={closeUpper} label="upper" open />
      </>,
    );
    mount(
      <>
        <Harness onClose={closeLower} label="lower" />
        <Harness onClose={closeUpper} label="upper" open={false} />
      </>,
    );

    pressEscape();

    expect(closeUpper).not.toHaveBeenCalled();
    expect(closeLower).toHaveBeenCalledTimes(1);
  });
});
