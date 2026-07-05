import { beforeEach, describe, expect, it } from "vitest";
import { evaluateSparkDecisionEngine } from "@/lib/sparkCompanion";
import {
  classifyPrimaryConversationTurnWithEngine,
} from "@/lib/conversation/primaryTurnClassifier";
import {
  isCreateTerminalDecision,
  startUniversalCreation,
  buildCreateFlowFailSafeReply,
} from "@/lib/conversation/createTerminalOwner";
import {
  clearPendingCreateDocumentType,
  clearUniversalCreationSession,
  createFastPathRecoveryLine,
  formatUniversalCreationQuestion,
  rememberPendingCreateDocumentType,
  resolveUniversalCreationTurn,
  startUniversalCreationTurn,
} from "@/lib/universalCreation";

const CREATE_TEXT = "help me create an sop";

describe("SOP create runtime", () => {
  beforeEach(() => {
    clearUniversalCreationSession();
    clearPendingCreateDocumentType();
  });

  it("help me create an sop — asks first discovery question", () => {
    const { primary, engine } =
      classifyPrimaryConversationTurnWithEngine({ userText: CREATE_TEXT });
    expect(isCreateTerminalDecision(engine, { userText: CREATE_TEXT })).toBe(
      true,
    );

    const { action } = startUniversalCreation({
      turn: 1,
      userText: CREATE_TEXT,
      lastAssistantText: "",
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toBeTruthy();
    expect(action.localReply).toMatch(/sop|business|client/i);
    expect(action.localReply).not.toContain(
      createFastPathRecoveryLine(CREATE_TEXT),
    );
  });

  it("how do we get started — continues after recovery line", () => {
    rememberPendingCreateDocumentType("sop");
    const recovery = createFastPathRecoveryLine(CREATE_TEXT);
    const engine = evaluateSparkDecisionEngine({ userText: "how do we get started" });
    expect(
      isCreateTerminalDecision(engine, {
        userText: "how do we get started",
        lastAssistantText: recovery,
      }),
    ).toBe(true);

    const turn = resolveUniversalCreationTurn(
      "how do we get started",
      2,
      recovery,
    );
    expect(turn?.kind).toBe("question");
    if (turn?.kind === "question") {
      expect(formatUniversalCreationQuestion(turn)).toMatch(/business|client/i);
    }
  });

  it("advances discovery when session exists", () => {
    const { primary: primary1, engine: engine1 } =
      classifyPrimaryConversationTurnWithEngine({ userText: CREATE_TEXT });
    const firstTurn = startUniversalCreation({
      turn: 1,
      userText: CREATE_TEXT,
      lastAssistantText: "",
      primaryTurn: primary1,
      engineDecision: engine1,
      workspace: null,
    });
    expect(firstTurn.action.localReply).toMatch(/business|client/i);

    const { primary, engine } =
      classifyPrimaryConversationTurnWithEngine({ userText: "for my team" });
    expect(
      isCreateTerminalDecision(engine, {
        userText: "for my team",
        lastAssistantText: firstTurn.action.localReply ?? "",
      }),
    ).toBe(true);

    const { action } = startUniversalCreation({
      turn: 2,
      userText: "for my team",
      lastAssistantText: firstTurn.action.localReply ?? "",
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toMatch(/scratch|written down|process/i);
    expect(action.localReply).not.toMatch(
      /ran into a problem|tell me what you need|what's your question/i,
    );
  });

  it("for my business — advances after audience question", () => {
    const { primary: primary1, engine: engine1 } =
      classifyPrimaryConversationTurnWithEngine({ userText: CREATE_TEXT });
    const firstTurn = startUniversalCreation({
      turn: 1,
      userText: CREATE_TEXT,
      lastAssistantText: "",
      primaryTurn: primary1,
      engineDecision: engine1,
      workspace: null,
    });
    const lastReply = firstTurn.action.localReply ?? "";

    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: "for my business",
      lastAssistantText: lastReply,
    });
    const { action } = startUniversalCreation({
      turn: 2,
      userText: "for my business",
      lastAssistantText: lastReply,
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toMatch(/scratch|written down|process/i);
    expect(action.localReply).not.toContain(
      createFastPathRecoveryLine("for my business"),
    );
  });

  it("for my business — rebuilds session when storage was cleared", () => {
    const { primary: primary1, engine: engine1 } =
      classifyPrimaryConversationTurnWithEngine({ userText: CREATE_TEXT });
    const firstTurn = startUniversalCreation({
      turn: 1,
      userText: CREATE_TEXT,
      lastAssistantText: "",
      primaryTurn: primary1,
      engineDecision: engine1,
      workspace: null,
    });
    const lastReply = firstTurn.action.localReply ?? "";
    clearUniversalCreationSession();

    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: "for my business",
      lastAssistantText: lastReply,
    });
    const { action } = startUniversalCreation({
      turn: 2,
      userText: "for my business",
      lastAssistantText: lastReply,
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toMatch(/scratch|written down|process/i);
    expect(action.localReply).not.toContain(
      createFastPathRecoveryLine("for my business"),
    );
  });

  it("business — advances after audience question (short reply)", () => {
    const { primary: primary1, engine: engine1 } =
      classifyPrimaryConversationTurnWithEngine({ userText: "build an sop" });
    const firstTurn = startUniversalCreation({
      turn: 1,
      userText: "build an sop",
      lastAssistantText: "",
      primaryTurn: primary1,
      engineDecision: engine1,
      workspace: null,
    });
    const lastReply = firstTurn.action.localReply ?? "";

    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: "business",
      lastAssistantText: lastReply,
    });
    expect(
      isCreateTerminalDecision(engine, {
        userText: "business",
        lastAssistantText: lastReply,
        primaryTurn: primary,
      }),
    ).toBe(true);

    const { action } = startUniversalCreation({
      turn: 2,
      userText: "business",
      lastAssistantText: lastReply,
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toMatch(/scratch|written down|process/i);
    expect(action.localReply).not.toContain(
      createFastPathRecoveryLine("business"),
    );
  });

  it("business — rebuilds from assistant when all storage cleared", () => {
    const { primary: primary1, engine: engine1 } =
      classifyPrimaryConversationTurnWithEngine({ userText: "build an sop" });
    const firstTurn = startUniversalCreation({
      turn: 1,
      userText: "build an sop",
      lastAssistantText: "",
      primaryTurn: primary1,
      engineDecision: engine1,
      workspace: null,
    });
    const lastReply = firstTurn.action.localReply ?? "";
    clearUniversalCreationSession();
    clearPendingCreateDocumentType();

    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: "business",
      lastAssistantText: lastReply,
    });
    const { action } = startUniversalCreation({
      turn: 2,
      userText: "business",
      lastAssistantText: lastReply,
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toMatch(/scratch|written down|process/i);
    expect(action.localReply).not.toContain(
      createFastPathRecoveryLine("business"),
    );
  });

  it("marketing plan — advances on purpose answer", () => {
    const createText = "help me write a marketing plan";
    const { primary: primary1, engine: engine1 } =
      classifyPrimaryConversationTurnWithEngine({ userText: createText });
    const firstTurn = startUniversalCreation({
      turn: 1,
      userText: createText,
      lastAssistantText: "",
      primaryTurn: primary1,
      engineDecision: engine1,
      workspace: null,
    });
    const lastReply = firstTurn.action.localReply ?? "";
    clearUniversalCreationSession();
    clearPendingCreateDocumentType();

    const answer = "to help me tell people about my new adhd app";
    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: answer,
      lastAssistantText: lastReply,
    });
    const { action } = startUniversalCreation({
      turn: 2,
      userText: answer,
      lastAssistantText: lastReply,
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toMatch(/who is this for/i);
    expect(action.localReply).not.toContain(
      createFastPathRecoveryLine(answer),
    );
  });

  it("buildCreateFlowFailSafeReply always surfaces SOP discovery question", () => {
    const reply = buildCreateFlowFailSafeReply(CREATE_TEXT, 1);
    expect(reply).toMatch(/business|client/i);
    expect(reply).not.toContain(createFastPathRecoveryLine(CREATE_TEXT));
  });

  it("routes via primaryTurn when engine confidence is not high CREATE", () => {
    const { primary } = classifyPrimaryConversationTurnWithEngine({
      userText: CREATE_TEXT,
    });
    const lowEngine = evaluateSparkDecisionEngine({ userText: CREATE_TEXT });
    const engine = { ...lowEngine, intent: "THINK" as const, intentConfidence: "low" as const };
    expect(
      isCreateTerminalDecision(engine, {
        userText: CREATE_TEXT,
        primaryTurn: primary,
      }),
    ).toBe(true);
  });

  it("full SOP discovery — fourth question before ready, no builder copy", () => {
    const { primary: p1, engine: e1 } =
      classifyPrimaryConversationTurnWithEngine({ userText: CREATE_TEXT });
    const t1 = startUniversalCreation({
      turn: 1,
      userText: CREATE_TEXT,
      lastAssistantText: "",
      primaryTurn: p1,
      engineDecision: e1,
      workspace: null,
    });
    const r1 = t1.action.localReply ?? "";

    const { primary: p2, engine: e2 } =
      classifyPrimaryConversationTurnWithEngine({
        userText: "business",
        lastAssistantText: r1,
      });
    const t2 = startUniversalCreation({
      turn: 2,
      userText: "business",
      lastAssistantText: r1,
      primaryTurn: p2,
      engineDecision: e2,
      workspace: null,
    });
    const r2 = t2.action.localReply ?? "";
    expect(r2).toMatch(/scratch|written down/i);
    expect(r2).not.toMatch(/open the sop builder|I've opened a new SOP/i);

    const { primary: p3, engine: e3 } =
      classifyPrimaryConversationTurnWithEngine({
        userText: "scratch",
        lastAssistantText: r2,
      });
    const t3 = startUniversalCreation({
      turn: 3,
      userText: "scratch",
      lastAssistantText: r2,
      primaryTurn: p3,
      engineDecision: e3,
      workspace: null,
    });
    const r3 = t3.action.localReply ?? "";
    expect(r3).toMatch(/one person|multiple people/i);
    expect(r3).not.toMatch(/open the sop builder|I've opened a new SOP/i);

    const { primary: p4, engine: e4 } =
      classifyPrimaryConversationTurnWithEngine({
        userText: "just me and my va",
        lastAssistantText: r3,
      });
    const t4 = startUniversalCreation({
      turn: 4,
      userText: "just me and my va",
      lastAssistantText: r3,
      primaryTurn: p4,
      engineDecision: e4,
      workspace: null,
    });
    const r4 = t4.action.localReply ?? "";
    expect(r4).toMatch(/what process are we documenting/i);
    expect(r4).not.toMatch(/open the sop builder|I've opened a new SOP/i);

    const { primary: p5, engine: e5 } =
      classifyPrimaryConversationTurnWithEngine({
        userText: "onboarding new VAs",
        lastAssistantText: r4,
      });
    const t5 = startUniversalCreation({
      turn: 5,
      userText: "onboarding new VAs",
      lastAssistantText: r4,
      primaryTurn: p5,
      engineDecision: e5,
      workspace: null,
    });
    const r5 = t5.action.localReply ?? "";
    expect(r5).toMatch(/enough to draft your SOP/i);
    expect(r5).toMatch(/onboarding new VAs/i);
    expect(r5).not.toMatch(/open the sop builder|I've opened a new SOP/i);
  });

  it("active SOP session — emotional message exits create", () => {
    rememberPendingCreateDocumentType("sop");
    const last =
      "Will one person use this, or will multiple people need to follow it?";

    expect(
      resolveUniversalCreationTurn(
        "i can't seem to relax or catch my breath",
        4,
        last,
      ),
    ).toBeNull();

    const engine = evaluateSparkDecisionEngine({
      userText: "i can't seem to relax or catch my breath",
    });
    expect(
      isCreateTerminalDecision(engine, {
        userText: "i can't seem to relax or catch my breath",
        lastAssistantText: last,
      }),
    ).toBe(false);
  });

  it("active SOP session — ADHD knowledge question exits create", () => {
    rememberPendingCreateDocumentType("sop");
    const last = "What process are we documenting today?";

    expect(
      resolveUniversalCreationTurn(
        "what are some symptoms of adhd",
        5,
        last,
      ),
    ).toBeNull();

    const engine = evaluateSparkDecisionEngine({
      userText: "what are some symptoms of adhd",
    });
    expect(
      isCreateTerminalDecision(engine, {
        userText: "what are some symptoms of adhd",
        lastAssistantText: last,
      }),
    ).toBe(false);
  });
});
