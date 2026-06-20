import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildDraftSavedAnnouncement,
  persistGeneratedDraft,
} from "./createDraftPersistence";
import { getSavedWork } from "./savedWorkStore";

describe("createDraftPersistence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
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

  it("saves generated draft to My Work with full location path", () => {
    const { item, record } = persistGeneratedDraft({
      draft: "Module 1: Welcome\nModule 2: Deep work",
      artifactType: "Workshop",
      title: "Focus Foundations",
    });

    expect(item.title).toBe("Focus Foundations");
    expect(item.savedLocation).toBe(
      "My Work > Workshops > Focus Foundations",
    );
    expect(record.savedWorkId).toBe(item.id);
    expect(record.savedLocationDetail).toBe(item.savedLocation);
    expect(getSavedWork()).toHaveLength(1);
  });

  it("updates existing saved work on rebuild", () => {
    const first = persistGeneratedDraft({
      draft: "v1",
      artifactType: "Workshop",
      title: "My Workshop",
    });
    const second = persistGeneratedDraft({
      draft: "v2 longer draft",
      artifactType: "Workshop",
      title: "My Workshop",
      existingSavedWorkId: first.item.id,
      prevArtifact: first.record,
    });

    expect(second.item.id).toBe(first.item.id);
    expect(second.item.body).toBe("v2 longer draft");
    expect(getSavedWork()).toHaveLength(1);
  });

  it("announcement includes Saved to line", () => {
    const { record } = persistGeneratedDraft({
      draft: "Outline",
      artifactType: "Workshop",
      title: "Spring Launch",
    });
    const msg = buildDraftSavedAnnouncement(record);
    expect(msg).toMatch(/Saved to:/i);
    expect(msg).toMatch(/My Work > Workshops > Spring Launch/);
    expect(msg).toMatch(/My Work/);
  });
});
