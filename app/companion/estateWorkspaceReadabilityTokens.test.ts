import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Estate workspace shell — shared readability & frosted-surface tokens", () => {
  const globals = readFileSync(
    resolve(process.cwd(), "app/globals.css"),
    "utf8",
  );
  const estateWorkspaceCss = readFileSync(
    resolve(process.cwd(), "app/companion/estate-workspace.css"),
    "utf8",
  );
  const experienceControlsOverlayCss = readFileSync(
    resolve(process.cwd(), "app/companion/experience-controls-overlay.css"),
    "utf8",
  );

  it("defines the frosted-strong surface tokens matching the Estate room glass recipe", () => {
    expect(globals).toContain(
      "--spark-surface-frosted-strong-bg: rgba(255, 252, 245, 0.56);",
    );
    expect(globals).toContain("--spark-surface-frosted-strong-blur: 14px;");
    expect(globals).toContain(
      "--spark-surface-frosted-strong-border: rgba(255, 255, 255, 0.5);",
    );
  });

  it("the .spark-surface-frosted-strong utility class includes the border", () => {
    expect(globals).toMatch(
      /\.spark-surface-frosted-strong\s*\{[^}]*border:\s*1px solid var\(--spark-surface-frosted-strong-border\)/,
    );
  });

  it("the shared ivory/default estate-workspace surface uses the frosted-strong tokens", () => {
    expect(estateWorkspaceCss).toMatch(
      /\.estate-workspace\.companion-workspace-frosted,\s*\n\.estate-workspace--ivory\.companion-workspace-frosted\s*\{\s*\n\s*background: var\(--spark-surface-frosted-strong-bg\);\s*\n\s*backdrop-filter: blur\(var\(--spark-surface-frosted-strong-blur\)\);\s*\n\s*-webkit-backdrop-filter: blur\(var\(--spark-surface-frosted-strong-blur\)\);\s*\n\s*border: 1px solid var\(--spark-surface-frosted-strong-border\);/,
    );
  });

  it("the shared kicker, title, and lead text use the text hierarchy tokens", () => {
    expect(estateWorkspaceCss).toMatch(
      /\.estate-workspace__kicker\s*\{[^}]*color: var\(--spark-text-supporting\);/,
    );
    expect(estateWorkspaceCss).toMatch(
      /\.estate-workspace__title\s*\{[^}]*color: var\(--spark-text-primary\);/,
    );
    expect(estateWorkspaceCss).toMatch(
      /\.estate-workspace__lead\s*\{[^}]*color: var\(--spark-text-secondary\);/,
    );
  });

  it("leaves the section-title's distinct, already-compliant shade untouched", () => {
    expect(estateWorkspaceCss).toContain("color: #4a4038;");
  });

  it("leaves the Evidence Vault dark variant's colors completely untouched — not a dark-theme redesign", () => {
    expect(estateWorkspaceCss).toContain(
      ".estate-workspace--vault.companion-workspace-frosted",
    );
    expect(estateWorkspaceCss).toMatch(
      /\.estate-workspace--vault\.companion-workspace-frosted\s*\{[^}]*background: rgba\(30, 22, 16, 0\.62\);/,
    );
    expect(estateWorkspaceCss).toMatch(
      /\.estate-workspace--vault \.estate-workspace__kicker \{\s*color: #c9b9a4;\s*\}/,
    );
    expect(estateWorkspaceCss).toMatch(
      /\.estate-workspace--vault \.estate-workspace__title \{\s*color: #f0e6d6;\s*\}/,
    );
    expect(estateWorkspaceCss).toMatch(
      /\.estate-workspace--vault \.estate-workspace__lead \{\s*color: #c9b9a4;\s*font-style: normal;\s*\}/,
    );
  });

  it("background-mode readability rules never target the estate-workspace shell classes — no foreground filter/blur leaks in", () => {
    for (const cls of [
      ".estate-workspace",
      ".estate-workspace__kicker",
      ".estate-workspace__title",
      ".estate-workspace__lead",
      ".companion-workspace-frosted",
      ".spark-surface-frosted-strong",
    ]) {
      expect(experienceControlsOverlayCss).not.toContain(cls);
    }
  });
});
