/**
 * Momentum Institute™ Drawer Wall™ — resolve catalog + layout; future Estate Intelligence hooks.
 */

import {
  getDrawerById,
  getKnowledgeCardById,
  listExperiencesForKnowledgeCard,
  listKnowledgeCardsForDrawer,
} from "../catalog/provider";
import { drawerIdFromSlug, drawerSlugFromId } from "./drawerLayout";
import { PHASE1_DRAWER_WALL_LAYOUT } from "./drawerLayout";
import type {
  DrawerWallLayout,
  InstituteDrawerWallCommand,
  InstituteDrawerWallState,
  KnowledgeCardPanelModel,
  ResolvedDrawerWallItem,
} from "./types";

export const INITIAL_DRAWER_WALL_STATE: InstituteDrawerWallState = {
  openDrawerId: null,
  openKnowledgeCardId: null,
  hoveredDrawerId: null,
};

export function reduceDrawerWallState(
  state: InstituteDrawerWallState,
  command: InstituteDrawerWallCommand,
): InstituteDrawerWallState {
  switch (command.type) {
    case "open_drawer":
      return {
        ...state,
        openDrawerId: command.drawerId,
        openKnowledgeCardId: null,
      };
    case "open_knowledge_card":
      return {
        ...state,
        openKnowledgeCardId: command.knowledgeCardId,
      };
    case "close_drawer":
      return {
        ...state,
        openDrawerId: null,
        openKnowledgeCardId: null,
      };
    case "close_knowledge_card":
      return {
        ...state,
        openKnowledgeCardId: null,
      };
    default:
      return state;
  }
}

export function resolveDrawerWallItems(
  layout: DrawerWallLayout = PHASE1_DRAWER_WALL_LAYOUT,
): ResolvedDrawerWallItem[] {
  return layout.hotspots
    .map((hotspot) => {
      const drawer = getDrawerById(hotspot.drawerId);
      if (!drawer) return null;
      return {
        hotspot,
        drawer,
        knowledgeCards: listKnowledgeCardsForDrawer(drawer.id),
      };
    })
    .filter((item): item is ResolvedDrawerWallItem => item != null);
}

export function resolveKnowledgeCardPanel(
  knowledgeCardId: string,
): KnowledgeCardPanelModel | null {
  const card = getKnowledgeCardById(knowledgeCardId);
  if (!card) return null;
  const drawer = getDrawerById(card.drawerId);
  if (!drawer) return null;
  return {
    card,
    drawer,
    experiences: listExperiencesForKnowledgeCard(card.id),
  };
}

/** Estate Intelligence™ — resolve drawer from member language (Phase 1 keyword match). */
export function matchDrawerIdForMemberText(text: string): string | null {
  const normalized = text.toLowerCase();
  const items = resolveDrawerWallItems();
  for (const item of items) {
    const slug = drawerSlugFromId(item.drawer.id);
    const title = item.drawer.title.toLowerCase();
    if (normalized.includes(slug.replace(/-/g, " ")) || normalized.includes(title)) {
      return item.drawer.id;
    }
  }
  if (/\bconfidence\b/.test(normalized)) return drawerIdFromSlug("confidence");
  if (/\bnetwork/.test(normalized)) return drawerIdFromSlug("networking");
  if (/\bcustomer|psychology|why people buy\b/.test(normalized)) {
    return drawerIdFromSlug("customer-psychology");
  }
  if (/\bmarket/.test(normalized)) return drawerIdFromSlug("marketing");
  if (/\bpricing\b/.test(normalized)) return drawerIdFromSlug("pricing");
  return null;
}

export function instituteDrawerInvitationLine(drawerId: string): string | null {
  const drawer = getDrawerById(drawerId);
  if (!drawer) return null;
  return `I have just the drawer for that — ${drawer.title}. Would you like me to open it?`;
}
