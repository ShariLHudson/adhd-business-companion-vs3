/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IdealClientAvatar } from "@/lib/companionStore";
import { AudienceSelectionField } from "./AudienceSelectionField";
import {
  createDefaultAudienceSelection,
  type AudienceSelection,
} from "@/lib/audienceSelection";

const NOW = "2026-01-01T00:00:00.000Z";

function avatar(p: Partial<IdealClientAvatar> & { id: string }): IdealClientAvatar {
  return {
    name: p.id,
    tagline: "",
    who: "",
    painPoints: "",
    goals: "",
    currentBehavior: "",
    solution: "",
    createdAt: NOW,
    updatedAt: NOW,
    ...p,
  };
}

const mary = avatar({ id: "a1", name: "Mary", who: "Coaches", painPoints: "burnout" });
const susan = avatar({ id: "a2", name: "Susan", who: "Founders", goals: "grow" });
const draftDan = avatar({ id: "d1", name: "Dan", who: "Someone" });

function sel(over: Partial<AudienceSelection> = {}): AudienceSelection {
  return { ...createDefaultAudienceSelection(NOW), ...over };
}

describe("AudienceSelectionField", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function render(props: Partial<Parameters<typeof AudienceSelectionField>[0]> = {}) {
    const onChange = vi.fn();
    act(() =>
      root.render(
        <AudienceSelectionField
          value={props.value ?? sel()}
          avatars={props.avatars ?? [mary, susan, draftDan]}
          onChange={props.onChange ?? onChange}
          onCreateAvatar={props.onCreateAvatar}
          now={NOW}
        />,
      ),
    );
    return props.onChange ?? onChange;
  }

  const q = (id: string) => container.querySelector(`[data-testid="${id}"]`);

  it("offers all four audience choices when avatars exist (optional, non-blocking)", () => {
    render();
    expect(q("audience-mode-none")).toBeTruthy();
    expect(q("audience-mode-single")).toBeTruthy();
    expect(q("audience-mode-multiple")).toBeTruthy();
    expect(q("audience-mode-all")).toBeTruthy();
    // None selected by default — nothing forces a choice.
    expect(q("audience-avatar-list")).toBeNull();
  });

  it("with no avatars, only offers No specific audience + Create a Client Avatar", () => {
    const onCreateAvatar = vi.fn();
    render({ avatars: [], onCreateAvatar });
    expect(q("audience-mode-none")).toBeTruthy();
    expect(q("audience-mode-single")).toBeNull();
    expect(q("audience-mode-all")).toBeNull();
    const create = q("audience-create-avatar") as HTMLButtonElement;
    expect(create).toBeTruthy();
    act(() => create.click());
    expect(onCreateAvatar).toHaveBeenCalledOnce();
  });

  it("reports a single-avatar pick", () => {
    const onChange = render({ value: sel({ selectionMode: "single" }) });
    const btn = q("audience-avatar-a1") as HTMLButtonElement;
    act(() => btn.click());
    const next = onChange.mock.calls.at(-1)![0] as AudienceSelection;
    expect(next.selectionMode).toBe("single");
    expect(next.selectedAvatarIds).toEqual(["a1"]);
  });

  it("hides the output-strategy control for zero or one audience", () => {
    render({ value: sel({ selectionMode: "single", selectedAvatarIds: ["a1"] }) });
    expect(q("multi-avatar-output-strategy")).toBeNull();
  });

  it("shows the output-strategy control only when two+ audiences resolve", () => {
    render({ value: sel({ selectionMode: "multiple", selectedAvatarIds: ["a1", "a2"] }) });
    expect(q("multi-avatar-output-strategy")).toBeTruthy();
    expect(q("output-mode-shared")).toBeTruthy();
    expect(q("output-mode-separate")).toBeTruthy();
    expect(q("output-mode-tailored")).toBeTruthy();
    expect(q("output-mode-compare")).toBeTruthy();
  });

  it("does not let drafts be selected by default", () => {
    render({ value: sel({ selectionMode: "multiple" }) });
    const draftBtn = q("audience-avatar-d1") as HTMLButtonElement;
    expect(draftBtn.disabled).toBe(true);
    const completeBtn = q("audience-avatar-a1") as HTMLButtonElement;
    expect(completeBtn.disabled).toBe(false);
  });
});
