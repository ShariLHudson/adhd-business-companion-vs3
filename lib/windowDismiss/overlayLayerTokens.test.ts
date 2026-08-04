/**
 * Shared overlay layer scale — registry kinds and paint order must agree.
 * External stylesheets are not applied in jsdom, so this asserts the wiring.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const globals = read("app/globals.css");

describe("layer tokens", () => {
  it("defines the popover / modal / dialog scale once, in :root", () => {
    expect(globals).toMatch(/--spark-layer-popover:\s*1000;/);
    expect(globals).toMatch(/--spark-layer-modal:\s*1100;/);
    expect(globals).toMatch(/--spark-layer-dialog:\s*1200;/);
  });

  it("orders popover below modal below dialog", () => {
    const value = (name: string) =>
      Number(globals.match(new RegExp(`--spark-layer-${name}:\\s*(\\d+)`))?.[1]);
    expect(value("popover")).toBeLessThan(value("modal"));
    expect(value("modal")).toBeLessThan(value("dialog"));
  });

  it("exposes a popover utility class bound to the token", () => {
    expect(globals).toMatch(
      /\.spark-layer-popover\s*\{[^}]*z-index:\s*var\(--spark-layer-popover\)/,
    );
  });
});

describe("migrated adopters use the shared layer", () => {
  it("LibraryItemActionMenu panel reads the token from CSS", () => {
    const css = read("app/companion/library-collection.css");
    expect(css).toMatch(
      /\.spark-library-menu__panel\s*\{[\s\S]*?z-index:\s*var\(--spark-layer-popover/,
    );
  });

  it("DraftDropdownMenu uses the class, not a hard-coded z-index", () => {
    const source = read("components/companion/DraftDropdownMenu.tsx");
    expect(source).toContain("spark-layer-popover");
    expect(source).not.toMatch(/\bz-\d+\b/);
  });

  it("CreateOptionsMenu uses the class, not a hard-coded z-index", () => {
    const source = read("components/companion/CreateOptionsMenu.tsx");
    expect(source).toContain("spark-layer-popover");
    expect(source).not.toMatch(/\bz-\d+\b/);
  });
});

describe("migrated adopters share the popover behavior hook", () => {
  const adopters = [
    "components/companion/library/LibraryItemActionMenu.tsx",
    "components/companion/DraftDropdownMenu.tsx",
    "components/companion/CreateOptionsMenu.tsx",
  ];

  it.each(adopters)("%s uses useExclusivePopover", (path) => {
    expect(read(path)).toContain("useExclusivePopover");
  });

  it.each(adopters)("%s no longer hand-rolls document listeners", (path) => {
    const source = read(path);
    expect(source).not.toContain('addEventListener("mousedown"');
    expect(source).not.toContain('addEventListener("keydown"');
  });

  it.each(adopters)("%s passes a trigger ref for focus return", (path) => {
    expect(read(path)).toContain("triggerRef");
  });
});
