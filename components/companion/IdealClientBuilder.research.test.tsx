/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IdealClientBuilder } from "./IdealClientBuilder";
import { getAvatars } from "@/lib/companionStore";

/**
 * Phase 2 integration: research threads persist on the avatar, "Add This
 * Response" routes to the active question's answer only, and adding marks the
 * draft dirty. (Dedup and thread mechanics are covered by the pure-helper and
 * panel tests; this proves the builder wires them to the right places.)
 */
describe("IdealClientBuilder — persistent research integration", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    let n = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({ json: async () => ({ message: `RESEARCH-${++n}` }) }),
      ),
    );
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  async function flush() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }

  const q = <T extends Element>(sel: string) =>
    container.querySelector(sel) as T | null;

  it("adds a research reply to the current question's answer, persists the thread, and marks dirty", async () => {
    await act(async () => {
      root.render(<IdealClientBuilder coachKickoff={1} />);
    });
    await flush();

    // Step 1 is the "who" question, a research-enabled text step.
    const entry = q<HTMLButtonElement>('[data-testid="research-question-entry"]');
    expect(entry).toBeTruthy();
    await act(async () => entry!.click());
    await flush(); // auto-research fires on open

    // The auto-researched reply is shown.
    expect(container.textContent).toContain("RESEARCH-1");

    // Add This Response → routes into the "who" answer field only.
    const add = q<HTMLButtonElement>('[data-testid="research-add-to-answer"]');
    expect(add).toBeTruthy();
    await act(async () => add!.click());
    await flush();

    const whoField = q<HTMLTextAreaElement>("#avatar-who");
    expect(whoField!.value).toContain("RESEARCH-1");

    // Adding research marks the draft dirty → Save Progress enabled.
    const save = q<HTMLButtonElement>('[data-testid="save-progress"]');
    expect(save!.disabled).toBe(false);

    // Save → the thread persists on the avatar (keyed by the question), and the
    // answer carries the added research.
    await act(async () => save!.click());
    await flush();
    const saved = getAvatars();
    expect(saved.length).toBe(1);
    expect(saved[0]!.who).toContain("RESEARCH-1");
    expect(saved[0]!.research?.threads?.who?.messages?.length ?? 0).toBeGreaterThan(
      0,
    );
    // Only the active field changed — other answers are untouched.
    expect(saved[0]!.painPoints).toBe("");
  });
});
