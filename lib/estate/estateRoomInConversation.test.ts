import { describe, expect, it } from "vitest";
import {
  detectEstateRoomInConversationTopic,
  resolveEstateRoomInConversationReply,
  resolveExplicitEstateActivity,
} from "./estateRoomInConversation";

describe("estateRoomInConversation", () => {
  it("detects journaling intent", () => {
    expect(
      detectEstateRoomInConversationTopic("i feel like journaling for a bit"),
    ).toBe("journal");
  });

  it("replies in apple orchard without software language", () => {
    const reply = resolveEstateRoomInConversationReply(
      "apple-orchard",
      "i feel like journaling for a bit",
    );
    expect(reply).toMatch(/orchard/i);
    expect(reply).not.toMatch(/journaling space|open a specific/i);
  });

  it("allows explicit room navigation", () => {
    expect(
      resolveEstateRoomInConversationReply(
        "apple-orchard",
        "take me to the journal",
      ),
    ).toBeNull();
  });

  it("opens breathe for explicit breathing exercise requests", () => {
    const activity = resolveExplicitEstateActivity(
      "i am stressed and need to do some breathing exercises",
    );
    expect(activity?.kind).toBe("open-breathe");
    expect(activity?.message).toMatch(/breathe/i);
  });

  it("does not treat room navigation as breathe activity", () => {
    expect(
      resolveExplicitEstateActivity("take me to the music room"),
    ).toBeNull();
  });
});
