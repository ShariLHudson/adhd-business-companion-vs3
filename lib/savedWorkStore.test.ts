import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  archiveSavedWork,
  createSavedWork,
  deleteSavedWork,
  duplicateSavedWork,
  getActiveSavedWork,
  getArchivedSavedWork,
  getSavedWork,
  savedWorkLocationLabel,
  savedWorkTypeFolder,
  searchSavedWork,
  unarchiveSavedWork,
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
    expect(savedWorkLocationLabel("SOPs")).toBe("My Work > SOPs");
    expect(savedWorkLocationLabel("Workshops", "ADHD Focus Workshop")).toBe(
      "My Work > Workshops > ADHD Focus Workshop",
    );
  });

  it("creates and searches saved work", () => {
    createSavedWork({
      title: "ElevenLabs Video SOP",
      artifactType: "SOP",
      body: "Steps for creating a video in ElevenLabs",
    });
    const items = getSavedWork();
    expect(items).toHaveLength(1);
    expect(items[0].savedLocation).toBe(
      "My Work > SOPs > ElevenLabs Video SOP",
    );
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

  it("archives, unarchives, duplicates, and deletes saved work", () => {
    const item = createSavedWork({
      title: "Workshop outline",
      artifactType: "Workshop",
      body: "Module 1 intro",
    });
    expect(getActiveSavedWork()).toHaveLength(1);
    expect(getArchivedSavedWork()).toHaveLength(0);

    archiveSavedWork(item.id);
    expect(getActiveSavedWork()).toHaveLength(0);
    expect(getArchivedSavedWork()).toHaveLength(1);
    expect(searchSavedWork("Workshop")).toHaveLength(0);

    unarchiveSavedWork(item.id);
    expect(getActiveSavedWork()).toHaveLength(1);

    const copy = duplicateSavedWork(item.id);
    expect(copy?.title).toBe("Workshop outline (copy)");
    expect(getSavedWork()).toHaveLength(2);

    deleteSavedWork(item.id);
    expect(getSavedWork()).toHaveLength(1);
    expect(deleteSavedWork("missing")).toBe(false);
  });

  it("maps workshop and presentation folders", () => {
    expect(savedWorkTypeFolder("Workshop")).toBe("Workshops");
    expect(savedWorkTypeFolder("Sales deck")).toBe("Presentations");
    expect(savedWorkTypeFolder("Brand asset")).toBe("Business Assets");
  });
});
