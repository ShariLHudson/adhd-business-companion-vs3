import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  decisionWheelConicGradient,
  isSpinWheelSoundEnabled,
  setSpinWheelSoundEnabled,
} from "./decisionRoom";

describe("Spin wheel Decision Room helpers", () => {
  it("builds an estate-palette conic gradient", () => {
    const g = decisionWheelConicGradient(6);
    expect(g).toContain("conic-gradient");
    expect(g).toContain("#1e4f4f");
    expect(g).toContain("#c4a35a");
  });

  it("persists sound toggle without touching auth", () => {
    const store = new Map<string, string>();
    const ls = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      clear: () => store.clear(),
      removeItem: (k: string) => {
        store.delete(k);
      },
      key: () => null,
      length: 0,
    };
    Object.defineProperty(globalThis, "window", {
      value: globalThis,
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: ls,
      configurable: true,
    });
    store.clear();
    expect(isSpinWheelSoundEnabled()).toBe(true);
    setSpinWheelSoundEnabled(false);
    expect(isSpinWheelSoundEnabled()).toBe(false);
    setSpinWheelSoundEnabled(true);
    expect(isSpinWheelSoundEnabled()).toBe(true);
  });

  it("preserves playSpin and adds decision result chime in chime module", () => {
    const chime = readFileSync(
      resolve(process.cwd(), "lib/chime.ts"),
      "utf8",
    );
    expect(chime).toContain("export function playSpin");
    expect(chime).toContain("export function playDecisionResultChime");
  });

  it("panel keeps selection via Math.random pool pick and uses playSpin", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/SpinWheelPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("playSpin()");
    expect(panel).toContain("playDecisionResultChime()");
    expect(panel).toContain(
      "pool[Math.floor(Math.random() * pool.length)]",
    );
    expect(panel).toContain("Sound On");
    expect(panel).toContain('data-testid="spin-wheel-result"');
    expect(panel).toContain("prefersReducedMotion");
    expect(panel).toContain("SpinWheelDecisionRoomShell");
  });
});
