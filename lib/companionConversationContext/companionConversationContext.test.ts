import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  clearCompanionConversationState,
  detectEmotionalPivot,
  formatEmotionalPivotReply,
  isAffirmativeReply,
  isLocationHereQuery,
  resolveCompanionTurn,
  writeCompanionConversationState,
} from "./index";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { runConversationRoutingPipeline } from "@/lib/conversationStabilization";

const stubRouting = { category: "chat", learnFastPath: false };

beforeEach(() => {
  clearCompanionConversationState();
  vi.stubEnv("NEXT_PUBLIC_COMPANION_CONVERSATION_CONTEXT", "1");
});

afterEach(() => {
  vi.unstubAllEnvs();
  clearCompanionConversationState();
});

describe("Companion Conversation Context™ — golden tests", () => {
  it("A — lists Possibility House sublocations from current location", () => {
    writeCompanionConversationState({
      currentLocation: {
        locationId: "house-possibility-outside",
        placeId: "house-possibility-outside",
        displayName: "Possibility House",
      },
      updatedAtTurn: 1,
    });

    const result = resolveCompanionTurn({
      userText: "what are all the places in the possibility house",
      currentRoom: "house-possibility-outside",
      currentTurn: 2,
    });

    expect(result.handled).toBe(true);
    expect(result.trace.finalResponseReason).toBe("estate_location_context");
    expect(result.decision?.localReply).toMatch(/observatory|discovery chest|studio/i);
    expect(result.decision?.localReply).not.toMatch(/reminder|settings|clear my mind/i);
  });

  it("B — what is here explains current location", () => {
    writeCompanionConversationState({
      currentLocation: {
        locationId: "house-possibility-outside",
        placeId: "house-possibility-outside",
        displayName: "Possibility House",
      },
      updatedAtTurn: 1,
    });

    const result = resolveCompanionTurn({
      userText: "what is here?",
      currentRoom: "house-possibility-outside",
      currentTurn: 2,
    });

    expect(result.handled).toBe(true);
    expect(result.decision?.localReply).toMatch(/Possibility House|treehouse|creative retreat/i);
  });

  it("C — yes executes pending fireplace navigation", () => {
    writeCompanionConversationState({
      pendingAction: {
        type: "estate_navigate",
        placeId: "observatory-fireplace",
        locationId: "house-possibility-observatory",
        priorAssistantQuestion: "Would you like to visit the fireplace?",
        originalReason: "fireplace_offer",
        offeredAtTurn: 1,
        expiresAtTurn: 4,
      },
      lastAssistantQuestion: "Would you like to visit the fireplace?",
      updatedAtTurn: 1,
    });

    const result = resolveCompanionTurn({
      userText: "yes",
      lastAssistantText: "Would you like to visit the fireplace?",
      currentTurn: 2,
    });

    expect(result.handled).toBe(true);
    expect(result.trace.finalResponseReason).toBe("pending_estate_navigate");
    expect(result.decision?.immediateEstatePlaceNavigate?.placeId).toBe(
      "observatory-fireplace",
    );
    expect(result.decision?.category).not.toBe("universal_creation");
  });

  it("D — that would be great executes pending action", () => {
    writeCompanionConversationState({
      pendingAction: {
        type: "estate_navigate",
        placeId: "house-possibility-outside",
        locationId: "house-possibility-outside",
        priorAssistantQuestion: "Would you like to go there?",
        originalReason: "location_offer",
        offeredAtTurn: 1,
        expiresAtTurn: 4,
      },
      updatedAtTurn: 1,
    });

    expect(isAffirmativeReply("that would be great")).toBe(true);

    const result = resolveCompanionTurn({
      userText: "that would be great",
      lastAssistantText: "Would you like to go there?",
      currentTurn: 2,
    });

    expect(result.handled).toBe(true);
    expect(result.decision?.immediateEstatePlaceNavigate).toBeDefined();
  });

  it("E — Kinsey emotional pivot avoids KB repeat", () => {
    writeCompanionConversationState({
      lastDiscussedEntity: {
        kind: "object",
        id: "kinsey",
        displayName: "Kinsey",
        answeredAtTurn: 1,
      },
      lastKnowledgeAnswerType: "factual_kb",
      updatedAtTurn: 1,
    });

    const sweet = resolveCompanionTurn({
      userText: "she seems like a sweet dog",
      currentTurn: 2,
    });
    expect(sweet.handled).toBe(true);
    expect(sweet.decision?.localReply).toMatch(/gentle|stirring|mind/i);
    expect(sweet.decision?.localReply).not.toMatch(/falls asleep on whichever sofa/i);

    const grief = resolveCompanionTurn({
      userText: "I had a dog like Kinsey and I miss her",
      currentTurn: 3,
    });
    expect(grief.handled).toBe(true);
    expect(grief.decision?.localReply).toMatch(/special|hear about her/i);
    expect(grief.decision?.localReply).not.toMatch(/Mr\. Ashford|sofa/i);
  });

  it("F — Discovery Chest appreciation is conversational", () => {
    writeCompanionConversationState({
      lastDiscussedEntity: {
        kind: "object",
        id: "discovery-chest",
        displayName: "Discovery Chest",
        answeredAtTurn: 1,
      },
      lastKnowledgeAnswerType: "factual_kb",
      updatedAtTurn: 1,
    });

    const result = resolveCompanionTurn({
      userText: "that sounds fun",
      currentTurn: 2,
    });

    expect(result.handled).toBe(true);
    expect(result.trace.emotionalPivotDetected).toBe(true);
    expect(result.decision?.localReply).toMatch(/curiosity|discover/i);
    expect(result.decision?.localReply).not.toMatch(/opened with permission/i);
  });

  it("G — telescope resolves to parent location navigation", () => {
    const userText = "take me to the telescope";
    const result = resolveCompanionTurn({ userText, currentTurn: 1 });

    expect(result.handled).toBe(true);
    expect(result.trace.finalResponseReason).toBe("object_to_location_navigate");
    expect(result.decision?.immediateEstatePlaceNavigate?.placeId).toBeTruthy();
    expect(result.decision?.localReply).toMatch(/telescope|Possibility House/i);
  });

  it("H — open reminders is feature open not navigation", () => {
    const userText = "open reminders";
    const pipeline = runConversationRoutingPipeline({ userText }, stubRouting);
    expect(pipeline.arbitration.goal).not.toBe("explicit_navigation");

    const contextResult = resolveCompanionTurn({ userText, currentTurn: 1 }, stubRouting);
    expect(contextResult.handled).toBe(false);

    const decision = resolveFrictionlessAction({ userText, currentTurn: 1 });
    expect(decision.immediateEstatePlaceNavigate).toBeUndefined();
  });

  it("I — research pricing wins over room suggestion", () => {
    const userText = "research pricing for a music library";
    const pipeline = runConversationRoutingPipeline({ userText }, stubRouting);
    expect(pipeline.arbitration.goal).toBe("research");
    expect(pipeline.winningCapability).toBe("research");

    const contextResult = resolveCompanionTurn({ userText, currentTurn: 1 }, stubRouting);
    expect(contextResult.handled).toBe(false);
  });

  it("J — compound overwhelm + proposal offers one choice", () => {
    const result = resolveCompanionTurn({
      userText: "I'm overwhelmed and I need to finish a proposal today",
      currentTurn: 1,
    });

    expect(result.handled).toBe(true);
    expect(result.trace.finalResponseReason).toBe("compound_overwhelm_task");
    expect(result.decision?.localReply).toMatch(/clear your mind/i);
    expect(result.decision?.localReply).toMatch(/proposal/i);
  });
});

describe("detectEmotionalPivot", () => {
  it("returns null for new knowledge questions", () => {
    const pivot = detectEmotionalPivot({
      userText: "who is Kinsey?",
      state: {
        lastDiscussedEntity: {
          kind: "object",
          id: "kinsey",
          displayName: "Kinsey",
          answeredAtTurn: 1,
        },
        lastKnowledgeAnswerType: "factual_kb",
      } as never,
      currentTurn: 2,
    });
    expect(pivot).toBeNull();
  });
});

describe("isLocationHereQuery", () => {
  it("detects in-room area questions", () => {
    expect(isLocationHereQuery("what are all the places in the possibility house")).toBe(
      true,
    );
    expect(isLocationHereQuery("what is here?")).toBe(true);
  });
});
