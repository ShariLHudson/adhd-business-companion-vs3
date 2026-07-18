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

  it("is reachable from Settings", () => {
    expect(settings).toContain('id: "curiosity"');
    expect(settings).toContain("How Shari Invites Me");
    expect(settings).toContain("CuriosityBeforeCommandsPanel");
  });
});
