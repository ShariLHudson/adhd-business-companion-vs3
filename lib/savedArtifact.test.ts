import { describe, expect, it } from "vitest";
import {
  buildGoogleDocRecoveryMessage,
  buildSavedArtifactRecoveryMessage,
  detectArtifactWorkspaceCommand,
  isSavedDocumentRecoveryRequest,
  recordAfterGoogleDoc,
  recordAfterSavedWorkSave,
} from "./savedArtifact";

describe("savedArtifact recovery", () => {
  const saved = recordAfterSavedWorkSave(
    null,
    "SOP",
    "ElevenLabs Video Process",
    "sw-1",
    "SOP content about ElevenLabs video creation",
  );

  it.each([
    "where is my saved document?",
    "where did it save?",
    "show my SOP",
    "show my proposal",
    "open my saved work",
  ])("detects saved document recovery: %s", (phrase) => {
    expect(isSavedDocumentRecoveryRequest(phrase)).toBe(true);
  });

  it("builds recovery message with Saved Work location", () => {
    const msg = buildSavedArtifactRecoveryMessage(saved, true);
    expect(msg).toContain("ElevenLabs Video Process");
    expect(msg).toContain("Saved Work");
    expect(msg).toContain("SOPs");
    expect(msg).toContain("Create Google Doc");
    expect(msg).toContain("not been added to a project yet");
  });

  it("detects google doc location vs create and add-to-project", () => {
    expect(detectArtifactWorkspaceCommand("where is my google doc")).toBe(
      "google-doc-location",
    );
    expect(detectArtifactWorkspaceCommand("create the google doc now")).toBe(
      "google-doc",
    );
    expect(detectArtifactWorkspaceCommand("print this")).toBe("print");
    expect(detectArtifactWorkspaceCommand("save it again")).toBe("save-again");
    expect(
      detectArtifactWorkspaceCommand("add this to my ADHD App project"),
    ).toBe("add-to-project");
  });

  it("builds google doc link when url exists", () => {
    const withDoc = recordAfterGoogleDoc(
      saved,
      "https://docs.google.com/document/d/abc/edit",
      "abc",
    );
    expect(buildGoogleDocRecoveryMessage(withDoc)).toContain(
      "https://docs.google.com/document/d/abc/edit",
    );
    expect(buildGoogleDocRecoveryMessage(saved)).toContain("No Google Doc yet");
  });
});
