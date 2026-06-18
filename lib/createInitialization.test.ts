import { describe, expect, it } from "vitest";
import {
  blankScaffoldForType,
  collaborativeScaffoldForType,
  extractArtifactFromChat,
  extractTitleFromArtifact,
  inferArtifactTypeFromConversation,
  isExplicitCreateResumeRequest,
  isExportArtifactRequest,
  resolveCurrentArtifact,
} from "./createInitialization";

const SOP_CHAT = [
  {
    role: "user" as const,
    content: "Help me write an SOP for our ElevenLabs video process.",
  },
  {
    role: "assistant" as const,
    content: `# ElevenLabs Video Process

## Purpose
Standardize how we produce short videos with ElevenLabs.

## Steps
1. Draft script in a doc
2. Generate voice in ElevenLabs
3. Export audio and import to editor
4. Add visuals and captions
5. Review and publish

## Checklist
- Script approved
- Voice generated
- Final export uploaded`,
  },
];

describe("createInitialization", () => {
  it("extracts SOP content from recent chat", () => {
    const artifact = extractArtifactFromChat(SOP_CHAT);
    expect(artifact?.itemType).toBe("SOP");
    expect(artifact?.title).toContain("ElevenLabs");
    expect(artifact?.draftContent).toContain("Generate voice");
  });

  it("resolves chat artifact for export-this requests", () => {
    const resolved = resolveCurrentArtifact({
      userText:
        "All I need for this is to create a Google Doc and then print it.",
      messages: SOP_CHAT,
      creationContext: null,
      lastActivity: null,
      storedSession: null,
      allowStoredSession: false,
    });
    expect(resolved?.source).toBe("chat");
    expect(resolved?.draftContent).toContain("ElevenLabs");
  });

  it("does not use stored session or last activity without explicit resume", () => {
    const resolved = resolveCurrentArtifact({
      userText: "create a google doc",
      messages: SOP_CHAT,
      creationContext: null,
      lastActivity: {
        kind: "draft",
        title: "Old post",
        contentType: "Post",
        content: "Simple Steps to Attract More Clients\n\nStep one...",
        ts: new Date().toISOString(),
      },
      storedSession: {
        genSeed: {
          type: "Post",
          draft: "Simple Steps to Attract More Clients\n\nStep one...",
        },
        creationContext: {
          section: "content-generator",
          itemType: "Post",
          title: "Old post",
          draftContent: "Simple Steps to Attract More Clients\n\nStep one...",
          brief: "",
          stage: "editing draft",
          artifactTypeLocked: false,
        },
        workspaceDetail: null,
        updatedAt: new Date().toISOString(),
      },
      allowResumeFromMemory: false,
    });
    expect(resolved?.draftContent).toContain("ElevenLabs");
    expect(resolved?.draftContent).not.toContain("Attract More Clients");
  });

  it("opens blank proposal scaffold for new proposal requests", () => {
    const resolved = resolveCurrentArtifact({
      userText: "I need a proposal for a new client.",
      messages: [],
      creationContext: null,
      lastActivity: null,
      storedSession: null,
      allowStoredSession: false,
    });
    expect(resolved?.itemType).toBe("Proposal");
    expect(resolved?.source).toBe("blank");
    expect(resolved?.draftContent).toContain("Prepared For");
    expect(blankScaffoldForType("Proposal")).toContain("Investment");
  });

  it("brainstorming FB post — does not resolve chat artifact or blank Facebook Post", () => {
    const userText =
      "I need some ideas to create a FB social media post but I don't have any ideas.";
    const assistantText = `1. **Client win** — share a quick result.
2. **Behind the scenes** — show your process.
3. **Tip** — one actionable idea.
4. **Question** — ask what they need.
5. **Story** — before and after.`;
    const resolved = resolveCurrentArtifact({
      userText,
      messages: [
        { role: "user", content: userText },
        { role: "assistant", content: assistantText },
      ],
      creationContext: null,
      lastActivity: null,
      storedSession: null,
    });
    expect(resolved).toBeNull();
  });

  it("builds default collaborative scaffold with title overview sections", () => {
    const scaffold = collaborativeScaffoldForType("document", "My recipe");
    expect(scaffold).toContain("My recipe");
    expect(scaffold).toContain("Overview");
    expect(scaffold).toContain("Sections");
    const sop = collaborativeScaffoldForType("SOP", "ElevenLabs");
    expect(sop).toContain("ElevenLabs");
    expect(sop).toContain("Purpose");
  });

  it("detects export and resume phrases", () => {
    expect(
      isExportArtifactRequest(
        "All I need is to create a Google Doc and print it.",
      ),
    ).toBe(true);
    expect(isExplicitCreateResumeRequest("continue my proposal")).toBe(true);
    expect(isExplicitCreateResumeRequest("create a google doc")).toBe(false);
  });

  it("rejects conversational meta lines as artifact titles", () => {
    const content = `Perfect! Here's a suggested title and some questions we can include:

**Questions:**
1. How would you rate your overall experience?
2. What features do you find most helpful?`;
    expect(extractTitleFromArtifact(content, "questionnaire")).toBe(
      "New questionnaire",
    );
  });

  it("preserves Facebook platform — does not default generic post to LinkedIn", () => {
    const text =
      "I need some ideas to create a FB social media post but I don't have any ideas.";
    expect(inferArtifactTypeFromConversation(text)).toBe("Facebook Post");
    expect(inferArtifactTypeFromConversation(text)).not.toBe("LinkedIn Post");
  });
});
