/**
 * 133 — Create scroll / clickability contract.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Create morning-room scroll contract (133)", () => {
  it("uses one flex-bounded scrollport (not min-height 100dvh grow)", () => {
    const css = read("app/companion/companion.css");
    const roomBlock = css.match(
      /\.plan-my-day-morning-room\s*\{[\s\S]*?\n\}/,
    )?.[0];
    const scrollBlock = css.match(
      /\.plan-my-day-morning-room__scroll\s*\{[\s\S]*?\n\}/,
    )?.[0];
    expect(roomBlock).toBeTruthy();
    expect(scrollBlock).toBeTruthy();
    expect(roomBlock).toMatch(/display:\s*flex/);
    expect(roomBlock).toMatch(/min-height:\s*0/);
    expect(roomBlock).toMatch(/overflow:\s*hidden/);
    expect(scrollBlock).toMatch(/flex:\s*1\s+1\s+0/);
    expect(scrollBlock).toMatch(/overflow-y:\s*auto/);
    expect(scrollBlock).not.toMatch(/min-height:\s*100dvh/);
  });

  it("Create shell owns the shared scroll and room-list workspace", () => {
    const shell = read("components/companion/CreateEstateRoomShell.tsx");
    expect(shell).toContain('data-testid="create-estate-shared-scroll"');
    expect(shell).toContain("plan-my-day-morning-room__scroll");
    expect(shell).toContain(
      "plan-my-day-morning-room__workspace--room-list",
    );
  });

  it("Create entrance keeps How Do I and three choices clickable targets", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-how-do-i");
    expect(panel).toContain("create-estate-choice-");
    expect(panel).toContain("CreateDraftResumeList");
    expect(panel).not.toContain("pointer-events-none");
  });

  it("Create full-bleed uses morning-room chrome class", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toMatch(
      /activeSection === "create"[\s\S]{0,120}companion-plan-my-day-active/,
    );
  });
});
