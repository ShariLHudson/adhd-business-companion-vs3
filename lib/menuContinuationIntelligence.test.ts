import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  applyMenuContinuationRoutingOverrides,
  clearPendingMenuSelection,
  detectStructuredTeachingMenu,
  isMenuSelectionInput,
  loadPendingMenuSelection,
  menuContinuationHintForChat,
  registerPendingMenuFromAssistant,
  resolveMenuContinuation,
} from "./menuContinuationIntelligence";
import { learningPathMenuOfferBlock } from "./learningPathMenu";
import { resolveIntentRouting } from "./intentRoutingIntelligence";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";

const TEACHING_MENU = `A mind map is a visual way to organize ideas.\n\nWould you like:\n${learningPathMenuOfferBlock()}`;

const SALES_FUNNEL_MENU = `A sales funnel is the journey from first hearing about you to becoming a customer.\n\nWould you like:\n${learningPathMenuOfferBlock()}`;

const ADHD_MENU = `ADHD paralysis is when you know what to do but can't start.\n\nWould you like:\n${learningPathMenuOfferBlock()}`;

describe("menuContinuationIntelligence", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
    });
    clearPendingMenuSelection();
  });

  it("detects structured 1–4 learning path menus", () => {
    const menu = detectStructuredTeachingMenu(TEACHING_MENU);
    expect(menu?.type).toBe("knowledge_menu");
    expect(menu?.options["4"]).toBe("deep_dive");
  });

  it.each([
    ["mind map", "What is a mind map?", TEACHING_MENU, "2", "example"],
    ["sales funnel", "What is a sales funnel?", SALES_FUNNEL_MENU, "3", "apply_to_business"],
    ["ADHD paralysis", "Explain ADHD paralysis.", ADHD_MENU, "1", "quick_answer"],
    ["knowledge", "Tell me about nurture sequences.", SALES_FUNNEL_MENU, "4", "deep_dive"],
  ] as const)(
    "%s menu → option continues workflow",
    (_label, priorUser, menu, pick, expectedOption) => {
      const resolution = resolveMenuContinuation({
        userText: pick,
        lastAssistantText: menu,
        priorUserText: priorUser,
      });
      expect(resolution.active).toBe(true);
      expect(resolution.selectedOption).toBe(expectedOption);
      expect(isMenuSelectionInput(pick, menu)).toBe(true);
    },
  );

  it("deep dive selection hint forbids relationship opener", () => {
    const resolution = resolveMenuContinuation({
      userText: "4",
      lastAssistantText: TEACHING_MENU,
      priorUserText: "What is a mind map?",
    });
    const hint = menuContinuationHintForChat(resolution, "4", TEACHING_MENU);
    expect(hint).toMatch(/DEEP DIVE/i);
    expect(hint).toMatch(/FORBIDDEN/i);
    expect(
      buildRelationshipLeadParagraph("4", new Date(), {
        suppressForRouting: true,
      }),
    ).toBeNull();
  });

  it("persists pendingMenuSelection when assistant offers menu", () => {
    registerPendingMenuFromAssistant(TEACHING_MENU, "What is a mind map?", 3);
    const pending = loadPendingMenuSelection();
    expect(pending?.type).toBe("knowledge_menu");
    expect(pending?.topic).toMatch(/mind map/i);
    expect(pending?.options["4"]).toBe("deep_dive");
  });

  it("routing overrides suppress relationship and observation layers", () => {
    const base = resolveIntentRouting({ userText: "2" });
    const patched = applyMenuContinuationRoutingOverrides(base);
    expect(patched.suppressRelationshipIntelligence).toBe(true);
    expect(patched.suppressObservationEngine).toBe(true);
  });
});
