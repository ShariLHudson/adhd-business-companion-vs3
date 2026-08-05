import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

/**
 * Settings Fix 4 — Connections must never claim "Connected ✓" for a service
 * with no real, authenticated integration behind it (Outlook Calendar,
 * Microsoft Word, Spark Estate Documents/Storage). See
 * docs/estate/SETTINGS_FUNCTIONALITY_AND_DUPLICATION_AUDIT.md §6 #5.
 */
describe("Connections honesty — no false Connected states", () => {
  it("ConnectionsPage renders the badge from the honest, kind-aware statusLabel — not a hardcoded Connected ✓ ternary", () => {
    const page = read(
      "components/companion/settings/connections/ConnectionsPage.tsx",
    );
    expect(page).toContain("{item.statusLabel}");
    // The old ternary always resolved unselected built-ins to "Connected ✓";
    // that literal pairing must be gone from the item badge JSX.
    expect(page).not.toMatch(
      /item\.showConnectedCheck\s*\?\s*"Connected ✓"\s*:\s*item\.status === "needs_attention"/,
    );
  });

  it("flashes Selected ✓ (not Connected ✓) for a built-in/preference-only local choice", () => {
    const page = read(
      "components/companion/settings/connections/ConnectionsPage.tsx",
    );
    expect(page).toContain("`${item.label} — Selected ✓`");
    // The built-in/preference-only branch itself must use "Selected ✓" —
    // isolate that branch's own flash call, not the separate (legitimate)
    // google-oauth "Connected ✓" flash earlier in the file.
    const builtInBranch = page.slice(page.indexOf('item.kind === "built-in"'));
    expect(builtInBranch).toContain("Selected ✓");
    expect(builtInBranch).not.toContain("Connected ✓");
  });

  it("never claims Outlook Calendar is Connected — no Microsoft Graph OAuth exists", () => {
    const page = read(
      "components/companion/settings/connections/ConnectionsPage.tsx",
    );
    expect(page).not.toContain("Outlook Calendar connected.");
    expect(page).not.toContain("Outlook Calendar — Connected ✓");
    expect(page).toContain("Outlook Calendar prepared.");
    expect(page).toContain("Outlook Calendar — Prepared ✓");

    const outlookConnection = read(
      "lib/connections/outlookCalendarConnection.ts",
    );
    expect(outlookConnection).toContain("Does not call Graph APIs");
  });

  it("passes real Digital Workspace preferences into buildServiceCategories so built-ins reflect the member's actual choice", () => {
    const page = read(
      "components/companion/settings/connections/ConnectionsPage.tsx",
    );
    expect(page).toContain("preferences: readDigitalWorkspacePreferences()");
  });

  it("Google (real OAuth) and Canva (verified local link) keep saying Connected ✓ when actually connected — this fix only touches the false cases", () => {
    const page = read(
      "components/companion/settings/connections/ConnectionsPage.tsx",
    );
    expect(page).toContain("`${item.label} — Connected ✓`");
    expect(page).toContain('"Canva — Connected ✓"');
  });
});
