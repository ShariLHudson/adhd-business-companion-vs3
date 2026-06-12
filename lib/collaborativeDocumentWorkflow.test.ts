import { describe, expect, it } from "vitest";
import {
  DOCUMENT_CREATION_WORKFLOW,
  documentTypeConfirmationMessage,
  extractDocumentTopic,
  inferDocumentTypeFromRequest,
  isDocumentCreationRequest,
  itemTypeForCollaborativeKind,
  needsDocumentTypeConfirmation,
  parseDocumentTypeChoice,
  titleForCollaborativeDocument,
} from "./collaborativeDocumentWorkflow";
import { isTaskDump, shouldStayInConversation } from "./conversationGating";

describe("collaborativeDocumentWorkflow", () => {
  it("loads document-creation-workflow.json config", () => {
    expect(DOCUMENT_CREATION_WORKFLOW.version).toBe("2.0");
    expect(DOCUMENT_CREATION_WORKFLOW.intentDetection).toBeDefined();
    expect(DOCUMENT_CREATION_WORKFLOW.tests.length).toBeGreaterThan(10);
  });

  it("detects document creation intents", () => {
    expect(isDocumentCreationRequest("I want to create a document for my recipe")).toBe(
      true,
    );
    expect(isDocumentCreationRequest("make a spreadsheet for Q2")).toBe(true);
    expect(isDocumentCreationRequest("Write a SOP")).toBe(true);
    expect(isDocumentCreationRequest("Write a proposal")).toBe(true);
    expect(isDocumentCreationRequest("Write a client intake form")).toBe(true);
    expect(isDocumentCreationRequest("what should I eat today")).toBe(false);
  });

  it("infers type when explicit", () => {
    expect(inferDocumentTypeFromRequest("make a spreadsheet")).toBe("sheet");
    expect(inferDocumentTypeFromRequest("build a client intake form")).toBe("form");
    expect(inferDocumentTypeFromRequest("write an SOP")).toBe("doc");
    expect(inferDocumentTypeFromRequest("write a proposal")).toBe("doc");
  });

  it("asks for confirmation when type is ambiguous", () => {
    expect(needsDocumentTypeConfirmation("create a document for my recipe")).toBe(
      true,
    );
    expect(needsDocumentTypeConfirmation("make a spreadsheet for sales")).toBe(
      false,
    );
    expect(needsDocumentTypeConfirmation("Write a SOP")).toBe(false);
    expect(documentTypeConfirmationMessage("my recipe")).toContain("Google Doc");
  });

  it("parses type choice replies", () => {
    expect(parseDocumentTypeChoice("Google Doc")).toBe("doc");
    expect(parseDocumentTypeChoice("2")).toBe("sheet");
    expect(parseDocumentTypeChoice("form please")).toBe("form");
  });

  it("extracts topic and maps collaborative kinds", () => {
    expect(extractDocumentTopic("create a document for my recipe")).toBe(
      "my recipe",
    );
    expect(itemTypeForCollaborativeKind("sheet")).toBe("content calendar");
    expect(itemTypeForCollaborativeKind("form")).toBe("questionnaire");
    expect(itemTypeForCollaborativeKind("doc", undefined, "Write a SOP")).toBe(
      "SOP",
    );
  });

  it("never uses raw chat sentence as title", () => {
    const chat =
      "I want to write a really long SOP about ElevenLabs voice settings";
    const title = titleForCollaborativeDocument(chat, undefined, "SOP");
    expect(title).not.toBe(chat);
    expect(title).toBe("New SOP");
  });

  it("blocks auto-open Create on task dumps", () => {
    const dump = "Write 3 emails, make 4 calls, and draft a proposal";
    expect(isTaskDump(dump)).toBe(true);
    expect(shouldStayInConversation(dump)).toBe(true);
  });
});
