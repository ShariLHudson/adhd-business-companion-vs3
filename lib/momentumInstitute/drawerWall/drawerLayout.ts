/**
 * Momentum Institute — data-driven drawer hotspot layout on wall photograph.
 */

import type { DrawerWallHotspot, DrawerWallLayout } from "./types";
import { PHASE1_DRAWER_IDS } from "./phase1Catalog";

/** Wall art occupies the left portion — frosted chat floats without hiding drawers. */
export const PHASE1_DRAWER_WALL_LAYOUT: DrawerWallLayout = {
  version: "1.0.0-phase1",
  wallRegion: {
    left: 4,
    top: 10,
    width: 58,
    height: 82,
  },
  hotspots: buildPhase1Hotspots(PHASE1_DRAWER_IDS),
};

function buildPhase1Hotspots(drawerIds: string[]): DrawerWallHotspot[] {
  const cols = 6;
  const gapX = 1.2;
  const gapY = 1.4;
  const cellW = (100 - gapX * (cols - 1)) / cols;
  const rows = Math.ceil(drawerIds.length / cols);
  const cellH = (100 - gapY * (rows - 1)) / rows;

  return drawerIds.map((drawerId, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const slug = drawerId.replace(/^drawer-/, "");
    const label = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      drawerId,
      categoryLabel: label,
      catalogLabel: deweyLabel(index),
      x: col * (cellW + gapX),
      y: row * (cellH + gapY),
      width: cellW,
      height: cellH,
      zIndex: index,
    };
  });
}

/** Decorative Dewey-style spine labels — tuned per drawer order. */
function deweyLabel(index: number): string {
  const major = 100 + Math.floor(index / 6) * 10;
  const minor = (index % 6) + 1;
  return `${major}.${minor}`;
}

export function hotspotForDrawer(
  layout: DrawerWallLayout,
  drawerId: string,
): DrawerWallHotspot | null {
  return layout.hotspots.find((h) => h.drawerId === drawerId) ?? null;
}

export function drawerIdFromSlug(slug: string): string {
  return slug.startsWith("drawer-") ? slug : `drawer-${slug}`;
}

export function drawerSlugFromId(drawerId: string): string {
  return drawerId.replace(/^drawer-/, "");
}
