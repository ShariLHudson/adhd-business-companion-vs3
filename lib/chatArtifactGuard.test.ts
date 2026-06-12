import { describe, expect, it } from "vitest";
import {
  shouldHandoffChatArtifactToWorkspace,
  shouldSyncChatArtifactToCreate,
} from "./chatArtifactGuard";

const SAMPLE_DRAFT = `# ElevenLabs SOP

## Purpose
Standardize voice production.

## Steps
1. Draft script
2. Generate voice
3. Export and edit
4. Review and publish

## Checklist
- Script approved
- Audio exported
`;

describe("chatArtifactGuard", () => {
  it("hands off to workspace when create is not open", () => {
    expect(
      shouldHandoffChatArtifactToWorkspace(SAMPLE_DRAFT, "Write an SOP for me"),
    ).toBe(true);
  });

  it("syncs revisions into open Create", () => {
    expect(
      shouldSyncChatArtifactToCreate(
        SAMPLE_DRAFT,
        "Revise the draft and add a troubleshooting section",
        true,
      ),
    ).toBe(true);
    expect(
      shouldSyncChatArtifactToCreate(
        SAMPLE_DRAFT,
        "Apply that to the draft",
        true,
      ),
    ).toBe(true);
    expect(
      shouldSyncChatArtifactToCreate(SAMPLE_DRAFT, "Thanks!", true),
    ).toBe(false);
    expect(shouldSyncChatArtifactToCreate(SAMPLE_DRAFT, "yes", true)).toBe(
      true,
    );
  });
});
