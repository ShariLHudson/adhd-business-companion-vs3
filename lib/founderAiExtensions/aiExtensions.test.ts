import { describe, expect, it } from "vitest";

import {
  AI_EXTENSION_TOOLS,
  composeAiExtensionsCenterView,
} from "./index";

describe("AI Extensions Center", () => {
  it("lists all specialist tools including future slot", () => {
    expect(AI_EXTENSION_TOOLS.map((t) => t.name)).toEqual([
      "ChatGPT",
      "VSS Command Center GPT",
      "Claude",
      "Gemini",
      "Cursor",
      "Image Creation GPT",
      "Future AI Tools",
    ]);
  });

  it("composeAiExtensionsCenterView exposes external links only", () => {
    const view = composeAiExtensionsCenterView();
    expect(view.tools.every((t) => t.openUrl.startsWith("https://"))).toBe(true);
    expect(view.tools[0]).toMatchObject({
      copyPromptPlaceholder: expect.any(String),
      relatedMissionPlaceholder: expect.any(String),
    });
  });

  it("does not mark production tools as future except the placeholder card", () => {
    const future = AI_EXTENSION_TOOLS.filter((t) => t.isFuture);
    expect(future).toHaveLength(1);
    expect(future[0]!.id).toBe("future-ai");
  });
});
