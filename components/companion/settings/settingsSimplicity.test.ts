import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

describe("Settings simplicity & contrast standard (173–175)", () => {
  it("exports shared Settings control primitives", () => {
    const index = read("components/companion/settings/index.ts");
    expect(index).toContain("SettingsSection");
    expect(index).toContain("SettingsDropdown");
    expect(index).toContain("SettingsToggle");
    expect(index).toContain("SettingsSlider");
    expect(index).toContain("SettingsHelpAccordion");
    expect(index).toContain("SettingsSaveStatus");
    expect(index).toContain("SettingsDescription");
  });

  it("uses dark readable text tokens on light surfaces", () => {
    const tokens = read("components/companion/settings/settingsTokens.ts");
    expect(tokens).toContain('primary: "text-[#1f1c19]"');
    expect(tokens).toContain('helper: "text-[#4b463f]"');
    expect(tokens).toContain("SETTINGS_SURFACE");
    expect(tokens).toContain("text-[#1f1c19]");
    // onDark cream is for dark sheets only — not for light card body text
    expect(tokens).toContain('onDark: "text-[#fff8eb]"');
  });

  it("notification sounds use one dropdown per family, not option card stacks", () => {
    const sounds = read(
      "components/companion/NotificationSoundPreferences.tsx",
    );
    expect(sounds).toContain("SettingsDropdown");
    expect(sounds).toContain("Test sound");
    expect(sounds).toContain("SETTINGS_SAVED_MESSAGE");
    expect(sounds).not.toContain("aria-pressed");
    expect(sounds).not.toContain("Play preview");
  });

  it("Conversation Style and Help Mode use dropdowns with explanation + save", () => {
    const tone = read("components/companion/ConversationStylePanel.tsx");
    const help = read("components/companion/HelpModePanel.tsx");
    const settings = read("components/companion/SettingsPanel.tsx");
    expect(tone).toContain("SettingsDropdown");
    expect(tone).toContain("SettingsSaveStatus");
    expect(tone).toContain("SETTINGS_SAVED_MESSAGE");
    expect(tone).toContain("More about this style");
    expect(tone).not.toContain("aria-pressed");
    expect(help).toContain("SettingsDropdown");
    expect(help).toContain("SettingsSaveStatus");
    expect(settings).toContain("ConversationStylePanel");
    expect(settings).toContain("HelpModePanel");
    expect(settings).not.toMatch(
      /open === "tone"[\s\S]{0,400}AI_TONE_GUIDES\.map/,
    );
  });

  it("dropdown select uses shared field surface with dark text", () => {
    const dropdown = read(
      "components/companion/settings/SettingsDropdown.tsx",
    );
    const tokens = read("components/companion/settings/settingsTokens.ts");
    expect(dropdown).toContain("SETTINGS_SURFACE.field");
    expect(dropdown).toContain("<select");
    expect(dropdown).toContain("aria-label={label}");
    expect(tokens).toMatch(/field:[\s\S]*text-\[#1f1c19\]/);
  });
});
