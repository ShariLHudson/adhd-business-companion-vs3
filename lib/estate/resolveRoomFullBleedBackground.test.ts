/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  setChatBackdropId,
  setClearMyMindBackdropId,
  setRoomBackdropOverride,
} from "@/lib/chatBackdrop/chatBackdropPreference";
import { resolveRoomFullBleedBackground } from "@/lib/estate/resolveRoomFullBleedBackground";
import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import { STABLES_ROOM_BG } from "@/lib/stables/stablesRoomRegistry";
import { MOMENTUM_INSTITUTE_ROOM_BG } from "@/lib/momentumInstitute/room/instituteRoomRegistry";
import { PORTFOLIO_ROOM_BG, EVIDENCE_VAULT_ROOM_BG } from "@/lib/growth/growthRoom";
import { MOMENTUM_BUILDER_ROOM_BG } from "@/lib/momentumBuilderRoom/roomRegistry";

const ADOPTERS = [
  { roomId: "stables", defaultImageUrl: STABLES_ROOM_BG },
  { roomId: "momentum-institute", defaultImageUrl: MOMENTUM_INSTITUTE_ROOM_BG },
  { roomId: "portfolio", defaultImageUrl: PORTFOLIO_ROOM_BG },
  { roomId: "momentum-builder", defaultImageUrl: MOMENTUM_BUILDER_ROOM_BG },
  { roomId: "evidence-vault", defaultImageUrl: EVIDENCE_VAULT_ROOM_BG },
];

describe("resolveRoomFullBleedBackground — Batch 5 shared adopter helper", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it.each(ADOPTERS)(
    "$roomId: member choice wins over the room's default",
    ({ roomId, defaultImageUrl }) => {
      setRoomBackdropOverride(roomId, "library");
      const result = resolveRoomFullBleedBackground(roomId, {
        backgroundId: roomId,
        imageUrl: defaultImageUrl,
      });
      expect(result.source).toBe("member-choice");
      expect(result.backgroundId).toBe("library");
      expect(result.imageUrl).toBe(
        estateBackgroundPath("room-library-estate-background.png"),
      );
      expect(result.memberSelected).toBe(true);
      expect(result.imageUrl).not.toBe(defaultImageUrl);
    },
  );

  it.each(ADOPTERS)(
    "$roomId: no member choice preserves the room's current default image",
    ({ roomId, defaultImageUrl }) => {
      const result = resolveRoomFullBleedBackground(roomId, {
        backgroundId: roomId,
        imageUrl: defaultImageUrl,
      });
      expect(result.source).toBe("default");
      expect(result.imageUrl).toBe(defaultImageUrl);
      expect(result.memberSelected).toBe(false);
    },
  );

  it.each(ADOPTERS)(
    "$roomId: an invalid/corrupted saved choice falls back safely to default",
    ({ roomId, defaultImageUrl }) => {
      window.localStorage.setItem(
        "spark.roomBackdropOverride.v1",
        JSON.stringify({ [roomId]: "discontinued-option-id" }),
      );
      expect(() =>
        resolveRoomFullBleedBackground(roomId, {
          backgroundId: roomId,
          imageUrl: defaultImageUrl,
        }),
      ).not.toThrow();
      const result = resolveRoomFullBleedBackground(roomId, {
        backgroundId: roomId,
        imageUrl: defaultImageUrl,
      });
      expect(result.source).toBe("default");
      expect(result.imageUrl).toBe(defaultImageUrl);
    },
  );

  it.each(ADOPTERS)(
    "$roomId: routine navigation (repeated calls) preserves the saved choice",
    ({ roomId, defaultImageUrl }) => {
      setRoomBackdropOverride(roomId, "greenhouse");
      for (let i = 0; i < 5; i++) {
        const result = resolveRoomFullBleedBackground(roomId, {
          backgroundId: roomId,
          imageUrl: defaultImageUrl,
        });
        expect(result.source).toBe("member-choice");
        expect(result.backgroundId).toBe("greenhouse");
      }
    },
  );

  it.each(ADOPTERS)(
    "$roomId: does not read the general chat backdrop or Clear My Mind preference",
    ({ roomId, defaultImageUrl }) => {
      setChatBackdropId("fireside-deck");
      setClearMyMindBackdropId("sunroom");
      // No room override set for this room specifically.
      const result = resolveRoomFullBleedBackground(roomId, {
        backgroundId: roomId,
        imageUrl: defaultImageUrl,
      });
      expect(result.source).toBe("default");
      expect(result.imageUrl).toBe(defaultImageUrl);
    },
  );

  it("a saved choice for one room does not leak into another room's resolution", () => {
    setRoomBackdropOverride("stables", "tea-room");
    const stables = resolveRoomFullBleedBackground("stables", {
      backgroundId: "stables",
      imageUrl: STABLES_ROOM_BG,
    });
    const portfolio = resolveRoomFullBleedBackground("portfolio", {
      backgroundId: "portfolio",
      imageUrl: PORTFOLIO_ROOM_BG,
    });
    expect(stables.source).toBe("member-choice");
    expect(stables.backgroundId).toBe("tea-room");
    expect(portfolio.source).toBe("default");
    expect(portfolio.imageUrl).toBe(PORTFOLIO_ROOM_BG);
  });

  it("deterministic output for identical inputs", () => {
    setRoomBackdropOverride("momentum-builder", "reading-nook");
    const request = {
      backgroundId: "momentum-builder",
      imageUrl: MOMENTUM_BUILDER_ROOM_BG,
    };
    const first = resolveRoomFullBleedBackground("momentum-builder", request);
    const second = resolveRoomFullBleedBackground("momentum-builder", request);
    expect(first).toEqual(second);
  });

  it("no room here uses roomRequired — none of the five has a documented identity requirement", () => {
    for (const { roomId, defaultImageUrl } of ADOPTERS) {
      const result = resolveRoomFullBleedBackground(roomId, {
        backgroundId: roomId,
        imageUrl: defaultImageUrl,
      });
      expect(result.source).not.toBe("room-required");
    }
  });

  it("the five approved room shells wire resolveRoomFullBleedBackground; no other room shell has adopted it yet", () => {
    const approvedShells = [
      "components/companion/stables/StablesRoomShell.tsx",
      "components/companion/momentumInstitute/MomentumInstituteRoomShell.tsx",
      "components/companion/PortfolioRoomShell.tsx",
      "components/companion/MomentumBuilderRoomShell.tsx",
      "components/companion/EvidenceVaultRoomShell.tsx",
    ];
    for (const relativePath of approvedShells) {
      const source = readFileSync(path.join(process.cwd(), relativePath), "utf8");
      expect(source).toContain("resolveRoomFullBleedBackground");
      // The hardcoded constant must remain only as the `default` fallback,
      // never passed straight through as EstateRoomFullBleedBackground's imageUrl prop.
      expect(source).not.toMatch(/imageUrl=\{[A-Z_]+_ROOM_BG\}/);
    }

    const nonAdoptedShells = [
      "components/companion/CalendarRoomShell.tsx",
      "components/companion/PlanMyDayMorningRoomShell.tsx",
      "components/companion/RemindersRoomShell.tsx",
      "components/companion/RhythmsRoomShell.tsx",
      "components/companion/StrategyLibraryRoomShell.tsx",
      "components/companion/MyProfileRoomShell.tsx",
      "components/companion/FocusMyBrainRoomShell.tsx",
      "components/companion/GrowthStoryRoomShell.tsx",
      "components/companion/GrowRoomShell.tsx",
      "components/companion/GrowthProfileRoomShell.tsx",
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
      "components/companion/boardroom/BoardroomRoomShell.tsx",
      "components/companion/chamber/ChamberOfMomentumRoomShell.tsx",
      "components/companion/estate/EstateRoomFullBleedBackground.tsx",
      "components/companion/estate/SparkEstateShell.tsx",
      "components/estate-collection/EstateCollectionRoomShell.tsx",
      "components/journal-gazebo/JournalGazeboExperience.tsx",
      "app/companion/CompanionPageClient.tsx",
    ];
    for (const relativePath of nonAdoptedShells) {
      const source = readFileSync(path.join(process.cwd(), relativePath), "utf8");
      expect(source).not.toContain("resolveRoomFullBleedBackground");
      expect(source).not.toContain("resolveEstateBackground(");
    }
  });
});
