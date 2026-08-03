/**
 * Saved Evidence view — durable-backed reopen/edit/filter/delete.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createEvidenceEntry } from "@/lib/evidenceBankStore";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "@/lib/durableRecords/repository";
import { clearMemberRecordDurableMarksForTests } from "@/lib/durableRecords/verifiedRegistry";
import { SavedEvidenceLibrary } from "./SavedEvidenceLibrary";

function baseInput(over: Partial<Parameters<typeof createEvidenceEntry>[0]> = {}) {
  return {
    category: "Small Win" as const,
    whatHappened: "Something happened",
    whatImproved: "",
    whatMovedForward: "",
    whatProblemSolved: "",
    whoBenefited: "",
    whyItMattered: "",
    whatThisProves: "",
    attachments: [],
    ...over,
  };
}

async function flush() {
  for (let i = 0; i < 10; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

describe("SavedEvidenceLibrary", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.clear();
  });

  it("lists existing evidence and reuses the existing category filter", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "Landed the client pitch", category: "Client Result" }));
    createEvidenceEntry(baseInput({ whatHappened: "Fixed the invoice bug", category: "Problem Solving" }));

    act(() => {
      root.render(<SavedEvidenceLibrary />);
    });
    await flush();

    expect(container.textContent).toContain("Landed the client pitch");
    expect(container.textContent).toContain("Fixed the invoice bug");

    const select = container.querySelector("select") as HTMLSelectElement;
    act(() => {
      select.value = "Client Result";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await flush();

    expect(container.textContent).toContain("Landed the client pitch");
    expect(container.textContent).not.toContain("Fixed the invoice bug");
  });

  it("reopens, edits, and durably saves an entry", async () => {
    const entry = createEvidenceEntry(baseInput({ whatHappened: "Original text" }));

    act(() => {
      root.render(<SavedEvidenceLibrary />);
    });
    await flush();

    const openButton = container.querySelector(
      "button",
    ) as HTMLButtonElement;
    act(() => {
      openButton.click();
    });
    await flush();
    expect(container.textContent).toContain("Original text");

    const editButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Edit",
    ) as HTMLButtonElement;
    act(() => {
      editButton.click();
    });
    await flush();

    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    act(() => {
      nativeSetter.call(textarea, "Edited text");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const saveButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Save",
    ) as HTMLButtonElement;
    act(() => {
      saveButton.click();
    });
    await flush();

    expect(container.textContent).toContain("Edited text");

    const { fetchEvidenceVaultDurable } = await import(
      "@/lib/durableRecords/domains/evidenceVault"
    );
    expect((await fetchEvidenceVaultDurable(entry.id))?.whatHappened).toBe(
      "Edited text",
    );
  });

  it("deletes an entry durably after confirmation", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "Delete me" }));

    act(() => {
      root.render(<SavedEvidenceLibrary />);
    });
    await flush();

    const openButton = container.querySelector(
      "button",
    ) as HTMLButtonElement;
    act(() => {
      openButton.click();
    });
    await flush();

    const deleteButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Delete",
    ) as HTMLButtonElement;
    act(() => {
      deleteButton.click();
    });
    await flush();

    const confirmButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Remove",
    ) as HTMLButtonElement;
    expect(confirmButton).toBeTruthy();
    act(() => {
      confirmButton.click();
    });
    await flush();

    expect(container.textContent).not.toContain("Delete me");
  });
});
