import { describe, expect, it, beforeEach } from "vitest";
import { classifyCompanionIntent } from "@/lib/companionTurn/classifyCompanionIntent";
import { shouldRouteThroughEstateKernel } from "./estateKernelGate";
import { clearPendingEstatePlaceMenu, evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import {
  ESTATE_ROOM_ALIAS_CATALOG,
  resolveEstatePlaceIdFromUserText,
  resolveEstateRoomAliasExact,
} from "./estateRoomAliasRegistry";

/** User-requested rooms — each must resolve from natural navigation phrases. */
const USER_ROOM_CASES: ReadonlyArray<{
  roomId: string;
  phrases: readonly string[];
}> = [
  {
    roomId: "summer-terrace",
    phrases: ["pool", "swimming pool", "summer terrace"],
  },
  { roomId: "study-hall", phrases: ["study hall"] },
  { roomId: "momentum-room", phrases: ["momentum room"] },
  { roomId: "evidence-vault", phrases: ["evidence vault"] },
  { roomId: "discovery-room", phrases: ["discovery room"] },
  { roomId: "gardens", phrases: ["celebration garden", "garden"] },
  {
    roomId: "celebration-room",
    phrases: ["celebration hall", "celebration room"],
  },
  {
    roomId: "gallery-of-firsts",
    phrases: ["hall of accomplishments", "gallery of firsts"],
  },
  { roomId: "strategy-studio", phrases: ["strategy studio"] },
  { roomId: "round-table", phrases: ["round table", "boardroom", "board room"] },
  { roomId: "dining-room", phrases: ["dining room"] },
  { roomId: "estate-kitchen", phrases: ["kitchen", "estate kitchen"] },
  { roomId: "game-room", phrases: ["game room"] },
  { roomId: "reflection-pond", phrases: ["reflection pond"] },
  { roomId: "lakeside-hammock", phrases: ["lakeside hammock"] },
  { roomId: "fireside-deck", phrases: ["fireside deck"] },
  { roomId: "personal-deck", phrases: ["personal deck", "private balcony"] },
  { roomId: "grand-terrace", phrases: ["grand terrace"] },
  { roomId: "lakeside-verandah", phrases: ["lakeside verandah"] },
  { roomId: "estate-gardens", phrases: ["estate gardens"] },
  { roomId: "apple-orchard", phrases: ["apple orchard"] },
  {
    roomId: "conservatory",
    phrases: ["butterfly conservatory", "conservatory"],
  },
  { roomId: "art-studio", phrases: ["art studio"] },
  { roomId: "music-room", phrases: ["music room"] },
  { roomId: "tea-room", phrases: ["tea room"] },
  { roomId: "decision-compass", phrases: ["writing room"] },
  { roomId: "reading-nook", phrases: ["reading nook"] },
  {
    roomId: "stairway-reading-nook",
    phrases: ["stairway reading nook"],
  },
  { roomId: "clear-my-mind", phrases: ["clear my mind sunroom"] },
  { roomId: "welcome-home", phrases: ["welcome home", "welcome room"] },
  { roomId: "spark-estate", phrases: ["spark estate", "front estate"] },
  { roomId: "stables", phrases: ["stables", "spark stables"] },
  { roomId: "observatory", phrases: ["observatory"] },
  { roomId: "library", phrases: ["library", "estate library"] },
  { roomId: "personal-library", phrases: ["personal library", "my library"] },
  { roomId: "coffee-house", phrases: ["coffee house"] },
  { roomId: "journal", phrases: ["journal gazebo"] },
  { roomId: "greenhouse", phrases: ["greenhouse", "working greenhouse"] },
];

const NAVIGATION_TEMPLATES = [
  (place: string) => `Take me to the ${place}.`,
  (place: string) => `Show me the ${place}.`,
  (place: string) => `What does the ${place} look like?`,
  (place: string) => `Let's visit the ${place}.`,
  (place: string) => `Go to the ${place}.`,
  (place: string) => `Open the ${place}.`,
] as const;

describe("estateRoomAliasNavigation", () => {
  beforeEach(() => {
    clearPendingEstatePlaceMenu();
  });

  it("catalog covers every user-requested room id", () => {
    const catalogIds = new Set(
      ESTATE_ROOM_ALIAS_CATALOG.map((row) => row.roomId),
    );
    for (const { roomId } of USER_ROOM_CASES) {
      expect(catalogIds.has(roomId), roomId).toBe(true);
    }
  });

  it.each(USER_ROOM_CASES)(
    "resolves $roomId from shorthand phrases",
    ({ roomId, phrases }) => {
      for (const phrase of phrases) {
        expect(resolveEstateRoomAliasExact(phrase), phrase).toBe(roomId);
        expect(resolveEstatePlaceIdFromUserText(phrase), phrase).toBe(roomId);
      }
    },
  );

  it.each(USER_ROOM_CASES)(
    "resolves $roomId from natural navigation templates",
    ({ roomId, phrases }) => {
      const phrase = phrases[0]!;
      for (const template of NAVIGATION_TEMPLATES) {
        const userText = template(phrase);
        expect(
          resolveEstatePlaceIdFromUserText(userText),
          userText,
        ).toBe(roomId);
      }
    },
  );

  it("avoids collisions between similar outdoor spaces", () => {
    expect(resolveEstatePlaceIdFromUserText("fireside deck")).toBe(
      "fireside-deck",
    );
    expect(resolveEstatePlaceIdFromUserText("personal deck")).toBe(
      "personal-deck",
    );
    expect(resolveEstatePlaceIdFromUserText("reflection pond")).toBe(
      "reflection-pond",
    );
    expect(resolveEstatePlaceIdFromUserText("seat at the pond")).toBe(
      "seat-at-pond",
    );
    expect(resolveEstatePlaceIdFromUserText("estate gardens")).toBe(
      "estate-gardens",
    );
    expect(resolveEstatePlaceIdFromUserText("celebration garden")).toBe(
      "gardens",
    );
    expect(resolveEstatePlaceIdFromUserText("art studio")).toBe("art-studio");
    expect(resolveEstatePlaceIdFromUserText("creative studio")).toBe(
      "creative-studio",
    );
  });

  it("routes explicit pool navigation to summer terrace", () => {
    expect(resolveEstatePlaceIdFromUserText("Take me to the pool.")).toBe(
      "summer-terrace",
    );
    const turn = evaluateEstatePlaceTurn({
      userText: "Take me to the pool.",
      currentPlaceId: null,
      lastAssistantText: null,
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      const placeId = turn.command.roomId ?? turn.command.entryId;
      expect(placeId).toBe("summer-terrace");
    }
  });

  it("keeps estate kernel in control — navigation classifies as NAVIGATE", () => {
    for (const userText of [
      "What does the Momentum Room look like?",
      "Show me the Study Hall.",
      "Let's visit the Reflection Pond.",
      "Take me to the pool.",
    ]) {
      expect(shouldRouteThroughEstateKernel(userText)).toBe(true);
      const classified = classifyCompanionIntent({
        userText,
        lastAssistantText: null,
        currentPlaceId: null,
      });
      expect(classified.kind, userText).toBe("NAVIGATE");
    }
  });

  it("keeps estate kernel in control for ambiguous library offers", () => {
    const userText = "Take me to the Library.";
    expect(shouldRouteThroughEstateKernel(userText)).toBe(true);
    const classified = classifyCompanionIntent({
      userText,
      lastAssistantText: null,
      currentPlaceId: null,
    });
    expect(classified.kind).toBe("CHAT");
    expect(classified.plan.type).toBe("place-menu");
  });

  it("look-like estate questions route through kernel as NAVIGATE", () => {
    const userText = "What does the Coffee House look like?";
    expect(shouldRouteThroughEstateKernel(userText)).toBe(true);
    const classified = classifyCompanionIntent({
      userText,
      lastAssistantText: null,
      currentPlaceId: null,
    });
    expect(classified.kind).toBe("NAVIGATE");
  });
});
