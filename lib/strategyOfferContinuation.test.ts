import { beforeEach, describe, expect, it, vi } from "vitest";
import { learningPathMenuOfferBlock } from "./learningPathMenu";
import {
  clearPendingMenuSelection,
  registerPendingMenuFromAssistant,
} from "./menuContinuationIntelligence";
import {
  clearFrictionlessPending,
  loadFrictionlessPending,
  saveFrictionlessPending,
  resolveFrictionlessAction,
  resolveFrictionlessContinuation,
} from "./frictionlessActionLayer";
import { recommendStrategyFromUserText } from "./strategyIntelligence";
import {
  buildStrategyOfferPendingAction,
  isStrategyIntelligenceOfferMessage,
  recoverStrategyOfferPendingFromChat,
  registerStrategyOfferFromAssistant,
  resolveStrategyFromOfferMessage,
  saveStrategyOfferPending,
  shouldSkipStrategyOfferForUserText,
} from "./strategyOfferContinuation";

describe("strategyOfferContinuation (P0.18)", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    };
    vi.stubGlobal("window", { dispatchEvent: vi.fn(), sessionStorage: storage });
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("sessionStorage", storage);
    clearFrictionlessPending();
    clearPendingMenuSelection();
  });

  it("Strategy Intelligence offer saves pending strategy action", () => {
    const prior = "I keep putting off my sales calls.";
    const rec = recommendStrategyFromUserText(prior);
    expect(rec).not.toBeNull();
    const pending = registerStrategyOfferFromAssistant({
      assistantText: rec!.offerMessage,
      priorUserText: prior,
      offeredAtTurn: 3,
    });
    expect(pending).not.toBeNull();
    expect(pending?.type).toBe("strategy_offer");
    expect(pending?.target).toBe("playbook");
    expect(pending?.strategyId).toBeTruthy();
    expect(pending?.offerSummary).toMatch(/Use /);
    saveStrategyOfferPending(pending!);
    const loaded = loadFrictionlessPending();
    expect(loaded?.type).toBe("strategy_offer");
    expect(loaded?.strategyId).toBe(pending?.strategyId);
  });

  it('"yes" opens playbook continuation executes', () => {
    const pending = buildStrategyOfferPendingAction({
      strategyId: "ugly-first-draft",
      strategyTitle: "Start Ugly",
      initialPrompt: "I keep procrastinating",
      offeredAtTurn: 2,
    });
    saveStrategyOfferPending(pending);
    const cont = resolveFrictionlessContinuation("yes", loadFrictionlessPending()!, 3);
    expect(cont?.execute).toBe(true);
    expect(cont?.ack).toBe("Opening **Start Ugly**.");
    expect(loadFrictionlessPending()?.target).toBe("playbook");
  });

  it("yes continuation carries correct strategyId", () => {
    const pending = buildStrategyOfferPendingAction({
      strategyId: "body-double",
      strategyTitle: "Body Double",
      initialPrompt: "I can't focus alone",
      offeredAtTurn: 1,
    });
    expect(pending.strategyId).toBe("body-double");
    const cont = resolveFrictionlessContinuation("use it", pending, 2);
    expect(cont?.execute).toBe(true);
  });

  it("strategy offer on last turn recovers over stale create pending", () => {
    saveFrictionlessPending({
      type: "open_workspace",
      target: "content-generator",
      context: "email",
      artifactType: "Email",
      initialPrompt: "old email",
      offeredAtTurn: 1,
      offerSummary: "Open Create",
    });
    const recovered = recoverStrategyOfferPendingFromChat({
      userText: "yes",
      lastAssistantText:
        "I have a strategy that may help — **Start Ugly**. Would you like to use it?",
      priorUserText: "I keep putting off my sales calls.",
      currentTurn: 4,
    });
    expect(recovered?.strategyId).toBe("ugly-first-draft");
    expect(loadFrictionlessPending()?.target).toBe("content-generator");
  });

  it("stale pending action is replaced by latest strategy offer", () => {
    saveStrategyOfferPending(
      buildStrategyOfferPendingAction({
        strategyId: "ugly-first-draft",
        strategyTitle: "Start Ugly",
        initialPrompt: "first",
        offeredAtTurn: 1,
      }),
    );
    saveStrategyOfferPending(
      buildStrategyOfferPendingAction({
        strategyId: "body-double",
        strategyTitle: "Body Double",
        initialPrompt: "second",
        offeredAtTurn: 4,
      }),
    );
    const loaded = loadFrictionlessPending();
    expect(loaded?.strategyId).toBe("body-double");
    expect(loaded?.offeredAtTurn).toBe(4);
  });

  it("generic playbook pending opens playbook", () => {
    const pending = {
      type: "open_workspace" as const,
      target: "playbook" as const,
      context: "strategies",
      offeredAtTurn: 1,
      offerSummary: "Open Strategies",
    };
    const cont = resolveFrictionlessContinuation("yes", pending, 2);
    expect(cont?.execute).toBe(true);
    expect(cont?.ack).toBe("Opening Strategies.");
  });

  it("marketing strategy document still routes to Create", () => {
    expect(
      shouldSkipStrategyOfferForUserText("Help me create a marketing strategy"),
    ).toBe(true);
    const decision = resolveFrictionlessAction({
      userText: "Help me create a marketing strategy",
      currentTurn: 1,
    });
    expect(decision.category).not.toBe("google_sheet");
    expect(registerStrategyOfferFromAssistant({
      assistantText:
        "I have a strategy that may help — **Marketing Plan**. Would you like to use it?",
      priorUserText: "Help me create a marketing strategy",
      offeredAtTurn: 2,
    })).toBeNull();
  });

  it("Deep Dive menu option 4 remains knowledge_menu, not strategy offer", () => {
    const menuText = `Here's the idea.\n\nWould you like to go deeper?\n${learningPathMenuOfferBlock()}`;
    expect(isStrategyIntelligenceOfferMessage(menuText)).toBe(false);
    const menu = registerPendingMenuFromAssistant(menuText, "What is a mind map?", 1);
    expect(menu?.type).toBe("knowledge_menu");
    expect(menu?.options["4"]).toBe("deep_dive");
    expect(
      registerStrategyOfferFromAssistant({
        assistantText: menuText,
        priorUserText: "What is a mind map?",
        offeredAtTurn: 1,
      }),
    ).toBeNull();
  });

  it("parses strategy title from assistant bold text", () => {
    const resolved = resolveStrategyFromOfferMessage(
      "I have a strategy that may help — **Start Ugly**. Would you like to use it?",
      "I can't get started on my project",
    );
    expect(resolved?.strategyId).toBe("ugly-first-draft");
    expect(resolved?.title).toBe("Start Ugly");
  });
});
