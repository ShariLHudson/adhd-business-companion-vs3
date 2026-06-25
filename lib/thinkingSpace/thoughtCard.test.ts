import { beforeEach, describe, expect, it, vi } from "vitest";
import { thoughtPreview, thoughtTitle, primaryCollectionChipForThought } from "./thoughtCard";
import { createThoughtCollection } from "./collections";
import { moveThoughtToCollection } from "./thoughtCollectionAuthority";
import { addBrainDump, getBrainDumps } from "@/lib/companionStore";

describe("thoughtCard", () => {
  it("derives title from first line", () => {
    expect(
      thoughtTitle({
        id: "1",
        text: "Call doctor\nFollow up on labs",
        createdAt: new Date().toISOString(),
      }),
    ).toBe("Call doctor");
  });

  it("uses explicit title when set", () => {
    expect(
      thoughtTitle({
        id: "1",
        text: "Long body text here",
        title: "Short title",
        createdAt: new Date().toISOString(),
      }),
    ).toBe("Short title");
  });

  it("shows preview when body extends beyond title", () => {
    const preview = thoughtPreview({
      id: "1",
      text: "Headline\nMore detail about the thought that continues.",
      createdAt: new Date().toISOString(),
    });
    expect(preview).toContain("More detail");
  });

  it("shows exactly one primary collection chip from collectionId", () => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("crypto", {
      randomUUID: () => `test-${Math.random().toString(36).slice(2)}`,
    });

    addBrainDump("Call doctor");
    const health = createThoughtCollection({ label: "Health" });
    createThoughtCollection({ label: "Business" });
    createThoughtCollection({ label: "Ideas" });
    moveThoughtToCollection(getBrainDumps()[0]!.id, health.id);

    const chip = primaryCollectionChipForThought(getBrainDumps()[0]!);
    expect(chip?.label).toBe("Health");
  });
});
