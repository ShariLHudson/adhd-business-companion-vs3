/**
 * Repair 4 — one truthful Create execution outcome per turn. A blocked Create
 * room must never render alongside a "that's your workspace" success claim.
 */
import { describe, expect, it } from "vitest";

import {
  CREATE_ROOM_PREPARED_STATE_MESSAGE,
  resolveLegacyCreateWorkspaceGuard,
} from "./blockLegacyCreateWorkspaceRouting";
import { buildChatArtifactHandoffMessage } from "@/lib/chatArtifactGuard";

/**
 * Models the Path-X outcome selection in CompanionPageClient: post the success
 * handoff ONLY when the artifact open will actually open; otherwise the
 * prepared-state placeholder is the single outcome. Never both.
 */
function chatArtifactCreateMessages(input: {
  itemType: string;
  title: string;
  userText: string;
  alreadyOpen?: boolean;
}): string[] {
  const guard = resolveLegacyCreateWorkspaceGuard({
    section: "content-generator",
    userText: input.userText,
    itemType: input.itemType,
    alreadyOpen: input.alreadyOpen,
  });
  const willOpen = guard.kind !== "prepared_state";
  if (willOpen) {
    return [buildChatArtifactHandoffMessage(input.itemType, input.title)];
  }
  // openCreateWithResolvedArtifact posts the placeholder for a blocked room.
  return [
    guard.kind === "prepared_state"
      ? guard.message
      : CREATE_ROOM_PREPARED_STATE_MESSAGE,
  ];
}

describe("Create execution outcome — truthful single message", () => {
  it("a chat-driven content-generator create is currently blocked (prepared_state)", () => {
    const guard = resolveLegacyCreateWorkspaceGuard({
      section: "content-generator",
      userText: "create a marketing plan",
      itemType: "Marketing Plan",
    });
    expect(guard.kind).toBe("prepared_state");
  });

  it("blocked create → only the placeholder, never the false workspace claim", () => {
    const messages = chatArtifactCreateMessages({
      itemType: "Marketing Plan",
      title: "New Marketing Plan",
      userText: "create a marketing plan",
    });
    expect(messages).toEqual([CREATE_ROOM_PREPARED_STATE_MESSAGE]);
    expect(messages.join(" ")).not.toMatch(/that's your workspace|is in Create/i);
  });

  it("the two outcomes are mutually exclusive (never success + placeholder together)", () => {
    const messages = chatArtifactCreateMessages({
      itemType: "Marketing Plan",
      title: "New Marketing Plan",
      userText: "create a marketing plan",
    });
    const hasSuccess = messages.some((m) => /that's your workspace/i.test(m));
    const hasPlaceholder = messages.some((m) =>
      m.includes("still being prepared"),
    );
    expect(hasSuccess && hasPlaceholder).toBe(false);
    expect(messages).toHaveLength(1);
  });

  it("when the room WOULD open (allow), the success handoff is the single message", () => {
    const guard = resolveLegacyCreateWorkspaceGuard({
      section: "plan-my-day" as never, // not a legacy-blocked section → allow
      userText: "create a marketing plan",
      itemType: "Marketing Plan",
    });
    expect(guard.kind).toBe("allow");
    const messages = chatArtifactCreateMessages({
      itemType: "Marketing Plan",
      title: "New Marketing Plan",
      userText: "create a marketing plan",
      alreadyOpen: true, // content-generator already open → allow → success
    });
    expect(messages[0]).toMatch(/that's your workspace/i);
    expect(messages).toHaveLength(1);
  });
});
