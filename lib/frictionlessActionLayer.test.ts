import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";
import {
  clearFrictionlessPending,
  frictionlessHintForChat,
  isFrictionlessAffirmation,
  loadFrictionlessPending,
  loadFrictionlessPendingForConfirmation,
  resolveFrictionlessAction,
  resolveFrictionlessContinuation,
  saveFrictionlessPending,
  shouldSuppressRelationshipForFrictionless,
} from "./frictionlessActionLayer";

describe("frictionlessActionLayer", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    clearFrictionlessPending();
    vi.restoreAllMocks();
  });

  it("routes pleasure places music to focus audio confirmation offer", () => {
    const decision = resolveFrictionlessAction({
      userText: "Can you take me to the pleasure places music?",
      currentTurn: 1,
    });
    expect(decision.localReply).toMatch(/Focus Audio/i);
    expect(decision.localReply).toMatch(/Want me to open it\?/i);
    expect(decision.pendingAction?.target).toBe("focus-audio");
  });

  it("routes I need to focus to focus_support with relationship suppressed", () => {
    const decision = resolveFrictionlessAction({ userText: "I need to focus" });
    expect(decision.category).toBe("focus_support");
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.suppressReflectionFirst).toBe(true);
    expect(decision.localReply).toMatch(/one focus thread/i);
    expect(decision.localReply).not.toMatch(/I've noticed/i);
    expect(shouldSuppressRelationshipForFrictionless(decision)).toBe(true);
    expect(
      buildRelationshipLeadParagraph("I need to focus", new Date(), {
        suppressForRouting: true,
      }),
    ).toBeNull();
  });

  it("routes breathless anxiety to emotional_regulation without productivity framing", () => {
    const decision = resolveFrictionlessAction({
      userText: "I am anxious and can't catch my breath",
    });
    expect(decision.category).toBe("emotional_regulation");
    expect(decision.suppressReflectionFirst).toBe(false);
    expect(decision.localReply).not.toMatch(/plan my day|productivity|business/i);
    expect(decision.localReply).not.toMatch(/let's break/i);
    const hint = frictionlessHintForChat(decision);
    expect(hint).toMatch(/SHARI COMPANION ENGINE|emotion before instruction/i);
  });

  it("routes difficult client call to Shari emotional-first local reply", () => {
    const decision = resolveFrictionlessAction({
      userText:
        "I need to make a call to a difficult client but I don't want to do it.",
    });
    expect(decision.category).toBe("emotional_regulation");
    expect(decision.suppressReflectionFirst).toBe(false);
    expect(decision.localReply).toMatch(/boundary conversation/i);
    expect(decision.localReply).toMatch(/practice/i);
    expect(decision.localReply).not.toMatch(/break (?:this |it )?down/i);
  });

  it("creates pending Focus Audio action for calming music requests", () => {
    const decision = resolveFrictionlessAction({
      userText: "I would like to listen to calming music",
      currentTurn: 4,
    });
    expect(decision.category).toBe("tool_open");
    expect(decision.pendingAction?.target).toBe("focus-audio");
    expect(decision.pendingAction?.context).toMatch(/calming/i);
    expect(decision.localReply).toMatch(/Focus Audio/i);
    saveFrictionlessPending(decision.pendingAction);
    expect(loadFrictionlessPending()?.target).toBe("focus-audio");
  });

  it("executes yes after sales funnel offer with content-generator target", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to create a sales funnel",
      currentTurn: 5,
    });
    saveFrictionlessPending(decision.pendingAction);
    const cont = resolveFrictionlessContinuation("yes", loadFrictionlessPending()!, 6);
    expect(cont?.execute).toBe(true);
    expect(loadFrictionlessPending()?.target).toBe("content-generator");
    expect(loadFrictionlessPending()?.artifactType).toBe("Sales Funnel");
  });

  it("executes yes after Focus Audio offer without treating as new conversation", () => {
    saveFrictionlessPending({
      type: "open_tool",
      target: "focus-audio",
      context: "calming music",
      focusAudioCategory: "calm-brain",
      offeredAtTurn: 5,
      offerSummary: "Focus Audio — calming music",
    });
    expect(isFrictionlessAffirmation("yes")).toBe(true);
    const cont = resolveFrictionlessContinuation(
      "yes",
      loadFrictionlessPending()!,
      6,
      "Want **Focus Audio** for calming music?",
    );
    expect(cont?.execute).toBe(true);
    expect(cont?.ack).toMatch(/Opening.*Focus Audio/i);
  });

  it("rejects yes when the latest assistant message no longer matches the stored offer", () => {
    saveFrictionlessPending({
      type: "open_workspace",
      target: "brain-dump",
      offeredAtTurn: 8,
      offerSummary: "Open Clear My Mind",
    });
    const cont = resolveFrictionlessContinuation(
      "yes",
      loadFrictionlessPending()!,
      10,
      "What would you like help with today?",
    );
    expect(cont).toBeNull();
  });

  it("routes write an email to direct_action with relationship suppressed", () => {
    const decision = resolveFrictionlessAction({
      userText: "write an email",
      currentTurn: 2,
    });
    expect(decision.category).toBe("direct_action");
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.workspaceOffer?.section).toBe("content-generator");
    expect(decision.pendingAction).toMatchObject({
      target: "content-generator",
      artifactType: "Email",
      initialPrompt: "write an email",
    });
    expect(decision.localReply).toMatch(/Create|email/i);
  });

  it("routes help me decide to decision_support with compass offer", () => {
    const decision = resolveFrictionlessAction({
      userText: "help me decide",
      currentTurn: 1,
    });
    expect(decision.category).toBe("decision_support");
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.workspaceOffer?.section).toBe("decision-compass");
  });

  it("prefers awaiting confirmation pending over misaligned localStorage", () => {
    saveFrictionlessPending({
      type: "open_tool",
      target: "brain-dump",
      context: "Clear My Mind",
      offeredAtTurn: 1,
      offerSummary: "Clear My Mind",
    });
    const awaiting = {
      type: "open_tool" as const,
      target: "focus-audio" as const,
      context: "background audio",
      focusAudioCategory: "focus",
      offeredAtTurn: 5,
      offerSummary: "Focus Audio — background audio",
    };
    const assistant =
      "I can open Focus Audio for background audio. Want me to open it?";
    const loaded = loadFrictionlessPendingForConfirmation({
      confirmationReply: true,
      awaitingPending: awaiting,
      lastAssistantText: assistant,
      currentTurn: 6,
    });
    expect(loaded?.target).toBe("focus-audio");
    const cont = resolveFrictionlessContinuation(
      "yes",
      loaded!,
      6,
      assistant,
    );
    expect(cont?.execute).toBe(true);
  });

  it("keeps learn fast path out of direct_action execute override", () => {
    const decision = resolveFrictionlessAction({
      userText: "What is a sales funnel?",
      currentTurn: 1,
    });
    expect(decision.category).toBe("none");
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.intentRouting?.learnFastPath).toBe(true);
    expect(decision.localReply).toBeNull();
  });
});
