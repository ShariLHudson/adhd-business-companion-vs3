import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateCompanionBehaviorCase } from "./companionBehaviorAudit";
import { clearDiscoverySession } from "./estateBrain/discoveryMode";
import { clearUniversalCreationSession } from "./universalCreation/orchestrator";
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
    clearUniversalCreationSession();
    clearDiscoverySession();
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

  it("routes I need to focus to focus support before coaching or navigation", () => {
    const decision = resolveFrictionlessAction({ userText: "I need to focus" });
    expect(decision.category).toBe("focus_support");
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.localReply).toMatch(/one focus thread/i);
    expect(decision.immediateEstateCoachingOpen).toBeUndefined();
    expect(decision.immediateCreateOpen).toBeUndefined();
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

  it("routes sales funnel through universal creation before Create", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to create a sales funnel",
      currentTurn: 5,
    });
    expect(decision.category).toBe("universal_creation");
    expect(decision.immediateCreateOpen).toBeUndefined();
    expect(decision.localReply).toMatch(
      /understand what you're building|reason you're creating|map a funnel|offer sits at the bottom/i,
    );
    expect(decision.pendingAction).toMatchObject({
      target: "content-generator",
      artifactType: "Sales Funnel",
      initialPrompt: "I need to create a sales funnel",
    });
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

  it("routes write an email through universal creation before Create", () => {
    const decision = resolveFrictionlessAction({
      userText: "write an email",
      currentTurn: 2,
    });
    expect(decision.category).toBe("universal_creation");
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.immediateCreateOpen).toBeUndefined();
    expect(decision.localReply).toMatch(/email|reason/i);
  });

  it("routes help me create an SOP through universal creation before Create", () => {
    const decision = resolveFrictionlessAction({
      userText: "help me create an SOP",
      currentTurn: 3,
    });
    expect(decision.category).toBe("universal_creation");
    expect(decision.localReply).toMatch(/understand what you're trying to build/i);
    expect(decision.immediateCreateOpen).toBeUndefined();
  });

  it("routes new project creation to Create not Momentum", () => {
    const decision = resolveFrictionlessAction({
      userText: "create a new project",
      currentTurn: 4,
    });
    expect(decision.immediateCreateProjectOpen?.experienceId).toBe("create");
    expect(decision.immediateCreateProjectOpen?.estatePlaceId).toBe(
      "creative-studio",
    );
    expect(decision.immediateMomentumOpen).toBeUndefined();
    expect(decision.localReply).toMatch(/bring that project to life/i);
  });

  it("routes vague business intent to medium-confidence menu", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to work on my business",
      currentTurn: 2,
    });
    expect(decision.localReply).toMatch(/Which feels right today/i);
    expect(decision.estateNavigationDisambiguation?.choices).toHaveLength(3);
    expect(decision.pendingAction).toBeNull();
  });

  it("routes lost member to low-confidence discovery", () => {
    const decision = resolveFrictionlessAction({
      userText: "I don't know where to start",
      currentTurn: 1,
    });
    expect(decision.localReply).toMatch(/figure it out together/i);
    expect(decision.localReply).toMatch(/making something new/i);
  });

  it("routes weekly planning to Momentum", () => {
    const decision = resolveFrictionlessAction({
      userText: "help me with weekly planning",
      currentTurn: 4,
    });
    expect(decision.immediateMomentumOpen?.section).toBe("projects");
    expect(decision.localReply).toMatch(/Momentum/i);
  });

  it("routes help me decide to Decision Compass before coaching menu", () => {
    const decision = resolveFrictionlessAction({
      userText: "help me decide",
      currentTurn: 1,
    });
    expect(decision.category).toBe("decision_support");
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.pendingAction?.target).toBe("decision-compass");
    expect(decision.immediateEstateCoachingOpen).toBeUndefined();
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

  it("routes mental fatigue through spark restoration intelligence", () => {
    const decision = resolveFrictionlessAction({
      userText: "I keep revising this and nothing is working",
      currentTurn: 20,
    });
    expect(decision.category).toBe("estate_restoration");
    expect(decision.localReply).not.toMatch(/take a break/i);
    expect(decision.responseHint).toMatch(/SPARK RESTORATION INTELLIGENCE/i);
    expect(decision.localReply).toMatch(/Clear My Mind|mind|different|tried/i);
  });

  it("routes what can Spark do through estate guide", () => {
    const decision = resolveFrictionlessAction({
      userText: "What can Spark do?",
      currentTurn: 2,
    });
    expect(decision.category).toBe("estate_guide");
    expect(decision.localReply).toMatch(/Create|Momentum/i);
    expect(decision.responseHint).toMatch(/ESTATE GUIDE/i);
  });

  it("routes room story questions through estate guide", () => {
    const decision = resolveFrictionlessAction({
      userText: "Tell me about the Butterfly Conservatory",
      currentTurn: 3,
    });
    expect(decision.category).toBe("estate_guide");
    expect(decision.localReply).toMatch(/Conservatory/i);
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

  it("navigates after coaching choice following focus discovery", () => {
    const discovery = resolveFrictionlessAction({
      userText: "I need to focus",
      currentTurn: 1,
    });
    const answered = resolveFrictionlessAction({
      userText: "Too many thoughts",
      lastAssistantText: discovery.localReply ?? "",
      currentTurn: 2,
    });
    expect(answered.category).toBe("estate_discovery");
    expect(answered.estateCoachingMenu).toBeDefined();

    const menuReply = answered.localReply ?? "";
    const picked = resolveFrictionlessAction({
      userText: "1",
      lastAssistantText: menuReply,
      currentTurn: 3,
    });
    expect(picked.immediateEstateCoachingOpen?.estatePlaceId).toBe(
      "clear-my-mind",
    );
  });

  it("yes-sales-funnel continues universal creation from stored pending", () => {
    const setup = resolveFrictionlessAction({
      userText: "I need to create a sales funnel",
      currentTurn: 1,
    });
    saveFrictionlessPending(setup.pendingAction);
    const yes = resolveFrictionlessAction({
      userText: "yes",
      currentTurn: 2,
      lastAssistantText: setup.localReply ?? "",
    });
    expect(yes.category).toBe("universal_creation");
    expect(yes.localReply).not.toMatch(/what would you like to create/i);
  });

  it("yes-decide resolves decision-compass pending", () => {
    const setup = resolveFrictionlessAction({
      userText: "Help me decide between two offers",
      currentTurn: 1,
    });
    saveFrictionlessPending(setup.pendingAction);
    const cont = resolveFrictionlessContinuation(
      "yes please",
      loadFrictionlessPending()!,
      2,
    );
    expect(cont?.execute).toBe(true);
    const yes = resolveFrictionlessAction({
      userText: "yes please",
      currentTurn: 2,
      lastAssistantText: setup.localReply ?? "",
    });
    expect(yes.pendingAction).toBeNull();
    expect(yes.workspaceOffer?.section ?? yes.category).toMatch(
      /decision-compass|decision_support/,
    );
  });

  it("yes-write-email continues Create pending without re-asking", () => {
    const setup = resolveFrictionlessAction({
      userText: "I need to write an email",
      currentTurn: 1,
    });
    expect(setup.pendingAction?.target).toBe("content-generator");
    saveFrictionlessPending(setup.pendingAction);
    const yes = resolveFrictionlessAction({
      userText: "let's do it",
      currentTurn: 2,
      lastAssistantText: setup.localReply ?? "",
    });
    expect(yes.localReply).not.toMatch(/what would you like to create/i);
    expect(yes.category).toMatch(/universal_creation|direct_action/);
  });

  it("yes-newsletter stores and continues Create pending", () => {
    const setup = resolveFrictionlessAction({
      userText: "I need to create a newsletter",
      currentTurn: 1,
    });
    expect(setup.pendingAction?.target).toBe("content-generator");
    expect(setup.pendingAction?.initialPrompt).toMatch(/newsletter/i);
    saveFrictionlessPending(setup.pendingAction);
    const cont = resolveFrictionlessContinuation(
      "go ahead",
      loadFrictionlessPending()!,
      2,
    );
    expect(cont?.execute).toBe(true);
  });

  it("yes-clear-my-mind resolves brain-dump pending", () => {
    const setup = resolveFrictionlessAction({
      userText: "I have too many ideas.",
      currentTurn: 1,
    });
    expect(setup.pendingAction?.target).toBe("brain-dump");
    const cont = resolveFrictionlessContinuation(
      "yes",
      setup.pendingAction!,
      2,
    );
    expect(cont?.execute).toBe(true);
  });

  it("yes-focus-help resolves focus-audio pending", () => {
    const setup = resolveFrictionlessAction({
      userText: "I need focus music while I work",
      currentTurn: 1,
    });
    expect(setup.pendingAction?.target).toBe("focus-audio");
    saveFrictionlessPending(setup.pendingAction);
    const yes = resolveFrictionlessAction({
      userText: "start",
      currentTurn: 2,
      lastAssistantText: setup.localReply ?? "",
    });
    expect(yes.category).toBe("tool_open");
    expect(yes.toolSuggestion?.action.type).toBe("tool");
  });

  it("recognizes extended affirmation phrases", () => {
    expect(isFrictionlessAffirmation("yes please")).toBe(true);
    expect(isFrictionlessAffirmation("create it")).toBe(true);
    expect(isFrictionlessAffirmation("start")).toBe(true);
  });

  it("passes yes-visual-map companion audit case", () => {
    const result = evaluateCompanionBehaviorCase({
      id: "yes-visual-map",
      category: "yes_continuation",
      setupUserInput: "Turn this into something visual",
      userInput: "yes",
      expectedIntent: "continuation",
      expectedRoute: "continuation",
      expectedFeature: "Visual Thinking",
      expectedSuppressionFlags: { relationship: true },
    });
    expect(result.failureReasons, result.failureReasons.join("; ")).toEqual([]);
  });
});
