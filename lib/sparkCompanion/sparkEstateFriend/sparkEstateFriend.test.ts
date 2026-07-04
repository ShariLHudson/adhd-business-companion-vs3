import { describe, expect, it } from "vitest";
import { evaluateSparkEstateFriend } from "./evaluateFriend";
import { roomFriendVoiceHintForPlace } from "./principles";
import { sparkEstateFriendHintForChat } from "./sparkEstateFriendHintForChat";
import { SPARK_FRIEND_PRINCIPLE_QUESTION } from "./types";

describe("sparkEstateFriend", () => {
  it("includes friend principle in hint", () => {
    const hint = sparkEstateFriendHintForChat({ userText: "Hello" });
    expect(hint).toContain(SPARK_FRIEND_PRINCIPLE_QUESTION);
  });

  it("defers advice on vent-only turns", () => {
    const d = evaluateSparkEstateFriend({
      userText: "I just needed to tell someone — I'm not looking for advice",
    });
    expect(d.deferAdvice).toBe(true);
    expect(d.friendNeeds).toContain("acceptance_only");
  });

  it("detects gentle challenge need on inner critic", () => {
    const d = evaluateSparkEstateFriend({
      userText: "I'm lazy and I'm the problem",
    });
    expect(d.friendNeeds).toContain("gently_challenge_belief");
    expect(d.signals).toContain("inner_critic_challenge");
  });

  it("detects celebrate friend need", () => {
    const d = evaluateSparkEstateFriend({
      userText: "I'm so excited — we finally launched!",
    });
    expect(d.friendNeeds).toContain("celebrate_with");
  });

  it("room friend voice for pond", () => {
    const hint = sparkEstateFriendHintForChat({
      userText: "Hi",
      placeId: "pond",
    });
    expect(hint).toContain("solve everything");
    expect(roomFriendVoiceHintForPlace("pond")).toContain("solve");
  });
});
