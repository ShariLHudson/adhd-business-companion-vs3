/**
 * Permanent QA — information vs creation routing.
 * The companion must distinguish "does the user want information, or something created?"
 */

import { describe, expect, it } from "vitest";

import { resolveCurrentArtifact } from "./createInitialization";
import { bridgeFromResolved, resolveIntent } from "./intentStabilizer";
import {
  isExplicitCreationRequest,
  shouldAutoOpenWorkspaceBeforeChat,
  shouldBlockArtifactPipeline,
  shouldSuppressCreatePending,
} from "./messageClassification";
import { shouldAutoRouteAssetRequest } from "./workspaceAssetRouting";
import {
  classifyCompanionIntentBucket,
  isInformationIntent,
  shouldOpenCreateWorkspace,
} from "./companionIntentRouting";

describe("Companion intent routing — chat-only (information)", () => {
  const cases: { text: string; bucket: ReturnType<typeof classifyCompanionIntentBucket> }[] =
    [
      {
        text: "What does research say about ADHD and procrastination?",
        bucket: "research",
      },
      {
        text: "How do sales funnels work?",
        bucket: "learning",
      },
      {
        text: "Which pricing model would work best for my ADHD app?",
        bucket: "advice",
      },
      {
        text: "Give me 20 lead magnet ideas.",
        bucket: "brainstorming",
      },
      {
        text: "Give me 20 Facebook post ideas.",
        bucket: "brainstorming",
      },
      {
        text: "What does research say about women with ADHD and perfectionism?",
        bucket: "research",
      },
    ];

  it.each(cases)("$bucket — $text", ({ text, bucket }) => {
    expect(classifyCompanionIntentBucket(text)).toBe(bucket);
    expect(isInformationIntent(text)).toBe(true);
    expect(shouldOpenCreateWorkspace(text)).toBe(false);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(shouldBlockArtifactPipeline(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(shouldAutoRouteAssetRequest(text)).toBe(false);
    expect(resolveIntent(text).action).toBe("chat");
    expect(bridgeFromResolved(resolveIntent(text))).toBeNull();
    expect(
      resolveCurrentArtifact({
        userText: text,
        messages: [{ role: "user", content: text }],
        creationContext: null,
        lastActivity: null,
        storedSession: null,
      }),
    ).toBeNull();
  });
});

describe("Companion intent routing — open Create (explicit creation)", () => {
  const cases = [
    "Create a Facebook post about ADHD procrastination.",
    "Create a Facebook post about women with ADHD and perfectionism.",
  ];

  it.each(cases)("$text", (text) => {
    expect(isExplicitCreationRequest(text)).toBe(true);
    expect(isInformationIntent(text)).toBe(false);
    expect(classifyCompanionIntentBucket(text)).toBe("content_creation");
    expect(shouldOpenCreateWorkspace(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(shouldBlockArtifactPipeline(text)).toBe(false);
    expect(resolveIntent(text).action).toBe("make");
  });
});

describe("Companion intent routing — anchor pair (nearly identical prompts)", () => {
  const research =
    "What does research say about women with ADHD and perfectionism?";
  const create =
    "Create a Facebook post about women with ADHD and perfectionism.";

  it("research question stays in chat", () => {
    expect(classifyCompanionIntentBucket(research)).toBe("research");
    expect(shouldOpenCreateWorkspace(research)).toBe(false);
    expect(resolveIntent(research).action).toBe("chat");
  });

  it("create request opens Create", () => {
    expect(classifyCompanionIntentBucket(create)).toBe("content_creation");
    expect(shouldOpenCreateWorkspace(create)).toBe(true);
    expect(resolveIntent(create).action).toBe("make");
  });

  it("classifier picks opposite paths for the pair", () => {
    expect(shouldOpenCreateWorkspace(research)).not.toBe(
      shouldOpenCreateWorkspace(create),
    );
  });
});

describe("Companion intent routing — borderline brainstorm with type", () => {
  it("offers ideas in chat; Create only after explicit yes", () => {
    const text = "Give me 20 Facebook post ideas.";
    expect(classifyCompanionIntentBucket(text)).toBe("brainstorming");
    expect(shouldOpenCreateWorkspace(text)).toBe(false);
    expect(resolveIntent(text).action).toBe("chat");
  });

  it("does not open Create on soft affirmation alone", () => {
    const yes = "yes";
    expect(shouldOpenCreateWorkspace(yes)).toBe(false);
    expect(isExplicitCreationRequest(yes)).toBe(false);
  });

  it("opens Create when user accepts draft offer explicitly", () => {
    const text = "Draft the first one as a Facebook post.";
    expect(isExplicitCreationRequest(text)).toBe(true);
    expect(shouldOpenCreateWorkspace(text)).toBe(true);
    expect(resolveIntent(text).action).toBe("make");
  });
});
