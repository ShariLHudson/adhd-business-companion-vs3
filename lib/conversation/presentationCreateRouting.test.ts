import { beforeEach, describe, expect, it } from "vitest";
import {
  classifyPrimaryConversationTurnWithEngine,
} from "@/lib/conversation/primaryTurnClassifier";
import {
  isCreateTerminalDecision,
  startUniversalCreation,
} from "@/lib/conversation/createTerminalOwner";
import {
  clearPendingCreateDocumentType,
  clearUniversalCreationSession,
  resolveUniversalCreationTurn,
} from "@/lib/universalCreation";
import { isEstateGuideQuestion } from "@/lib/sparkKnowledge/estateGuide";
import { resolveInformationalKnowledgeLocalReply } from "@/lib/sparkKnowledge/informationalKnowledge";
import { shouldExitActiveCreateSession } from "@/lib/conversation/createSessionExit";
import { isDevelopmentWorkFrustration } from "@/lib/universalCreation/createFastPath";
import { shouldResolveEarlyLocalSupportTurn } from "./earlyLocalSupportTurn";
import { appendStuckTurnRecoveryMessage } from "./conversationTurnWatchdog";

const CREATE_TEXT = "i need help creating a presentation";
const PURPOSE_ANSWER =
  "to explain to potential users how they can use and benefit from my new adhd app";
const CLARIFY_ANSWER = "the process to creating the presentation itself";
const DISCOVERY_Q1 =
  "What's the main reason you're giving this presentation?";
const FRUSTRATED_AUDIENCE_ANSWER =
  "adhd business people and they are frustrated, tired of buying things they think will help them";

describe("presentation create routing", () => {
  beforeEach(() => {
    clearUniversalCreationSession();
    clearPendingCreateDocumentType();
  });

  it("adhd product pitch answer is not estate guide during create", () => {
    expect(isEstateGuideQuestion(PURPOSE_ANSWER)).toBe(false);
    expect(isEstateGuideQuestion(PURPOSE_ANSWER, DISCOVERY_Q1)).toBe(false);
    expect(resolveInformationalKnowledgeLocalReply(PURPOSE_ANSWER)).toBeNull();
    expect(
      shouldExitActiveCreateSession(PURPOSE_ANSWER, DISCOVERY_Q1),
    ).toBe(false);
  });

  it("advances after purpose answer — not estate guide", () => {
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

    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: PURPOSE_ANSWER,
      lastAssistantText: r1,
    });
    expect(
      isCreateTerminalDecision(engine, {
        userText: PURPOSE_ANSWER,
        lastAssistantText: r1,
        primaryTurn: primary,
      }),
    ).toBe(true);

    const { action } = startUniversalCreation({
      turn: 2,
      userText: PURPOSE_ANSWER,
      lastAssistantText: r1,
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toMatch(/who is in the room|who is this for/i);
    expect(action.localReply).not.toMatch(/walk you through the Estate/i);
    expect(action.localReply).not.toMatch(/brains that work differently/i);
  });

  it("clarify answer mid-discovery continues — does not restart intro", () => {
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
        userText: PURPOSE_ANSWER,
        lastAssistantText: r1,
      });
    const t2 = startUniversalCreation({
      turn: 2,
      userText: PURPOSE_ANSWER,
      lastAssistantText: r1,
      primaryTurn: p2,
      engineDecision: e2,
      workspace: null,
    });
    const r2 = t2.action.localReply ?? "";

    const turn = resolveUniversalCreationTurn(CLARIFY_ANSWER, 3, r2);
    expect(turn?.kind).toBe("question");
    if (turn?.kind === "question") {
      expect(turn.question).toMatch(/setting|conference|webinar|pitch|success|look like/i);
      expect(turn.question).not.toMatch(
        /main reason you're creating this presentation/i,
      );
    }
  });

  it("purpose answer during discovery classifies as active create", () => {
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

    const { primary } = classifyPrimaryConversationTurnWithEngine({
      userText: PURPOSE_ANSWER,
      lastAssistantText: r1,
    });
    expect(primary.type).toBe("TASK_REQUEST");
    expect(primary.owner).toBe("frictionless:universal_creation");
  });

  it("app development frustration does not start create", () => {
    const text =
      "trying to make the new app i am creating respond like it's supposed to";
    expect(isDevelopmentWorkFrustration(text)).toBe(true);
    expect(
      isCreateTerminalDecision(
        {
          intent: "CREATE",
          intentConfidence: "high",
          friction: "none",
          companionRole: "thinking_partner",
          estateRoute: null,
          landscape: {
            primary: "river",
            secondary: [],
            confidence: "low",
            optionalMetaphor: null,
            reason: "test",
          },
          targetOutcomes: [],
          learningSignals: [],
          anticipateHints: [],
          suppressEmotionalCoaching: false,
          reason: "test",
        },
        { userText: text, lastAssistantText: "What's been the hardest part today?" },
      ),
    ).toBe(false);
  });

  it("frustrated audience answer during discovery is not emotional support", () => {
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

    const purpose = "to introduce my new adhd app";
    const { primary: p2, engine: e2 } =
      classifyPrimaryConversationTurnWithEngine({
        userText: purpose,
        lastAssistantText: r1,
      });
    const t2 = startUniversalCreation({
      turn: 2,
      userText: purpose,
      lastAssistantText: r1,
      primaryTurn: p2,
      engineDecision: e2,
      workspace: null,
    });
    const r2 = t2.action.localReply ?? "";
    expect(r2).toMatch(/who is in the room/i);

    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: FRUSTRATED_AUDIENCE_ANSWER,
      lastAssistantText: r2,
    });
    expect(primary.type).toBe("TASK_REQUEST");
    expect(primary.owner).toBe("frictionless:universal_creation");
    expect(
      shouldResolveEarlyLocalSupportTurn(
        FRUSTRATED_AUDIENCE_ANSWER,
        primary,
        r2,
      ),
    ).toBe(false);

    const { action } = startUniversalCreation({
      turn: 3,
      userText: FRUSTRATED_AUDIENCE_ANSWER,
      lastAssistantText: r2,
      primaryTurn: primary,
      engineDecision: engine,
      workspace: null,
    });
    expect(action.localReply).toMatch(/setting|conference|webinar|pitch/i);
    expect(action.localReply).not.toMatch(/running on empty/i);
    expect(action.localReply).not.toMatch(/hardest part today/i);
  });

  it("overwhelm continuation resolves locally — no stuck recovery duplicate", () => {
    const last = "What's been the hardest part today?";
    const user =
      "trying to get everything done when i need to and not wanting to do anything";
    expect(
      shouldResolveEarlyLocalSupportTurn(user, {
        type: "RELATIONSHIP_CHAT",
        confidence: "low",
        owner: "chat",
        reason: "test",
        blockKernelNavigation: true,
        blockBridgeResponder: true,
        blockCollectionOffer: true,
        blockSecondaryResponders: true,
      }, last),
    ).toBe(true);

    const withReply = appendStuckTurnRecoveryMessage([
      { role: "user", content: user },
      { role: "assistant", content: "That sounds really heavy — I'm here." },
    ]);
    expect(withReply).toHaveLength(2);
  });
});
