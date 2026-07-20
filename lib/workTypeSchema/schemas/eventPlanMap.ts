/**
 * Leaf data only — no imports from Create runtime (avoids circular deps).
 * Event Plan Full Workshop Map section order (080).
 */

import type { WorkTypeMapSectionDef } from "../types";

export const EVENT_PLAN_MAP_SECTIONS: readonly WorkTypeMapSectionDef[] = [
  { id: "event_type", title: "Event Type" },
  { id: "purpose", title: "Purpose" },
  { id: "outcomes", title: "Outcomes" },
  { id: "audience", title: "Audience" },
  { id: "format", title: "Format" },
  { id: "dates", title: "Date and Time" },
  { id: "venue", title: "Venue or Online Platform" },
  { id: "budget", title: "Budget" },
  { id: "revenue_pricing", title: "Revenue and Pricing" },
  { id: "agenda", title: "Program and Agenda" },
  { id: "speakers", title: "Speakers and Facilitators" },
  { id: "attendee_experience", title: "Attendee Experience" },
  { id: "registration", title: "Registration" },
  { id: "marketing", title: "Marketing" },
  { id: "sponsors", title: "Sponsors" },
  { id: "vendors", title: "Vendors" },
  { id: "staff", title: "Team" },
  { id: "volunteers", title: "Volunteers and Team" },
  { id: "technology", title: "Equipment and Technology" },
  { id: "accessibility", title: "Accessibility" },
  { id: "hospitality", title: "Food and Hospitality" },
  { id: "swag", title: "Swag and Materials" },
  { id: "supplies", title: "Supplies" },
  { id: "safety", title: "Safety" },
  { id: "contingencies", title: "Risk and Contingencies" },
  { id: "run_of_show", title: "Run of Show" },
  { id: "communications", title: "Communication Plan" },
  { id: "production", title: "Production" },
  { id: "day_of_operations", title: "Day-of Operations" },
  { id: "post_event_follow_up", title: "Follow-Up" },
  { id: "measurement", title: "Evaluation" },
  { id: "archive_and_reuse", title: "Archive and Reuse" },
  { id: "final_review", title: "Final Review" },
];

export const EVENT_PLAN_DEFAULT_FOCUS: readonly string[] = [
  "event_type",
  "outcomes",
  "audience",
  "purpose",
  "format",
  "dates",
  "venue",
  "budget",
];

export const EVENT_PLAN_WORK_TYPE_ID = "event_plan" as const;
