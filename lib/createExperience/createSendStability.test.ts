import { describe, expect, it } from "vitest";
import { SafeJsonResponseError } from "@/lib/safeJsonResponse";
import {
  buildCreateChatFailureReply,
  companionChatHttpFailureError,
  CREATE_CHAT_RETRY_REPLY,
  isCompanionChatHttpFailure,
  isProtectedCreateSession,
  shouldBlockNavigationDuringCreateSend,
} from "./createSendStability";

describe("createSendStability", () => {
  it("protects Create session while awaiting a response", () => {
    expect(
      isProtectedCreateSession({
        awaitingResponse: true,
        workspacePanel: "content-generator",
        createBuilderActive: true,
        splitCreateChat: true,
      }),
    ).toBe(true);
    expect(
      shouldBlockNavigationDuringCreateSend({
        awaitingResponse: true,
        workspacePanel: "content-generator",
        createBuilderActive: true,
        splitCreateChat: true,
      }),
    ).toBe(true);
  });

  it("does not block navigation when Create is idle", () => {
    expect(
      shouldBlockNavigationDuringCreateSend({
        awaitingResponse: false,
        workspacePanel: "content-generator",
        createBuilderActive: true,
        splitCreateChat: true,
      }),
    ).toBe(false);
  });

  it("recognizes 503 / http companion-chat failures", () => {
    expect(
      isCompanionChatHttpFailure(
        companionChatHttpFailureError(503, "Model unavailable."),
      ),
    ).toBe(true);
    expect(
      isCompanionChatHttpFailure(
        new SafeJsonResponseError("Non-JSON response (503)", { status: 503 }),
      ),
    ).toBe(true);
    expect(isCompanionChatHttpFailure(new Error("unrelated"))).toBe(false);
  });

  it("keeps an inline retry cue for Create failures", () => {
    expect(buildCreateChatFailureReply("hero headline ideas")).toBe(
      CREATE_CHAT_RETRY_REPLY,
    );
    expect(CREATE_CHAT_RETRY_REPLY.toLowerCase()).toMatch(/send|again|ready/);
  });
});
