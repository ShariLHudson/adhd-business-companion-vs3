import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendProjectConversation,
  countProjectConversations,
  listProjectConversations,
} from "./projectConversations";

describe("projectConversations", () => {
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

  it("stores and lists conversations per project", () => {
    appendProjectConversation("p1", "How do I start?", "Pick one small step.");
    appendProjectConversation("p2", "Other project", "Sure.");
    appendProjectConversation("p1", "What next?", "Try outlining.");

    expect(countProjectConversations("p1")).toBe(2);
    expect(listProjectConversations("p1")[0]?.userPreview).toBe("What next?");
    expect(listProjectConversations("p2")).toHaveLength(1);
  });
});
