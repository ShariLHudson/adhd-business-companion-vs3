import { resolvePlace } from "@/lib/companionConstitution";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { livingBorderCatalogForPlace } from "./borderCatalog";
import { borderElement } from "./elementRegistry";
import { centerAllowsBorderLife, capBorderAnimations } from "./rules";
import type {
  LivingBorderActiveElement,
  LivingBorderInput,
  LivingBorderVerdict,
} from "./types";
import {
  LIVING_BORDER_EXPERIENCE_PRINCIPLE,
  LIVING_BORDER_PRINCIPLE,
} from "./types";

function resolveVisibility(
  elementId: LivingBorderActiveElement["id"],
  input: LivingBorderInput,
): { visible: boolean; animated: boolean } {
  const evening =
    input.timeOfDay === "evening" || input.timeOfDay === "night";
  const morning = input.timeOfDay === "morning";
  const rainy = input.weather === "rain";
  const snowy = input.weather === "snow";

  switch (elementId) {
    case "lamp-glow":
      return { visible: input.warmLamp ?? evening, animated: false };
    case "steam":
    case "coffee-mug":
      return {
        visible: input.showMugSteam ?? (morning || evening),
        animated: input.showMugSteam ?? true,
      };
    case "blanket":
    case "kinsey":
      return { visible: input.showBlanket ?? true, animated: false };
    case "bird":
    case "bird-feeder":
      return {
        visible: Boolean(input.wildlife) || morning,
        animated: Boolean(input.wildlife),
      };
    case "rain":
      return { visible: rainy, animated: rainy };
    case "snow":
      return { visible: snowy, animated: false };
    case "candle":
      return { visible: evening, animated: evening };
    case "curtain-left":
    case "curtain-right":
      return { visible: true, animated: true };
    case "trees":
    case "landscape":
    case "flowers":
    case "window":
      return { visible: true, animated: !rainy };
    case "pond-water":
      return { visible: true, animated: true };
    case "goldfish":
    case "water-lilies":
      return { visible: true, animated: !snowy };
    case "pergola-vines":
      return { visible: true, animated: true };
    default:
      return { visible: true, animated: false };
  }
}

/**
 * Living Border — resolve which border elements are alive for this room.
 */
export function evaluateLivingBorder(
  input: LivingBorderInput = {},
): LivingBorderVerdict {
  const placeId: CompanionPlaceId =
    input.placeId ?? resolvePlace({ workspaceId: input.workspaceId });
  const catalog = livingBorderCatalogForPlace(placeId);

  const activeElements = capBorderAnimations(
    catalog.elements.map((id) => {
      const def = borderElement(id);
      const state = resolveVisibility(id, input);
      return {
        ...def,
        visible: state.visible,
        animated: def.mayAnimate && state.animated,
      };
    }),
  );

  const animatedCount = activeElements.filter((e) => e.animated).length;

  const visibleCss = [
    ...new Set(
      activeElements.filter((e) => e.visible).map((e) => e.cssClass),
    ),
  ];

  return {
    placeId,
    principle: LIVING_BORDER_PRINCIPLE,
    experiencePrinciple: LIVING_BORDER_EXPERIENCE_PRINCIPLE,
    centerStable: true,
    mustNotDistract: true,
    activeElements,
    animatedCount,
    recognitionHints: {
      season: input.season ?? null,
      timeOfDay: input.timeOfDay ?? null,
      room: placeId,
    },
    dataAttributes: {
      "data-living-border": placeId,
      "data-living-border-center-stable": "1",
      "data-living-border-subtle": animatedCount <= 3 ? "1" : "0",
      "data-living-border-elements": visibleCss.join(" "),
    },
  };
}

/** Visible DOM hooks for LivingBorderFrame — deduped CSS classes only */
export function visibleBorderRenderClasses(
  verdict: LivingBorderVerdict,
): string[] {
  return [
    ...new Set(
      verdict.activeElements.filter((e) => e.visible).map((e) => e.cssClass),
    ),
  ];
}

export function passesLivingBorderRecognitionTest(
  verdict: LivingBorderVerdict,
): boolean {
  const visibleCount = verdict.activeElements.filter((e) => e.visible).length;
  return (
    visibleCount >= 3 &&
    verdict.recognitionHints.room !== undefined &&
    !centerAllowsBorderLife()
  );
}

export function livingBorderHintForChat(verdict: LivingBorderVerdict): string {
  return [
    "LIVING BORDER — where the home comes alive:",
    verdict.principle,
    verdict.experiencePrinciple,
    `Room: ${verdict.placeId}. Border life visible: ${verdict.activeElements.filter((e) => e.visible).length}. Animated (subtle cap): ${verdict.animatedCount}.`,
    "Never distract. Gently remind: real home, not software.",
    "Life at edges only — guest notices through observation, never explanation.",
  ].join("\n");
}
