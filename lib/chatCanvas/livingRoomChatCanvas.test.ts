import { describe, expect, it } from "vitest";
import {
  homesteadLivingRoomImageUrl,
  resolveHomesteadSceneState,
} from "@/lib/homesteadScene";
import { resolveLivingRoomChatAtmosphere } from "./livingRoomChatCanvas";
import { pickChatPlaceholder } from "./chatPlaceholders";

describe("livingRoomChatCanvas", () => {
  it("uses the fixed master living-room photograph", () => {
    const morning = resolveLivingRoomChatAtmosphere(
      new Date("2026-06-15T09:00:00"),
    );
    expect(morning.imageUrl).toBe(homesteadLivingRoomImageUrl());
    expect(morning.imageUrl).not.toContain("progress/blue-sky");
    expect(morning.timeOfDay).toBe("morning");
  });

  it("inherits homestead scene state at evening hours", () => {
    const evening = resolveLivingRoomChatAtmosphere(
      new Date("2026-06-15T19:00:00"),
    );
    const state = resolveHomesteadSceneState({
      now: new Date("2026-06-15T19:00:00"),
      surface: "chat",
    });
    expect(evening.imageUrl).toBe(homesteadLivingRoomImageUrl());
    expect(evening.timeOfDay).toBe(state.timeOfDay);
  });
});

describe("chatPlaceholders", () => {
  it("rotates warm inviting placeholders", () => {
    const line = pickChatPlaceholder();
    expect(line.length).toBeGreaterThan(0);
    expect(line).toMatch(/mind|true|help|rush|small/i);
  });
});
