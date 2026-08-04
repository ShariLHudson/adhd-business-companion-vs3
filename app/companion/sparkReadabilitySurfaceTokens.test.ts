import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Shared readability & frosted-surface tokens", () => {
  const globals = readFileSync(
    resolve(process.cwd(), "app/globals.css"),
    "utf8",
  );
  const createWorkspaceV2Panel = readFileSync(
    resolve(process.cwd(), "components/companion/CreateWorkspaceV2Panel.tsx"),
    "utf8",
  );
  const onlinePresenceSection = readFileSync(
    resolve(
      process.cwd(),
      "components/companion/settings/profile/OnlinePresenceSection.tsx",
    ),
    "utf8",
  );
  const workspaceLayoutTokens = readFileSync(
    resolve(process.cwd(), "lib/workspaceLayoutTokens.ts"),
    "utf8",
  );
  const experienceControlsOverlayCss = readFileSync(
    resolve(process.cwd(), "app/companion/experience-controls-overlay.css"),
    "utf8",
  );

  it("defines all ten token categories as CSS custom properties", () => {
    const requiredTokens = [
      "--spark-text-primary",
      "--spark-text-secondary",
      "--spark-text-supporting",
      "--spark-text-disabled",
      "--spark-surface-frosted-bg",
      "--spark-surface-frosted-strong-bg",
      "--spark-surface-border",
      "--spark-surface-selected-bg",
      "--spark-surface-selected-border",
      "--spark-surface-disabled-bg",
      "--spark-surface-disabled-border",
      "--spark-focus-ring",
    ];
    for (const token of requiredTokens) {
      expect(globals).toContain(`${token}:`);
    }
  });

  it("provides utility classes for every token category", () => {
    const requiredClasses = [
      ".spark-text-primary",
      ".spark-text-secondary",
      ".spark-text-supporting",
      ".spark-text-disabled",
      ".spark-surface-frosted",
      ".spark-surface-frosted-strong",
      ".spark-surface-border",
      ".spark-surface-selected",
      ".spark-surface-disabled",
    ];
    for (const cls of requiredClasses) {
      expect(globals).toContain(`${cls} {`);
    }
    // Focus ring only ever applies on :focus-visible, never a static state.
    expect(globals).toContain(".spark-focus-ring:focus-visible {");
  });

  it("text tokens are fixed values, not opacity-based — functional text never depends on low opacity", () => {
    expect(globals).not.toMatch(/--spark-text-supporting:\s*rgba?\([^)]*0\.[0-3]/);
    expect(globals).not.toMatch(/--spark-text-secondary:\s*rgba?\([^)]*0\.[0-3]/);
    expect(globals).not.toMatch(/--spark-text-primary:\s*rgba?\([^)]*0\.[0-3]/);
  });

  it("supporting text token clears WCAG AA 4.5:1 against white and cream", () => {
    const match = globals.match(/--spark-text-supporting:\s*(#[0-9a-fA-F]{6})/);
    expect(match).toBeTruthy();
    const hex = match![1];
    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const luminance = (h: string) => {
      const [r, g, b] = h
        .slice(1)
        .match(/\w\w/g)!
        .map((x) => parseInt(x, 16) / 255)
        .map(toLinear);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (h1: string, h2: string) => {
      const l1 = luminance(h1);
      const l2 = luminance(h2);
      const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
      return (a + 0.05) / (b + 0.05);
    };
    expect(contrast(hex, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex, "#faf7f2")).toBeGreaterThanOrEqual(4.5);
  });

  it("CreateWorkspaceV2Panel no longer hard-codes the low-contrast muted hex for functional text", () => {
    expect(createWorkspaceV2Panel).not.toContain("text-[#9a8f82]");
  });

  it("CreateWorkspaceV2Panel uses the full text hierarchy (primary, secondary, supporting, disabled)", () => {
    expect(createWorkspaceV2Panel).toContain("spark-text-primary");
    expect(createWorkspaceV2Panel).toContain("spark-text-secondary");
    expect(createWorkspaceV2Panel).toContain("spark-text-supporting");
    expect(createWorkspaceV2Panel).toContain("spark-text-disabled");
    const supportingCount = (
      createWorkspaceV2Panel.match(/spark-text-supporting/g) ?? []
    ).length;
    expect(supportingCount).toBeGreaterThanOrEqual(7);
  });

  it("CreateWorkspaceV2Panel's selected and disabled row states use the surface tokens", () => {
    expect(createWorkspaceV2Panel).toContain("spark-surface-selected");
    expect(createWorkspaceV2Panel).toContain("spark-surface-disabled");
    expect(createWorkspaceV2Panel).toContain("spark-surface-border");
  });

  it("CreateWorkspaceV2Panel's interactive row now has a visible keyboard focus ring", () => {
    expect(createWorkspaceV2Panel).toMatch(
      /className=\{`spark-focus-ring rounded-xl border/,
    );
  });

  it("OnlinePresenceSection's Settings instruction no longer hard-codes the low-contrast muted hex", () => {
    expect(onlinePresenceSection).not.toContain("text-[#9a8f82]");
    expect(onlinePresenceSection).toContain("spark-text-supporting");
  });

  it("the shared full-page workspace surface uses the frosted-surface token instead of raw bg-white/80", () => {
    expect(workspaceLayoutTokens).toContain("spark-surface-frosted");
    expect(workspaceLayoutTokens).not.toContain("bg-white/80");
    expect(workspaceLayoutTokens).not.toContain("backdrop-blur-sm");
  });

  it("background-mode readability rules never target the new surface or text token classes — foreground panels stay unfiltered", () => {
    for (const cls of [
      ".spark-text-primary",
      ".spark-text-secondary",
      ".spark-text-supporting",
      ".spark-text-disabled",
      ".spark-surface-frosted",
      ".spark-surface-frosted-strong",
      ".spark-surface-selected",
      ".spark-surface-disabled",
      ".spark-surface-border",
      ".spark-focus-ring",
    ]) {
      expect(experienceControlsOverlayCss).not.toContain(cls);
    }
    // Background modes still only ever reach the scene-photo layer.
    expect(experienceControlsOverlayCss).toMatch(
      /data-estate-background-mode="soften"\]\s+\.spark-readability-scene/,
    );
  });
});
