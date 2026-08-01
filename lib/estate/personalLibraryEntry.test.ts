import { describe, expect, it } from "vitest";
import { resolvePersonalLibraryEntryView } from "./personalLibraryEntry";

describe("resolvePersonalLibraryEntryView", () => {
  it("routes plain Personal Library requests to the room", () => {
    for (const phrase of [
      "take me to my personal library",
      "go to my personal library",
      "open my personal library",
      "open my library",
      "show me my library",
    ]) {
      expect(resolvePersonalLibraryEntryView(phrase)).toBe("room");
    }
  });

  it("routes Spark Collection / saved-item requests to the collection", () => {
    expect(resolvePersonalLibraryEntryView("go to my Spark Collection")).toBe(
      "collection",
    );
    expect(resolvePersonalLibraryEntryView("show me my saved Sparks")).toBe(
      "collection",
    );
    expect(resolvePersonalLibraryEntryView("take me to my saved items")).toBe(
      "collection",
    );
  });

  it("routes Find/Search requests to find", () => {
    expect(resolvePersonalLibraryEntryView("find a saved card")).toBe("find");
    expect(resolvePersonalLibraryEntryView("find my saved note")).toBe("find");
    expect(resolvePersonalLibraryEntryView("search my saved sparks")).toBe("find");
  });

  it("routes Recent requests to recent (more specific than collection)", () => {
    expect(resolvePersonalLibraryEntryView("show my recent saved items")).toBe(
      "recent",
    );
  });

  it("defaults empty / unrelated text to the room", () => {
    expect(resolvePersonalLibraryEntryView("")).toBe("room");
    expect(resolvePersonalLibraryEntryView(null)).toBe("room");
  });
});
