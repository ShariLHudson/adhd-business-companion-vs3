import { describe, expect, it } from "vitest";
import {
  blankScaffoldForType,
  collaborativeScaffoldForType,
  extractArtifactFromChat,
  extractTitleFromArtifact,
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

  it("does not use stored session without explicit resume", () => {
    const resolved = resolveCurrentArtifact({
      userText: "create a google doc",
      messages: SOP_CHAT,
      creationContext: null,
      lastActivity: null,
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
      allowStoredSession: false,
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
});
