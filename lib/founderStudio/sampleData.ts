/**
 * @deprecated Import from `@/lib/founder` services instead.
 * Kept for backward compatibility during Phase 2 migration.
 */
import { getTodayBrief } from "@/lib/founder/briefs";
import { getTeamHubSections } from "@/lib/founder/teamhub";
import { getRoomCards } from "@/lib/founder/services/roomContentService";

const brief = () => getTodayBrief();

export const FOUNDER_HOME_GLANCE = brief().glance;
export const FOUNDER_BEST_IDEA = brief().bestIdea;
export const FOUNDER_CURSOR_PRIORITIES = brief().priorities;
export const FOUNDER_CUSTOMER_PULSE = brief().customerSignals;
export const FOUNDER_TREND_RADAR = brief().trends;
export const FOUNDER_REVENUE_OPPORTUNITY = brief().revenueOpportunity;
export const FOUNDER_IGNORE_TODAY = brief().ignoreItems.map((i) => i.summary);
export const TEAM_HUB_SECTIONS = getTeamHubSections();

export function sampleRoomCards(roomId: string) {
  return getRoomCards(roomId);
}

export const CREATION_STUDIO_CARDS = getRoomCards("creation-studio");
export const AUTOMATION_STUDIO_CARDS = getRoomCards("automation-studio");
export const KNOWLEDGE_LIBRARY_CARDS = getRoomCards("knowledge-library");
