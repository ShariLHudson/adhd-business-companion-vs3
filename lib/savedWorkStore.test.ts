import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSavedWork,
  getSavedWork,
  savedWorkLocationLabel,
  savedWorkTypeFolder,
  searchSavedWork,
  updateSavedWork,
} from "./savedWorkStore";

describe("savedWorkStore", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
    });
  });

  it("maps artifact types to Saved Work folders", () => {
    expect(savedWorkTypeFolder("SOP")).toBe("SOPs");
    expect(savedWorkTypeFolder("Proposal")).toBe("Proposals");
    expect(savedWorkLocationLabel("SOPs")).toBe("Saved Work > SOPs");
  });

  it("creates and searches saved work", () => {
    createSavedWork({
      title: "ElevenLabs Video SOP",
      artifactType: "SOP",
      body: "Steps for creating a video in ElevenLabs",
    });
    const items = getSavedWork();
    expect(items).toHaveLength(1);
    expect(items[0].savedLocation).toBe("Saved Work > SOPs");
    expect(items[0].status).toBe("saved");

    const hits = searchSavedWork("ElevenLabs");
    expect(hits).toHaveLength(1);
    expect(hits[0].title).toBe("ElevenLabs Video SOP");
  });

  it("updates existing saved work", () => {
    const item = createSavedWork({
      title: "Draft Plan",
      artifactType: "Plan",
      body: "Day 1 outline",
      status: "draft",
    });
    updateSavedWork(item.id, { status: "saved", body: "Day 1-5 outline" });
    const updated = getSavedWork().find((w) => w.id === item.id);
    expect(updated?.status).toBe("saved");
    expect(updated?.body).toContain("Day 1-5");
  });
});
