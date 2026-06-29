import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  getProjectItems,
  saveProject,
  type Project,
} from "@/lib/companionStore";
import { seedProjectChunks } from "./seedProjectChunks";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
  });
}

describe("seedProjectChunks", () => {
  let project: Project;

  beforeEach(() => {
    seedLocalStorage();
    const list = saveProject({
      name: "Test project",
      goal: "Ship it",
      status: "in-progress",
      nextAction: "",
    });
    project = list[0]!;
  });

  it("creates task sections from chunk titles", () => {
    const first = seedProjectChunks(project.id, ["Marketing", "Product", ""]);
    expect(first).toBe("Marketing");
    const sections = getProjectItems(project.id).filter((i) => i.kind === "section");
    expect(sections.map((s) => s.title)).toEqual(["Marketing", "Product"]);
  });

  it("returns null when no chunks are provided", () => {
    expect(seedProjectChunks(project.id, ["", "  "])).toBeNull();
  });
});
