import { describe, expect, it } from "vitest";

import { auditEstatePlaceNavigation } from "./estatePlaceNavigationAudit";
import { resolveEstatePlace, shouldNavigateFromResolution } from "./resolveEstatePlace";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";

const PHRASE_MATRIX: {
  text: string;
  expect:
    | { type: "navigate"; placeId: string }
    | { type: "offer"; placeIds?: string[]; lineIncludes?: string[] }
    | { type: "reply"; lineIncludes: string[] };
}[] = [
  {
    text: "take me to the swimming pool",
    expect: { type: "navigate", placeId: "summer-terrace" },
  },
  {
    text: "let's go swimming",
    expect: {
      type: "offer",
      placeIds: ["seat-at-pond", "peaceful-places"],
      lineIncludes: ["isn't on the Estate yet"],
    },
  },
  {
    text: "take me to the pool",
    expect: { type: "navigate", placeId: "summer-terrace" },
  },
  {
    text: "take me to the celebration room",
    expect: { type: "navigate", placeId: "celebration-room" },
  },
  {
    text: "take me to the celebration hall",
    expect: { type: "navigate", placeId: "celebration-room" },
  },
  {
    text: "show me my wins",
    expect: { type: "navigate", placeId: "gardens" },
  },
  {
    text: "let's celebrate this",
    expect: {
      type: "offer",
      lineIncludes: ["Celebration"],
    },
  },
  {
    text: "show me celebration sounds",
    expect: {
      type: "reply",
      lineIncludes: ["audio settings", "not a room"],
    },
  },
  {
    text: "turn on celebration sounds",
    expect: {
      type: "reply",
      lineIncludes: ["audio settings"],
    },
  },
  {
    text: "take me to the Journal Gazebo",
    expect: { type: "navigate", placeId: "journal" },
  },
  {
    text: "take me to the Apple Orchard",
    expect: { type: "navigate", placeId: "apple-orchard" },
  },
];

describe("estate place navigation phrase matrix", () => {
  for (const { text, expect: expected } of PHRASE_MATRIX) {
    it(`"${text}"`, () => {
      const turn = evaluateEstatePlaceTurn({ userText: text });

      if (expected.type === "navigate") {
        expect(turn.type).toBe("navigate");
        if (turn.type === "navigate") {
          expect(turn.command.roomId ?? turn.command.entryId).toBe(
            expected.placeId,
          );
        }

        const resolution = resolveEstatePlace(text);
        expect(shouldNavigateFromResolution(resolution)).toBe(true);
        expect(resolution.placeId).toBe(expected.placeId);

        const direct = detectDirectCommand(text);
        expect(direct?.roomId ?? direct?.entryId).toBe(expected.placeId);
        return;
      }

      if (expected.type === "offer") {
        expect(turn.type).toBe("offer");
        if (turn.type === "offer") {
          for (const fragment of expected.lineIncludes ?? []) {
            expect(turn.line).toContain(fragment);
          }
          if (expected.placeIds) {
            expect(turn.placeIds).toEqual(expected.placeIds);
          }
        }
        return;
      }

      expect(turn.type).toBe("reply");
      if (turn.type === "reply") {
        for (const fragment of expected.lineIncludes) {
          expect(turn.line).toContain(fragment);
        }
      }

      const resolution = resolveEstatePlace(text);
      expect(resolution.kind).toBe("audio-settings");
    });
  }

  it("swimming phrases never route to game-room", () => {
    for (const text of [
      "take me to the swimming pool",
      "let's go swimming",
      "take me to the pool",
    ]) {
      const resolution = resolveEstatePlace(text);
      expect(resolution.placeId).not.toBe("game-room");
      const turn = evaluateEstatePlaceTurn({ userText: text });
      if (turn.type === "navigate") {
        expect(turn.command.roomId ?? turn.command.entryId).not.toBe("game-room");
      }
    }
  });
});

describe("estate place navigation audit", () => {
  it("audits every canonical place with goToPlace viability", () => {
    const rows = auditEstatePlaceNavigation();
    expect(rows.length).toBeGreaterThanOrEqual(40);

    const notNavigable = rows.filter((row) => !row.goToPlaceCanOpen);
    expect(notNavigable.map((row) => row.placeId)).toEqual([]);

    const swimmingPool = rows.find((row) => row.placeId === "swimming-pool");
    expect(swimmingPool).toBeUndefined();
  });
});
