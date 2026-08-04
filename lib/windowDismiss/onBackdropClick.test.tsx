/**
 * Step 1.3D — the legacy onBackdropClick path, now guarded.
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

/**
 * Wrapper-style consumer: the click handler sits on the backdrop, which also
 * contains the panel. This is the riskier of the two shapes in the codebase.
 */
function Window({
  id,
  onClose,
  requiresExplicitDecision,
  isDirty,
  confirmDiscard,
  outsideClickIgnore,
}: {
  id: string;
  onClose: () => void;
  requiresExplicitDecision?: boolean;
  isDirty?: boolean;
  confirmDiscard?: () => boolean;
  outsideClickIgnore?: string;
}) {
  const { onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
    requiresExplicitDecision,
    isDirty,
    confirmDiscard,
    outsideClickIgnore,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  return (
    <div data-testid={`backdrop-${id}`} onClick={onBackdropClick}>
      <div ref={panelRef} role="dialog" data-testid={`panel-${id}`}>
        <button type="button" data-testid={`inside-${id}`}>
          inside
        </button>
      </div>
    </div>
  );
}

let container: HTMLDivElement;
let root: Root;

function need(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`missing [data-testid="${id}"]`);
  return el;
}

/** Real bubbling click, so target/currentTarget are set as in the browser. */
function clickOn(el: HTMLElement, init: MouseEventInit = {}) {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, ...init }));
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("topmost ordering", () => {
  it("dismisses when the window is topmost", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });

    clickOn(need("backdrop-a"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("a lower stacked window does NOT dismiss from its own backdrop", () => {
    const closeLower = vi.fn();
    const closeUpper = vi.fn();
    act(() => {
      root.render(
        <>
          <Window id="lower" onClose={closeLower} />
          <Window id="upper" onClose={closeUpper} />
        </>,
      );
    });

    clickOn(need("backdrop-lower"));

    expect(closeLower).not.toHaveBeenCalled();
    expect(closeUpper).not.toHaveBeenCalled();
  });

  it("the topmost window still dismisses while stacked", () => {
    const closeLower = vi.fn();
    const closeUpper = vi.fn();
    act(() => {
      root.render(
        <>
          <Window id="lower" onClose={closeLower} />
          <Window id="upper" onClose={closeUpper} />
        </>,
      );
    });

    clickOn(need("backdrop-upper"));

    expect(closeUpper).toHaveBeenCalledTimes(1);
    expect(closeLower).not.toHaveBeenCalled();
  });
});

describe("inside the panel", () => {
  it("a click on panel content does not dismiss", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });

    clickOn(need("inside-a"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("a click on the panel itself does not dismiss", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });

    clickOn(need("panel-a"));

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("portaled content", () => {
  it("a recognized portaled control does not dismiss", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });

    // A listbox that bubbles to the backdrop through the React tree.
    const listbox = document.createElement("div");
    listbox.setAttribute("role", "listbox");
    const option = document.createElement("div");
    listbox.appendChild(option);
    need("backdrop-a").appendChild(listbox);

    clickOn(option as HTMLElement);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("content matched by outsideClickIgnore does not dismiss", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(
        <Window
          id="a"
          onClose={onClose}
          outsideClickIgnore="[data-owned-panel]"
        />,
      );
    });

    const owned = document.createElement("div");
    owned.setAttribute("data-owned-panel", "1");
    need("backdrop-a").appendChild(owned);

    clickOn(owned as HTMLElement);

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("scrollbar", () => {
  it("a press on the backdrop's scrollbar does not dismiss", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });

    const backdrop = need("backdrop-a");
    // jsdom has no layout — describe an element that overflows horizontally.
    Object.defineProperty(backdrop, "clientWidth", { value: 90, configurable: true });
    Object.defineProperty(backdrop, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(backdrop, "scrollWidth", { value: 200, configurable: true });
    Object.defineProperty(backdrop, "scrollHeight", { value: 100, configurable: true });
    backdrop.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;

    // x=95 lands past the 90px content box — on the vertical scrollbar.
    clickOn(backdrop, { clientX: 95, clientY: 10 });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("a press on the backdrop's content area still dismisses", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });

    const backdrop = need("backdrop-a");
    Object.defineProperty(backdrop, "clientWidth", { value: 90, configurable: true });
    Object.defineProperty(backdrop, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(backdrop, "scrollWidth", { value: 200, configurable: true });
    Object.defineProperty(backdrop, "scrollHeight", { value: 100, configurable: true });
    backdrop.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;

    clickOn(backdrop, { clientX: 10, clientY: 10 });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("blocked dismissal stays open", () => {
  it("an explicit-decision dialog ignores the backdrop", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} requiresExplicitDecision />);
    });

    clickOn(need("backdrop-a"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("an upload in progress blocks, then releases", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });
    const endUpload = beginUploadInProgress();

    clickOn(need("backdrop-a"));
    expect(onClose).not.toHaveBeenCalled();

    endUpload();
    clickOn(need("backdrop-a"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("an active operation blocks", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });
    const endOperation = beginActiveOperation();

    clickOn(need("backdrop-a"));

    expect(onClose).not.toHaveBeenCalled();
    endOperation();
  });

  it("dirty work is confirmed, and a decline keeps it open", () => {
    const onClose = vi.fn();
    const confirmDiscard = vi.fn(() => false);
    act(() => {
      root.render(
        <Window id="a" onClose={onClose} isDirty confirmDiscard={confirmDiscard} />,
      );
    });

    clickOn(need("backdrop-a"));

    expect(confirmDiscard).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("stops a voice session before closing", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(<Window id="a" onClose={onClose} />);
    });
    const stopVoice = vi.fn();
    const unregister = registerVoiceSession(stopVoice);

    clickOn(need("backdrop-a"));

    expect(stopVoice).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    unregister();
  });
});

describe("no-argument call still supported", () => {
  it("dismisses without an event, using stack and policy only", () => {
    const onClose = vi.fn();
    let handler: ((event?: unknown) => boolean) | null = null;

    function Legacy() {
      const { onBackdropClick } = useDismissibleWindow({ open: true, onClose });
      handler = onBackdropClick;
      return null;
    }
    act(() => {
      root.render(<Legacy />);
    });

    act(() => {
      handler?.();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
