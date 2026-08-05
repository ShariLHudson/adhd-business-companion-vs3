/**
 * Settings Fix 2 — playTTS is the single low-level TTS entry point in the
 * app (see ExperienceControlsOverlay.shariVoice.test.tsx for the toggle's
 * own behavior). CompanionPageClient.tsx is too large to mount in a unit
 * test, so this locks the function body directly, matching this codebase's
 * established pattern for that file.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const COMPANION_PAGE_CLIENT = path.join(
  process.cwd(),
  "app/companion/CompanionPageClient.tsx",
);

function playTTSSource(): string {
  const source = readFileSync(COMPANION_PAGE_CLIENT, "utf8");
  const match = source.match(
    /async function playTTS\(text: string\) \{[\s\S]*?\n  \}/,
  );
  if (!match) {
    throw new Error("playTTS function not found in CompanionPageClient.tsx");
  }
  return match[0];
}

describe("CompanionPageClient — playTTS respects Shari Voice", () => {
  it("is the only playTTS definition and the only /api/tts caller in the app shell", () => {
    const source = readFileSync(COMPANION_PAGE_CLIENT, "utf8");
    const defs = source.match(/function playTTS\(/g) ?? [];
    const fetches = source.match(/fetch\(\s*["']\/api\/tts["']/g) ?? [];
    expect(defs.length).toBe(1);
    expect(fetches.length).toBe(1);
  });

  it("checks Shari Voice before doing anything else network-related", () => {
    const fn = playTTSSource();
    const gateIndex = fn.indexOf("getExperienceControlPrefs().shariVoiceEnabled");
    const fetchIndex = fn.indexOf('fetch("/api/tts"');
    expect(gateIndex).toBeGreaterThan(-1);
    expect(fetchIndex).toBeGreaterThan(-1);
    expect(gateIndex).toBeLessThan(fetchIndex);
    // The check must be a real early-return, not a no-op read.
    expect(fn).toMatch(
      /if\s*\(\s*!getExperienceControlPrefs\(\)\.shariVoiceEnabled\s*\)\s*return;/,
    );
  });

  it("still checks the Welcome Home intro guard (unrelated gate preserved)", () => {
    const fn = playTTSSource();
    expect(fn).toContain("if (isWelcomeHomeIntroAudioBlocked()) return;");
  });

  it("still checks plan voice entitlement after the Shari Voice gate (money-gating preserved)", () => {
    const fn = playTTSSource();
    const shariVoiceIndex = fn.indexOf("shariVoiceEnabled");
    const entitlementIndex = fn.indexOf("vs.hasVoice");
    expect(entitlementIndex).toBeGreaterThan(-1);
    expect(entitlementIndex).toBeGreaterThan(shariVoiceIndex);
    expect(fn).toMatch(/if\s*\(!vs\.hasVoice \|\| vs\.leftMin <= 0\)/);
  });

  it("does not touch estate ambience, soundscape, or volume code in the same edit", () => {
    const fn = playTTSSource();
    expect(fn).not.toMatch(/estateAmbience|Soundscape|masterVolume/);
  });
});
