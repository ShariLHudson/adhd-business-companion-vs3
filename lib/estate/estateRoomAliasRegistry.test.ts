import { describe, expect, it } from "vitest";
import {
  messageNamesExactEstateRoom,
  resolveEstateRoomAliasBounded,
  resolveEstateRoomAliasExact,
} from "./estateRoomAliasRegistry";

describe("estateRoomAliasRegistry", () => {
  it("resolves conservatory exactly — not clear my mind", () => {
    expect(resolveEstateRoomAliasExact("the conservatory")).toBe("conservatory");
    expect(resolveEstateRoomAliasExact("conservatory")).toBe("conservatory");
  });

  it("does not map greenhouse to welcome home", () => {
    expect(resolveEstateRoomAliasBounded("greenhouse")).toBe("greenhouse");
    expect(resolveEstateRoomAliasBounded("the greenhouse")).toBe("greenhouse");
  });

  it("does not treat mood sentence as exact room command", () => {
    expect(messageNamesExactEstateRoom("I need to clear my mind")).toBe(false);
    expect(resolveEstateRoomAliasExact("I need to clear my mind")).toBeNull();
  });

  it("detects explicit navigation to music room", () => {
    expect(messageNamesExactEstateRoom("Take me to the Music Room.")).toBe(
      true,
    );
    expect(resolveEstateRoomAliasExact("music room")).toBe("music-room");
  });

  it("maps momentum institute to institute room", () => {
    expect(resolveEstateRoomAliasExact("momentum institute")).toBe(
      "momentum-institute",
    );
    expect(resolveEstateRoomAliasExact("the institute")).toBe(
      "momentum-institute",
    );
  });
});
