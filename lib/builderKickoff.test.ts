import { describe, expect, it } from "vitest";
import {
  buildClientAvatarKickoffMessage,
  CLIENT_AVATAR_KICKOFF_HEADER,
  CLIENT_AVATAR_STEP1_CHAT,
  isBuilderKickoffAwaitingAnswer,
  isStaleAvatarCoachOpener,
  kickoffHeaderForSection,
  shouldSuppressCardsForBuilderKickoff,
} from "./builderKickoff";

describe("builderKickoff", () => {
  it("uses distinct header and step 1 chat copy", () => {
    expect(kickoffHeaderForSection("client-avatars")).toBe(
      CLIENT_AVATAR_KICKOFF_HEADER,
    );
    expect(buildClientAvatarKickoffMessage().content).toBe(
      CLIENT_AVATAR_STEP1_CHAT,
    );
    expect(CLIENT_AVATAR_KICKOFF_HEADER).not.toContain("Who do you help");
    expect(CLIENT_AVATAR_STEP1_CHAT).toContain("Who do you help most often?");
  });

  it("suppresses cards until the user replies", () => {
    const messages = [
      { role: "assistant", content: CLIENT_AVATAR_STEP1_CHAT },
    ] as { role: string; content: string }[];

    expect(
      shouldSuppressCardsForBuilderKickoff({
        kickoffActive: true,
        messages,
      }),
    ).toBe(true);
    expect(
      isBuilderKickoffAwaitingAnswer({ kickoffActive: true, messages }),
    ).toBe(true);

    const afterReply = [
      ...messages,
      { role: "user", content: "ADHD entrepreneurs" },
    ];
    expect(
      shouldSuppressCardsForBuilderKickoff({
        kickoffActive: true,
        messages: afterReply,
      }),
    ).toBe(false);
  });

  it("flags stale avatar coach openers", () => {
    expect(
      isStaleAvatarCoachOpener(
        "Let's build your Client Avatar together. I'll guide you one step at a time.",
      ),
    ).toBe(true);
    expect(isStaleAvatarCoachOpener(CLIENT_AVATAR_STEP1_CHAT)).toBe(false);
  });
});
