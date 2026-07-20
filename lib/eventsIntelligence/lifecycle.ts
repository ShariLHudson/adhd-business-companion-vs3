import type {
  EventFoundationQuestion,
  EventLifecyclePhase,
  EventRecord,
  EventRuntimeState,
  EventSectionId,
  EventTypeId,
} from "./types";
import { getEventSection } from "./eventSections";

export const EVENT_LIFECYCLE_PHASES: readonly EventLifecyclePhase[] = [
  "discovery",
  "viability",
  "strategy",
  "experience_design",
  "planning",
  "preparation",
  "delivery",
  "breakdown_closure",
  "follow_up",
  "debrief_reuse",
] as const;

export function phaseToRuntimeState(phase: EventLifecyclePhase): EventRuntimeState {
  switch (phase) {
    case "discovery":
      return "DISCOVERY";
    case "viability":
      return "VIABILITY_REVIEW";
    case "strategy":
      return "STRATEGY";
    case "experience_design":
      return "CONCEPT_APPROVED";
    case "planning":
      return "PLANNING";
    case "preparation":
      return "PREPARATION";
    case "delivery":
      return "LIVE";
    case "breakdown_closure":
      return "BREAKDOWN";
    case "follow_up":
      return "FOLLOW_UP";
    case "debrief_reuse":
      return "DEBRIEF";
    default:
      return "DISCOVERY";
  }
}

/** One material foundation question at a time (EI-005 / EI-W601). */
export function foundationQuestionsForType(
  eventType: EventTypeId,
): EventFoundationQuestion[] {
  const outcomePrompt =
    eventType === "retreat"
      ? "What should people leave this retreat with — the one outcome that would make the weekend feel successful?"
      : eventType === "webinar" || eventType === "workshop"
        ? "What should attendees be able to do or know by the end?"
        : "What is the primary outcome that would make this event worth doing?";

  return [
    {
      id: "q-outcomes",
      sectionId: "outcomes",
      prompt: outcomePrompt,
      phase: "discovery",
    },
    {
      id: "q-audience",
      sectionId: "audience",
      prompt: "Who is this gathering for — and who is it not for?",
      phase: "discovery",
    },
    {
      id: "q-purpose",
      sectionId: "purpose",
      prompt: "In one sentence, why does this event need to exist?",
      phase: "discovery",
    },
    {
      id: "q-format",
      sectionId: "format",
      prompt: "Will this be in person, virtual, or hybrid?",
      phase: "viability",
    },
    {
      id: "q-dates",
      sectionId: "dates",
      prompt: "Do you have dates in mind, or a season you're aiming for?",
      phase: "viability",
    },
    {
      id: "q-budget",
      sectionId: "budget",
      prompt: "Is there a budget range — even a rough one — or are we designing around what's possible?",
      phase: "viability",
    },
    {
      id: "q-venue",
      sectionId: "venue",
      prompt: "Do you already have a venue or platform in mind, or should we define what the space needs to do first?",
      phase: "planning",
    },
  ];
}

export function nextFoundationQuestion(
  record: EventRecord,
): EventFoundationQuestion | null {
  const questions = foundationQuestionsForType(record.eventType);
  for (const q of questions) {
    if (q.sectionId === "format" && record.format !== "unspecified") continue;
    const section = getEventSection(record.sections, q.sectionId);
    if (!section?.content.trim()) return q;
  }
  return null;
}

export function sectionFilled(record: EventRecord, id: EventSectionId): boolean {
  return Boolean(getEventSection(record.sections, id)?.content.trim());
}

export function inferNextAction(record: EventRecord): string {
  const next = nextFoundationQuestion(record);
  if (next) return `Confirm ${next.sectionId.replace(/_/g, " ")}`;
  if (!sectionFilled(record, "agenda")) return "Sketch a simple agenda";
  if (!sectionFilled(record, "run_of_show")) return "Draft run of show";
  return "Review open decisions and next milestone";
}
