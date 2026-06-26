/**
 * Living Border™ — constitutional rules.
 */

import type { EdgeZone } from "@/lib/roomCompositionRule";

/** Center never hosts living border evolution */
export const CENTER_BORDER_FORBIDDEN = true;

/** Border elements may change; center workspace panel stays visually calm */
export const BORDER_CHANGE_ALLOWED = true;

export const BORDER_MOTION_ZONES: EdgeZone[] = ["left", "right", "top", "bottom"];

export function borderAllowsMotion(zone: EdgeZone): boolean {
  return BORDER_MOTION_ZONES.includes(zone);
}

export function centerAllowsBorderLife(): false {
  return false;
}

/** Success test — if center 60% hidden, frame should still convey place */
export const RECOGNITION_FRAME_VISIBLE_RATIO = 0.4;

/** Subtle movement cap — border never distracts from guest work */
export const MAX_SIMULTANEOUS_BORDER_ANIMATIONS = 3;

export function capBorderAnimations<T extends { animated: boolean }>(
  elements: T[],
  max = MAX_SIMULTANEOUS_BORDER_ANIMATIONS,
): T[] {
  let animatedSlots = 0;
  return elements.map((element) => {
    if (!element.animated) return element;
    if (animatedSlots >= max) {
      return { ...element, animated: false };
    }
    animatedSlots += 1;
    return element;
  });
}
