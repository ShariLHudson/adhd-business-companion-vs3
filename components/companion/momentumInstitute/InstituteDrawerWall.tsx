"use client";

import type { KnowledgeCardViewModel } from "@/lib/momentumInstitute/drawerWall/knowledgeCardViewModel";
import type { DrawerWallHotspot } from "@/lib/momentumInstitute/drawerWall/types";
import { InstituteDrawerIndexStack } from "@/components/companion/momentumInstitute/InstituteDrawerIndexStack";
import { InstituteWallPhotoPlate } from "@/components/companion/momentumInstitute/InstituteWallPhotoPlate";

type DrawerItem = {
  hotspot: DrawerWallHotspot;
  drawerTitle: string;
  cardCount: number;
  cardViewModels: KnowledgeCardViewModel[];
};

type Props = {
  wallRegion: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  items: DrawerItem[];
  openDrawerId: string | null;
  openKnowledgeCardId: string | null;
  hoveredDrawerId: string | null;
  onHover: (drawerId: string | null) => void;
  onOpenDrawer: (drawerId: string) => void;
  onSelectCard: (knowledgeCardId: string) => void;
  onCloseDrawer: () => void;
};

export function InstituteDrawerWall({
  wallRegion,
  items,
  openDrawerId,
  openKnowledgeCardId,
  hoveredDrawerId,
  onHover,
  onOpenDrawer,
  onSelectCard,
  onCloseDrawer,
}: Props) {
  return (
    <InstituteWallPhotoPlate>
      <div
        className="institute-drawer-wall"
        style={{
          left: `${wallRegion.left}%`,
          top: `${wallRegion.top}%`,
          width: `${wallRegion.width}%`,
          height: `${wallRegion.height}%`,
        }}
        data-testid="institute-drawer-wall"
      >
        {items.map(({ hotspot, drawerTitle, cardCount, cardViewModels }) => {
          const isOpen = openDrawerId === hotspot.drawerId;
          const isHovered = hoveredDrawerId === hotspot.drawerId;
          return (
            <button
              key={hotspot.drawerId}
              type="button"
              className={[
                "institute-drawer-wall__drawer",
                isHovered ? "institute-drawer-wall__drawer--hover" : "",
                isOpen ? "institute-drawer-wall__drawer--open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
                zIndex: isOpen ? 24 : (hotspot.zIndex ?? 1),
              }}
              aria-label={`Open ${drawerTitle} drawer — ${cardCount} index cards`}
              aria-expanded={isOpen}
              onMouseEnter={() => onHover(hotspot.drawerId)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(hotspot.drawerId)}
              onBlur={() => onHover(null)}
              onClick={() => onOpenDrawer(hotspot.drawerId)}
            >
              <span className="institute-drawer-wall__drawer-face" aria-hidden>
                <span className="institute-drawer-wall__catalog-label">
                  {hotspot.catalogLabel}
                </span>
                <span className="institute-drawer-wall__handle" />
                <span className="institute-drawer-wall__hover-glow" aria-hidden />
              </span>
              <span className="institute-drawer-wall__drawer-title">
                {drawerTitle}
              </span>

              {isOpen ? (
                <InstituteDrawerIndexStack
                  drawerTitle={drawerTitle}
                  cards={cardViewModels}
                  openKnowledgeCardId={openKnowledgeCardId}
                  onSelectCard={onSelectCard}
                  onClose={onCloseDrawer}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </InstituteWallPhotoPlate>
  );
}
