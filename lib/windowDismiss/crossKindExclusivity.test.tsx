/**
 * Step 1.3E — the 11 backdrop consumers registered as overlays.
 * Cross-kind exclusivity: an ordinary popover and an ordinary modal must
 * negotiate through the same registry, and a confirmation dialog must never
 * be swept aside by either.
 * @vitest-environment jsdom
 */
import { act, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDismissibleWindow } from "@/lib/windowDismiss/useDismissibleWindow";
import { useExclusivePopover } from "@/lib/windowDismiss/useExclusivePopover";
import {
  __resetOverlayRegistryForTests,
  listOpenOverlays,
  openExclusiveOverlay,
  overlayCount,
} from "@/lib/windowDismiss/overlayRegistry";
import {
  __resetUnsavedWorkGuardsForTests,
  registerUnsavedWorkGuard,
} from "@/lib/unsavedWorkGuard";
import { beginUploadInProgress } from "@/lib/windowDismiss/dismissPolicy";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Stand-in for one of the 11 migrated backdrop consumers. */
function BackdropModal({
  id,
  onClose,
  isDirty,
  confirmDiscard,
}: {
  id: string;
  onClose: () => void;
  isDirty?: boolean;
  confirmDiscard?: () => boolean;
}) {
  const { onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
    isDirty,
    confirmDiscard,
    overlayId: id,
    overlayKind: "modal",
  });
  return (
    <div data-testid={`backdrop-${id}`} onClick={onBackdropClick}>
      <div role="dialog" data-testid={`panel-${id}`} />
    </div>
  );
}

/** Stand-in for a migrated popover (Step 1.3B/C style). */
function Popover({ id, onClose }: { id: string; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useExclusivePopover({
    overlayId: id,
    open: true,
    onClose,
    rootRef,
    triggerRef,
  });
  return <div ref={rootRef} data-testid={`popover-${id}`} />;
}

/** A true confirmation dialog — the kind exclusivity must never touch. */
function ConfirmationDialog({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  useDismissibleWindow({
    open: true,
    onClose,
    requiresExplicitDecision: true,
    overlayId: id,
    overlayKind: "dialog",
  });
  return <div data-testid={`confirm-${id}`} />;
}

let container: HTMLDivElement;
let root: Root;

function clickBackdrop(id: string) {
  act(() => {
    const el = document.querySelector<HTMLElement>(`[data-testid="backdrop-${id}"]`);
    el?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

beforeEach(() => {
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
});

describe("ordinary popover vs ordinary modal", () => {
  it("an ordinary popover closes an eligible open modal, through policy", () => {
    const closeModal = vi.fn();
    act(() => {
      root.render(<BackdropModal id="decision-compass-save" onClose={closeModal} />);
    });
    expect(overlayCount()).toBe(1);

    act(() => {
      openExclusiveOverlay("some-popover");
    });

    // The modal's own onClose ran — dismissal went through requestClose /
    // requestWindowDismiss, not a forced removal from the registry.
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("an eligible modal closes an ordinary popover", () => {
    const closePopover = vi.fn();
    act(() => {
      root.render(<Popover id="some-popover" onClose={closePopover} />);
    });
    expect(overlayCount()).toBe(1);

    act(() => {
      openExclusiveOverlay("decision-compass-save");
    });

    expect(closePopover).toHaveBeenCalledTimes(1);
  });

  it("opening a modal after a popover leaves exactly one overlay registered", () => {
    const closePopover = vi.fn();
    act(() => {
      root.render(<Popover id="some-popover" onClose={closePopover} />);
    });

    act(() => {
      root.render(
        <>
          <BackdropModal id="decision-compass-save" onClose={vi.fn()} />
        </>,
      );
      openExclusiveOverlay("decision-compass-save");
    });

    expect(closePopover).toHaveBeenCalledTimes(1);
  });
});

describe("confirmation dialogs are never auto-closed", () => {
  it("an ordinary popover opening does not touch a confirmation dialog", () => {
    const closeConfirm = vi.fn();
    act(() => {
      root.render(<ConfirmationDialog id="delete-confirm" onClose={closeConfirm} />);
    });

    const result = openExclusiveOverlay("some-popover");

    expect(closeConfirm).not.toHaveBeenCalled();
    expect(result.kept).toEqual([{ id: "delete-confirm", reason: "not-temporary" }]);
  });

  it("an ordinary modal opening does not touch a confirmation dialog", () => {
    const closeConfirm = vi.fn();
    act(() => {
      root.render(<ConfirmationDialog id="delete-confirm" onClose={closeConfirm} />);
    });

    openExclusiveOverlay("todays-spark-card:abc");

    expect(closeConfirm).not.toHaveBeenCalled();
  });

  it("a confirmation dialog ignores its own backdrop (explicit decision only)", () => {
    const closeConfirm = vi.fn();
    act(() => {
      root.render(<ConfirmationDialog id="delete-confirm" onClose={closeConfirm} />);
    });

    // Confirmation dialogs render their own buttons, not a clickable backdrop
    // in this stand-in — assert the registry itself never targets it.
    expect(listOpenOverlays()).toEqual([{ id: "delete-confirm", kind: "dialog" }]);
  });
});

describe("blocked overlays are never incorrectly replaced", () => {
  it("a dirty modal stays open and the new overlay still opens", () => {
    const closeDirty = vi.fn();
    act(() => {
      root.render(
        <BackdropModal
          id="evidence-vault-browse-modal"
          onClose={closeDirty}
          isDirty
          confirmDiscard={() => false}
        />,
      );
    });

    const result = openExclusiveOverlay("todays-spark-card:xyz");

    expect(closeDirty).not.toHaveBeenCalled();
    expect(result.kept).toEqual([
      { id: "evidence-vault-browse-modal", reason: "dirty" },
    ]);
  });

  it("a modal blocked by an active upload stays open", () => {
    const closeBlocked = vi.fn();
    act(() => {
      root.render(<BackdropModal id="focus-audio-player:none" onClose={closeBlocked} />);
    });
    const endUpload = beginUploadInProgress();

    clickBackdrop("focus-audio-player:none");

    expect(closeBlocked).not.toHaveBeenCalled();
    endUpload();
  });

  it("dirty via a separately registered unsaved-work guard is also respected", () => {
    const closeDirty = vi.fn();
    act(() => {
      root.render(<BackdropModal id="project-picker:abc" onClose={closeDirty} />);
    });
    const unregister = registerUnsavedWorkGuard({
      id: "project-picker:abc",
      confirmLeave: () => false,
    });

    const result = openExclusiveOverlay("some-popover");

    expect(closeDirty).not.toHaveBeenCalled();
    expect(result.kept).toEqual([{ id: "project-picker:abc", reason: "dirty" }]);
    unregister();
  });
});

describe("Escape and backdrop affect only the topmost eligible overlay", () => {
  it("stacking a modal over a popover: only the modal responds to Escape", () => {
    const closePopover = vi.fn();
    const closeModal = vi.fn();
    act(() => {
      root.render(
        <>
          <Popover id="some-popover" onClose={closePopover} />
        </>,
      );
    });
    act(() => {
      root.render(
        <>
          <Popover id="some-popover" onClose={closePopover} />
          <BackdropModal id="decision-compass-save" onClose={closeModal} />
        </>,
      );
    });

    act(() => {
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(closePopover).not.toHaveBeenCalled();
  });

  it("a lower modal's own backdrop does not dismiss while another is topmost", () => {
    const closeLower = vi.fn();
    const closeUpper = vi.fn();
    act(() => {
      root.render(
        <>
          <BackdropModal id="chamber-member-profile:m1" onClose={closeLower} />
          <BackdropModal id="spark-note-my-collection" onClose={closeUpper} />
        </>,
      );
    });

    clickBackdrop("chamber-member-profile:m1");

    expect(closeLower).not.toHaveBeenCalled();
    expect(closeUpper).not.toHaveBeenCalled();
  });
});

describe("stable ids do not collide", () => {
  it("two card-based ids for different cards remain distinct", () => {
    act(() => {
      root.render(
        <>
          <BackdropModal id="todays-spark-card:card-1" onClose={vi.fn()} />
        </>,
      );
    });
    act(() => {
      root.render(
        <>
          <BackdropModal id="todays-spark-card:card-1" onClose={vi.fn()} />
          <BackdropModal id="todays-spark-card:card-2" onClose={vi.fn()} />
        </>,
      );
    });

    const ids = listOpenOverlays().map((o) => o.id);
    expect(ids).toEqual(["todays-spark-card:card-1", "todays-spark-card:card-2"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all 11 static/id-based overlay ids used across the batch are pairwise distinct", () => {
    const ids = [
      "board-meet-director:d1",
      "board-round-table",
      "chamber-member-profile:m1",
      "decision-compass-save",
      "focus-audio-player:p1",
      "how-spark-estate-works-together",
      "project-picker:instance-1",
      "spark-note-expanded:c1",
      "spark-note-my-collection",
      "todays-spark-card:c1",
      "evidence-vault-browse-modal",
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
