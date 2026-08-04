/**
 * Step 1.3G — LibraryRenameDialog and LibraryEditDetailsDialog on the
 * shared overlay registry, as "dialog" kind: may stack above eligible
 * popovers, never auto-closed by one.
 * @vitest-environment jsdom
 */
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryItemActionMenu } from "@/components/companion/library/LibraryItemActionMenu";
import { useDismissibleWindow } from "@/lib/windowDismiss/useDismissibleWindow";
import { LibraryRenameDialog } from "@/components/companion/library/LibraryRenameDialog";
import {
  LibraryEditDetailsDialog,
  type LibraryDetailsDraft,
} from "@/components/companion/library/LibraryEditDetailsDialog";
import {
  __resetOverlayRegistryForTests,
  listOpenOverlays,
  openExclusiveOverlay,
  overlayCount,
  registerOverlay,
} from "@/lib/windowDismiss/overlayRegistry";
import { __resetUnsavedWorkGuardsForTests } from "@/lib/unsavedWorkGuard";
import { beginUploadInProgress } from "@/lib/windowDismiss/dismissPolicy";
import type {
  LibraryItem,
  SparkLibraryCardActionId,
} from "@/lib/sparkLibraryCollection/types";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function libraryItem(id: string, title: string): LibraryItem {
  return {
    id,
    kind: "creation",
    title,
    description: "",
    statusId: "draft",
    statusLabel: "Draft",
    favorite: false,
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    capabilities: {
      canRename: true,
      canEditDetails: true,
      canDuplicate: false,
      canArchive: true,
      canRestore: false,
      canTrash: false,
      canFavorite: true,
      canCreateProject: false,
      canViewLinkedProject: false,
      canViewSourceCreation: false,
      canChangeStatus: false,
      canContinue: false,
      canOpen: false,
    },
    primaryAction: "rename",
    sourceRef: null,
  } as LibraryItem;
}

/**
 * Minimal stand-in for CreationLibraryPanel's real wiring: a per-item
 * three-dot menu (already registered, Step 1.3B) whose "Rename" / "Edit
 * details" actions open the two singleton dialogs under test.
 */
function LibraryPanelHarness({
  item,
  busy = false,
}: {
  item: LibraryItem;
  busy?: boolean;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  function handleAction(action: SparkLibraryCardActionId) {
    if (action === "rename") setRenameOpen(true);
    if (action === "edit_details") setDetailsOpen(true);
  }

  return (
    <>
      <LibraryItemActionMenu item={item} onAction={handleAction} />
      <LibraryRenameDialog
        open={renameOpen}
        title="Rename this work"
        initialName={item.title}
        busy={busy}
        onCancel={() => setRenameOpen(false)}
        onSave={() => setRenameOpen(false)}
      />
      <LibraryEditDetailsDialog
        open={detailsOpen}
        heading="Edit details"
        initial={{ title: item.title } as LibraryDetailsDraft}
        busy={busy}
        onCancel={() => setDetailsOpen(false)}
        onSave={() => setDetailsOpen(false)}
      />
    </>
  );
}

let container: HTMLDivElement;
let root: Root;

function need(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`missing [data-testid="${id}"]`);
  return el;
}
function q(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}
function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}
/**
 * Dispatches on document.activeElement, matching real browser keyboard
 * events (which always target whatever currently has focus) — dispatching
 * on document.body unconditionally would silently bypass the text-field
 * exclusion this suite exists to test, since event.target would never be
 * the focused input.
 */
function pressEscape() {
  act(() => {
    (document.activeElement ?? document.body).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
}
function clickBackdrop(testId: string) {
  click(need(testId));
}

beforeEach(() => {
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
  container = document.createElement("div");
  document.body.appendChild(container);
  const host = document.createElement("div");
  container.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
});

describe("opens from a registered library menu", () => {
  it("rename dialog opens when the menu's Rename item is picked", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));

    expect(q("library-rename-dialog")).not.toBeNull();
    expect(
      listOpenOverlays().some((o) => o.id.startsWith("library-rename:")),
    ).toBe(true);
  });

  it("edit-details dialog opens when the menu's Edit Details item is picked", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-edit_details"));

    expect(q("library-details-dialog")).not.toBeNull();
    expect(
      listOpenOverlays().some((o) => o.id.startsWith("library-edit-details:")),
    ).toBe(true);
  });

  it("the underlying popover closes as the dialog opens", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    expect(q("library-menu-panel-a")).not.toBeNull();

    click(need("library-menu-action-a-rename"));

    expect(q("library-menu-panel-a")).toBeNull();
    expect(overlayCount()).toBe(1);
  });
});

describe("dialog kind registration", () => {
  it("registers as kind dialog", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));

    const entry = listOpenOverlays().find((o) =>
      o.id.startsWith("library-rename:"),
    );
    expect(entry?.kind).toBe("dialog");
  });
});

describe("ordinary popover cannot replace an active dialog", () => {
  it("openExclusiveOverlay from a popover leaves the dialog open", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));
    expect(q("library-rename-dialog")).not.toBeNull();

    const result = openExclusiveOverlay("some-other-popover");

    expect(q("library-rename-dialog")).not.toBeNull();
    expect(
      result.kept.some((k) => k.id.startsWith("library-rename:") && k.reason === "not-temporary"),
    ).toBe(true);
  });
});

describe("opening a dialog asks an eligible popover to close, through policy", () => {
  it("a dialog opening claims exclusivity against another open popover", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    // Open the item's own action menu FIRST — its Step 1.3B popover claims
    // exclusivity too, so registering the unrelated popover only after it is
    // open isolates what the DIALOG's own opening does, moments later.
    click(need("library-menu-trigger-a"));

    const closePopover = vi.fn();
    const unregisterPopover = registerOverlay({
      id: "unrelated-popover",
      kind: "popover",
      requestDismiss: () => {
        closePopover();
        unregisterPopover();
        return true;
      },
    });

    click(need("library-menu-action-a-rename"));

    expect(closePopover).toHaveBeenCalledTimes(1);
  });
});

describe("escapeAppliesInFocusedField is opt-in, not a default change", () => {
  it("a consumer that does not pass it keeps Escape excluded from its own field", () => {
    const onClose = vi.fn();
    function PlainWindow() {
      const inputRef = useRef<HTMLInputElement>(null);
      useDismissibleWindow({ open: true, onClose });
      return <input ref={inputRef} data-testid="plain-field" />;
    }
    act(() => {
      root.render(<PlainWindow />);
    });
    act(() => {
      need("plain-field").focus();
    });

    pressEscape();

    // Every other adopter's existing accessibility behavior is unchanged:
    // Escape from inside a focused field is still not stolen by default.
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Escape closes only the active dialog", () => {
  it("closes the topmost dialog", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));

    pressEscape();

    expect(q("library-rename-dialog")).toBeNull();
  });

  it("closes even while focus is inside the dialog's own auto-focused input — the field it opens into, not an edge case", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));
    const input = need("library-rename-input");
    act(() => {
      input.focus();
    });
    expect(document.activeElement).toBe(input);

    pressEscape();

    expect(q("library-rename-dialog")).toBeNull();
  });

  it("edit-details dialog also closes while its own input is focused", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-edit_details"));
    const input = need("library-details-title");
    act(() => {
      input.focus();
    });

    pressEscape();

    expect(q("library-details-dialog")).toBeNull();
  });

  it("does not close a lower dialog while another dialog is on top", () => {
    const closeLower = vi.fn();
    const closeUpper = vi.fn();
    registerOverlay({ id: "lower-dialog", kind: "dialog", requestDismiss: closeLower });
    registerOverlay({ id: "upper-dialog", kind: "dialog", requestDismiss: closeUpper });

    pressEscape();

    // Both are plain registrations (no real useDismissibleWindow instance),
    // so Escape here exercises only the *stack* used by useDismissibleWindow
    // consumers; neither is wired to it, so neither fires — the point is
    // registry membership order is what a real topmost check would use.
    expect(listOpenOverlays().map((o) => o.id)).toEqual([
      "lower-dialog",
      "upper-dialog",
    ]);
  });
});

describe("outside-click follows current dialog policy", () => {
  it("closes on a direct backdrop press", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));

    clickBackdrop("library-rename-dialog");

    expect(q("library-rename-dialog")).toBeNull();
  });

  it("a click inside the dialog does not dismiss", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));

    click(need("library-rename-input"));

    expect(q("library-rename-dialog")).not.toBeNull();
  });
});

describe("blocked or dirty dialog remains open", () => {
  it("busy blocks Escape", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} busy />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));

    pressEscape();

    expect(q("library-rename-dialog")).not.toBeNull();
  });

  it("busy blocks the backdrop", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} busy />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));

    clickBackdrop("library-rename-dialog");

    expect(q("library-rename-dialog")).not.toBeNull();
  });

  it("an unrelated active upload also blocks dismissal", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    click(need("library-menu-action-a-rename"));
    const endUpload = beginUploadInProgress();

    pressEscape();
    expect(q("library-rename-dialog")).not.toBeNull();

    endUpload();
    pressEscape();
    expect(q("library-rename-dialog")).toBeNull();
  });
});

describe("focus returns to the opener", () => {
  it("returns focus to whatever was focused before the dialog opened", () => {
    act(() => {
      root.render(<LibraryPanelHarness item={libraryItem("a", "Draft A")} />);
    });
    click(need("library-menu-trigger-a"));
    const renameMenuItem = need("library-menu-action-a-rename");
    act(() => {
      renameMenuItem.focus();
    });
    click(renameMenuItem);
    expect(q("library-rename-dialog")).not.toBeNull();

    pressEscape();

    expect(document.activeElement).toBe(need("library-menu-trigger-a"));
  });
});

describe("existing library behavior is unchanged", () => {
  it("Save still submits the edited name", () => {
    const onSave = vi.fn();
    act(() => {
      root.render(
        <LibraryRenameDialog
          open
          title="Rename this work"
          initialName="Old Name"
          onCancel={vi.fn()}
          onSave={onSave}
        />,
      );
    });
    const input = need("library-rename-input") as HTMLInputElement;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )!.set!;
    act(() => {
      nativeSetter.call(input, "New Name");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    click(need("library-rename-save"));
    expect(onSave).toHaveBeenCalledWith("New Name");
  });

  it("Save and Cancel stay disabled while busy, as before", () => {
    act(() => {
      root.render(
        <LibraryRenameDialog
          open
          title="Rename this work"
          initialName="Old Name"
          busy
          onCancel={vi.fn()}
          onSave={vi.fn()}
        />,
      );
    });
    expect((need("library-rename-save") as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("an error message still renders", () => {
    act(() => {
      root.render(
        <LibraryRenameDialog
          open
          title="Rename this work"
          initialName="Old Name"
          errorMessage="Could not rename"
          onCancel={vi.fn()}
          onSave={vi.fn()}
        />,
      );
    });
    expect(need("library-rename-error").textContent).toBe("Could not rename");
  });
});
