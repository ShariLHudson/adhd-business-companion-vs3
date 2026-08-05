import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const panel = readFileSync(
  join(process.cwd(), "components/companion/CuriosityBeforeCommandsPanel.tsx"),
  "utf8",
);
const settings = readFileSync(
  join(process.cwd(), "components/companion/SettingsPanel.tsx"),
  "utf8",
);
const options = readFileSync(
  join(process.cwd(), "lib/curiosityBeforeCommands/types.ts"),
  "utf8",
);
const tonePreferences = readFileSync(
  join(process.cwd(), "lib/companionTonePreferences.ts"),
  "utf8",
);
const companionPageClient = readFileSync(
  join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
  "utf8",
);

describe("How Shari Invites Me Settings UI", () => {
  it("uses one dropdown and collapses examples", () => {
    expect(panel).toContain("How Shari Invites Me");
    expect(panel).toContain("SettingsDropdown");
    expect(panel).toContain("curiosity-mode-dropdown");
    expect(panel).toContain("See examples");
    expect(panel).toContain("SettingsHelpAccordion");
    expect(panel).toContain("SETTINGS_SAVED_MESSAGE");
    expect(panel).not.toContain("aria-pressed");
    expect(panel).not.toMatch(/guaranteed dopamine/i);
  });

  it("offers the approved invite modes", () => {
    expect(options).toContain("Use the situation — Recommended");
    expect(options).toContain("Usually ask a curiosity question");
    expect(options).toContain("Mix questions and direct invitations");
    expect(options).toContain("Be direct with me");
    expect(options).toContain("I’m not sure yet");
  });

  describe("ADR-012 Phase 1 — hidden from Settings, prompt contribution removed", () => {
    it("is no longer reachable from Settings", () => {
      expect(settings).not.toContain('id: "curiosity"');
      expect(settings).not.toContain('"How Shari Invites Me"');
      expect(settings).not.toContain("CuriosityBeforeCommandsPanel");
    });

    it("no longer contributes to the client-built prompt hint", () => {
      expect(companionPageClient).not.toContain(
        "buildCuriosityBeforeCommandsPromptHint(",
      );
    });

    it("no longer contributes to the server-rebuilt tone preference blocks", () => {
      expect(tonePreferences).not.toContain(
        "buildCuriosityBeforeCommandsPromptHint(",
      );
    });

    it("keeps storage, types, and the phrasing engine dormant — nothing deleted", () => {
      expect(options).toContain("CuriosityBeforeCommandsMode");
      expect(options).toContain("CURIOSITY_BEFORE_COMMANDS_PREFS_KEY");
      expect(panel).toContain("export function CuriosityBeforeCommandsPanel");
      // The prompt-hint builder itself stays exported for a future phase to re-wire.
      const phrasing = readFileSync(
        join(process.cwd(), "lib/curiosityBeforeCommands/phrasing.ts"),
        "utf8",
      );
      expect(phrasing).toContain(
        "export function buildCuriosityBeforeCommandsPromptHint",
      );
    });
  });
});
