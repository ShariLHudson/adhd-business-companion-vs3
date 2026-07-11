import { describe, expect, it } from "vitest";
import { buildClearMyMindSessionListText } from "./brainDumpCanvasExport";

describe("clearMyMind session list export", () => {
  it("builds printable bucketed text", () => {
    const text = buildClearMyMindSessionListText([
      { text: "Call the accountant", category: "Do Now" },
      { text: "Website idea", category: "Ideas" },
      { text: "Buy milk", category: "Do Now" },
    ]);
    expect(text).toContain("Clear My Mind");
    expect(text).toContain("Do Now (2)");
    expect(text).toContain("• Call the accountant");
    expect(text).toContain("Ideas (1)");
  });
});
