import { describe, expect, it } from "vitest";
import {
  ADAPTIVE_CONTEXT_TOKENS,
  CATEGORY_THEME_TOKENS,
  MINIMAL_THEME_TOKENS,
  THEME_CONSUMING_SURFACES,
  themeTokensForMode,
} from "@/lib/companionThemeTokens";
import { getPrefs, savePrefs } from "@/lib/companionStore";

/**
 * COLOR MODE VERIFICATION AUDIT
 * Documents token values per mode and proves modes are meaningfully distinct.
 */
describe("color mode verification audit", () => {
  it("lists surfaces that consume theme CSS variables", () => {
    expect(THEME_CONSUMING_SURFACES).toContain("Plan My Day");
    expect(THEME_CONSUMING_SURFACES).toContain("Snippets");
    expect(THEME_CONSUMING_SURFACES.length).toBeGreaterThanOrEqual(10);
  });

  it("minimal uses white/cream/gray with single teal accent", () => {
    expect(MINIMAL_THEME_TOKENS.background).toMatch(/^#faf/i);
    expect(MINIMAL_THEME_TOKENS.canvas).toMatch(/^#fff/i);
    expect(MINIMAL_THEME_TOKENS.accent).toBe("#1e4f4f");
    expect(MINIMAL_THEME_TOKENS.headerBand).toBe("transparent");
  });

  it("category colors mode uses teal-forward ecosystem palette", () => {
    expect(CATEGORY_THEME_TOKENS.accent).toBe("#1e4f4f");
    expect(CATEGORY_THEME_TOKENS.background).not.toBe(MINIMAL_THEME_TOKENS.background);
    expect(CATEGORY_THEME_TOKENS.headerBand).not.toBe("transparent");
  });

  it("adaptive mode uses soft rainbow accents per context", () => {
    const accents = Object.values(ADAPTIVE_CONTEXT_TOKENS).map((t) => t.accent);
    const unique = new Set(accents);
    expect(unique.size).toBe(5);
    expect(ADAPTIVE_CONTEXT_TOKENS.support.accent).toBe("#5B8FC9");
    expect(ADAPTIVE_CONTEXT_TOKENS.recovery.accent).toBe("#9B87C4");
    expect(ADAPTIVE_CONTEXT_TOKENS.focus.accent).toBe("#4F9E9E");
    expect(ADAPTIVE_CONTEXT_TOKENS.planning.accent).toBe("#C48992");
  });

  it("each mode produces different background + accent pairs", () => {
    const minimal = themeTokensForMode("off");
    const category = themeTokensForMode("meaning");
    const adaptive = themeTokensForMode("decorative", "planning");

    expect(`${minimal.background}|${minimal.accent}`).not.toBe(
      `${category.background}|${category.accent}`,
    );
    expect(`${category.background}|${category.accent}`).not.toBe(
      `${adaptive.background}|${adaptive.accent}`,
    );
    expect(adaptive.accent).toBe("#C48992");
  });

  it("documents full token matrix for audit export", () => {
    const audit = {
      minimal: MINIMAL_THEME_TOKENS,
      category: CATEGORY_THEME_TOKENS,
      adaptive: ADAPTIVE_CONTEXT_TOKENS,
      cssVariables: [
        "--cm-bg",
        "--cm-canvas",
        "--cm-card",
        "--cm-border",
        "--cm-accent",
        "--cm-accent-tint",
        "--cm-nav-active",
        "--cm-header-band",
      ],
      shellAttributes: ["data-visual-mode", "data-adaptive-context"],
      persistenceKey: "companion-prefs-v1",
      persistenceField: "visualMode",
      liveUpdateEvent: "companion-prefs-updated",
    };
    expect(audit.cssVariables).toHaveLength(8);
    expect(audit.adaptive.planning.background).toBe("#FAF0F2");
  });

  it("savePrefs returns updated visualMode (persisted in browser via localStorage)", () => {
    const before = getPrefs().visualMode;
    const next = savePrefs({ visualMode: "meaning" });
    expect(next.visualMode).toBe("meaning");
    savePrefs({ visualMode: before });
  });
});
