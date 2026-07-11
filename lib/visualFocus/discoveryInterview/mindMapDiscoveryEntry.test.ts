import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  requestMindMapDiscoveryOpen,
  consumeMindMapDiscoveryPending,
  VISUAL_FOCUS_MIND_MAP_DISCOVERY_REQUESTED,
} from "../store";
import { detectExplicitVisualView } from "@/lib/visualThinkingStudio";
import { gatherMindMapDiscoveryContext } from "./gatherContext";

function installBrowserMocks() {
  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  });

  const listeners = new Map<string, Set<(event: Event) => void>>();
  class MockCustomEvent extends Event {
    detail: unknown;
    constructor(type: string, init?: CustomEventInit) {
      super(type);
      this.detail = init?.detail;
    }
  }
  vi.stubGlobal("CustomEvent", MockCustomEvent);
  vi.stubGlobal("window", {
    addEventListener: (type: string, listener: (event: Event) => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener: (type: string, listener: (event: Event) => void) => {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent: (event: Event) => {
      listeners.get(event.type)?.forEach((listener) => listener(event));
      return true;
    },
  });
}

describe("Mind Map Discovery entry (NL + frame parity)", () => {
  beforeEach(() => {
    installBrowserMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    "I want a mind map",
    "Create a mind map",
    "Build a mind map",
    "Mind map this",
  ])("detects mind-map for: %s", (text) => {
    const view = detectExplicitVisualView(text);
    expect(view?.id).toBe("mind-map");
    expect(view?.mode).toBe("mind-map");
  });

  it("requestMindMapDiscoveryOpen stores seed and fires event", () => {
    const handler = vi.fn();
    window.addEventListener(VISUAL_FOCUS_MIND_MAP_DISCOVERY_REQUESTED, handler);
    requestMindMapDiscoveryOpen("Launch plan for Q3");
    expect(handler).toHaveBeenCalled();
    const pending = consumeMindMapDiscoveryPending();
    expect(pending?.seedText).toBe("Launch plan for Q3");
    expect(consumeMindMapDiscoveryPending()).toBeNull();
    window.removeEventListener(
      VISUAL_FOCUS_MIND_MAP_DISCOVERY_REQUESTED,
      handler,
    );
  });

  it("gatherMindMapDiscoveryContext seeds topic from NL seed", () => {
    const seed = gatherMindMapDiscoveryContext({
      seedText: "Create a mind map about my product launch",
    });
    expect(seed.suggestedTopic?.toLowerCase()).toMatch(/product launch/);
  });
});
