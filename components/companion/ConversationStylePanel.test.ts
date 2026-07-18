import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

describe("Conversation Style settings (dropdown + explanation + save)", () => {
  it("uses SettingsDropdown then selected explanation, not card stacks", () => {
    const panel = read("components/companion/ConversationStylePanel.tsx");
    expect(panel).toContain("SettingsSection");
    expect(panel).toContain("SettingsDropdown");
    expect(panel).toContain("conversation-style-dropdown");
    expect(panel).toContain("SettingsHelpAccordion");
    expect(panel).toContain("SettingsSaveStatus");
    expect(panel).toContain("savePrefs({ aiTone: next })");
    expect(panel).not.toContain("border-[#1e4f4f] bg-[#1e4f4f]/[0.06]");
  });

  it("Help Mode follows the same control pattern", () => {
    const panel = read("components/companion/HelpModePanel.tsx");
    expect(panel).toContain("SettingsDropdown");
    expect(panel).toContain("help-mode-dropdown");
    expect(panel).toContain("SETTINGS_SAVED_MESSAGE");
    expect(panel).toContain("savePrefs({ helpMode: next })");
  });
});
