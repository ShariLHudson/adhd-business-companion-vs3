import { describe, expect, it } from "vitest";
import {
  applyUserAnswerToSection,
  artifactFromWorkflow,
  createEmptyArtifact,
  markSectionUnsure,
} from "./artifactModel";
import { canOfferFinalizeActions } from "./finalizeGate";
import {
  buildWhatWeHaveSoFarSummary,
  isShowProgressRequest,
} from "./progressSummary";
import {
  applyArtifactRevisionCommand,
  parseArtifactRevisionCommand,
} from "./revisionCommands";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";

describe("Artifact State — what we have so far", () => {
  it("detects show progress request", () => {
    expect(isShowProgressRequest("show me what we have so far")).toBe(true);
    expect(isShowProgressRequest("write a newsletter")).toBe(false);
  });

  it("summarizes offer sections with status", () => {
    let artifact = createEmptyArtifact("Offer", [
      { id: "audience", label: "Audience" },
      { id: "problem", label: "Problem" },
      { id: "promise", label: "Promise" },
      { id: "price", label: "Price" },
    ]);
    artifact = applyUserAnswerToSection(
      artifact,
      "audience",
      "ADHD coaches who struggle with marketing.",
    );
    artifact = applyUserAnswerToSection(
      artifact,
      "promise",
      "A calm path to consistent marketing.",
    );
    artifact = markSectionUnsure(artifact, "promise");
    const summary = buildWhatWeHaveSoFarSummary(artifact);
    expect(summary).toContain("Here is what we have so far");
    expect(summary).toContain("Audience");
    expect(summary).toContain("ADHD coaches");
    expect(summary).toContain("Problem");
    expect(summary).toContain("Not started yet");
    expect(summary).toContain("Which part would you like to work on next");
    expect(summary).toContain("working draft");
  });

  it("blocks finalize actions until ready", () => {
    expect(canOfferFinalizeActions("working_draft")).toBe(false);
    expect(canOfferFinalizeActions("ready_to_finalize")).toBe(true);
  });

  it("syncs from workflow with user answers", () => {
    const workflow = initializeWorkspaceV2Workflow("Offer");
    workflow.sectionContent = {
      audience: "Coaches",
    };
    const artifact = artifactFromWorkflow(workflow, {
      facilitatedPhase: "workspace_active",
    });
    expect(artifact.status).toBe("working_draft");
    expect(artifact.sections.find((s) => s.id === "audience")?.status).toBe(
      "answered_by_user",
    );
  });

  it("parses skip and change section commands", () => {
    const artifact = createEmptyArtifact("Offer", [
      { id: "price", label: "Price" },
    ]);
    const skip = parseArtifactRevisionCommand("skip pricing for now", artifact);
    expect(skip.kind).toBe("skip_section");
    const change = parseArtifactRevisionCommand("change the audience", {
      ...artifact,
      sections: [
        ...artifact.sections,
        {
          id: "audience",
          label: "Audience",
          status: "answered_by_user",
          content: "Coaches",
          primarySource: "user",
          skipped: false,
          unsure: false,
          activeRevisionId: null,
        },
      ],
    });
    expect(change.kind).toBe("change_section");
  });

  it("applies skip section revision", () => {
    const artifact = createEmptyArtifact("Offer", [
      { id: "price", label: "Price" },
    ]);
    const cmd = parseArtifactRevisionCommand("skip pricing for now", artifact);
    const result = applyArtifactRevisionCommand(artifact, cmd);
    expect(result?.artifact.sections[0]?.skipped).toBe(true);
  });
});
