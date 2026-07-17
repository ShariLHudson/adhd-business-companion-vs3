/**
 * Route / eligibility contract for one-time account welcome (119–121).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("one-time account welcome (119–121)", () => {
  it("keeps FirstLoginWelcomeGate as the automatic account gate", () => {
    const loader = read("components/companion/CompanionPageLoader.tsx");
    expect(loader).toContain("FirstLoginWelcomeGate");
    const persistence = read("lib/firstLoginWelcome/persistence.ts");
    expect(persistence).toContain("welcome_completed_at");
    expect(persistence).toContain("hasEstablishedAccountWelcomeEvidence");
    expect(persistence).toContain("PUSH_RETRIES");
  });

  it("does not mount welcome over destinations after completion", () => {
    const gate = read("components/companion/FirstLoginWelcomeOverlay.tsx");
    expect(gate).toContain('phase === "not_required"');
    expect(gate).toContain("setPhase(\"not_required\")");
    // Welcome Home primary stays off when destinations are open.
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("welcomeHomePrimary");
    expect(client).toContain("!profileDestinationActive");
    expect(client).toContain("!companionStandaloneSection");
  });

  it("wires Settings Replay Welcome without clearing completion", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("onReplayWelcome");
    expect(client).toContain("requestWelcomeHomeReplay");
    expect(client).toContain("settings replay welcome");
    const settings = read("components/companion/SettingsPanel.tsx");
    expect(settings).toContain("Replay Welcome");
    expect(settings).toContain("onReplayWelcome");
  });
});
