export type GardenBannerDropdownSide = "left" | "right";

export type RectSize = {
  width: number;
  height: number;
};

const EDGE_PADDING = 10;
const GAP_PX = 14;

/** Place dropdown toward the pathway center; flip if it would leave the viewport. */
export function computeGardenBannerDropdownPosition(
  anchor: DOMRect,
  menu: RectSize,
  side: GardenBannerDropdownSide,
  viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280,
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800,
): { top: number; left: number } {
  const menuWidth = menu.width > 0 ? menu.width : 280;
  const menuHeight = menu.height > 0 ? menu.height : 420;

  let left =
    side === "left"
      ? anchor.right + GAP_PX
      : anchor.left - menuWidth - GAP_PX;

  if (side === "left" && left + menuWidth > viewportWidth - EDGE_PADDING) {
    left = anchor.left - menuWidth - GAP_PX;
  } else if (side === "right" && left < EDGE_PADDING) {
    left = anchor.right + GAP_PX;
  }

  left = Math.max(EDGE_PADDING, Math.min(left, viewportWidth - menuWidth - EDGE_PADDING));

  let top = anchor.top + anchor.height * 0.08;
  if (top + menuHeight > viewportHeight - EDGE_PADDING) {
    top = viewportHeight - menuHeight - EDGE_PADDING;
  }
  if (top < EDGE_PADDING) {
    top = EDGE_PADDING;
  }

  return { top, left };
}
