import { describe, expect, it } from "vitest";
import {
  CARTOGRAPHERS_ATLAS_ENTRIES,
  CARTOGRAPHERS_FRAMED_MAPS,
  CARTOGRAPHERS_ROOM_INTRO,
  CARTOGRAPHERS_WELCOME_ABOUT_HEADING,
  CARTOGRAPHERS_WELCOME_BEGIN_HEADING,
  CARTOGRAPHERS_WELCOME_BODY,
  CARTOGRAPHERS_WELCOME_CLICK_FRAME,
  CARTOGRAPHERS_WELCOME_FOOTER,
  CARTOGRAPHERS_WELCOME_MAP_BLURBS,
  CARTOGRAPHERS_WELCOME_SUBTITLE,
  CARTOGRAPHERS_WELCOME_TELL_SPARK,
  CARTOGRAPHERS_WELCOME_TITLE,
  detectsVisualBeginnerUnsure,
  formatVisualBeginnerChoiceMessage,
  parseVisualBeginnerChoice,
  VISUAL_BEGINNER_CHOICE_LINE,
} from "@/lib/cartographersStudio";
import { detectExplicitVisualView } from "@/lib/visualThinkingStudio";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { resolveEstateRoomInvitationSet } from "@/lib/estate/estateRoomInvitation";
import { isDedicatedEstateRoomPanelSection } from "@/lib/estate/directEstateVisit";

describe("Cartographer Studio UX refinement", () => {
  it("every framed map has a one-sentence hover blurb", () => {
    for (const map of CARTOGRAPHERS_FRAMED_MAPS) {
      expect(map.hoverBlurb.trim().length).toBeGreaterThan(8);
      expect(map.hoverBlurb).toMatch(/\./);
    }
    expect(
      CARTOGRAPHERS_FRAMED_MAPS.find((m) => m.id === "mind-map")?.hoverBlurb,
    ).toBe("Organize ideas and discover connections.");
  });

  it("only Mind Map wall button is selectable (Prompt 140)", () => {
    const selectable = CARTOGRAPHERS_FRAMED_MAPS.filter((m) => m.wallSelectable);
    expect(selectable.map((m) => m.id)).toEqual(["mind-map"]);
  });

  it("room intro tells visitors to click any map", () => {
    expect(CARTOGRAPHERS_ROOM_INTRO.instruction).toMatch(/click any map/i);
    expect(CARTOGRAPHERS_WELCOME_CLICK_FRAME.body).toMatch(/name in the center/i);
  });

  it("Atlas entries teach what / why / when / example / related / create", () => {
    expect(CARTOGRAPHERS_ATLAS_ENTRIES).toHaveLength(10);
    for (const entry of CARTOGRAPHERS_ATLAS_ENTRIES) {
      expect(entry.whatItIs.length).toBeGreaterThan(20);
      expect(entry.whyItWorks.length).toBeGreaterThan(20);
      expect(entry.bestUsedFor.length).toBeGreaterThan(10);
      expect(entry.whenNotToUse.length).toBeGreaterThan(10);
      expect(entry.example.length).toBeGreaterThan(10);
      expect(entry.relatedMethods.length).toBeGreaterThan(0);
    }
    const mind = CARTOGRAPHERS_ATLAS_ENTRIES.find((e) => e.id === "mind-map");
    expect(mind?.canCreate).toBe(true);
    expect(
      CARTOGRAPHERS_ATLAS_ENTRIES.filter((e) => e.canCreate),
    ).toHaveLength(1);
  });

  it.each([
    "I want a Mind Map",
    "Create a Mind Map",
    "Build a Mind Map",
    "Mind map this",
  ])("explicit mind map phrase detects mind-map: %s", (text) => {
    expect(detectExplicitVisualView(text)?.id).toBe("mind-map");
  });

  it("explicit mind map opens Discovery path (not recommendation menu)", () => {
    const decision = resolveFrictionlessAction({
      userText: "I want a Mind Map",
      currentTurn: 1,
    });
    expect(decision.immediateVisualOpen?.viewId).toBe("mind-map");
    expect(decision.localReply).toMatch(/Mind Map Discovery/i);
    expect(decision.localReply).not.toMatch(/I can visualize this a few ways/i);
  });

  it("beginner unsure offers Recommend One / I'll Choose", () => {
    expect(detectsVisualBeginnerUnsure("I don't know which visual I need")).toBe(
      true,
    );
    const message = formatVisualBeginnerChoiceMessage();
    expect(message).toContain(VISUAL_BEGINNER_CHOICE_LINE);
    expect(message).toMatch(/Recommend One/);
    expect(message).toMatch(/I'll Choose/);

    const decision = resolveFrictionlessAction({
      userText: "I don't know which visual I need",
      currentTurn: 2,
    });
    expect(decision.localReply).toContain(VISUAL_BEGINNER_CHOICE_LINE);
    expect(decision.immediateVisualOpen).toBeUndefined();
  });

  it("parses beginner choices", () => {
    expect(parseVisualBeginnerChoice("Recommend One")).toBe("recommend");
    expect(parseVisualBeginnerChoice("1")).toBe("recommend");
    expect(parseVisualBeginnerChoice("I'll Choose")).toBe("explore");
    expect(parseVisualBeginnerChoice("2")).toBe("explore");
  });

  it("I'll Choose opens Cartographer's Studio immediately", () => {
    const decision = resolveFrictionlessAction({
      userText: "I'll Choose",
      currentTurn: 3,
      lastAssistantText: formatVisualBeginnerChoiceMessage(),
    });
    expect(decision.immediateCartographersStudioOpen).toBe(true);
    expect(decision.localReply).toMatch(/Cartographer's Studio/i);
  });

  it("welcome guide has orientation copy without Welcome Home navigation", () => {
    const blob = [
      CARTOGRAPHERS_WELCOME_TITLE,
      CARTOGRAPHERS_WELCOME_SUBTITLE,
      ...CARTOGRAPHERS_WELCOME_BODY,
      CARTOGRAPHERS_WELCOME_BEGIN_HEADING,
      CARTOGRAPHERS_WELCOME_TELL_SPARK.heading,
      ...CARTOGRAPHERS_WELCOME_TELL_SPARK.examples,
      CARTOGRAPHERS_WELCOME_CLICK_FRAME.heading,
      CARTOGRAPHERS_WELCOME_CLICK_FRAME.body,
      CARTOGRAPHERS_WELCOME_ABOUT_HEADING,
      CARTOGRAPHERS_WELCOME_FOOTER,
    ].join("\n");
    expect(blob).not.toMatch(/Chat with Shari/i);
    expect(blob).not.toMatch(/Visit Another Room/i);
    expect(blob).not.toMatch(/Enjoy the Estate/i);
    expect(blob).toContain("Cartographer's Studio");
    expect(blob).toContain(
      "Every map tells a story. Every story reveals a path.",
    );
    expect(CARTOGRAPHERS_WELCOME_MAP_BLURBS).toHaveLength(10);
  });

  it("focus-studio has no Focus Studio invitation closers", () => {
    const set = resolveEstateRoomInvitationSet("focus-studio");
    const labels = set.items.map((i) => i.label);
    expect(labels).not.toContain("Just Chat with Shari");
    expect(labels).not.toContain("Visit Another Room");
    expect(labels).not.toContain("Enjoy the Estate");
    expect(set.items.filter((i) => i.tier === "universal")).toHaveLength(0);
  });

  it("visual-focus is a dedicated panel (no frosted estate overlay)", () => {
    expect(isDedicatedEstateRoomPanelSection("visual-focus")).toBe(true);
  });
});
