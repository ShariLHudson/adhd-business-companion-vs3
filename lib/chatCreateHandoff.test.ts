import { describe, expect, it, beforeEach } from "vitest";
import {
  clearPendingChatArtifact,
  inferHandoffDestination,
  rememberChatArtifactFromAssistant,
  resolveChatHandoffArtifact,
  userAcceptedCreateHandoff,
} from "./chatCreateHandoff";
import { looksLikeEmailDraft } from "./createInitialization";

const EMAIL_DRAFT = `Subject: Follow-up on our workshop conversation

Hi Alex,

Thanks again for taking the time to chat yesterday. I wanted to follow up with the resources we discussed and confirm the next step on your calendar.

Would Thursday at 2pm work for a quick 20-minute call?

Best,
Shari`;

describe("chatCreateHandoff", () => {
  beforeEach(() => {
    clearPendingChatArtifact();
  });

  it("detects email drafts with a lower bar than full artifacts", () => {
    expect(looksLikeEmailDraft(EMAIL_DRAFT)).toBe(true);
  });

  it("routes email tool acceptance to email destination", () => {
    const dest = inferHandoffDestination(
      "Would you like me to create the draft in the email tool?",
      "yes",
    );
    expect(dest).toBe("email");
    expect(
      userAcceptedCreateHandoff(
        "yes",
        "Would you like me to create the draft in the email tool?",
      ),
    ).toBe(true);
  });

  it("does not treat doc numbered choice as email handoff", () => {
    expect(inferHandoffDestination("Reply 1 for Doc, 2 for Sheet, 3 for Form", "2")).toBe(
      null,
    );
  });

  it("resolves chat email content into a handoff artifact", () => {
    const messages = [
      { role: "user" as const, content: "Help me write a follow-up email to Alex." },
      { role: "assistant" as const, content: EMAIL_DRAFT },
      {
        role: "user" as const,
        content: "Yes, create the draft in the email tool",
      },
    ];
    const artifact = resolveChatHandoffArtifact(messages, {
      hintType: "Email",
      userText: "Yes, create the draft in the email tool",
      lastAssistantText: EMAIL_DRAFT,
    });
    expect(artifact?.itemType).toBe("Email");
    expect(artifact?.draftContent).toContain("Hi Alex");
    expect(artifact?.title).toBe("Email Draft");
  });

  it("uses remembered pending artifact when extraction is blocked", () => {
    rememberChatArtifactFromAssistant(
      EMAIL_DRAFT,
      "Help me write a follow-up email",
    );
    const artifact = resolveChatHandoffArtifact(
      [{ role: "user" as const, content: "yes" }],
      {
        hintType: "Email",
        userText: "yes",
        lastAssistantText:
          "Would you like me to create the draft in the email tool?",
      },
    );
    expect(artifact?.draftContent).toContain("Hi Alex");
  });
});
