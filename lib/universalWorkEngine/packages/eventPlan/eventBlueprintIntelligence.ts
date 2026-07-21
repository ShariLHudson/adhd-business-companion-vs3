/**
 * Event Work Type — Blueprint Intelligence package (100).
 * Domain suggestions only; no expert names in member-facing copy.
 */

import type { BlueprintDefinition } from "../../blueprints/types";
import { registerBlueprintIntelligencePackage } from "../../blueprints/intelligence/intelligencePackages";
import type { BlueprintHealthFinding } from "../../blueprints/intelligence/intelligenceTypes";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/eventPlanMap";

const EVENT_HINTS: { match: RegExp; id: string; title: string; why: string }[] = [
  {
    match: /connection|networking|mixer/i,
    id: "event-has-connection-design",
    title: "Connection design is present",
    why: "Networking events succeed when how people meet is planned on purpose.",
  },
  {
    match: /learning|practice|facilitat|activity|workbook/i,
    id: "event-has-learning-practice",
    title: "Learning and practice design is present",
    why: "Workshops succeed when practice and facilitation are planned, not only content.",
  },
  {
    match: /webinar|replay|moderator|poll|caption/i,
    id: "event-has-webinar-production",
    title: "Webinar production thinking is present",
    why: "Webinars succeed with rehearsal, moderation, engagement, and a clear replay path.",
  },
  {
    match: /retreat|lodging|wellness|downtime|integration/i,
    id: "event-has-retreat-care",
    title: "Retreat care and rhythm thinking is present",
    why: "Retreats succeed when rest, lodging, care, and follow-through are planned on purpose.",
  },
  {
    match: /conference|track|sponsor|exhibitor|keynote|badge/i,
    id: "event-has-conference-ops",
    title: "Conference operations thinking is present",
    why: "Conferences succeed when program, sponsors, production, and attendee journey are planned together.",
  },
  {
    match: /summit|executive|vip|roundtable|keynote|strategic/i,
    id: "event-has-summit-alignment",
    title: "Summit alignment thinking is present",
    why: "Summits succeed when vision, VIP care, program quality, and follow-through are planned together.",
  },
  {
    match: /launch|offer|demo|checkout|onboarding|affiliate|messaging|positioning/i,
    id: "event-has-product-launch",
    title: "Product launch thinking is present",
    why: "Launches succeed when offer clarity, demo readiness, conversion path, and customer success are planned together.",
  },
  {
    match: /book launch|reading|signing|bookseller|preorder|author|readership/i,
    id: "event-has-book-launch",
    title: "Book launch thinking is present",
    why: "Book launches succeed when author care, reader journey, inventory, and follow-through are planned together.",
  },
  {
    match: /challenge|daily|accountability|check-in|habit|missed-day|completion/i,
    id: "event-has-challenge-rhythm",
    title: "Challenge rhythm thinking is present",
    why: "Challenges succeed when daily action, accountability, recovery, and completion are planned together.",
  },
  {
    match: /masterclass|promise|curriculum|demonstration|implementation|worksheet|learning outcome/i,
    id: "event-has-masterclass-depth",
    title: "Masterclass depth thinking is present",
    why: "Masterclasses succeed when expert teaching, demos, guided implementation, and follow-through are planned together.",
  },
  {
    match: /risk|contingency/i,
    id: "event-has-risk",
    title: "Risk thinking is present",
    why: "Events benefit from a clear plan when something unexpected happens.",
  },
  {
    match: /follow[- ]?up|thank/i,
    id: "event-has-followup",
    title: "Follow-up is present",
    why: "A follow-up section helps the event continue to create value after the day ends.",
  },
  {
    match: /run of show|agenda|program/i,
    id: "event-has-run",
    title: "Program flow is present",
    why: "A clear run of show or agenda keeps the day easier to host.",
  },
  {
    match: /feedback|survey|evaluation/i,
    id: "event-has-feedback",
    title: "Feedback is present",
    why: "Feedback helps you improve the next event without guessing.",
  },
];

const EVENT_SUGGEST_IF_MISSING: {
  id: string;
  test: (titles: string) => boolean;
  title: string;
  why: string;
}[] = [
  {
    id: "event-suggest-risk",
    test: (t) => !/risk|contingency/i.test(t),
    title: "Consider a risk or contingency section",
    why: "Events often need a calm plan for weather, no-shows, or tech trouble.",
  },
  {
    id: "event-suggest-volunteer",
    test: (t) => !/volunteer/i.test(t),
    title: "Consider volunteer communication",
    why: "If people help on the day, a short communication section prevents last-minute scramble.",
  },
  {
    id: "event-suggest-accessibility",
    test: (t) => !/accessib/i.test(t),
    title: "Consider accessibility",
    why: "A dedicated accessibility note helps more people attend comfortably.",
  },
  {
    id: "event-suggest-followup",
    test: (t) => !/follow[- ]?up|thank|feedback/i.test(t),
    title: "Follow-up section may be missing",
    why: "After the event, a clear follow-up path turns the day into lasting relationships.",
  },
  {
    id: "event-suggest-connection-support",
    test: (t) => !/connection|alone|facilitat|host/i.test(t),
    title: "Consider host support for alone or shy guests",
    why: "Networking events often leave people stranded without a clear first conversation.",
  },
  {
    id: "event-suggest-practice-debrief",
    test: (t) => !/practice|activity|debrief|exercise/i.test(t),
    title: "Consider practice and debrief space",
    why: "Workshops often overload content and leave too little time to practice or reflect.",
  },
  {
    id: "event-suggest-rehearsal-moderator",
    test: (t) => !/rehearsal|moderator|replay|tech/i.test(t),
    title: "Consider rehearsal and moderator support",
    why: "Webinars often fail from untested tech or an unmanaged chat and Q&A.",
  },
  {
    id: "event-suggest-rest-integration",
    test: (t) => !/rest|downtime|quiet|integration|lodging/i.test(t),
    title: "Consider rest, lodging, and integration",
    why: "Retreats often pack the schedule and leave no quiet space or return plan.",
  },
  {
    id: "event-suggest-speaker-sponsor-ops",
    test: (t) => !/speaker|sponsor|exhibitor|av|wayfinding|badge/i.test(t),
    title: "Consider speakers, sponsors, and production ops",
    why: "Conferences often underplan green rooms, sponsor deliverables, and attendee wayfinding.",
  },
  {
    id: "event-suggest-vip-followthrough",
    test: (t) => !/vip|executive|briefing|commitment|follow/i.test(t),
    title: "Consider VIP care and post-summit commitments",
    why: "Summits often underplan executive briefings and who owns decisions afterward.",
  },
  {
    id: "event-suggest-launch-conversion",
    test: (t) => !/demo|checkout|onboarding|offer|affiliate|messaging/i.test(t),
    title: "Consider demo, checkout, and onboarding readiness",
    why: "Product launches often underplan rehearsal, payment testing, and what happens after someone buys.",
  },
  {
    id: "event-suggest-book-launch-ops",
    test: (t) => !/reading|signing|bookseller|inventory|preorder|author/i.test(t),
    title: "Consider reading, signing, and bookseller ops",
    why: "Book launches often underplan inventory, signing flow, and what happens after readers leave.",
  },
  {
    id: "event-suggest-challenge-retention",
    test: (t) => !/accountability|check-in|missed|daily|habit|reminder/i.test(t),
    title: "Consider daily accountability and missed-day recovery",
    why: "Challenges often underplan reminders, check-ins, and what happens when someone falls behind.",
  },
  {
    id: "event-suggest-masterclass-implementation",
    test: (t) => !/implementation|demonstration|worksheet|curriculum|promise|pre-work/i.test(t),
    title: "Consider demos, worksheets, and guided implementation",
    why: "Masterclasses often underplan practice time and what people do after the teaching ends.",
  },
];

function evaluateDomainFindings(
  blueprint: BlueprintDefinition,
): readonly BlueprintHealthFinding[] {
  const sections = blueprint.sections.filter((s) => !s.softDeleted);
  const titles = sections.map((s) => s.title).join(" · ");
  const findings: BlueprintHealthFinding[] = [];

  for (const hint of EVENT_HINTS) {
    if (!hint.match.test(titles)) continue;
    findings.push({
      id: hint.id,
      kind: "domain",
      severity: "ok",
      title: hint.title,
      why: hint.why,
      affectsExistingWorks: false,
      createsNewVersion: false,
      evidenceFingerprint: `${hint.id}|${blueprint.version}`,
    });
  }

  for (const suggest of EVENT_SUGGEST_IF_MISSING) {
    if (!suggest.test(titles)) continue;
    findings.push({
      id: suggest.id,
      kind: "missing_element",
      severity: "advisory",
      title: suggest.title,
      why: suggest.why,
      expectedImpact: "Optional improvement for the next published version.",
      affectsExistingWorks: false,
      createsNewVersion: true,
      evidenceFingerprint: `${suggest.id}|${titles.slice(0, 80)}`,
    });
  }

  return findings;
}

export function ensureEventBlueprintIntelligenceRegistered(): void {
  registerBlueprintIntelligencePackage({
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
    evaluateDomainFindings,
  });
}
