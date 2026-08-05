/**
 * Settings Fix 5 — real reminder/rhythm/time-block notifications must play
 * the member's actual notification-sound choice, not a hardcoded chime.
 * CompanionPageClient.tsx is too large to mount in a unit test, so this
 * locks the function body directly, matching this codebase's established
 * pattern for that file (see CompanionPageClient.playTTSShariVoiceGate.test.ts).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const COMPANION_PAGE_CLIENT = path.join(
  process.cwd(),
  "app/companion/CompanionPageClient.tsx",
);

function checkFunctionSource(): string {
  const source = readFileSync(COMPANION_PAGE_CLIENT, "utf8");
  const match = source.match(/function check\(\) \{[\s\S]*?\n    \}/);
  if (!match) {
    throw new Error(
      "check() function (time-block + reminder/rhythm delivery loop) not found in CompanionPageClient.tsx",
    );
  }
  return match[0];
}

describe("CompanionPageClient — real notifications play the chosen sound (Settings Fix 5)", () => {
  it("imports the real notification sound router and the deliverable→family resolver", () => {
    const source = readFileSync(COMPANION_PAGE_CLIENT, "utf8");
    expect(source).toContain(
      'import { resolveDeliverableSoundEvent } from "@/lib/notifications/resolveNotificationSoundEvent";',
    );
    expect(source).toContain("playNotificationSoundForEvent");
  });

  it("never calls the hardcoded chime for time-block or reminder/rhythm delivery", () => {
    const fn = checkFunctionSource();
    expect(fn).not.toContain("playChime()");
  });

  it("routes both time-block alerts (15-min warning and at-start trigger) through the real sound preference", () => {
    const fn = checkFunctionSource();
    const calls = fn.match(/playNotificationSoundForEvent\(\s*"time-block"/g) ?? [];
    expect(calls.length).toBe(2);
    expect(fn).toContain('playNotificationSoundForEvent("time-block", `time-block-warn:${b.id}`)');
    expect(fn).toMatch(
      /playNotificationSoundForEvent\(\s*"time-block",\s*`time-block-trigger:\$\{due\.id\}`,?\s*\)/,
    );
  });

  it("routes chat reminders/rhythms through resolveDeliverableSoundEvent — including critical → Priority Alert", () => {
    const fn = checkFunctionSource();
    expect(fn).toContain(
      "playNotificationSoundForEvent(resolveDeliverableSoundEvent(item), key)",
    );
    // The old kind-only guess (rhythm vs reminder, no priority-alert routing)
    // must be gone from the sound call — it may still exist for the
    // unrelated in-app notice `kind` field, so assert on the sound call only.
    expect(fn).not.toMatch(
      /playChime\(\)[\s\S]{0,40}item\.kind === "rhythm" \? "rhythm" : "reminder"/,
    );
  });

  it("preserves playChime for everything else it already covered (test-alert fallback, unlock listener)", () => {
    const source = readFileSync(COMPANION_PAGE_CLIENT, "utf8");
    expect(source).toContain('import { playChime, unlockChime } from "@/lib/chime";');
    // testAlert() still falls back to the raw chime only if the real router
    // produces nothing (e.g. Web Audio unavailable) — untouched by this fix.
    expect(source).toContain('if (!playNotificationSoundForEvent("test", "test-alert")) {');
  });

  it("does not touch estate ambience, soundscape, layered audio, or Shari Voice code in the same function", () => {
    const fn = checkFunctionSource();
    expect(fn).not.toMatch(/estateAmbience|Soundscape|shariVoiceEnabled|masterVolume/);
  });
});
