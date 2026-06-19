import { describe, expect, it, beforeEach } from "vitest";
import {
  appendDraftReviewMessage,
  applyReviewSuggestionToDraft,
  buildDraftReviewContext,
  buildDraftReviewSystemPrompt,
  buildDraftReviewUserPayload,
  canAskDraftReview,
  clearDraftReviewSessionsForTests,
  DRAFT_REVIEW_QUICK_PROMPTS,
  loadDraftReviewSession,
  parseDraftReviewResponse,
  receiptForReviewAction,
  suggestionButtonsFor,
  summarizeSourceConversation,
  type DraftReviewSuggestion,
} from "./createDraftReview";

const SAMPLE_DRAFT = `# Welcome Guide\n\nStep one: say hello.\nStep two: explain the product.`;

describe("createDraftReview", () => {
  beforeEach(() => {
    clearDraftReviewSessionsForTests();
  });

  it("1. user can ask a question about a draft", () => {
    expect(canAskDraftReview(SAMPLE_DRAFT)).toBe(true);
    const payload = buildDraftReviewUserPayload("Is this good enough?", []);
    expect(payload).toBe("Is this good enough?");
    const withHistory = buildDraftReviewUserPayload("What is missing?", [
      {
        id: "1",
        role: "user",
        content: "Is this too long?",
      },
      {
        id: "2",
        role: "assistant",
        content: "A bit — trim the intro.",
      },
    ]);
    expect(withHistory).toMatch(/Is this too long/);
    expect(withHistory).toMatch(/What is missing/);
  });

  it("2. Shari receives draft title, type, and content", () => {
    const ctx = buildDraftReviewContext({
      sessionId: "sess-1",
      draftTitle: "Onboarding SOP",
      draftType: "SOP",
      draftContent: SAMPLE_DRAFT,
      projectName: "Client Launch",
    });
    const system = buildDraftReviewSystemPrompt(ctx);
    expect(system).toMatch(/Onboarding SOP/);
    expect(system).toMatch(/SOP/);
    expect(system).toMatch(/Welcome Guide/);
    expect(system).toMatch(/Client Launch/);
    expect(system).toMatch(/REVIEW ONLY/);
  });

  it("3. asking a question does not modify draft", () => {
    const draft = SAMPLE_DRAFT;
    parseDraftReviewResponse(
      JSON.stringify({
        answer: "This is solid but missing a CTA.",
        suggestion: {
          summary: "Add a CTA",
          proposedText: "Next: book a call.",
          actionKind: "append",
        },
      }),
    );
    expect(draft).toBe(SAMPLE_DRAFT);
  });

  it("4. quick prompt asks review question without editing", () => {
    for (const prompt of DRAFT_REVIEW_QUICK_PROMPTS) {
      expect(prompt.question).toMatch(/\?$/);
      expect(prompt.label.toLowerCase()).not.toMatch(/update draft|regenerate/);
    }
  });

  it("5. suggested change requires user approval", () => {
    const suggestion: DraftReviewSuggestion = {
      summary: "Add a checklist",
      proposedText: "- [ ] Step 1",
      actionKind: "append",
    };
    const buttons = suggestionButtonsFor(suggestion);
    expect(buttons.some((b) => b.action === "dismiss")).toBe(true);
    expect(buttons.some((b) => b.label === "Leave draft as-is")).toBe(true);
  });

  it("6. applying suggestion updates draft", () => {
    const suggestion: DraftReviewSuggestion = {
      summary: "Add closing CTA",
      proposedText: "Ready to start?",
      actionKind: "append",
    };
    const next = applyReviewSuggestionToDraft(SAMPLE_DRAFT, suggestion, "append");
    expect(next).toContain(SAMPLE_DRAFT);
    expect(next).toContain("Ready to start?");
    expect(receiptForReviewAction("append")).toBe("I updated the draft.");
  });

  it("7. leaving suggestion alone keeps draft unchanged", () => {
    const draft = SAMPLE_DRAFT;
    const receipt = receiptForReviewAction("dismiss");
    expect(draft).toBe(SAMPLE_DRAFT);
    expect(receipt).toBe("Your draft is unchanged.");
  });

  it("8. draft review context remains tied to draft session", () => {
    appendDraftReviewMessage("sess-abc", {
      id: "m1",
      role: "user",
      content: "Is this clear?",
    });
    const loaded = loadDraftReviewSession("sess-abc");
    expect(loaded?.messages).toHaveLength(1);
    expect(loaded?.sessionId).toBe("sess-abc");
  });

  it("9. no blank Create draft is opened from review chat", () => {
    expect(canAskDraftReview("")).toBe(false);
    expect(canAskDraftReview("   ")).toBe(false);
    expect(canAskDraftReview(SAMPLE_DRAFT)).toBe(true);
  });

  it("summarizes source conversation for context", () => {
    const summary = summarizeSourceConversation([
      { role: "user", content: "We need an onboarding SOP" },
      { role: "assistant", content: "Tell me the audience." },
      { role: "user", content: "New clients who feel overwhelmed" },
    ]);
    expect(summary).toMatch(/onboarding SOP/);
    expect(summary).toMatch(/overwhelmed/);
  });
});
