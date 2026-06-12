import { describe, expect, it } from "vitest";
import {
  conflictsWithLockedArtifact,
  detectArtifactExportOffer,
  filterAssistedActionForArtifact,
  isProposalArtifact,
  normalizeArtifactType,
  shouldLockArtifactType,
} from "./artifactType";
import type { AssistedAction } from "./assistedActionBridge";
import type { CreationWorkspaceContext } from "./workspaceCreation";

const emailAction: AssistedAction = {
  id: "email",
  section: "content-generator",
  itemType: "Email",
  title: "Email",
  brief: "",
  offerLine: "email",
  helpMessage: "draft the email",
  openAck: "open",
  buttonLabel: "Help Me Draft It",
  emoji: "✉️",
};

describe("artifactType", () => {
  it("normalizes proposal variants", () => {
    expect(normalizeArtifactType("business proposal")).toBe("Proposal");
    expect(isProposalArtifact("Proposal")).toBe(true);
    expect(shouldLockArtifactType("Proposal")).toBe(true);
  });

  it("blocks email assisted action when proposal is locked", () => {
    expect(
      filterAssistedActionForArtifact(emailAction, "Proposal"),
    ).toBeNull();
    expect(
      conflictsWithLockedArtifact("Proposal", "Email"),
    ).toBe(true);
  });

  it("detects export offer when user agrees to save proposal", () => {
    const ctx: CreationWorkspaceContext = {
      section: "content-generator",
      itemType: "Proposal",
      title: "Client proposal",
      draftContent: "# Proposal\n\nHello",
      brief: "ACME",
      stage: "editing draft",
      artifactTypeLocked: true,
    };
    const offer = detectArtifactExportOffer("yes, save it", ctx);
    expect(offer?.artifactType).toBe("Proposal");
    expect(offer?.actions).toContain("google-doc");
    expect(offer?.actions).toContain("print");
  });
});
