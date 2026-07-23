/**
 * Success criteria shown before each Founder Validation journey.
 */

import type { CertificationJourneyId } from "@/lib/createCertification";
import { CERTIFICATION_JOURNEYS } from "@/lib/createCertification";
import type { JourneySuccessCriterion } from "./types";

const CRITERIA: Record<CertificationJourneyId, JourneySuccessCriterion[]> = {
  "J-001": [
    { id: "same_record", label: "Same Event Record after leave → return" },
    { id: "same_focus", label: "Same Current Focus restored" },
    { id: "same_rec", label: "Same primary Recommendation" },
    { id: "continuous", label: "Conversation feels continuous (welcome-back bridge)" },
    { id: "agenda", label: "Agenda created advances lifecycle" },
    { id: "no_dup", label: "No duplicate Event Records" },
  ],
  "J-002": [
    { id: "nl_entry", label: "Create natural language reaches Creation Platform" },
    { id: "same_ws", label: "Same Event Workspace as existing work" },
    { id: "no_dup", label: "No duplicate records" },
  ],
  "J-003": [
    { id: "continue", label: "Projects Continue opens same Event" },
    { id: "same_rec", label: "Same Recommendation" },
    { id: "lifecycle", label: "Same Lifecycle state" },
  ],
  "J-004": [
    { id: "landing", label: "Marketing → Landing attaches to existing Event" },
    { id: "same_ws", label: "Same Workspace (not a new orphan)" },
  ],
  "J-005": [
    { id: "search", label: "Search → Workshop opens existing workspace" },
    { id: "no_dup", label: "Never creates duplicates" },
  ],
  "J-006": [
    { id: "refresh", label: "Refresh restores Workspace + Current Focus" },
    { id: "restart", label: "Browser restart / tab close restores context" },
    { id: "orient", label: "Member immediately knows where they are" },
  ],
  "J-007": [
    { id: "zoom", label: "150% zoom — Current Focus reachable" },
    { id: "keyboard", label: "Keyboard navigation works" },
    { id: "scroll", label: "Scroll / touchpad — no permanent dead zones" },
  ],
  "J-008": [
    { id: "same_id", label: "Workshop → Webinar → Conference keeps same Event Record id" },
    { id: "recs", label: "Recommendations update" },
    { id: "lifecycle", label: "Lifecycle preserved" },
    { id: "rels", label: "Relationships preserved" },
  ],
  TRUST: [
    { id: "discover", label: "Discover → plan event" },
    { id: "leave_return", label: "Leave → return with continuity" },
    { id: "type_change", label: "Type change same record" },
    { id: "agenda_landing_mkt", label: "Agenda → Landing → Marketing same lineage" },
    { id: "week_later", label: "Return next week still trustworthy" },
    { id: "complete_archive_v2", label: "Complete → Archive → Version 2" },
    { id: "emotional", label: "All eight emotional quality questions = yes" },
    { id: "truth", label: "Shari never promised uncreated work" },
  ],
};

export function getJourneySuccessCriteria(
  journeyId: CertificationJourneyId,
): JourneySuccessCriterion[] {
  return CRITERIA[journeyId] ?? [];
}

export function getJourneyDefinition(journeyId: CertificationJourneyId) {
  return CERTIFICATION_JOURNEYS.find((j) => j.id === journeyId) ?? null;
}

export function listValidationJourneyIds(): CertificationJourneyId[] {
  return CERTIFICATION_JOURNEYS.map((j) => j.id);
}
