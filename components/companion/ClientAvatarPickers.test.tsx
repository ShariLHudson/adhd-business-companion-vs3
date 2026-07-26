/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClientPicker } from "./ClientPicker";
import { CreateAudienceMultiPicker } from "./CreateAudienceMultiPicker";
import { saveAvatar } from "@/lib/companionStore";

/** Proves the active Client Avatar pickers render ClientAvatarMark (not emoji). */
describe("Client Avatar pickers use ClientAvatarMark", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    // Seed two avatars, one with a legacy emoji value — it must NOT render.
    saveAvatar({ name: "Burned Out Coach", emoji: "🧑‍💻" });
    saveAvatar({ name: "Anxious Founder", emoji: "🧠" });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.localStorage.clear();
  });

  it("ClientPicker renders a mark per avatar and no raw emoji", () => {
    act(() => root.render(<ClientPicker value={undefined} onChange={vi.fn()} />));
    const marks = container.querySelectorAll(
      '[data-testid^="client-avatar-mark"]',
    );
    expect(marks.length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).not.toContain("🧑‍💻");
    expect(container.textContent).not.toContain("🧠");
    expect(container.textContent).toContain("Burned Out Coach");
  });

  it("CreateAudienceMultiPicker renders a mark per avatar and no raw emoji", () => {
    act(() =>
      root.render(<CreateAudienceMultiPicker value={[]} onChange={vi.fn()} />),
    );
    const marks = container.querySelectorAll(
      '[data-testid^="client-avatar-mark"]',
    );
    expect(marks.length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).not.toContain("🧑‍💻");
    expect(container.textContent).not.toContain("🧠");
    expect(container.textContent).toContain("Anxious Founder");
  });
});
