import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveProject } from "./companionStore";
import {
  projectDetailFromStore,
  resolveProjectWorkspaceDetail,
} from "./projectWorkspaceDetail";

describe("projectWorkspaceDetail", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
      clear: () => {
        mem.clear();
      },
    });
  });

  it("builds detail from store", () => {
    const list = saveProject({ name: "Workshop Launch", goal: "Fill the room" });
    const p = list[0]!;
    const detail = projectDetailFromStore(p.id);
    expect(detail?.selectedItemName).toBe("Workshop Launch");
    expect(detail?.selectedItemGoal).toBe("Fill the room");
    expect(detail?.view).toBe("detail");
  });

  it("resolves from projectContinueId when panel reports list", () => {
    const list = saveProject({ name: "ADHD Ecosystem" });
    const p = list[0]!;
    const detail = resolveProjectWorkspaceDetail(
      { view: "list", stage: "Project list", selectedItemId: null },
      p.id,
    );
    expect(detail?.selectedItemName).toBe("ADHD Ecosystem");
    expect(detail?.view).toBe("detail");
  });
});
