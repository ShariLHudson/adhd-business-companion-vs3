/**
 * Evidence Vault hinged doors — stacking + motion wiring.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EVIDENCE_VAULT_DOOR_LEFT_BG,
  EVIDENCE_VAULT_DOOR_RIGHT_BG,
  EVIDENCE_VAULT_INTERIOR_REVEAL_BG,
  EVIDENCE_VAULT_ROOM_STATIC_BG,
} from "@/lib/estate/evidenceVaultDoor";
import { EvidenceVaultEntrance } from "./EvidenceVaultEntrance";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  return {
    useReducedMotion: () => false,
    motion: {
      div: React.forwardRef(function MotionDiv(
        {
          children,
          animate,
          style,
          ...rest
        }: {
          children?: React.ReactNode;
          animate?: { rotateY?: number; opacity?: number };
          style?: React.CSSProperties & { transformPerspective?: number };
          className?: string;
          "data-testid"?: string;
        },
        ref: React.Ref<HTMLDivElement>,
      ) {
        const rotateY = animate?.rotateY ?? 0;
        const opacity = animate?.opacity ?? 1;
        const {
          transformPerspective,
          transformOrigin,
          ...box
        } = style ?? {};
        return React.createElement(
          "div",
          {
            ...rest,
            ref,
            style: {
              ...box,
              transformOrigin,
              opacity,
              transform:
                rotateY === 0
                  ? undefined
                  : `perspective(${transformPerspective ?? 1400}px) rotateY(${rotateY}deg)`,
            },
            "data-rotate-y": String(rotateY),
            "data-door-opacity": String(opacity),
          },
          children,
        );
      }),
    },
  };
});

describe("EvidenceVaultEntrance door motion", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderEntrance(
    doorState: "locked" | "key_ready" | "unlocking" | "opening" | "open",
  ) {
    act(() => {
      root.render(
        <EvidenceVaultEntrance
          doorState={doorState}
          onUnlock={vi.fn()}
          onSkip={vi.fn()}
        />,
      );
    });
  }

  it("renders two distinct door elements with separate leaf assets", () => {
    renderEntrance("key_ready");
    const left = document.querySelector(
      '[data-testid="evidence-vault-door-left"]',
    );
    const right = document.querySelector(
      '[data-testid="evidence-vault-door-right"]',
    );
    expect(left).toBeTruthy();
    expect(right).toBeTruthy();
    expect(left).not.toBe(right);
    expect(left?.querySelector("img")?.getAttribute("src")).toBe(
      EVIDENCE_VAULT_DOOR_LEFT_BG,
    );
    expect(right?.querySelector("img")?.getAttribute("src")).toBe(
      EVIDENCE_VAULT_DOOR_RIGHT_BG,
    );
    expect(left?.getAttribute("style") || "").toMatch(/left:/i);
    expect(right?.getAttribute("style") || "").toMatch(/left:/i);
    const leftLeft = (left as HTMLElement).style.left;
    const rightLeft = (right as HTMLElement).style.left;
    expect(leftLeft).not.toBe(rightLeft);
  });

  it("applies non-zero rotateY on each door while opening", () => {
    renderEntrance("opening");
    const left = document.querySelector(
      '[data-testid="evidence-vault-door-left"]',
    );
    const right = document.querySelector(
      '[data-testid="evidence-vault-door-right"]',
    );
    expect(Number(left?.getAttribute("data-rotate-y"))).toBeLessThan(0);
    expect(Number(right?.getAttribute("data-rotate-y"))).toBeGreaterThan(0);
    expect(left?.getAttribute("style") || "").toMatch(/rotateY\(-?\d/i);
    expect(right?.getAttribute("style") || "").toMatch(/rotateY\(\d/i);
  });

  it("removes the closed full-image overlay during unlocking and opening", () => {
    renderEntrance("key_ready");
    expect(
      document.querySelector('[data-testid="evidence-vault-closed-composite"]'),
    ).toBeTruthy();

    renderEntrance("unlocking");
    expect(
      document.querySelector('[data-testid="evidence-vault-closed-composite"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-testid="evidence-vault-closed-door-image"]'),
    ).toBeNull();

    renderEntrance("opening");
    expect(
      document.querySelector('[data-testid="evidence-vault-closed-composite"]'),
    ).toBeNull();
  });

  it("keeps interior reveal beneath the door stage", () => {
    renderEntrance("opening");
    const inner = document.querySelector(".evidence-vault-entrance__art-inner");
    const interior = document.querySelector(
      '[data-testid="evidence-vault-interior-reveal-image"]',
    );
    const stage = document.querySelector(
      '[data-testid="evidence-vault-door-stage"]',
    );
    const room = document.querySelector(
      '[data-testid="evidence-vault-room-static-image"]',
    );
    expect(interior?.getAttribute("src")).toBe(EVIDENCE_VAULT_INTERIOR_REVEAL_BG);
    expect(room?.getAttribute("src")).toBe(EVIDENCE_VAULT_ROOM_STATIC_BG);
    expect(inner?.contains(interior!)).toBe(true);
    expect(inner?.contains(stage!)).toBe(true);
    const nodes = [...(inner?.children ?? [])];
    const interiorPlate = interior?.parentElement;
    expect(nodes.indexOf(interiorPlate!)).toBeLessThan(nodes.indexOf(stage!));
  });

  it("does not put a 2D transform on the 3D art stage (prevents flatten)", () => {
    renderEntrance("opening");
    const art = document.querySelector(
      ".evidence-vault-entrance__art",
    ) as HTMLElement | null;
    const inner = document.querySelector(
      ".evidence-vault-entrance__art-inner",
    ) as HTMLElement | null;
    expect(art).toBeTruthy();
    expect(inner).toBeTruthy();
    // Structural guard: centering must not rely on transform on the 3D parent.
    expect(art?.style.transform || "").toBe("");
  });

  it("keeps doors opaque while swinging (no ghost fade over closed plate)", () => {
    renderEntrance("opening");
    const left = document.querySelector(
      '[data-testid="evidence-vault-door-left"]',
    );
    const right = document.querySelector(
      '[data-testid="evidence-vault-door-right"]',
    );
    expect(left?.getAttribute("data-door-opacity")).toBe("1");
    expect(right?.getAttribute("data-door-opacity")).toBe("1");
  });

  it("does not mount entrance home chrome after open (entrance unmounts)", () => {
    renderEntrance("open");
    expect(
      document.querySelector('[data-testid="evidence-vault-entrance"]'),
    ).toBeNull();
  });

  it("hides key/lock glow once hinged opening begins", () => {
    renderEntrance("key_ready");
    expect(
      document.querySelector(".evidence-vault-entrance__lock-glow"),
    ).toBeTruthy();

    renderEntrance("opening");
    expect(
      document.querySelector(".evidence-vault-entrance__lock-glow"),
    ).toBeNull();
    expect(
      document.querySelector(".evidence-vault-entrance__key-glint"),
    ).toBeNull();
  });
});

describe("Evidence Vault auth isolation", () => {
  it("does not import auth modules from entrance or door libs", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = process.cwd();
    const entrance = readFileSync(
      join(root, "components/estate-collection/EvidenceVaultEntrance.tsx"),
      "utf8",
    );
    const door = readFileSync(
      join(root, "lib/estate/evidenceVaultDoor.ts"),
      "utf8",
    );
    expect(entrance.toLowerCase()).not.toMatch(/supabase|next-auth|clerk/);
    expect(door.toLowerCase()).not.toMatch(/supabase|next-auth|clerk/);
  });
});
