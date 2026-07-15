/**
 * Evidence Vault hinged doors — stacking + motion wiring.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EVIDENCE_VAULT_ARRIVAL_MS,
  EVIDENCE_VAULT_DOOR_HOLD_MS,
  EVIDENCE_VAULT_DOOR_LEFT_BG,
  EVIDENCE_VAULT_DOOR_OPEN_DEGREES,
  EVIDENCE_VAULT_DOOR_RIGHT_BG,
  EVIDENCE_VAULT_ROOM_STATIC_BG,
  EVIDENCE_VAULT_WRITING_ROOM_BG,
} from "@/lib/estate/evidenceVaultDoor";
import { EvidenceVaultEntrance } from "./EvidenceVaultEntrance";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MotionDiv = React.forwardRef(function MotionDiv(
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
    const { transformPerspective, transformOrigin, ...box } = style ?? {};
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
              : `perspective(${transformPerspective ?? 1600}px) rotateY(${rotateY}deg)`,
        },
        "data-rotate-y": String(rotateY),
        "data-door-opacity": String(opacity),
      },
      children,
    );
  });
  const MotionButton = React.forwardRef(function MotionButton(
    {
      children,
      animate,
      ...rest
    }: {
      children?: React.ReactNode;
      animate?: Record<string, unknown>;
      className?: string;
      type?: "button";
      onClick?: () => void;
      disabled?: boolean;
      "aria-label"?: string;
      "aria-describedby"?: string;
      "data-testid"?: string;
    },
    ref: React.Ref<HTMLButtonElement>,
  ) {
    return React.createElement(
      "button",
      { ...rest, ref, "data-key-animate": animate ? "1" : "0" },
      children,
    );
  });
  return {
    useReducedMotion: () => false,
    motion: {
      div: MotionDiv,
      button: MotionButton,
    },
  };
});

describe("EvidenceVaultEntrance door motion", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
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
    if (doorState === "locked" || doorState === "key_ready") {
      act(() => {
        vi.advanceTimersByTime(EVIDENCE_VAULT_ARRIVAL_MS);
      });
    }
  }

  it("starts with closed hinged doors and hanging key object", () => {
    renderEntrance("key_ready");
    expect(
      document.querySelector('[data-testid="evidence-vault-door-left"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-testid="evidence-vault-door-right"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-testid="vault-key-interaction"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-testid="evidence-vault-use-key"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-testid="evidence-vault-closed-composite"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-testid="evidence-vault-unlock-action"]'),
    ).toBeNull();
  });

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
    expect(Number(left?.getAttribute("data-rotate-y"))).toBe(
      -EVIDENCE_VAULT_DOOR_OPEN_DEGREES,
    );
    expect(Number(right?.getAttribute("data-rotate-y"))).toBe(
      EVIDENCE_VAULT_DOOR_OPEN_DEGREES,
    );
    expect(left?.getAttribute("style") || "").toMatch(/rotateY\(-?\d/i);
    expect(right?.getAttribute("style") || "").toMatch(/rotateY\(\d/i);
  });

  it("never mounts a closed full-image overlay", () => {
    for (const state of ["key_ready", "unlocking", "opening"] as const) {
      renderEntrance(state);
      expect(
        document.querySelector(
          '[data-testid="evidence-vault-closed-composite"]',
        ),
      ).toBeNull();
    }
  });

  it("keeps writing room beneath the door stage without fade swap", () => {
    renderEntrance("opening");
    const inner = document.querySelector(".evidence-vault-entrance__art-inner");
    const writing = document.querySelector(
      '[data-testid="evidence-vault-writing-room-image"]',
    );
    const stage = document.querySelector(
      '[data-testid="evidence-vault-door-stage"]',
    );
    const room = document.querySelector(
      '[data-testid="evidence-vault-room-static-image"]',
    );
    expect(writing?.getAttribute("src")).toBe(EVIDENCE_VAULT_WRITING_ROOM_BG);
    expect(room?.getAttribute("src")).toBe(EVIDENCE_VAULT_ROOM_STATIC_BG);
    expect(inner?.contains(writing!)).toBe(true);
    expect(inner?.contains(stage!)).toBe(true);
    const nodes = [...(inner?.children ?? [])];
    const writingPlate = writing?.parentElement;
    expect(nodes.indexOf(writingPlate!)).toBeLessThan(nodes.indexOf(stage!));
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

  it("holds open doors framing the room, then unmounts entrance", () => {
    renderEntrance("open");
    expect(
      document.querySelector('[data-testid="evidence-vault-entrance"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-testid="evidence-vault-entrance"]')
        ?.getAttribute("data-holding-open"),
    ).toBe("true");
    act(() => {
      vi.advanceTimersByTime(EVIDENCE_VAULT_DOOR_HOLD_MS + 50);
    });
    expect(
      document.querySelector('[data-testid="evidence-vault-entrance"]'),
    ).toBeNull();
  });

  it("hides key interaction once hinged opening begins", () => {
    renderEntrance("key_ready");
    expect(
      document.querySelector('[data-testid="vault-key-interaction"]'),
    ).toBeTruthy();

    renderEntrance("opening");
    expect(
      document.querySelector('[data-testid="vault-key-interaction"]'),
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
