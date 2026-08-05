import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const panel = readFileSync(
  join(process.cwd(), "components/companion/HelpModePanel.tsx"),
  "utf8",
);
const store = readFileSync(
  join(process.cwd(), "lib/companionStore.ts"),
  "utf8",
);
const tonePreferences = readFileSync(
  join(process.cwd(), "lib/companionTonePreferences.ts"),
  "utf8",
);

describe("Help Mode Settings UI", () => {
  it("uses the standard Settings control pattern", () => {
    expect(panel).toContain("SettingsDropdown");
    expect(panel).toContain("help-mode-dropdown");
    expect(panel).toContain("SETTINGS_SAVED_MESSAGE");
    expect(panel).toContain("savePrefs({ helpMode: next })");
  });

  describe("ADR-012 Phase 2 — dead options retired from the dropdown", () => {
    it("no longer offers Step-by-step guidance or Take me to the right place", () => {
      expect(panel).not.toContain("Step-by-step guidance");
      expect(panel).not.toContain("Take me to the right place");
      expect(panel).not.toContain('"step-by-step" as const');
      expect(panel).not.toContain('"navigate" as const');
    });

    it("still offers the three live options", () => {
      expect(panel).toContain("Ask me questions first");
      expect(panel).toContain("Direct answers");
      expect(panel).toContain("Concise replies");
    });

    it("keeps the HelpMode type's full five-value union — nothing deleted from storage", () => {
      expect(store).toMatch(
        /HelpMode\s*=\s*\n?\s*\|?\s*"step-by-step"/,
      );
      expect(store).toContain('"navigate"');
      expect(store).toContain('helpMode: "ask-first"');
    });

    it("keeps HELP_MODE_DELIVERY's prompt text for both dormant values — dormant, not deleted", () => {
      expect(tonePreferences).toContain('"step-by-step":');
      expect(tonePreferences).toContain("navigate:");
      expect(tonePreferences).toContain("HELP MODE — STEP BY STEP");
      expect(tonePreferences).toContain("HELP MODE — NAVIGATE");
    });
  });
});
