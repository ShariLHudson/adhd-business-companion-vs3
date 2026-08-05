/**
 * Fix C (2026-08-05 audit) — a guided domain's Begin must bind
 * onBeginCreate to the canonical UWE work id it already minted via
 * resolveGuidedBeginOpen, instead of letting a second, independent
 * classification pass (the Creation Workspace pipeline) open a
 * different surface and orphan that id — or mint a second id for the
 * same member intent.
 *
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateEstateEntrancePanel } from "@/components/companion/CreateEstateEntrancePanel";
import { clearCreateDraftLibraryForTests } from "@/lib/createDraftLibrary";
import {
  clearForceNewCreateSession,
  resetForceNewCreateSessionForTests,
} from "@/lib/createEstate/forceNewCreateSession";
import { clearActiveWorkspaceRegistryForTests } from "@/lib/activeWorkspaceRegistry";
import { ensureEventPlanWorkTypeRegistered } from "@/lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType";

describe("CreateEstateEntrancePanel — guided domain canonical work id (Fix C)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    clearCreateDraftLibraryForTests();
    clearActiveWorkspaceRegistryForTests();
    resetForceNewCreateSessionForTests();
    clearForceNewCreateSession();
    ensureEventPlanWorkTypeRegistered();
    // jsdom does not implement scrollIntoView; the confirm gate calls it.
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderPanel(onBeginCreate: (...args: unknown[]) => unknown) {
    act(() => {
      root.render(
        <CreateEstateEntrancePanel
          onBack={() => undefined}
          onBeginCreate={onBeginCreate}
          onSelectCreationType={() => undefined}
          onResumeCreationWorkspace={() => undefined}
          onStartSomethingNew={() => undefined}
          onOpenSavedDraft={() => undefined}
          onRenameDraft={() => undefined}
          onDuplicateDraft={() => undefined}
          onDeleteDraft={() => undefined}
        />,
      );
    });
  }

  async function beginAndConfirm(text: string) {
    const input = container.querySelector<HTMLTextAreaElement>(
      "[data-testid='create-estate-nl-input']",
    )!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setter.call(input, text);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const beginButton = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-estate-start-creating']",
    )!;
    await act(async () => {
      beginButton.click();
    });

    const confirmYes = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-estate-confirm-yes']",
    );
    expect(confirmYes).toBeTruthy();
    await act(async () => {
      confirmYes!.click();
      await Promise.resolve();
    });
  }

  it("passes a canonical UWE work id through to onBeginCreate for a guided (event) domain", async () => {
    const onBeginCreate = vi.fn().mockResolvedValue(true);
    renderPanel(onBeginCreate);

    await beginAndConfirm("new workshop");

    expect(onBeginCreate).toHaveBeenCalledTimes(1);
    const [, opts] = onBeginCreate.mock.calls[0] as [unknown, { canonicalWorkId?: string | null } | undefined];
    expect(opts?.canonicalWorkId).toBeTruthy();
    expect(typeof opts?.canonicalWorkId).toBe("string");
  });

  it("does NOT set canonicalWorkId for a non-guided (single-artifact) domain", async () => {
    const onBeginCreate = vi.fn().mockResolvedValue(true);
    renderPanel(onBeginCreate);

    await beginAndConfirm("a checklist for onboarding new clients");

    expect(onBeginCreate).toHaveBeenCalledTimes(1);
    const [, opts] = onBeginCreate.mock.calls[0] as [unknown, { canonicalWorkId?: string | null } | undefined];
    expect(opts?.canonicalWorkId ?? null).toBeNull();
  });
});
