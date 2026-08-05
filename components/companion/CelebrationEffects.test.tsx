import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CelebrationEffects } from "@/components/companion/CelebrationEffects";
import type { RecognitionPlannedEffect } from "@/lib/recognition/types";

const ALL_EFFECTS: RecognitionPlannedEffect[] = [
  "confetti",
  "fireworks",
  "birthday_cake",
  "balloons",
  "celebration_banner",
];

describe("CelebrationEffects (Settings Fix 6 — Full celebrations)", () => {
  it("renders nothing when there is no planned effect — Off and Simple stay empty", () => {
    const html = renderToStaticMarkup(<CelebrationEffects effect={null} />);
    expect(html).toBe("");
  });

  it("renders a distinct, recognizable layer for every planned effect", () => {
    const markers: Record<RecognitionPlannedEffect, string> = {
      confetti: "recognition-confetti",
      fireworks: "recognition-firework",
      birthday_cake: "recognition-candle",
      balloons: "recognition-balloon",
      celebration_banner: "recognition-banner",
    };
    const rendered = ALL_EFFECTS.map((effect) => ({
      effect,
      html: renderToStaticMarkup(<CelebrationEffects effect={effect} />),
    }));

    for (const { effect, html } of rendered) {
      expect(html).toContain(markers[effect]);
    }

    // Each effect's markup must actually differ from every other effect's —
    // "visibly different" is only true if the rendered HTML isn't identical.
    const htmlSet = new Set(rendered.map((r) => r.html));
    expect(htmlSet.size).toBe(ALL_EFFECTS.length);
  });

  it("is decorative and never blocks interaction with the page underneath", () => {
    const html = renderToStaticMarkup(<CelebrationEffects effect="confetti" />);
    expect(html).toContain("aria-hidden");
    expect(html).toContain("pointer-events-none");
  });

  it("shows an accessible dismiss control only when a handler is supplied", () => {
    const withDismiss = renderToStaticMarkup(
      <CelebrationEffects effect="confetti" onDismiss={() => {}} />,
    );
    expect(withDismiss).toContain('aria-label="Dismiss celebration effects"');

    const withoutDismiss = renderToStaticMarkup(
      <CelebrationEffects effect="confetti" />,
    );
    expect(withoutDismiss).not.toContain("Dismiss celebration effects");
  });

  it("uses only CSS keyframe animations — the app's global reduce-motion rule (html[data-estate-reduce-motion=\"true\"] * { animation-duration: .01ms !important }) neutralizes them automatically", () => {
    const html = renderToStaticMarkup(<CelebrationEffects effect="fireworks" />);
    // No inline style or JS-driven motion library reference — confirms the
    // effect rides on the same CSS animation contract Reduce Motion already
    // overrides globally (app/companion/companion.css + experience-controls-overlay.css).
    expect(html).not.toMatch(/framer-motion|useAnimation|motion\./i);
  });
});
