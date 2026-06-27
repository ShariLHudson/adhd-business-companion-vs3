import { describe, expect, it } from "vitest";
import {
  createConversationCommitment,
  inferCommitmentFromAssistant,
  resolveConversationCommitment,
  commitmentAllowsArtifactExport,
  COMMITMENT_DECLINE_MESSAGES,
  COMMITMENT_CLARIFY_MESSAGE,
  DUPLICATE_COMMITMENT_MESSAGE,
} from "./index";
import { resolveCompanionAcceptanceTurn } from "../companionIntelligenceRouter";
import { isForbiddenResetMessage } from "../companionDecisionIntelligence/acceptedIntentLock";

function commitmentFrom(assistant: string, turn = 2) {
  return createConversationCommitment(assistant, turn)!;
}

describe("Conversation Commitment Engine", () => {
  describe("inferCommitmentFromAssistant", () => {
    it("detects choose one small task invitation", () => {
      const q = "Would you like to choose one small task to focus on right now?";
      expect(inferCommitmentFromAssistant(q)?.type).toBe("choose_small_task");
    });

    it("detects open My Thoughts invitation", () => {
      const q = "Want to open My Thoughts and pick from there?";
      expect(inferCommitmentFromAssistant(q)?.type).toBe("open_workspace");
      expect(inferCommitmentFromAssistant(q)?.workspaceId).toBe("brain-dump");
    });

    it("detects research invitation", () => {
      const q = "Would you like me to research that for you?";
      expect(inferCommitmentFromAssistant(q)?.type).toBe("research_topic");
    });

    it("detects Pinterest learning invitation", () => {
      const q =
        "Would you like to explore what types of images work best for Pinterest?";
      expect(inferCommitmentFromAssistant(q)?.type).toBe(
        "continue_learning_topic",
      );
    });

    it("detects create SOP invitation", () => {
      const q = "Would you like me to create that SOP for you?";
      expect(inferCommitmentFromAssistant(q)?.type).toBe("create_artifact");
      expect(inferCommitmentFromAssistant(q)?.artifactType).toMatch(/sop/i);
    });

    it("detects save/export invitation", () => {
      expect(
        inferCommitmentFromAssistant("Would you like to save this?")?.type,
      ).toBe("save_artifact");
      expect(
        inferCommitmentFromAssistant("Ready to export this to Google Docs?")
          ?.type,
      ).toBe("export_artifact");
    });
  });

  describe("yes resolution", () => {
    it("1. yes after choose one small task — no echo of prior text", () => {
      const assistant =
        "Would you like to choose one small task to focus on right now?";
      const commitment = commitmentFrom(assistant);
      const result = resolveConversationCommitment({
        userText: "yes",
        commitment,
        currentTurn: 3,
        outcomeThread: {
          currentProblem: "Picking up its only 9:30 am",
          updatedAt: new Date().toISOString(),
        },
      });
      expect(result.outcome).toBe("affirm");
      if (result.outcome === "affirm") {
        expect(result.continuation.action).toBe("reply");
        if (result.continuation.action === "reply") {
          expect(result.continuation.message).toMatch(/one thing/i);
          expect(result.continuation.message).not.toMatch(/9:30/i);
          expect(result.continuation.message).not.toMatch(/Picking up/i);
        }
      }
    });

    it("2. yes after open My Thoughts — beside chat", () => {
      const assistant = "Want to open My Thoughts and pick from there?";
      const commitment = commitmentFrom(assistant);
      const result = resolveConversationCommitment({
        userText: "yes",
        commitment,
        currentTurn: 3,
      });
      expect(result.outcome).toBe("affirm");
      if (result.outcome === "affirm" && result.continuation.action === "open_section") {
        expect(result.continuation.section).toBe("brain-dump");
        expect(result.continuation.message).not.toMatch(/is open beside us/i);
        expect(result.continuation.message).toMatch(/still here|doable/i);
        expect(result.continuation.clearMyMindView).toBe("my-thoughts");
      }
    });

    it("3. yes after research this — stays in chat", () => {
      const assistant = "Would you like me to research the latest Pinterest trends?";
      const commitment = commitmentFrom(assistant);
      const result = resolveConversationCommitment({
        userText: "yeah",
        commitment,
        currentTurn: 3,
      });
      expect(result.outcome).toBe("affirm");
      if (result.outcome === "affirm" && result.continuation.action === "reply") {
        expect(result.continuation.message).toMatch(/research/i);
        expect(result.continuation.message).not.toMatch(/Documents/i);
      }
    });

    it("4. yes after explore Pinterest image ideas — educational, not export", () => {
      const assistant =
        "Would you like to explore what types of images work best for Pinterest?";
      const commitment = commitmentFrom(assistant);
      const result = resolveConversationCommitment({
        userText: "sure",
        commitment,
        currentTurn: 3,
      });
      expect(result.outcome).toBe("affirm");
      if (result.outcome === "affirm" && result.continuation.action === "reply") {
        expect(result.continuation.message).toMatch(/Pinterest/i);
        expect(result.continuation.message).not.toMatch(/export/i);
      }
      expect(commitmentAllowsArtifactExport(commitment)).toBe(false);
    });

    it("5. yes after create SOP", () => {
      const assistant = "Would you like me to create that SOP?";
      const commitment = commitmentFrom(assistant);
      const result = resolveConversationCommitment({
        userText: "go ahead",
        commitment,
        currentTurn: 3,
      });
      expect(result.outcome).toBe("affirm_create");
      if (result.outcome === "affirm_create") {
        expect(result.artifactType).toMatch(/sop/i);
        expect(result.message).toMatch(/still here|shape your/i);
        expect(result.message).not.toMatch(/is open beside us/i);
      }
    });

    it("6. yes after save/export — only with real draft", () => {
      const assistant = "Would you like to save this?";
      const commitment = commitmentFrom(assistant);
      const withoutDraft = resolveConversationCommitment({
        userText: "yes",
        commitment,
        currentTurn: 3,
        hasRealArtifactDraft: false,
      });
      expect(withoutDraft.outcome).toBe("affirm");
      if (withoutDraft.outcome === "affirm" && withoutDraft.continuation.action === "reply") {
        expect(withoutDraft.continuation.message).toMatch(/don't have a finished draft/i);
      }

      const withDraft = resolveConversationCommitment({
        userText: "yes",
        commitment: commitmentFrom(assistant),
        currentTurn: 3,
        hasRealArtifactDraft: true,
      });
      expect(withDraft.outcome).toBe("affirm_export");
      expect(commitmentAllowsArtifactExport(commitment)).toBe(true);
    });
  });

  describe("no resolution", () => {
    const types = [
      "Would you like to choose one small task?",
      "Want to open My Thoughts and pick from there?",
      "Would you like me to research that?",
      "Would you like to explore Pinterest image ideas?",
      "Would you like me to create that SOP?",
      "Would you like to save this?",
    ];

    it.each(types)("7. no after invitation: %s", (assistant) => {
      const commitment = commitmentFrom(assistant);
      const result = resolveConversationCommitment({
        userText: "no thanks",
        commitment,
        currentTurn: 3,
      });
      expect(result.outcome).toBe("decline");
      if (result.outcome === "decline") {
        expect(COMMITMENT_DECLINE_MESSAGES).toContain(result.message);
        expect(result.consumed.consumed).toBe(true);
      }
    });
  });

  describe("edge cases", () => {
    it("8. duplicate yes after pending consumed", () => {
      const assistant = "Would you like to choose one small task?";
      const consumed = { ...commitmentFrom(assistant), consumed: true as const };
      const result = resolveConversationCommitment({
        userText: "yes",
        commitment: consumed,
        lastConsumedId: consumed.id,
        currentTurn: 4,
      });
      expect(result.outcome).toBe("duplicate");
    });

    it("9. yes with no pending commitment", () => {
      const result = resolveConversationCommitment({
        userText: "yes",
        commitment: null,
        currentTurn: 3,
      });
      expect(result.outcome).toBe("no_pending");
    });

    it("10. educational answer does not trigger export commitment", () => {
      const assistant =
        "Would you like to explore what types of images work best for Pinterest?";
      const commitment = commitmentFrom(assistant);
      expect(commitmentAllowsArtifactExport(commitment)).toBe(false);
    });

    it("11. workspace opens beside chat when promised", () => {
      const assistant = "Would you like to open Plan My Day beside us?";
      const result = resolveConversationCommitment({
        userText: "yes",
        commitment: commitmentFrom(assistant),
        currentTurn: 3,
      });
      expect(result.outcome).toBe("affirm");
      if (result.outcome === "affirm" && result.continuation.action === "open_section") {
        expect(result.continuation.section).toBe("plan-my-day");
        expect(result.continuation.message).not.toMatch(/is open beside us/i);
        expect(result.continuation.message).toMatch(/today|lighter|still here/i);
      }
    });

    it("12. no echo of original user text via router integration", () => {
      const assistant =
        "Would you like to walk through this together and compare your options?";
      const commitment = commitmentFrom(assistant, 4);
      const turn = resolveCompanionAcceptanceTurn({
        userText: "yes",
        lastAssistantText: assistant,
        currentTurn: 5,
        workflow: null,
        commitment,
        pendingInput: {
          workspacePanel: null,
          record: null,
          pendingAction: null,
          createConsent: null,
        },
        outcomeThread: {
          currentProblem: "adding a new product line at 9:30",
          updatedAt: new Date().toISOString(),
        },
      });
      expect(turn.kind).toBe("commitment");
      if (turn.kind === "commitment" && turn.resolution.outcome === "affirm") {
        const msg =
          turn.resolution.continuation.action === "reply"
            ? turn.resolution.continuation.message
            : "";
        expect(msg).not.toMatch(/9:30/i);
        expect(msg).not.toMatch(/Picking up/i);
        expect(isForbiddenResetMessage(msg)).toBe(false);
      }
    });

    it("clarifies when yes has no pending commitment via router", () => {
      const turn = resolveCompanionAcceptanceTurn({
        userText: "yes",
        lastAssistantText: "Here are three ideas for your newsletter.",
        currentTurn: 3,
        workflow: null,
        commitment: null,
        pendingInput: {
          workspacePanel: null,
          record: null,
          pendingAction: null,
          createConsent: null,
        },
      });
      expect(turn.kind === "pending" || turn.kind === "commitment").toBe(true);
      if (turn.kind === "pending") {
        expect(turn.result.outcome).toBe("conversation");
      }
    });
  });

  describe("affirmation variants", () => {
    it.each(["that would help", "sounds good", "let's do it", "please"])(
      "accepts %s",
      (reply) => {
        const assistant = "Would you like to choose one small task?";
        const result = resolveConversationCommitment({
          userText: reply,
          commitment: commitmentFrom(assistant),
          currentTurn: 3,
        });
        expect(result.outcome).toBe("affirm");
      },
    );
  });

  describe("constants", () => {
    it("exposes clarify and duplicate messages", () => {
      expect(COMMITMENT_CLARIFY_MESSAGE.length).toBeGreaterThan(10);
      expect(DUPLICATE_COMMITMENT_MESSAGE.length).toBeGreaterThan(10);
    });
  });
});
