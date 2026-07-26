/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IdealClientBuilder } from "./IdealClientBuilder";
import { getAvatars } from "@/lib/companionStore";

/**
 * Step 11 "Revenue Connection" — honest, optional note. It says it does NOT
 * track revenue, tells the member where to find it, and persists like any other
 * field.
 */
describe("IdealClientBuilder — Revenue Connection (Step 11)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.localStorage.clear();
  });

  async function flush() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }
  const byText = (t: string) =>
    [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === t,
    ) as HTMLButtonElement | undefined;

  async function gotoRevenue() {
    await act(async () => root.render(<IdealClientBuilder coachKickoff={1} />));
    await flush();
    // Skip forward until Step 11 (the last step, Revenue Connection).
    for (let i = 0; i < 10 && !container.textContent?.includes("Step 11 of 11"); i++) {
      await act(async () => byText("Skip for Now")!.click());
      await flush();
    }
  }

  it("uses honest, optional Revenue Connection copy (no tracking implied)", async () => {
    await gotoRevenue();
    const text = container.textContent ?? "";
    expect(text).toContain("Step 11 of 11");
    expect(text).toContain("Revenue Connection for this Client Type");
    expect(text).toContain("does not track revenue automatically");
    expect(text).toContain("return to Step 11 later"); // where to find it
    // No dashboard/tracking language.
    expect(text).not.toContain("Track revenue");
    expect(text).not.toContain("dashboard");
    // It's optional — you can finish or skip without it.
    expect(byText("Save and Finish")).toBeTruthy();
  });

  it("persists, restores, edits and clears the note; stays optional", async () => {
    await gotoRevenue();
    const input = container.querySelector(
      'input[placeholder^="e.g. typical offer"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    const set = (v: string) => {
      const proto = window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(input, v);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    await act(async () => set("~$2k engagements, 3–6 months"));
    const save = () =>
      container.querySelector('[data-testid="save-progress"]') as HTMLButtonElement;
    expect(save().disabled).toBe(false); // adding a note enables Save Progress
    await act(async () => save().click());
    await flush();
    expect(getAvatars()[0]!.revenue).toBe("~$2k engagements, 3–6 months");

    // Edit it.
    await act(async () => set("Updated note"));
    await act(async () => save().click());
    await flush();
    expect(getAvatars()[0]!.revenue).toBe("Updated note");

    // Clear it — still valid (optional).
    await act(async () => set(""));
    await act(async () => save().click());
    await flush();
    expect(getAvatars()[0]!.revenue).toBe("");
  });
});
