import { prepareOfficePreparation } from "../preparation";
import {
  getSampleAgenda,
  getSampleExecutiveRecommendation,
  getSamplePrimaryMessage,
  getSampleThinkingSpaceSuggestion,
  getSampleWorkspaceSuggestion,
} from "../recommendations";
import {
  SAMPLE_MORNING_GREETING,
  SAMPLE_QUICK_WINS,
  SAMPLE_REMINDERS,
} from "../sample/officePreparation";
import type { PreparedOffice } from "../types";

/** Executive Concierge — prepares Founder Studio before Shari arrives. */
export const ExecutiveConciergeService = {
  prepareOffice(): PreparedOffice {
    return prepareOfficePreparation();
  },

  getMorningGreeting(): string {
    return SAMPLE_MORNING_GREETING;
  },

  getExecutiveRecommendation() {
    return getSampleExecutiveRecommendation();
  },

  getSuggestedWorkspace() {
    return getSampleWorkspaceSuggestion();
  },

  getSuggestedThinkingSpace() {
    return getSampleThinkingSpaceSuggestion();
  },

  getExecutiveAgenda() {
    return getSampleAgenda();
  },

  getQuickWins() {
    return SAMPLE_QUICK_WINS;
  },

  getWatchItems() {
    return getSampleAgenda().watchItems;
  },

  getPrimaryMessage() {
    return getSamplePrimaryMessage();
  },

  getReminders() {
    return SAMPLE_REMINDERS;
  },
};

export function prepareOffice(): PreparedOffice {
  return ExecutiveConciergeService.prepareOffice();
}

export function getMorningGreeting(): string {
  return ExecutiveConciergeService.getMorningGreeting();
}

export function getExecutiveConciergeRecommendation() {
  return ExecutiveConciergeService.getExecutiveRecommendation();
}

export function getSuggestedWorkspace() {
  return ExecutiveConciergeService.getSuggestedWorkspace();
}

export function getSuggestedThinkingSpace() {
  return ExecutiveConciergeService.getSuggestedThinkingSpace();
}

export function getExecutiveAgenda() {
  return ExecutiveConciergeService.getExecutiveAgenda();
}

export function getConciergeQuickWins() {
  return ExecutiveConciergeService.getQuickWins();
}

export function getConciergeWatchItems() {
  return ExecutiveConciergeService.getWatchItems();
}
