/**
 * @vitest-environment jsdom
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalRevealFlow } from "@/components/journal-gazebo/journal-reveal";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return { ...actual, useReducedMotion: () => false };
});

const journal: JournalGazeboConfig = {
  id: "verify-journal",
  name: "My Journey",
  embossedTitle: "My Journey",
  leatherColor: "forest",
  showSparkFlame: true,
  coverImageKind: "none",
  paperStyle: "ivory",
  fontId: "lora",
  inkColor: "forest-green",
  penStyle: "fountain",
  nibSize: "medium",
  writingMode: "gentle",
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
};

const OUT = join(process.cwd(), "docs/verification/journal-reveal");

describe("Journal reveal physical snapshots", () => {
  it("captures wrapped → ribbon → revealed → opening HTML", () => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    mkdirSync(OUT, { recursive: true });
    vi.useFakeTimers();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const click = (id: string) => {
      act(() => {
        container.querySelector<HTMLElement>(`[data-testid='${id}']`)?.click();
      });
    };
    const tick = (ms: number) => {
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    };
    const state = () =>
      container
        .querySelector("[data-testid='journal-reveal-flow']")
        ?.getAttribute("data-reveal-state");

    act(() => {
      root.render(
        <JournalRevealFlow
          journal={journal}
          isFirstCreation
          onComplete={() => {}}
        />,
      );
    });
    writeFileSync(join(OUT, "01-wrapped.html"), wrapHtml("wrapped", container.innerHTML), "utf8");
    expect(state()).toBe("wrapped");

    click("journal-reveal-gift-button");
    writeFileSync(
      join(OUT, "02-ribbon-pull.html"),
      wrapHtml("ribbon-pull", container.innerHTML),
      "utf8",
    );
    expect(state()).toBe("ribbon-pull");

    click("journal-reveal-ribbon-drag");
    writeFileSync(join(OUT, "03-bow.html"), wrapHtml("bow", container.innerHTML), "utf8");
    expect(state()).toBe("bow");

    tick(900);
    tick(800);
    writeFileSync(
      join(OUT, "04-unwrap.html"),
      wrapHtml("unwrap", container.innerHTML),
      "utf8",
    );
    expect(state()).toBe("unwrap");

    tick(1400);
    tick(1200);
    writeFileSync(
      join(OUT, "05-revealed.html"),
      wrapHtml("revealed", container.innerHTML),
      "utf8",
    );
    expect(state()).toBe("admire");
    expect(container.textContent).toContain("My Journey");

    click("journal-reveal-open-journal");
    writeFileSync(
      join(OUT, "06-opening.html"),
      wrapHtml("opening", container.innerHTML),
      "utf8",
    );
    expect(state()).toBe("opening");

    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });
});

function wrapHtml(state: string, body: string): string {
  const css = readFileSync(
    join(process.cwd(), "components/journal-gazebo/journal-reveal/journal-reveal.css"),
    "utf8",
  );
  // Serve from repo root (`npx serve .`) so /public/images resolves.
  const rewritten = body.replaceAll('src="/images/', 'src="/public/images/');
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Journal gift — ${state}</title>
<style>
body{margin:0;min-height:100vh;background:
  radial-gradient(ellipse 80% 60% at 50% 40%,rgba(90,70,45,.35),transparent 70%),
  linear-gradient(180deg,#3a2e22 0%,#1c1610 100%);
display:grid;place-items:center}
.journal-gift-scene{position:relative;min-height:100vh;width:100%}
.jg-cinematic-gift{perspective:1400px;transform-style:preserve-3d}
.jg-cinematic-gift__desk-shadow{position:absolute;left:-8%;right:-8%;bottom:-14%;height:30%;background:radial-gradient(ellipse,rgba(8,6,4,.45),transparent 70%)}
.jg-cinematic-gift__wrap{position:absolute;inset:-12% -3% -4%;transform-style:preserve-3d}
.jg-cinematic-gift__paper--front{position:absolute;inset:0;border-radius:10px;background-size:cover;background-position:center;box-shadow:0 18px 42px rgba(8,6,4,.38)}
.jg-cinematic-gift__journal{position:absolute;inset:0;display:flex;opacity:0}
.jg-cinematic-gift--journal-visible .jg-cinematic-gift__journal{opacity:1}
.jg-cinematic-gift__journal-cover{flex:1;border-radius:0 14px 14px 0;background:linear-gradient(145deg,#3f5f50,#1e3028)}
.jg-cinematic-gift__journal-spine{flex:0 0 13%;background:linear-gradient(90deg,#243830,#355248,#243830);border-radius:10px 0 0 10px}
.jg-cinematic-gift__package-photo{position:absolute;inset:-2%;width:104%;height:104%;object-fit:contain;z-index:6;filter:drop-shadow(0 22px 48px rgba(8,6,4,.42))}
.jg-cinematic-gift__ribbon{position:absolute;background:linear-gradient(90deg,#9a7840,#d4b870,#9a7840)}
.jg-cinematic-gift__ribbon--h{left:0;right:0;top:50%;height:12%;transform:translateY(-50%);z-index:2}
.jg-cinematic-gift__ribbon--v{top:0;bottom:0;left:50%;width:12%;transform:translateX(-50%);z-index:2}
.jg-cinematic-gift__bow{position:absolute;left:50%;top:50%;width:55%;aspect-ratio:1.2;transform:translate(-50%,-50%);z-index:5}
.jg-cover-emboss__title{position:absolute;top:17%;left:50%;transform:translate(-50%,-50%);color:#e8c878;font-family:Georgia,serif;font-size:1.2rem;text-align:center;width:88%}
${css}
</style></head><body>${rewritten}</body></html>`;
}
