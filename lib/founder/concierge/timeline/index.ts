import { SAMPLE_EXECUTIVE_AGENDA } from "../sample/officePreparation";

/** Concierge timeline surfacing — priorities and watch items for today. */
export function getConciergeDayTimeline() {
  return {
    priorities: SAMPLE_EXECUTIVE_AGENDA.priorities,
    watchItems: SAMPLE_EXECUTIVE_AGENDA.watchItems,
    opportunity: SAMPLE_EXECUTIVE_AGENDA.opportunity,
  };
}
