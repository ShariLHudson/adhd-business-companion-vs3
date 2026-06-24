import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  inferCreateItemTypeFromText,
  resolvedArtifactFromCreatePending,
} from "./createPendingAction";
import {
  clearFrictionlessPending,
  isFrictionlessAffirmation,
  loadFrictionlessPending,
  resolveFrictionlessAction,
  resolveFrictionlessContinuation,
  saveFrictionlessPending,
} from "./frictionlessActionLayer";

describe("createPendingAction (P0.10.2)", () => {
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
  });

  it("infers Email from create-an-email prompt", () => {
    expect(
      inferCreateItemTypeFromText("I need to create an email."),
    ).toBe("Email");
  });

  it("infers Sales Funnel, SOP, and Marketing Plan artifact types", () => {
    expect(
      inferCreateItemTypeFromText("I need to create a sales funnel."),
    ).toBe("Sales Funnel");
    expect(inferCreateItemTypeFromText("Help me create an SOP.")).toBe("SOP");
    expect(inferCreateItemTypeFromText("Write a marketing plan.")).toBe(
      "Marketing Plan",
    );
  });

  it("email Create offer saves pending action with artifact context", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to create an email.",
      currentTurn: 3,
    });
    expect(decision.pendingAction).toMatchObject({
      type: "open_workspace",
      target: "content-generator",
      label: "Create",
      artifactType: "Email",
      initialPrompt: "I need to create an email.",
    });
    saveFrictionlessPending(decision.pendingAction);
    expect(loadFrictionlessPending()).toMatchObject({
      target: "content-generator",
      artifactType: "Email",
      initialPrompt: "I need to create an email.",
    });
  });

  it("write-an-email prompt registers Create pending action (P0.16.3)", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to write an email",
      currentTurn: 2,
    });
    expect(decision.localReply).toMatch(/open Create to draft your email/i);
    expect(decision.pendingAction).toMatchObject({
      type: "open_workspace",
      target: "content-generator",
      artifactType: "Email",
      initialPrompt: "I need to write an email",
    });
  });

  it("yes after email offer resolves Create artifact, not chat", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to create an email.",
      currentTurn: 2,
    });
    saveFrictionlessPending(decision.pendingAction);
    expect(isFrictionlessAffirmation("yes")).toBe(true);
    const cont = resolveFrictionlessContinuation(
      "yes",
      loadFrictionlessPending()!,
      3,
    );
    expect(cont?.execute).toBe(true);
    expect(cont?.ack).toBe("Opening Create.");
    const artifact = resolvedArtifactFromCreatePending(loadFrictionlessPending()!);
    expect(artifact?.itemType).toBe("Email");
    expect(artifact?.artifactTypeLocked).toBe(true);
    expect(loadFrictionlessPending()?.target).toBe("content-generator");
    expect(loadFrictionlessPending()?.target).not.toBe("chat");
  });

  it("preserves original prompt on pending action", () => {
    const prompt = "I need to create an email.";
    const decision = resolveFrictionlessAction({
      userText: prompt,
      currentTurn: 1,
    });
    expect(decision.pendingAction?.initialPrompt).toBe(prompt);
  });

  it("sales funnel, SOP, and marketing plan pending actions pass", () => {
    const cases = [
      { text: "I need to create a sales funnel.", type: "Sales Funnel" },
      { text: "Help me create an SOP.", type: "SOP" },
      { text: "Write a marketing plan.", type: "Marketing Plan" },
    ];
    for (const { text, type } of cases) {
      const decision = resolveFrictionlessAction({ userText: text, currentTurn: 1 });
      expect(decision.pendingAction?.artifactType).toBe(type);
      expect(decision.pendingAction?.target).toBe("content-generator");
      const artifact = resolvedArtifactFromCreatePending(decision.pendingAction!);
      expect(artifact?.itemType).toBe(type);
    }
  });

  it("clears pending only when caller clears after successful open", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to create an email.",
      currentTurn: 4,
    });
    saveFrictionlessPending(decision.pendingAction);
    expect(loadFrictionlessPending()).not.toBeNull();
    resolveFrictionlessContinuation("yes", loadFrictionlessPending()!, 5);
    expect(loadFrictionlessPending()).not.toBeNull();
    clearFrictionlessPending();
    expect(loadFrictionlessPending()).toBeNull();
  });
});
