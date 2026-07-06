import {
  SAMPLE_DRAWER_SECTIONS,
  SAMPLE_MORNING_GREETING,
  SAMPLE_QUICK_WINS,
  SAMPLE_REMINDERS,
} from "../sample/officePreparation";
import type { PreparedOffice } from "../types";
import {
  getSampleAgenda,
  getSampleExecutiveRecommendation,
  getSamplePrimaryMessage,
  getSampleThinkingSpaceSuggestion,
  getSampleWorkspaceSuggestion,
} from "../recommendations";

/** Assembles the prepared executive office — sample data only. */
export function prepareOfficePreparation(): PreparedOffice {
  const agenda = getSampleAgenda();
  return {
    greeting: SAMPLE_MORNING_GREETING,
    primaryMessage: getSamplePrimaryMessage(),
    agenda,
    workspaceSuggestion: getSampleWorkspaceSuggestion(),
    thinkingSpace: getSampleThinkingSpaceSuggestion(),
    reminders: SAMPLE_REMINDERS,
    quickWins: SAMPLE_QUICK_WINS,
    watchItems: agenda.watchItems,
    drawer: SAMPLE_DRAWER_SECTIONS,
    preparedAt: new Date().toISOString(),
  };
}
