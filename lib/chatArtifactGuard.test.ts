import { describe, expect, it } from "vitest";
import {
  shouldHandoffChatArtifactToWorkspace,
  shouldSyncChatArtifactToCreate,
} from "./chatArtifactGuard";
import { resolveCurrentArtifact } from "./createInitialization";
import { shouldBlockArtifactPipeline } from "./messageClassification";

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

const FB_BRAINSTORM_USER =
  "I need some ideas to create a FB social media post but I don't have any ideas.";

const FB_BRAINSTORM_ASSISTANT = `Here are a few angles for your Facebook post:

1. **Share a client win** — a short story about a result you helped someone get.
2. **Behind the scenes** — what your workday actually looks like.
3. **Tip of the week** — one actionable ADHD-friendly business tip.
4. **Question post** — ask your audience what they're struggling with.
5. **Story hook** — start with "I used to think…" and flip to what changed.

Which angle feels most like you right now?`;

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
      shouldSyncChatArtifactToCreate(
        SAMPLE_DRAFT,
        "Here is more detail for the ElevenLabs SOP steps section.",
        true,
      ),
    ).toBe(true);
    expect(
      shouldSyncChatArtifactToCreate(SAMPLE_DRAFT, "Thanks!", true),
    ).toBe(false);
    expect(shouldSyncChatArtifactToCreate(SAMPLE_DRAFT, "yes", true)).toBe(
      false,
    );
    expect(
      shouldSyncChatArtifactToCreate(
        SAMPLE_DRAFT,
        "yes",
        true,
        "Would you like me to apply this to the draft?",
      ),
    ).toBe(true);
  });

  it("Facebook post brainstorming — no handoff, no sync, no artifact resolve", () => {
    expect(shouldBlockArtifactPipeline(FB_BRAINSTORM_USER)).toBe(true);
    expect(
      shouldHandoffChatArtifactToWorkspace(
        FB_BRAINSTORM_ASSISTANT,
        FB_BRAINSTORM_USER,
      ),
    ).toBe(false);
    expect(
      shouldSyncChatArtifactToCreate(
        FB_BRAINSTORM_ASSISTANT,
        FB_BRAINSTORM_USER,
        true,
      ),
    ).toBe(false);

    const resolved = resolveCurrentArtifact({
      userText: FB_BRAINSTORM_USER,
      messages: [
        { role: "user", content: FB_BRAINSTORM_USER },
        { role: "assistant", content: FB_BRAINSTORM_ASSISTANT },
      ],
      creationContext: null,
      lastActivity: null,
      storedSession: null,
    });
    expect(resolved).toBeNull();
  });

  it("explicit draft follow-up allows handoff", () => {
    expect(
      shouldHandoffChatArtifactToWorkspace(
        FB_BRAINSTORM_ASSISTANT,
        "Draft the Facebook post using angle 2",
      ),
    ).toBe(true);
    expect(shouldBlockArtifactPipeline("Draft the Facebook post")).toBe(false);
    expect(shouldBlockArtifactPipeline("write it")).toBe(false);
    expect(shouldBlockArtifactPipeline("create the post")).toBe(false);
    expect(shouldBlockArtifactPipeline("generate the post")).toBe(false);
    expect(shouldBlockArtifactPipeline("draft one")).toBe(false);
  });
});
