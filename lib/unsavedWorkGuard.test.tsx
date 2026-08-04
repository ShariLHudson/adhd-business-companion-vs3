/**
 * Unsaved-work guards — keyed registry behavior.
 * The old single slot let a second screen silently displace the first.
 * @vitest-environment jsdom
 */
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetUnsavedWorkGuardsForTests,
  confirmLeaveUnsavedWork,
  hasUnsavedWorkGuard,
  registerUnsavedWorkGuard,
  topmostDirtyUnsavedWorkGuard,
  unsavedWorkGuardCount,
} from "@/lib/unsavedWorkGuard";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Fires a cancelable beforeunload and reports whether anything blocked it. */
function fireBeforeUnload(): boolean {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

beforeEach(() => {
  __resetUnsavedWorkGuardsForTests();
});

afterEach(() => {
  __resetUnsavedWorkGuardsForTests();
});

describe("registration lifecycle", () => {
  it("registers one guard and unregisters it", () => {
    expect(unsavedWorkGuardCount()).toBe(0);
    expect(hasUnsavedWorkGuard()).toBe(false);

    const unregister = registerUnsavedWorkGuard({
      id: "solo",
      confirmLeave: () => false,
    });

    expect(unsavedWorkGuardCount()).toBe(1);
    expect(hasUnsavedWorkGuard()).toBe(true);
    expect(confirmLeaveUnsavedWork()).toBe(false);

    unregister();

    expect(unsavedWorkGuardCount()).toBe(0);
    expect(hasUnsavedWorkGuard()).toBe(false);
    expect(confirmLeaveUnsavedWork()).toBe(true);
  });

  it("is idempotent when unregister runs twice", () => {
    const unregister = registerUnsavedWorkGuard({ confirmLeave: () => false });
    registerUnsavedWorkGuard({ id: "other", confirmLeave: () => false });

    unregister();
    unregister();

    expect(unsavedWorkGuardCount()).toBe(1);
  });

  it("treats registration alone as dirty when isDirty is omitted", () => {
    registerUnsavedWorkGuard({ confirmLeave: () => false });
    expect(hasUnsavedWorkGuard()).toBe(true);
  });
});

describe("multiple guards coexist", () => {
  it("keeps both guards registered", () => {
    const unregisterA = registerUnsavedWorkGuard({
      id: "a",
      confirmLeave: () => false,
    });
    const unregisterB = registerUnsavedWorkGuard({
      id: "b",
      confirmLeave: () => false,
    });

    expect(unsavedWorkGuardCount()).toBe(2);

    unregisterA();
    expect(unsavedWorkGuardCount()).toBe(1);
    expect(topmostDirtyUnsavedWorkGuard()?.id).toBe("b");

    unregisterB();
    expect(unsavedWorkGuardCount()).toBe(0);
  });

  it("does NOT orphan the first guard when a second registers", () => {
    const confirmA = vi.fn(() => true);
    registerUnsavedWorkGuard({ id: "first", confirmLeave: confirmA });

    const unregisterB = registerUnsavedWorkGuard({
      id: "second",
      confirmLeave: () => true,
    });

    // The old single-slot module dropped "first" here.
    expect(unsavedWorkGuardCount()).toBe(2);

    // Once the newer guard leaves, the first is still protecting its screen.
    unregisterB();
    expect(hasUnsavedWorkGuard()).toBe(true);
    expect(topmostDirtyUnsavedWorkGuard()?.id).toBe("first");
    confirmLeaveUnsavedWork();
    expect(confirmA).toHaveBeenCalledTimes(1);
  });

  it("a stale unregister cannot remove a newer guard sharing its id", () => {
    const staleUnregister = registerUnsavedWorkGuard({
      id: "shared",
      confirmLeave: () => true,
    });
    staleUnregister();

    registerUnsavedWorkGuard({ id: "shared", confirmLeave: () => false });
    staleUnregister();

    expect(unsavedWorkGuardCount()).toBe(1);
    expect(confirmLeaveUnsavedWork()).toBe(false);
  });

  it("re-registering the same id replaces it and moves it to the top", () => {
    registerUnsavedWorkGuard({ id: "dup", confirmLeave: () => true });
    registerUnsavedWorkGuard({ id: "other", confirmLeave: () => true });
    registerUnsavedWorkGuard({ id: "dup", confirmLeave: () => false });

    expect(unsavedWorkGuardCount()).toBe(2);
    expect(topmostDirtyUnsavedWorkGuard()?.id).toBe("dup");
  });
});

describe("topmost dirty guard decides", () => {
  it("blocks dismissal when the topmost dirty guard declines", () => {
    registerUnsavedWorkGuard({ id: "lower", confirmLeave: () => true });
    registerUnsavedWorkGuard({ id: "upper", confirmLeave: () => false });

    expect(topmostDirtyUnsavedWorkGuard()?.id).toBe("upper");
    expect(confirmLeaveUnsavedWork()).toBe(false);
  });

  it("asks only the topmost dirty guard", () => {
    const lower = vi.fn(() => true);
    const upper = vi.fn(() => true);
    registerUnsavedWorkGuard({ id: "lower", confirmLeave: lower });
    registerUnsavedWorkGuard({ id: "upper", confirmLeave: upper });

    expect(confirmLeaveUnsavedWork()).toBe(true);
    expect(upper).toHaveBeenCalledTimes(1);
    expect(lower).not.toHaveBeenCalled();
  });

  it("skips clean guards and asks the dirty one beneath", () => {
    const dirty = vi.fn(() => false);
    registerUnsavedWorkGuard({
      id: "dirty-lower",
      isDirty: () => true,
      confirmLeave: dirty,
    });
    registerUnsavedWorkGuard({
      id: "clean-upper",
      isDirty: () => false,
      confirmLeave: () => true,
    });

    expect(topmostDirtyUnsavedWorkGuard()?.id).toBe("dirty-lower");
    expect(confirmLeaveUnsavedWork()).toBe(false);
    expect(dirty).toHaveBeenCalledTimes(1);
  });
});

describe("clean guards never block", () => {
  it("allows leaving when every registered guard is clean", () => {
    const confirmLeave = vi.fn(() => false);
    registerUnsavedWorkGuard({
      id: "clean",
      isDirty: () => false,
      confirmLeave,
    });

    expect(unsavedWorkGuardCount()).toBe(1);
    expect(hasUnsavedWorkGuard()).toBe(false);
    expect(confirmLeaveUnsavedWork()).toBe(true);
    expect(confirmLeave).not.toHaveBeenCalled();
  });

  it("treats a throwing isDirty as clean rather than trapping the member", () => {
    registerUnsavedWorkGuard({
      id: "broken",
      isDirty: () => {
        throw new Error("boom");
      },
      confirmLeave: () => false,
    });

    expect(hasUnsavedWorkGuard()).toBe(false);
    expect(confirmLeaveUnsavedWork()).toBe(true);
  });

  it("treats a throwing confirmLeave as permission to leave", () => {
    registerUnsavedWorkGuard({
      id: "broken-confirm",
      confirmLeave: () => {
        throw new Error("boom");
      },
    });

    expect(confirmLeaveUnsavedWork()).toBe(true);
  });
});

describe("beforeunload", () => {
  it("does not block when nothing is registered", () => {
    expect(fireBeforeUnload()).toBe(false);
  });

  it("blocks while any guard is dirty", () => {
    registerUnsavedWorkGuard({ id: "dirty", confirmLeave: () => true });
    expect(fireBeforeUnload()).toBe(true);
  });

  it("blocks when a lower guard is dirty and the top one is clean", () => {
    registerUnsavedWorkGuard({
      id: "dirty",
      isDirty: () => true,
      confirmLeave: () => true,
    });
    registerUnsavedWorkGuard({
      id: "clean",
      isDirty: () => false,
      confirmLeave: () => true,
    });

    expect(fireBeforeUnload()).toBe(true);
  });

  it("clears once every dirty guard unregisters", () => {
    const unregisterA = registerUnsavedWorkGuard({
      id: "a",
      confirmLeave: () => true,
    });
    const unregisterB = registerUnsavedWorkGuard({
      id: "b",
      confirmLeave: () => true,
    });
    expect(fireBeforeUnload()).toBe(true);

    unregisterA();
    expect(fireBeforeUnload()).toBe(true);

    unregisterB();
    expect(fireBeforeUnload()).toBe(false);
  });

  it("clears when a still-registered guard reports clean", () => {
    let dirty = true;
    registerUnsavedWorkGuard({
      id: "toggles",
      isDirty: () => dirty,
      confirmLeave: () => true,
    });
    expect(fireBeforeUnload()).toBe(true);

    dirty = false;
    expect(unsavedWorkGuardCount()).toBe(1);
    expect(fireBeforeUnload()).toBe(false);
  });
});

describe("React cleanup on unmount", () => {
  let container: HTMLDivElement;
  let root: Root;

  function Guarded({ id }: { id: string }) {
    useEffect(
      () => registerUnsavedWorkGuard({ id, confirmLeave: () => false }),
      [id],
    );
    return null;
  }

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("unregisters when the component unmounts", () => {
    act(() => {
      root.render(<Guarded id="panel" />);
    });
    expect(unsavedWorkGuardCount()).toBe(1);
    expect(fireBeforeUnload()).toBe(true);

    act(() => {
      root.unmount();
    });

    expect(unsavedWorkGuardCount()).toBe(0);
    expect(hasUnsavedWorkGuard()).toBe(false);
    expect(fireBeforeUnload()).toBe(false);
  });

  it("unmounting one guarded screen leaves the other registered", () => {
    act(() => {
      root.render(
        <>
          <Guarded id="one" />
          <Guarded id="two" />
        </>,
      );
    });
    expect(unsavedWorkGuardCount()).toBe(2);

    act(() => {
      root.render(<Guarded id="one" />);
    });

    expect(unsavedWorkGuardCount()).toBe(1);
    expect(topmostDirtyUnsavedWorkGuard()?.id).toBe("one");

    act(() => {
      root.unmount();
    });
    expect(unsavedWorkGuardCount()).toBe(0);
  });
});
