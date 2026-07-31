/**
 * @vitest-environment jsdom
 * EstateTopRightChrome — home/arrival sound reachability (Estate regression fix).
 * Uses react-dom/client + act (repo convention). The chrome portals to
 * document.body, so queries target `document`, not the render container.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EstateTopRightChrome,
  type EstateTopRightChromeProps,
} from "./EstateTopRightChrome";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let playSpy: ReturnType<typeof vi.spyOn>;

function base(
  over: Partial<EstateTopRightChromeProps> = {},
): EstateTopRightChromeProps {
  return {
    showProfile: false,
    showRoom: false,
    roomId: null,
    chatVisible: true,
    onEstateMenuAction: vi.fn(),
    onToggleChat: vi.fn(),
    onBackToEstate: vi.fn(),
    ...over,
  };
}

function render(props: EstateTopRightChromeProps) {
  act(() => root.render(<EstateTopRightChrome {...props} />));
}
const q = (sel: string) => document.querySelector<HTMLElement>(sel);
const qa = (sel: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(sel));
function click(el: Element | null) {
  if (!el) throw new Error("missing element to click");
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  playSpy = vi
    .spyOn(window.HTMLMediaElement.prototype, "play")
    .mockImplementation(() => Promise.resolve());
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("EstateTopRightChrome — home/arrival sound reachability", () => {
  it("renders one canonical sound control on authenticated home/arrival (no room/profile menu)", () => {
    render(base({ showHomeSoundControl: true }));
    const controls = qa('[data-testid="global-sound-control"]');
    expect(controls).toHaveLength(1);
    expect(controls[0].getAttribute("data-canonical-audio-controller")).toBe("true");
    expect(
      q('[data-testid="estate-top-right-chrome"]')?.getAttribute("data-standalone-sound"),
    ).toBe("true");
  });

  it("opens Soundscapes from the home sound control (forwarded handler)", () => {
    const onOpenSoundscapes = vi.fn();
    render(base({ showHomeSoundControl: true, onOpenSoundscapes }));
    click(q('[data-testid="global-sound-control"] button'));
    click(q('[data-testid="global-sound-soundscapes"]'));
    expect(onOpenSoundscapes).toHaveBeenCalledTimes(1);
  });

  it("opens Peaceful Moments from the home sound control (forwarded handler)", () => {
    const onOpenPeacefulPlaces = vi.fn();
    render(base({ showHomeSoundControl: true, onOpenPeacefulPlaces }));
    click(q('[data-testid="global-sound-control"] button'));
    click(q('[data-testid="global-sound-peaceful-moments"]'));
    expect(onOpenPeacefulPlaces).toHaveBeenCalledTimes(1);
  });

  it("does not autoplay audio on the home surface", () => {
    render(base({ showHomeSoundControl: true }));
    expect(playSpy).not.toHaveBeenCalled();
  });

  it("does not duplicate the sound control when full chrome (profile menu) is visible", () => {
    render(base({ showProfile: true, showHomeSoundControl: true }));
    expect(qa('[data-testid="global-sound-control"]')).toHaveLength(1);
    expect(
      q('[data-testid="estate-top-right-chrome"]')?.getAttribute("data-standalone-sound"),
    ).toBe("false");
  });

  it("renders nothing on sign-in / unauthenticated state (no home flag, no menus)", () => {
    render(base({ showHomeSoundControl: false }));
    expect(q('[data-testid="estate-top-right-chrome"]')).toBeNull();
    expect(q('[data-testid="global-sound-control"]')).toBeNull();
  });

  it("keeps room-level sound behavior: control renders once when a room menu is active", () => {
    render(base({ showRoom: true, roomId: "welcome-home", showHomeSoundControl: false }));
    expect(qa('[data-testid="global-sound-control"]')).toHaveLength(1);
    expect(
      q('[data-testid="estate-top-right-chrome"]')?.getAttribute("data-standalone-sound"),
    ).toBe("false");
  });
});
