/**
 * Canonical Event Record — Events Intelligence runtime object.
 * Connected to Projects via projectHomeId / companionProjectId.
 * Full map lives in the background; conversation reveals one step at a time.
 */

export type EventLifecyclePhase =
  | "discovery"
  | "viability"
  | "strategy"
  | "experience_design"
  | "planning"
  | "preparation"
  | "delivery"
  | "breakdown_closure"
  | "follow_up"
  | "debrief_reuse";

export type EventRuntimeState =
  | "IDEA"
  | "DISCOVERY"
  | "VIABILITY_REVIEW"
  | "STRATEGY"
  | "CONCEPT_APPROVED"
  | "PLANNING"
  | "BOOKING"
  | "PROMOTION"
  | "REGISTRATION_OPEN"
  | "PREPARATION"
  | "REHEARSAL"
  | "READY"
  | "LIVE"
  | "ISSUE_RECOVERY"
  | "BREAKDOWN"
  | "FOLLOW_UP"
  | "DEBRIEF"
  | "REPEAT_DECISION"
  | "COMPLETED"
  | "PAUSED"
  | "CANCELED"
  | "POSTPONED";

export type EventFormat = "in_person" | "virtual" | "hybrid" | "unspecified";

export type EventTypeId =
  | "retreat"
  | "workshop"
  | "webinar"
  | "conference"
  | "summit"
  | "panel"
  | "launch"
  | "networking"
  | "church_community"
  | "community"
  | "training"
  | "fundraiser"
  | "trade_show"
  | "multi_day"
  | "custom";

/**
 * Virtual / hybrid are formats (EventFormat), not separate EventTypeId values.
 * Registry applicability may still key off format for venue vs platform assets.
 */

/** Full background map — never dump all at once in conversation. */
export type EventSectionId =
  | "event_type"
  | "purpose"
  | "audience"
  | "outcomes"
  | "format"
  | "dates"
  | "venue"
  | "budget"
  | "revenue_pricing"
  | "agenda"
  | "speakers"
  | "sponsors"
  | "vendors"
  | "staff"
  | "volunteers"
  | "registration"
  | "marketing"
  | "communications"
  | "attendee_experience"
  | "accessibility"
  | "hospitality"
  | "technology"
  | "production"
  | "day_of_operations"
  | "supplies"
  | "swag"
  | "safety"
  | "contingencies"
  | "run_of_show"
  | "post_event_follow_up"
  | "measurement"
  | "archive_and_reuse"
  | "final_review";

export type EventSection = {
  id: EventSectionId;
  title: string;
  content: string;
  status: "empty" | "drafting" | "confirmed" | "skipped";
};

export type EventTask = {
  id: string;
  title: string;
  sectionId?: EventSectionId;
  done: boolean;
  owner?: string;
  deadline?: string;
  dependsOn?: string[];
  /** Only created after user confirmation or clear appropriateness. */
  confirmed: boolean;
};

export type EventMilestone = {
  id: string;
  title: string;
  due?: string;
  done: boolean;
};

export type EventDecision = {
  id: string;
  decision: string;
  owner?: string;
  deadline?: string;
  resolved: boolean;
  resolvedValue?: string;
};

export type EventRecord = {
  id: string;
  title: string;
  eventType: EventTypeId;
  eventTypeLabel: string;
  purpose: string;
  audience: string;
  outcomes: string;
  format: EventFormat;
  dates: string;
  venue: string;
  budget: string;
  lifecyclePhase: EventLifecyclePhase;
  runtimeState: EventRuntimeState;
  sections: EventSection[];
  tasks: EventTask[];
  milestones: EventMilestone[];
  decisions: EventDecision[];
  dependencies: string[];
  owners: string[];
  nextAction: string;
  activeQuestionId: string | null;
  conversationContext: string;
  projectHomeId: string | null;
  companionProjectId: string | null;
  canonicalWorkId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventFoundationQuestion = {
  id: string;
  sectionId: EventSectionId;
  prompt: string;
  phase: EventLifecyclePhase;
};

export type EventsIntelligenceTurnResult = {
  kind: "start" | "continue" | "domain" | "noop";
  reply: string;
  record: EventRecord | null;
  projectHomeId: string | null;
  projectHomeCreated: boolean;
  retrievalPath: string[];
  /** True when this turn should short-circuit generic chat / Talk It Out. */
  handled: boolean;
};
