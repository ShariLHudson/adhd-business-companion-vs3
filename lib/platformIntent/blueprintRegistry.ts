/**
 * 046 — Create Blueprint Registry
 * One owner per blueprint. Aliases point to the owner. No duplicates.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { CreateBlueprint } from "./types";

const BLUEPRINTS: CreateBlueprint[] = [
  {
    id: "bp-retreat-event",
    label: "Retreat Event",
    catalogType: "Event Plan",
    ownerChamberMemberId: "events",
    aliases: [
      "retreat",
      "retreat weekend",
      "retreat event",
      "weekend retreat",
    ],
    purpose: "Plan a restorative or immersive retreat gathering.",
    expectedOutcome: "A complete retreat plan ready to execute.",
    projectIntegration: "complex",
    visibleThinking: "helpful",
    specialtyRuntime: "events",
    ecosystemId: "eco-retreat-weekend",
  },
  {
    id: "bp-event-plan",
    label: "Event Plan",
    catalogType: "Event Plan",
    ownerChamberMemberId: "events",
    aliases: [
      // Longer gathering phrases must outrank Marketing "product launch"
      "product launch event",
      "launch event",
      "launch party",
      "event",
      "conference",
      "summit",
      "panel",
      "networking event",
      "gathering",
      "meetup",
      "webinar",
      "workshop event",
    ],
    purpose: "Plan any gathering people will attend.",
    expectedOutcome: "An event plan with foundation and next steps.",
    projectIntegration: "complex",
    visibleThinking: "helpful",
    specialtyRuntime: "events",
    ecosystemId: "eco-event-plan",
  },
  {
    id: "bp-workshop",
    label: "Workshop",
    catalogType: "Workshop",
    ownerChamberMemberId: "events",
    aliases: ["workshop", "masterclass", "training session"],
    purpose: "Design a workshop people can learn from.",
    expectedOutcome: "A workshop outline ready to facilitate.",
    projectIntegration: "complex",
    visibleThinking: "helpful",
    specialtyRuntime: "events",
    ecosystemId: "eco-workshop",
  },
  {
    id: "bp-launch-plan",
    label: "Product Launch",
    catalogType: "Launch Plan",
    ownerChamberMemberId: "marketing",
    // GTM / offer launch only — never steal "…launch event" gatherings
    aliases: ["launch plan", "go to market launch", "gtm launch"],
    purpose: "Plan a product or offer launch.",
    expectedOutcome: "A launch plan with sequence and messaging.",
    projectIntegration: "complex",
    visibleThinking: "recommended",
    ecosystemId: "eco-launch",
  },
  {
    id: "bp-email-campaign",
    label: "Email Campaign",
    catalogType: "Email Campaign",
    ownerChamberMemberId: "marketing",
    aliases: ["email campaign", "email sequence", "nurture sequence"],
    purpose: "Build an email sequence that moves people forward.",
    expectedOutcome: "A campaign outline with key emails.",
    projectIntegration: "simple",
    visibleThinking: "helpful",
  },
  {
    id: "bp-marketing-strategy",
    label: "Marketing Strategy",
    catalogType: "Marketing Strategy",
    ownerChamberMemberId: "marketing",
    aliases: ["marketing plan", "marketing strategy", "go-to-market"],
    purpose: "Clarify how the business will attract and serve customers.",
    expectedOutcome: "A practical marketing strategy.",
    projectIntegration: "complex",
    visibleThinking: "recommended",
  },
  {
    id: "bp-newsletter",
    label: "Newsletter",
    catalogType: "Newsletter",
    ownerChamberMemberId: "content",
    aliases: ["newsletter"],
    purpose: "Write a newsletter issue.",
    expectedOutcome: "A ready-to-edit newsletter draft.",
    projectIntegration: "none",
    visibleThinking: "none",
  },
  {
    id: "bp-book",
    label: "Book",
    catalogType: "Document",
    ownerChamberMemberId: "content",
    aliases: ["ebook", "book", "book chapter", "manuscript"],
    purpose: "Shape a book or long-form written work.",
    expectedOutcome: "An outline or chapter structure in progress.",
    projectIntegration: "long_term",
    visibleThinking: "recommended",
  },
  {
    id: "bp-course",
    label: "Course Outline",
    catalogType: "Course Outline",
    ownerChamberMemberId: "learning",
    aliases: ["course", "course outline", "curriculum"],
    purpose: "Design a course people can complete.",
    expectedOutcome: "A module outline with learning outcomes.",
    projectIntegration: "complex",
    visibleThinking: "helpful",
  },
  {
    id: "bp-proposal",
    label: "Proposal",
    catalogType: "Proposal",
    ownerChamberMemberId: "client-relationships",
    aliases: ["proposal", "scope of work", "sow"],
    purpose: "Write a client proposal.",
    expectedOutcome: "A clear proposal ready to review.",
    projectIntegration: "simple",
    visibleThinking: "none",
  },
  {
    id: "bp-budget",
    label: "Budget",
    catalogType: "Document",
    ownerChamberMemberId: "finance",
    aliases: ["budget", "financial plan", "event budget"],
    purpose: "Build a practical budget.",
    expectedOutcome: "A budget structure with categories.",
    projectIntegration: "simple",
    visibleThinking: "helpful",
  },
  {
    id: "bp-leadership-training",
    label: "Leadership Training",
    catalogType: "Training Guide",
    ownerChamberMemberId: "leadership",
    aliases: [
      "leadership training",
      "leadership program",
      "volunteer training",
    ],
    purpose: "Build leadership or volunteer training.",
    expectedOutcome: "A training outline ready to facilitate.",
    projectIntegration: "complex",
    visibleThinking: "helpful",
  },
  {
    id: "bp-sales-funnel",
    label: "Sales Funnel",
    catalogType: "Sales Funnel",
    ownerChamberMemberId: "marketing",
    aliases: ["funnel", "sales funnel", "marketing funnel"],
    purpose: "Design a customer journey funnel.",
    expectedOutcome: "A funnel map with stages.",
    projectIntegration: "complex",
    visibleThinking: "essential",
  },
  {
    id: "bp-sop",
    label: "SOP",
    catalogType: "SOP",
    ownerChamberMemberId: null,
    aliases: ["sop", "standard operating procedure", "process doc"],
    purpose: "Document a repeatable process.",
    expectedOutcome: "A clear SOP draft.",
    projectIntegration: "none",
    visibleThinking: "none",
  },
  {
    id: "bp-email",
    label: "Email",
    catalogType: "Email",
    ownerChamberMemberId: "content",
    aliases: ["email", "cold email", "follow-up email"],
    purpose: "Write one email.",
    expectedOutcome: "A usable email draft.",
    projectIntegration: "none",
    visibleThinking: "none",
  },
  {
    id: "bp-presentation",
    label: "Presentation",
    catalogType: "Presentation",
    ownerChamberMemberId: "creative-studio",
    aliases: ["presentation", "slide deck", "slides"],
    purpose: "Shape a presentation.",
    expectedOutcome: "A slide outline.",
    projectIntegration: "simple",
    visibleThinking: "helpful",
  },
];

/** Longer aliases first so "retreat weekend" wins over "retreat". */
function sortedByAliasLength(bps: CreateBlueprint[]): CreateBlueprint[] {
  return [...bps].sort((a, b) => {
    const al = Math.max(...a.aliases.map((x) => x.length), 0);
    const bl = Math.max(...b.aliases.map((x) => x.length), 0);
    return bl - al;
  });
}

const SORTED = sortedByAliasLength(BLUEPRINTS);

export function listCreateBlueprints(): readonly CreateBlueprint[] {
  return BLUEPRINTS;
}

export function getCreateBlueprintById(id: string): CreateBlueprint | null {
  return BLUEPRINTS.find((b) => b.id === id) ?? null;
}

export function getCreateBlueprintByCatalogType(
  catalogType: string,
): CreateBlueprint | null {
  const n = catalogType.trim().toLowerCase();
  return (
    BLUEPRINTS.find((b) => b.catalogType.toLowerCase() === n) ??
    BLUEPRINTS.find((b) => b.label.toLowerCase() === n) ??
    null
  );
}

/**
 * Gathering language means Event Workspace — never Marketing Launch Plan.
 * Subtype (launch / workshop / webinar) customizes the Event; it never replaces it.
 */
function isGatheringEventLanguage(t: string): boolean {
  return (
    /\b(?:event|party|gathering|meetup|summit|conference|workshop|webinar|retreat|panel)\b/i.test(
      t,
    ) || /\b(?:plan|host|organize)\s+(?:a|an|my|the)\s+(?:product\s+)?launch\b/i.test(t)
  );
}

/**
 * Resolve blueprint from natural language — one owner, aliases only.
 * Longest matching alias wins so "retreat weekend" beats bare "event".
 */
export function resolveBlueprintFromText(text: string): CreateBlueprint | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  // Product launch *event* → Event Plan (subtype = launch), not Launch Plan
  if (
    isGatheringEventLanguage(t) &&
    /\b(?:product\s+)?launch\b/i.test(t) &&
    !/\blaunch\s+plan\b/i.test(t)
  ) {
    return BLUEPRINTS.find((b) => b.id === "bp-event-plan") ?? null;
  }

  let best: { bp: CreateBlueprint; len: number } | null = null;
  for (const bp of SORTED) {
    for (const alias of bp.aliases) {
      const a = alias.toLowerCase();
      const matched =
        t === a ||
        new RegExp(`\\b${escapeRe(a)}\\b`, "i").test(t) ||
        t.includes(a);
      if (!matched) continue;
      if (!best || a.length > best.len) {
        best = { bp, len: a.length };
      }
    }
  }
  return best?.bp ?? null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function blueprintsForChamberMember(
  memberId: ChamberMemberId,
): CreateBlueprint[] {
  return BLUEPRINTS.filter((b) => b.ownerChamberMemberId === memberId);
}

export function shouldAutoProjectHome(bp: CreateBlueprint | null): boolean {
  if (!bp) return false;
  return (
    bp.projectIntegration === "simple" ||
    bp.projectIntegration === "complex" ||
    bp.projectIntegration === "long_term"
  );
}

export function shouldOfferVisibleThinking(bp: CreateBlueprint | null): boolean {
  if (!bp) return false;
  return (
    bp.visibleThinking === "helpful" ||
    bp.visibleThinking === "recommended" ||
    bp.visibleThinking === "essential"
  );
}
