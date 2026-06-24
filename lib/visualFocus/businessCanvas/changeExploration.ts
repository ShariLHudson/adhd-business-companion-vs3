import type { VisualFocusAnalysis } from "../types";
import { guidanceForSection } from "./guidance";
import type { BusinessCanvasData, BusinessCanvasSectionId } from "./types";
import { BUSINESS_CANVAS_SECTION_ORDER } from "./types";
import { filledBusinessCanvasSectionCount } from "./factory";

export type ChangeFollowUpQuestion = {
  id: string;
  question: string;
};

export type ChangeCategory =
  | "membership"
  | "pricing"
  | "audience"
  | "product"
  | "channel"
  | "delivery"
  | "general";

export function detectChangeCategory(change: string): ChangeCategory {
  const c = change.toLowerCase();
  if (/membership|member|subscribe|subscription/i.test(c)) return "membership";
  if (/price|pricing|raise|cost|fee/i.test(c)) return "pricing";
  if (/audience|customer|segment|niche|who we serve/i.test(c)) return "audience";
  if (/product|offer|service|course|program/i.test(c)) return "product";
  if (/channel|marketing|social|ads|traffic/i.test(c)) return "channel";
  if (/deliver|fulfill|model|how we work/i.test(c)) return "delivery";
  return "general";
}

export function followUpQuestionsForChange(change: string): ChangeFollowUpQuestion[] {
  const category = detectChangeCategory(change);
  switch (category) {
    case "membership":
      return [
        { id: "who", question: "Who is the membership for?" },
        { id: "included", question: "What would be included?" },
        { id: "price", question: "How much would it cost?" },
        { id: "discovery", question: "How would people find it?" },
        { id: "support", question: "How much support would it require?" },
        {
          id: "replace",
          question: "Would it replace something or be added on top?",
        },
        { id: "time", question: "How much time would it take each week?" },
      ];
    case "pricing":
      return [
        { id: "offer", question: "Which offer or service?" },
        { id: "current-price", question: "Current price?" },
        { id: "new-price", question: "New price?" },
        { id: "audience", question: "Same audience or different audience?" },
        {
          id: "delivery",
          question: "Would anything about delivery change?",
        },
        {
          id: "buyers",
          question: "Do you expect fewer buyers, better clients, or both?",
        },
      ];
    case "audience":
      return [
        { id: "current-audience", question: "Who is the current audience?" },
        { id: "new-audience", question: "Who is the new audience?" },
        { id: "offer-same", question: "Would the offer stay the same?" },
        { id: "messaging", question: "Would messaging need to change?" },
        { id: "channels", question: "Would marketing channels change?" },
      ];
    case "product":
      return [
        { id: "what", question: "What would you add, change, or remove?" },
        { id: "who", question: "Who is it for?" },
        { id: "revenue", question: "How would it affect revenue?" },
        { id: "time", question: "How much time would it take to launch or maintain?" },
      ];
    case "channel":
      return [
        { id: "channel", question: "Which channel would you add or change?" },
        { id: "audience", question: "Who would it reach?" },
        { id: "effort", question: "How much ongoing effort would it need?" },
        { id: "cost", question: "Would it add cost or replace another channel?" },
      ];
    case "delivery":
      return [
        { id: "what-changes", question: "What would change about how you deliver?" },
        { id: "capacity", question: "Would your capacity go up or down?" },
        { id: "quality", question: "Would client experience change?" },
        { id: "cost", question: "Would costs change?" },
      ];
    default:
      return [
        { id: "what", question: "What exactly would change?" },
        { id: "who", question: "Who would be affected?" },
        { id: "why", question: "Why are you considering this now?" },
        { id: "tradeoff", question: "What might you gain or lose?" },
      ];
  }
}

/** Minimum answers before impact analysis — not a long questionnaire. */
export function hasEnoughChangeDetail(
  change: string,
  answers: Record<string, string>,
): boolean {
  const questions = followUpQuestionsForChange(change);
  const answered = questions.filter((q) => answers[q.id]?.trim()).length;
  const minimum = Math.min(3, questions.length);
  return change.trim().length > 0 && answered >= minimum;
}

export function affectedSectionsForChange(change: string): BusinessCanvasSectionId[] {
  const c = change.toLowerCase();
  const affected = new Set<BusinessCanvasSectionId>();

  const add = (...ids: BusinessCanvasSectionId[]) => ids.forEach((id) => affected.add(id));

  if (/membership|subscribe|member/i.test(c)) {
    add("revenue-streams", "value-proposition", "customer-segments", "key-activities", "cost-structure");
  }
  if (/price|pricing|raise/i.test(c)) {
    add("revenue-streams", "value-proposition", "customer-segments", "channels");
  }
  if (/audience|customer|segment|niche/i.test(c)) {
    add("customer-segments", "value-proposition", "channels", "customer-relationships");
  }
  if (/product|offer|service|course/i.test(c)) {
    add("value-proposition", "revenue-streams", "key-activities", "key-resources");
  }
  if (/channel|marketing|social|ads/i.test(c)) {
    add("channels", "customer-segments", "key-activities", "cost-structure");
  }
  if (/hire|help|team|partner/i.test(c)) {
    add("key-partners", "key-resources", "key-activities", "cost-structure");
  }
  if (/stop|remove|cut/i.test(c)) {
    add("revenue-streams", "key-activities", "cost-structure", "value-proposition");
  }
  if (/deliver|fulfill|model/i.test(c)) {
    add("key-activities", "customer-relationships", "cost-structure", "value-proposition");
  }

  if (affected.size === 0) {
    add("value-proposition", "revenue-streams", "customer-segments");
  }

  return BUSINESS_CANVAS_SECTION_ORDER.filter((id) => affected.has(id));
}

export function buildBusinessCanvasImpactAnalysis(
  data: BusinessCanvasData,
  title: string,
  change: string,
  answers: Record<string, string>,
): VisualFocusAnalysis {
  const now = new Date().toISOString();
  const filled = filledBusinessCanvasSectionCount(data);
  const affected = affectedSectionsForChange(change);

  const whatChanges = `Exploring: ${change.trim()}`;
  const answerSummary = Object.entries(answers)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => {
      const q = followUpQuestionsForChange(change).find((item) => item.id === k);
      return q ? `${q.question} ${v.trim()}` : v.trim();
    });

  const sectionImpacts = affected.map((id) => {
    const g = guidanceForSection(id);
    const ripples = g.changeRipples.slice(0, 2).join(" ");
    return `${g.title}: ${ripples}`;
  });

  const keyRelationships = [
    whatChanges,
    ...affected.map((id) => {
      const g = guidanceForSection(id);
      return `${g.title} may be affected because this change touches how ${g.prompt.toLowerCase()}`;
    }),
  ];

  const patterns = [
    `${affected.length} canvas sections likely affected by this change.`,
    `Current canvas has ${filled} of 9 sections filled — baseline context is ${filled >= 5 ? "solid enough for useful prediction" : "still forming; treat predictions as directional"}.`,
  ];

  const risks: string[] = [];
  for (const id of affected) {
    risks.push(...guidanceForSection(id).changeRipples.slice(0, 1));
  }
  if (filled < 5) {
    risks.push(
      "Your current canvas is still incomplete — impact analysis may miss dependencies until more sections are filled.",
    );
  }

  const opportunities: string[] = [];
  if (/membership|subscribe/i.test(change)) {
    opportunities.push(
      "Recurring revenue could stabilize cash flow if delivery cost stays predictable.",
    );
  }
  if (/price|pricing|raise/i.test(change)) {
    opportunities.push(
      "Higher prices can attract better-fit clients if value proposition stays clear.",
    );
  }
  if (opportunities.length === 0) {
    opportunities.push(
      "A deliberate change can reveal which parts of your model are strongest anchors.",
    );
  }

  const recommendations: string[] = [
    `Review ${affected.map((id) => guidanceForSection(id).title).join(", ")} before committing.`,
    "Run a small test before fully switching — reversible experiments reduce regret.",
  ];

  const boardObservations = [
    "Impact analysis builds on your current canvas baseline — not a blank assumption.",
    answerSummary.length >= 3
      ? "You provided enough detail for a directional what-if — validate with real customer feedback next."
      : "Add a few more specifics if you want sharper predictions before acting.",
    "Board of Directors™ full review — coming soon.",
  ];

  const extras = impactPanelExtras(change, answers, affected);

  const nextSteps = [
    "Save this canvas and note which section you will validate first.",
    affected[0]
      ? `Re-read ${guidanceForSection(affected[0]).title} with this change in mind.`
      : "Pick one affected section and list one small experiment.",
  ];

  const summary = `What-if for "${title}": ${change.trim()}. ${affected.length} sections may shift based on your current ${filled}-of-9 canvas.`;

  return {
    summary,
    keyRelationships,
    patterns,
    risks: [...new Set(risks)].slice(0, 6),
    opportunities,
    recommendations,
    nextSteps,
    boardObservations,
    whatIfNotes: [
      `What changes: ${extras.whatChanges}`,
      ...extras.affectedSections.map((s) => `Affected: ${s}`),
      ...extras.rippleEffects.map((r) => `Ripple: ${r}`),
    ],
    generatedAt: now,
  };
}

/** Extended analysis fields for impact view — surfaced in intelligence panel. */
export function impactPanelExtras(
  change: string,
  answers: Record<string, string>,
  affected: BusinessCanvasSectionId[],
): {
  whatChanges: string;
  affectedSections: string[];
  whyAffected: string[];
  rippleEffects: string[];
  whatIfNotes: string[];
} {
  const ripples: string[] = [];
  for (const id of affected) {
    ripples.push(...guidanceForSection(id).changeRipples);
  }
  return {
    whatChanges: change.trim(),
    affectedSections: affected.map((id) => guidanceForSection(id).title),
    whyAffected: affected.map((id) => guidanceForSection(id).whyItMatters),
    rippleEffects: [...new Set(ripples)].slice(0, 8),
    whatIfNotes: [
      "What-If Analysis — directional preview from your current canvas.",
      ...Object.entries(answers)
        .filter(([, v]) => v.trim())
        .slice(0, 4)
        .map(([k, v]) => {
          const q = followUpQuestionsForChange(change).find((item) => item.id === k);
          return q ? `${q.question} → ${v.trim()}` : v.trim();
        }),
    ],
  };
}
