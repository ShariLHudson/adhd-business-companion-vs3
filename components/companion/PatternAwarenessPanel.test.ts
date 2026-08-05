import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const panelSource = readFileSync(
  join(process.cwd(), "components/companion/PatternAwarenessPanel.tsx"),
  "utf8",
);
const settingsSource = readFileSync(
  join(process.cwd(), "components/companion/SettingsPanel.tsx"),
  "utf8",
);
const profileSource = readFileSync(
  join(process.cwd(), "components/companion/MyProfilePanel.tsx"),
  "utf8",
);

describe("Pattern Awareness explanation UI", () => {
  it("shows short explanation and the toggle first; education collapsed", () => {
    expect(panelSource).toContain(
      "Pattern Awareness helps Spark notice repeated things",
    );
    expect(panelSource).toContain("SettingsToggle");
    expect(panelSource).toContain("Use My Saved Patterns");
    expect(panelSource).toContain("+ Add a Pattern I Already Know");
    expect(panelSource).toContain('title="Why this can help"');
    expect(panelSource).toContain('title="You stay in control"');
    expect(panelSource).toContain("SettingsHelpAccordion");
    expect(panelSource).toContain("you choose what to keep");
    // Education must not be a always-open cream callout block
    expect(panelSource).not.toMatch(
      /bg-\[#f7f3ec\][\s\S]{0,80}Why This Can Help/,
    );
  });

  it("avoids technical profiling language", () => {
    expect(panelSource).not.toMatch(
      /Behavioral model|Predictive learning|User inference|Automated profiling/i,
    );
  });

  it("is reachable from Settings and My Profile", () => {
    expect(settingsSource).toContain("PatternAwarenessPanel");
    expect(settingsSource).toContain('id: "pattern"');
    expect(profileSource).toContain('onOpenSettings?.("pattern")');
    expect(profileSource).toContain("Pattern Awareness");
  });

  it("offers save controls without auto-save language", () => {
    expect(panelSource).toContain("Save This Pattern");
    expect(panelSource).not.toMatch(
      /Pattern detected|Behavior recorded|Profile updated/i,
    );
  });

  describe("Settings Fix 7 — Notice New Patterns has no detection engine", () => {
    it("no longer shows the Notice New Patterns toggle or its promise", () => {
      expect(panelSource).not.toContain("Notice New Patterns");
      expect(panelSource).not.toContain("pattern-notice-new");
      expect(panelSource).not.toContain(
        "Spark may gently offer patterns it noticed",
      );
    });

    it("removed the 'What Spark may notice' accordion — same phantom feature as the toggle", () => {
      expect(panelSource).not.toContain('title="What Spark may notice"');
      expect(panelSource).not.toContain("pattern-what-may-notice");
      expect(panelSource).not.toContain("morning energy, slower starts");
    });

    it("empty state no longer promises a suggestion that can never arrive", () => {
      expect(panelSource).not.toContain("wait for a gentle");
      expect(panelSource).toContain("No saved patterns yet");
      expect(panelSource).toContain("Add one you already know to get started");
    });

    it("keeps Use My Saved Patterns exactly as it was — real, tested, unchanged", () => {
      expect(panelSource).toContain("pattern-use-saved");
      expect(panelSource).toContain(
        "When on, active patterns can shape suggestions. When off, they stay stored but unused.",
      );
    });

    it("does not delete the dormant noticeNewPatterns field, canNoticeNewPatterns hook, or PatternSuggestionCard — future-ready, just unmounted", () => {
      const prefsSource = readFileSync(
        join(process.cwd(), "lib/patternAwareness/prefs.ts"),
        "utf8",
      );
      const typesSource = readFileSync(
        join(process.cwd(), "lib/patternAwareness/types.ts"),
        "utf8",
      );
      expect(typesSource).toContain("noticeNewPatterns");
      expect(prefsSource).toContain("canNoticeNewPatterns");
      expect(panelSource).toContain("export function PatternSuggestionCard");
    });

    it("preserves noticeNewPatterns in storage when saving useSavedPatterns — persistControls no longer forces a value for it", () => {
      expect(panelSource).toMatch(
        /savePatternAwarenessControlPrefs\(\{\s*useSavedPatterns:\s*nextUse\s*\}\)/,
      );
      expect(panelSource).not.toMatch(
        /savePatternAwarenessControlPrefs\(\{\s*noticeNewPatterns/,
      );
    });

    it("Settings row summary reflects only useSavedPatterns (On/Off), not the removed notice half", () => {
      expect(settingsSource).toMatch(
        /setPatternSummary\(pa\.useSavedPatterns \? "On" : "Off"\)/,
      );
      expect(settingsSource).not.toContain("Noticing & using");
      expect(settingsSource).not.toContain("Noticing only");
    });
  });
});
