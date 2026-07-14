/**
 * @vitest-environment jsdom
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboJournalPicker } from "@/components/journal-gazebo/JournalGazeboJournalPicker";
import { JournalGazeboSanctuaryDesk } from "@/components/journal-gazebo/JournalGazeboSanctuaryDesk";
import { JournalGazeboWelcomeDesk } from "@/components/journal-gazebo/JournalGazeboWelcomeDesk";

const OUT = join(process.cwd(), "docs/verification/journal-gazebo-visits");

const j = (name: string, id: string): JournalGazeboConfig => ({
  id,
  name,
  embossedTitle: name,
  leatherColor: "forest",
  showSparkFlame: true,
  coverImageKind: "none",
  paperStyle: "cream",
  fontId: "lora",
  inkColor: "charcoal",
  penStyle: "fountain",
  nibSize: "medium",
  writingMode: "silent",
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
});

describe("Journal Gazebo visit screenshots", () => {
  it("writes first-visit and returning HTML without notecard overlays", async () => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    mkdirSync(OUT, { recursive: true });

    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        <JournalGazeboWelcomeDesk
          journals={[]}
          onCreateJournal={() => {}}
          onOpenJournal={() => {}}
        />,
      );
    });
    writeFileSync(
      join(OUT, "01-first-visit.html"),
      page("First visit", `${host.innerHTML}${portalHtml()}`),
      "utf8",
    );
    expect(document.querySelector("[data-testid='jg-welcome-letter']")).toBeNull();
    expect(document.querySelector(".jg-welcome-note")).toBeNull();
    expect(document.body.textContent).toContain("Create New Journal");
    expect(document.querySelector("[data-testid='jg-write-journal']")).toBeNull();

    await act(async () => {
      root.render(
        <JournalGazeboSanctuaryDesk
          journals={[j("Business Journal", "b1"), j("Ideas Journal", "i1")]}
          featuredJournal={j("Business Journal", "b1")}
          sceneComposed
          onCreateJournal={() => {}}
          onOpenJournal={() => {}}
        />,
      );
    });
    writeFileSync(
      join(OUT, "02-returning-visit.html"),
      page("Returning visit", `${host.innerHTML}${portalHtml()}`),
      "utf8",
    );
    expect(host.querySelector("[data-testid='jg-return-desk-note']")).toBeNull();
    expect(document.body.textContent).toContain("Write");

    await act(async () => {
      root.render(
        <JournalGazeboJournalPicker
          journals={[
            j("Business Journal", "b1"),
            j("Ideas Journal", "i1"),
            j("Reflection Journal", "r1"),
          ]}
          onSelect={() => {}}
          onClose={() => {}}
        />,
      );
    });
    writeFileSync(
      join(OUT, "04-journal-picker.html"),
      page("Journal picker", host.innerHTML),
      "utf8",
    );
    expect(host.textContent).toContain("Choose a journal:");

    act(() => root.unmount());
    host.remove();
    document.querySelectorAll(".jg-table-actions-portal").forEach((n) => n.remove());
  });
});

function portalHtml(): string {
  return Array.from(document.querySelectorAll(".jg-table-actions-portal"))
    .map((n) => n.outerHTML)
    .join("");
}

function page(title: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>
body{margin:0;min-height:100vh;background:#2a2218;color:#f4efe6;font-family:Georgia,serif;padding:24px}
.jg-table-actions{display:flex;gap:16px;flex-wrap:wrap;margin-top:24px}
.jg-table-actions__plaque{background:#1e4f4f;color:#fff;border:0;border-radius:12px;padding:16px 20px;min-width:200px;text-align:left;cursor:pointer}
.jg-table-actions__plaque-title{display:block;font-size:1.15rem}
.jg-table-actions__plaque-sub{display:block;opacity:.85;margin-top:4px;font-size:.9rem}
.jg-journal-picker__panel{background:#1f1a14;padding:24px;border-radius:16px}
</style></head><body><h1>${title}</h1>${body}</body></html>`;
}
