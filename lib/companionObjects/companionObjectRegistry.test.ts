import { describe, expect, it } from "vitest";
import {
  COMPANION_OBJECT_REGISTRY,
  companionObjectById,
  companionObjectByEmoji,
  objectIdForEmoji,
} from "./companionObjectRegistry";

describe("companionObjectRegistry", () => {
  it("includes all primary feature objects from the initial map", () => {
    const required = [
      "clear-my-mind",
      "todays-reality",
      "plan-my-day",
      "decision-compass",
      "focus-audio",
      "breathing",
      "games",
      "create",
      "business",
      "learning",
      "reading",
      "parking-lot",
      "evidence-bank",
      "wins",
      "growth",
      "calendar",
      "projects",
      "messages",
      "settings",
      "search",
      "notifications",
      "help",
    ];
    for (const id of required) {
      expect(companionObjectById(id)?.id).toBe(id);
    }
  });

  it("resolves emoji replacements for legacy data", () => {
    expect(objectIdForEmoji("🧠")).toBe("clear-my-mind");
    expect(objectIdForEmoji("📅")).toBe("plan-my-day");
    expect(companionObjectByEmoji("🎲")?.objectName).toMatch(/puzzle/i);
  });

  it("has unique object ids", () => {
    const ids = COMPANION_OBJECT_REGISTRY.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
