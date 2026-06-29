import { describe, expect, it } from "vitest";
import {
  OBJECT_SIGNATURE_ICON,
  SIGNATURE_ICON_IDS,
  signatureIconForObject,
} from "./index";

const CORE_NAV_OBJECTS = [
  ["messages", "home-cottage"],
  ["clear-my-mind", "clear-mind-brain"],
  ["plan-my-day", "plan-my-day"],
  ["focus-my-brain", "focus-lantern-brain"],
  ["focus-audio", "peaceful-path"],
  ["games", "momentum-blocks"],
  ["help", "library-journal"],
  ["learning", "study-lamp"],
  ["journal", "journal-pen"],
  ["voice", "voice-waves"],
  ["community", "community-chairs"],
  ["growth", "learn-grow-tree"],
  ["support", "support-hands"],
  ["decision-compass", "decision-compass"],
  ["other-tools", "adhd-toolkit"],
  ["settings", "settings-key-gear"],
] as const;

describe("signatureIcons", () => {
  it("defines a unique icon for every core navigation object", () => {
    for (const [objectId, iconId] of CORE_NAV_OBJECTS) {
      expect(signatureIconForObject(objectId)).toBe(iconId);
      expect(OBJECT_SIGNATURE_ICON[objectId]).toBe(iconId);
    }
  });

  it("uses only registered icon ids", () => {
    for (const iconId of Object.values(OBJECT_SIGNATURE_ICON)) {
      expect(SIGNATURE_ICON_IDS).toContain(iconId);
    }
  });
});
