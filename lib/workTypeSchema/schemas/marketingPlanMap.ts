/**
 * Leaf data only — no imports from Create runtime (avoids circular deps).
 * Marketing Plan section order (105).
 */

import type { WorkTypeMapSectionDef } from "../types";

export const MARKETING_PLAN_MAP_SECTIONS: readonly WorkTypeMapSectionDef[] = [
  { id: "purpose_outcome", title: "Purpose and Desired Outcome" },
  { id: "business_offer", title: "Business and Offer" },
  { id: "people_to_reach", title: "People You Want to Reach" },
  { id: "current_situation", title: "Where Things Stand Now" },
  { id: "positioning_message", title: "Positioning and Core Message" },
  { id: "marketing_goals", title: "Marketing Goals" },
  { id: "channels", title: "Channels and Places to Show Up" },
  { id: "content_approach", title: "Content and Communication" },
  { id: "offer_path", title: "Offer Path and Calls to Action" },
  { id: "activity_plan", title: "Simple Activity Plan" },
  { id: "capacity", title: "Budget, Time, and Energy" },
  { id: "measures", title: "Measures and Signals" },
  { id: "risks_assumptions", title: "Risks, Assumptions, and Gaps" },
  { id: "next_actions", title: "Next Actions" },
  { id: "review_rhythm", title: "Review and Improvement Rhythm" },
  { id: "final_plan", title: "Final Plan and Deliverables" },
];

export const MARKETING_PLAN_DEFAULT_FOCUS: readonly string[] = [
  "purpose_outcome",
  "business_offer",
  "people_to_reach",
  "channels",
  "next_actions",
  "measures",
];

export const MARKETING_PLAN_WORK_TYPE_ID = "marketing_plan" as const;
