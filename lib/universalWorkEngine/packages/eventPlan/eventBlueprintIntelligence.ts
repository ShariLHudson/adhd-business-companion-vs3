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
