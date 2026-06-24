import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";
import {
  clearFrictionlessPending,
  frictionlessHintForChat,
  isFrictionlessAffirmation,
  loadFrictionlessPending,
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
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.localReply).toMatch(/slow this down|breath/i);
    expect(decision.localReply).not.toMatch(/plan my day|productivity|business/i);
    const hint = frictionlessHintForChat(decision);
    expect(hint).toMatch(/EMOTIONAL REGULATION/i);
    expect(hint).toMatch(/No productivity/i);
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
