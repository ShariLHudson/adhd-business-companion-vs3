import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("FirstLoginWelcomeGate — one-time welcome behavior", () => {
  const source = readFileSync(
    join(process.cwd(), "components/companion/FirstLoginWelcomeOverlay.tsx"),
    "utf8",
  );

  it("stops audio and continues to Welcome Home from Stop", () => {
    expect(source).toContain("handleStopAndContinue");
    expect(source).toContain("FIRST_LOGIN_WELCOME_STOP");
    expect(source).toMatch(/markWelcomeCompleted\(userId\)/);
    expect(source).toContain('data-testid="first-login-stop-welcome"');
  });

  it("never re-opens welcome after audio was already played or completed", () => {
    expect(source).toContain("record.welcomeAudioPlayedAt");
    expect(source).toContain("isWelcomeCompleted(record)");
    expect(source).toMatch(/markWelcomeCompleted\(userId\)/);
    expect(source).toContain('setPhase("not_required")');
  });

  it("does not autoplay when welcome audio was already started once", () => {
    expect(source).toContain(
      "Never autoplay if this account already started welcome once",
    );
    expect(source).toMatch(
      /welcomeAudioPlayedAt \|\| record\?\.welcomeCompletedAt/,
    );
  });

  it("offers Continue without audio and respects the Settings opt-out", () => {
    expect(source).toContain("handleContinueWithoutAudio");
    expect(source).toContain("FIRST_LOGIN_WELCOME_SKIP_AUDIO");
    expect(source).toContain('data-testid="first-login-skip-welcome-audio"');
    expect(source).toContain("isWelcomeGreetingAudioEnabled");
  });
});
