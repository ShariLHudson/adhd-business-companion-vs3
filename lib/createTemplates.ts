/**
 * Create templates — preset structures per item type, custom template storage.
 */

import { sortDropdownLabels } from "./dropdownSort";
import {
  resolvedTypeLabel,
  type CreateTemplateSection,
  type CreateWorkflowState,
} from "./createWorkflowState";
import { CREATE_WORKSPACE_V2 } from "./createWorkspaceFlags";
import { effectiveSubtypeLabel, OTHER_OPTION } from "./createTypePickers";
import { EVENT_PLAN_MAP_SECTIONS } from "@/lib/workTypeSchema/schemas/eventPlanMap";
import { workshopMapToTemplateSections } from "@/lib/workTypeSchema/ensureMapSections";

export type { CreateTemplateSection };

/** Local brief helper — never import createWorkflow (cycle break). */
function briefFromDiscoveryAnswers(
  typeLabel: string,
  answers: Record<string, string>,
  subtype?: string | null,
): string {
  const header = subtype
    ? `Creating: ${typeLabel} (${subtype})`
    : `Creating: ${typeLabel}`;
  const lines = Object.entries(answers)
    .filter(([, v]) => Boolean(v?.trim()))
    .map(([key, value]) => `${key}\n${value.trim()}`);
  if (!lines.length) {
    return subtype
      ? `Create a ${typeLabel} — ${subtype}.`
      : `Create a ${typeLabel}.`;
  }
  return [header, ...lines].join("\n\n");
}

export type CreateTemplatePreset = {
  id: string;
  name: string;
  itemType: string;
  /** When set, this preset is the default for the subtype. */
  subtype?: string | null;
  sections: CreateTemplateSection[];
};

export type SavedCustomTemplate = {
  id: string;
  name: string;
  itemType: string;
  subtype?: string | null;
  sections: CreateTemplateSection[];
  updatedAt: string;
};

const CUSTOM_STORAGE_KEY = "companion-create-custom-templates-v1";

function section(id: string, label: string): CreateTemplateSection {
  return { id, label };
}

const NEWSLETTER_SECTIONS: CreateTemplateSection[] = [
  section("subject", "Subject Line"),
  section("opening", "Opening"),
  section("main", "Main Story"),
  section("tip", "Helpful Tip"),
  section("cta", "Offer / CTA"),
  section("closing", "Closing"),
];

const SOCIAL_SECTIONS: CreateTemplateSection[] = [
  section("hook", "Hook"),
  section("body", "Main Message"),
  section("cta", "Call to Action"),
  section("hashtags", "Hashtags"),
];

const EMAIL_SECTIONS: CreateTemplateSection[] = [
  section("subject", "Subject Line"),
  section("opening", "Opening"),
  section("body", "Body"),
  section("cta", "Call to Action"),
  section("signoff", "Sign-Off"),
];

/**
 * SOP Build Journey Phase 1 (2026-08-05) — the SOP Build Definition.
 *
 * Replaces the previous four generic headings (Purpose, Scope, Steps, Notes &
 * Tips) with the sections the approved SOP Knowledge Finger requires, each
 * carrying the question an operations expert would actually ask. The four
 * added sections — Intended User, Before You Begin, Completion Check,
 * Troubleshooting — are precisely what determine whether someone else can
 * follow the process without the creator present.
 *
 * On "Title": the Knowledge Finger lists Title as required section 1. It is
 * deliberately NOT a conversational section here — the creation record already
 * owns the title (resolveHumanReadableTitle), and assembleWorkFromWorkflow
 * prepends it to the assembled body. Asking "What belongs in Title?" would
 * duplicate that machinery and open the conversation with a form field
 * instead of the outcome question the specification requires.
 *
 * Section ids `purpose` and `steps` are preserved deliberately — IDEAS_BY_SECTION
 * (lib/currentFocus/submitCurrentFocusResponse.ts) is keyed on them.
 *
 * @see docs/create-experience/SOP_BUILD_JOURNEY_SPECIFICATION.md
 * @see docs/create-experience/SOP_BUILD_JOURNEY_APPROVAL_RECORD.md
 */
const SOP_SECTIONS: CreateTemplateSection[] = [
  {
    id: "purpose",
    label: "Purpose",
    prompt:
      "What should someone be able to accomplish after following this SOP?",
    why: "Starting with the result keeps every step pointed at something real.",
  },
  {
    id: "intended-user",
    label: "Intended User",
    prompt: "Who will be using these instructions?",
    why: "How much to explain depends entirely on who is reading it.",
  },
  {
    id: "before-you-begin",
    label: "Before You Begin",
    prompt: "What should they already have or know before they start?",
    why: "Missing access or setup is where most people get stuck first.",
  },
  {
    id: "steps",
    label: "Step-by-Step Instructions",
    prompt: "What happens first?",
    why: "We'll build the steps in order, one at a time.",
  },
  {
    id: "completion-check",
    label: "Completion Check",
    prompt: "How will they know they did it right?",
    why: "Without a way to check, someone can finish and still be unsure.",
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    prompt: "What usually goes wrong, and what should they do about it?",
    why: "This is what keeps them from needing to interrupt you.",
  },
];

/**
 * 2026-08-05 — ADR-013 routing exposure fix. Checklist requests now
 * default to Create/Current Focus (previously detoured through Creation
 * Workspace) and had no dedicated template, so they fell to
 * GENERIC_SECTIONS (Introduction/Main Content/Call to Action/Closing) —
 * fine for a persuasive piece, wrong shape for a checklist.
 */
const CHECKLIST_SECTIONS: CreateTemplateSection[] = [
  section("purpose", "Purpose"),
  section("before-you-start", "Before You Start"),
  section("items", "Checklist Items"),
  section("done", "Done / Sign-Off"),
];

/**
 * 2026-08-05 — ADR-013 routing exposure fix, same as above. Keyed to
 * "Document" — the real, reachable catalog item (matchTerms: "document",
 * "general document"; createParentTypes.ts hint: "Anything else that
 * does not fit the categories above") — not "Report", which is not
 * currently a resolvable artifactType anywhere in the app: it exists
 * only as a disabled subtype (userFacingSubtypeOptionsForItem in
 * createTypePickers.ts unconditionally returns []), and no free-text,
 * catalog, or Browse More path ever produces artifactType === "Report".
 * Report-style single documents are exactly what land here as
 * "Document" today.
 */
const DOCUMENT_SECTIONS: CreateTemplateSection[] = [
  section("purpose", "Purpose & Overview"),
  section("key-points", "Key Points"),
  section("details", "Details"),
  section("summary", "Summary & Next Steps"),
];

const TRAINING_SECTIONS: CreateTemplateSection[] = [
  section("overview", "Overview"),
  section("objectives", "Learning Objectives"),
  section("content", "Main Content"),
  section("exercise", "Exercise / Practice"),
  section("summary", "Summary"),
];

const WORKSHOP_SECTIONS: CreateTemplateSection[] = [
  section("overview", "Workshop Overview"),
  section("outcomes", "Learning Outcomes"),
  section("agenda", "Agenda"),
  section("activities", "Activities"),
  section("materials", "Materials Needed"),
  section("closing", "Closing & Next Steps"),
];

/** Event Plan map — from shared Work Type schema (080), not a parallel list. */
const EVENT_PLAN_SECTIONS: CreateTemplateSection[] =
  workshopMapToTemplateSections(EVENT_PLAN_MAP_SECTIONS);

const PROPOSAL_SECTIONS: CreateTemplateSection[] = [
  section("summary", "Executive Summary"),
  section("scope", "Scope of Work"),
  section("approach", "Approach"),
  section("timeline", "Timeline"),
  section("investment", "Investment"),
];

const MARKETING_PLAN_SECTIONS: CreateTemplateSection[] = [
  section("audience", "Audience"),
  section("positioning", "Positioning"),
  section("channels", "Channels & Tactics"),
  section("content", "Content Plan"),
  section("metrics", "Goals & Metrics"),
];

/** Transitional campaign map (until a Marketing Campaign Work Type package ships). */
const MARKETING_CAMPAIGN_SECTIONS: CreateTemplateSection[] = [
  section("intro", "Introduction"),
  section("main", "Main Content"),
  section("cta", "Call to Action"),
  section("distribution", "Distribution"),
  section("metrics", "Metrics"),
];

const LEAD_MAGNET_SECTIONS: CreateTemplateSection[] = [
  section("audience", "Who is it for?"),
  section("problem", "Problem"),
  section("outcome", "Desired Outcome"),
  section("promotion", "Promotion"),
  section("format", "Format"),
  section("promise", "Promise"),
  section("outline", "Outline"),
  section("cta", "Delivery & CTA"),
];

const LANDING_PAGE_SECTIONS: CreateTemplateSection[] = [
  section("headline", "Headline"),
  section("problem", "Problem"),
  section("solution", "Solution"),
  section("proof", "Proof"),
  section("cta", "Call to Action"),
];

const FUNNEL_SECTIONS: CreateTemplateSection[] = [
  section("offer", "Offer"),
  section("entry", "Entry Point"),
  section("nurture", "Nurture"),
  section("conversion", "Conversion"),
];

const EMAIL_SEQUENCE_SECTIONS: CreateTemplateSection[] = [
  section("goal", "Sequence Goal"),
  section("arc", "Email Arc"),
  section("emails", "Email Summaries"),
  section("cta", "Primary CTA"),
];

const COURSE_OUTLINE_SECTIONS: CreateTemplateSection[] = [
  section("audience", "Audience"),
  section("transformation", "Transformation"),
  section("modules", "Modules"),
  section("delivery", "Delivery Format"),
];

const CLIENT_ONBOARDING_SECTIONS: CreateTemplateSection[] = [
  section("welcome", "Welcome"),
  section("kickoff", "Kickoff Steps"),
  section("deliverables", "First-Week Deliverables"),
  section("communication", "Communication"),
];

const OFFER_SECTIONS: CreateTemplateSection[] = [
  section("audience", "Audience"),
  section("problem", "Problem"),
  section("promise", "Promise"),
  section("price", "Price"),
];

const GENERIC_SECTIONS: CreateTemplateSection[] = [
  section("intro", "Introduction"),
  section("main", "Main Content"),
  section("cta", "Call to Action"),
  section("closing", "Closing"),
];

function presetsForNewsletter(): CreateTemplatePreset[] {
  const subtypes = [
    "Announcement",
    "Educational",
    "Monthly Update",
    "Nurture",
    "Promotional",
    "Weekly Tips",
  ];
  return sortDropdownLabels(subtypes).map((subtype) => ({
    id: `newsletter-${subtype.toLowerCase().replace(/\s+/g, "-")}`,
    name: `${subtype} Newsletter`,
    itemType: "Newsletter",
    subtype,
    sections: [...NEWSLETTER_SECTIONS],
  }));
}

const PRESET_TEMPLATES: CreateTemplatePreset[] = [
  ...presetsForNewsletter(),
  {
    id: "newsletter-default",
    name: "Default Newsletter Template",
    itemType: "Newsletter",
    sections: [...NEWSLETTER_SECTIONS],
  },
  {
    id: "social-default",
    name: "Default Social Post Template",
    itemType: "Social Post",
    sections: [...SOCIAL_SECTIONS],
  },
  {
    id: "email-default",
    name: "Default Email Template",
    itemType: "Email",
    sections: [...EMAIL_SECTIONS],
  },
  {
    id: "sop-default",
    name: "Default SOP Template",
    itemType: "SOP",
    sections: [...SOP_SECTIONS],
  },
  {
    id: "checklist-default",
    name: "Default Checklist Template",
    itemType: "Checklist",
    sections: [...CHECKLIST_SECTIONS],
  },
  {
    id: "document-default",
    name: "Default Document Template",
    itemType: "Document",
    sections: [...DOCUMENT_SECTIONS],
  },
  {
    id: "training-default",
    name: "Default Training Guide Template",
    itemType: "Training Guide",
    sections: [...TRAINING_SECTIONS],
  },
  {
    id: "workshop-default",
    name: "Default Workshop Template",
    itemType: "Workshop",
    sections: [...WORKSHOP_SECTIONS],
  },
  {
    id: "event-plan-default",
    name: "Default Event Plan Template",
    itemType: "Event Plan",
    sections: [...EVENT_PLAN_SECTIONS],
  },
  {
    id: "proposal-default",
    name: "Default Proposal Template",
    itemType: "Proposal",
    sections: [...PROPOSAL_SECTIONS],
  },
  {
    id: "marketing-plan-default",
    name: "Default Marketing Plan Template",
    itemType: "Marketing Plan",
    sections: [...MARKETING_PLAN_SECTIONS],
  },
  {
    id: "marketing-campaign-default",
    name: "Marketing Campaign",
    itemType: "Marketing Campaign",
    sections: [...MARKETING_CAMPAIGN_SECTIONS],
  },
  {
    id: "lead-magnet-default",
    name: "Default Lead Magnet Template",
    itemType: "Lead Magnet",
    sections: [...LEAD_MAGNET_SECTIONS],
  },
  {
    id: "landing-page-default",
    name: "Default Landing Page Template",
    itemType: "Landing Page",
    sections: [...LANDING_PAGE_SECTIONS],
  },
  {
    id: "funnel-default",
    name: "Default Sales Funnel Template",
    itemType: "Sales Funnel",
    sections: [...FUNNEL_SECTIONS],
  },
  {
    id: "email-sequence-default",
    name: "Default Email Sequence Template",
    itemType: "Email Sequence",
    sections: [...EMAIL_SEQUENCE_SECTIONS],
  },
  {
    id: "course-outline-default",
    name: "Default Course Outline Template",
    itemType: "Course Outline",
    sections: [...COURSE_OUTLINE_SECTIONS],
  },
  {
    id: "offer-default",
    name: "Default Offer Template",
    itemType: "Offer",
    sections: [...OFFER_SECTIONS],
  },
  {
    id: "client-onboarding-default",
    name: "Default Client Onboarding Template",
    itemType: "Client Onboarding",
    sections: [...CLIENT_ONBOARDING_SECTIONS],
  },
  {
    id: "generic-default",
    name: "Default Template",
    itemType: "*",
    sections: [...GENERIC_SECTIONS],
  },
];

export function listPresetTemplates(
  itemType: string,
  subtype?: string | null,
): CreateTemplatePreset[] {
  const subtypeLabel = subtype?.trim() || null;
  const matches = PRESET_TEMPLATES.filter(
    (p) =>
      p.itemType === itemType ||
      (p.itemType === "*" && itemType !== "Newsletter"),
  );
  const subtypeMatches = subtypeLabel
    ? matches.filter((p) => !p.subtype || p.subtype === subtypeLabel)
    : matches.filter((p) => !p.subtype);
  const named = subtypeLabel
    ? matches.filter((p) => p.subtype === subtypeLabel)
    : [];
  const merged = [...named, ...subtypeMatches.filter((p) => !p.subtype)];
  const seen = new Set<string>();
  const unique: CreateTemplatePreset[] = [];
  for (const p of merged) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push(p);
  }
  if (unique.length === 0) {
    const generic = PRESET_TEMPLATES.find((p) => p.id === "generic-default");
    return generic ? [generic] : [];
  }
  return sortDropdownLabels(unique.map((p) => p.name)).map(
    (name) => unique.find((p) => p.name === name)!,
  );
}

export function findPresetTemplate(id: string): CreateTemplatePreset | null {
  return PRESET_TEMPLATES.find((p) => p.id === id) ?? null;
}

export function presetMatchesItemType(
  preset: CreateTemplatePreset,
  itemType: string,
): boolean {
  return preset.itemType === "*" || preset.itemType === itemType;
}

/** Reset template selection when it no longer matches the current item type. */
export function reconcileTemplateForType(
  state: CreateWorkflowState,
): CreateWorkflowState {
  const itemType = resolvedTypeLabel(state);
  if (!itemType) return state;

  const id = state.selectedTemplateId;
  if (id && id !== "none") {
    const preset = findPresetTemplate(id);
    if (preset && !presetMatchesItemType(preset, itemType)) {
      return initializeTemplateForWorkflow({
        ...state,
        selectedTemplateId: null,
        selectedTemplateName: null,
        templateSections: null,
      });
    }
    const custom = findCustomTemplate(id);
    if (custom && custom.itemType !== itemType) {
      return initializeTemplateForWorkflow({
        ...state,
        selectedTemplateId: null,
        selectedTemplateName: null,
        templateSections: null,
      });
    }
    return state;
  }

  return initializeTemplateForWorkflow(state);
}

export function defaultTemplateFor(
  itemType: string,
  subtype?: string | null,
): CreateTemplatePreset {
  const list = listPresetTemplates(itemType, subtype);
  if (subtype?.trim()) {
    const match = list.find((p) => p.subtype === subtype);
    if (match) return match;
  }
  const specific = list.find((p) => p.itemType === itemType);
  if (specific) return specific;
  return (
    list[0] ??
    PRESET_TEMPLATES.find((p) => p.id === "generic-default") ?? {
      id: "generic-default",
      name: "Default Template",
      itemType: "*",
      sections: [...GENERIC_SECTIONS],
    }
  );
}

export function loadCustomTemplates(): SavedCustomTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCustomTemplate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplate(
  template: Omit<SavedCustomTemplate, "id" | "updatedAt"> & { id?: string },
): SavedCustomTemplate {
  const existing = loadCustomTemplates();
  const id =
    template.id?.trim() ||
    `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record: SavedCustomTemplate = {
    id,
    name: template.name.trim(),
    itemType: template.itemType,
    subtype: template.subtype ?? null,
    sections: template.sections.map((s) => ({ ...s })),
    updatedAt: new Date().toISOString(),
  };
  const next = [...existing.filter((t) => t.id !== id), record];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return record;
}

export function findCustomTemplate(id: string): SavedCustomTemplate | null {
  return loadCustomTemplates().find((t) => t.id === id) ?? null;
}

export function listAllTemplatesForItem(
  itemType: string,
  subtype?: string | null,
): { id: string; name: string; source: "preset" | "custom" }[] {
  const presets = listPresetTemplates(itemType, subtype).map((p) => ({
    id: p.id,
    name: p.name,
    source: "preset" as const,
  }));
  const customs = loadCustomTemplates()
    .filter((t) => t.itemType === itemType)
    .map((t) => ({ id: t.id, name: t.name, source: "custom" as const }));
  const combined = [...presets, ...customs];
  const other = { id: OTHER_OPTION, name: "Other / Custom", source: "preset" as const };
  const names = sortDropdownLabels(combined.map((c) => c.name));
  const sorted = names
    .map((name) => combined.find((c) => c.name === name)!)
    .filter(Boolean);
  return [...sorted, other];
}

export function resolveTemplateSections(
  state: CreateWorkflowState,
): CreateTemplateSection[] | null {
  if (!state.useTemplate) return null;
  if (state.templateSections?.length) {
    return state.templateSections;
  }
  const id = state.selectedTemplateId;
  if (!id || id === "none") return null;
  const itemType = resolvedTypeLabel(state);
  const subtype = effectiveSubtypeLabel(
    state.selectedSubtype,
    state.customSubtype,
  );
  const custom = findCustomTemplate(id);
  if (custom) {
    if (custom.itemType !== itemType) {
      return defaultTemplateFor(itemType, subtype).sections;
    }
    return custom.sections;
  }
  const preset = findPresetTemplate(id);
  if (preset) {
    if (!presetMatchesItemType(preset, itemType)) {
      return defaultTemplateFor(itemType, subtype).sections;
    }
    return preset.sections;
  }
  return defaultTemplateFor(itemType, subtype).sections;
}

export function resolveTemplateName(state: CreateWorkflowState): string {
  if (!state.useTemplate) return "No template (freeform)";
  if (state.selectedTemplateName?.trim()) return state.selectedTemplateName.trim();
  const id = state.selectedTemplateId;
  if (!id) return "Default Template";
  const custom = findCustomTemplate(id);
  if (custom) return custom.name;
  const preset = findPresetTemplate(id);
  if (preset) return preset.name;
  const itemType = resolvedTypeLabel(state);
  const subtype = effectiveSubtypeLabel(
    state.selectedSubtype,
    state.customSubtype,
  );
  return defaultTemplateFor(itemType, subtype).name;
}

export function applyTemplateSelection(
  state: CreateWorkflowState,
  templateId: string,
  templateName: string,
  sections?: CreateTemplateSection[] | null,
): CreateWorkflowState {
  if (templateId === "none") {
    return {
      ...state,
      useTemplate: false,
      selectedTemplateId: "none",
      selectedTemplateName: "No template (freeform)",
      templateSections: null,
    };
  }
  return {
    ...state,
    useTemplate: true,
    selectedTemplateId: templateId,
    selectedTemplateName: templateName,
    templateSections: sections ?? null,
  };
}

export function initializeTemplateForWorkflow(
  state: CreateWorkflowState,
): CreateWorkflowState {
  const itemType = resolvedTypeLabel(state);
  if (!itemType) return state;

  const id = state.selectedTemplateId;
  if (id && id !== "none") {
    const preset = findPresetTemplate(id);
    if (preset && presetMatchesItemType(preset, itemType)) return state;
    const custom = findCustomTemplate(id);
    if (custom && custom.itemType === itemType) return state;
  }

  const subtype = effectiveSubtypeLabel(
    state.selectedSubtype,
    state.customSubtype,
  );
  const preset = defaultTemplateFor(itemType, subtype);
  return applyTemplateSelection(state, preset.id, preset.name, null);
}

export function buildGenerationBrief(
  state: CreateWorkflowState,
  discoveryBrief: string,
): string {
  const sections = resolveTemplateSections(state);
  if (!sections?.length) return discoveryBrief;
  const templateName = resolveTemplateName(state);
  const scaffold = sections
    .map((s, i) => `${i + 1}. ${s.label}\n[Write this section]`)
    .join("\n\n");
  return `${discoveryBrief}

Use this template structure (${templateName}):
${scaffold}

Fill every section with real, usable content based on the answers above.`;
}

export function newSectionId(): string {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildFullCreateBrief(state: CreateWorkflowState): string {
  const typeLabel = resolvedTypeLabel(state);
  const subtype = effectiveSubtypeLabel(
    state.selectedSubtype,
    state.customSubtype,
  );

  // Workspace-first brief without importing createWorkspaceV2 (Vercel cycle break).
  if (CREATE_WORKSPACE_V2 && state.workspaceFirst && state.useTemplate) {
    const header = subtype
      ? `Creating: ${typeLabel} (${subtype})`
      : `Creating: ${typeLabel}`;
    const skipped = new Set(state.skippedSectionIds ?? []);
    const lines = (resolveTemplateSections(state) ?? [])
      .map((s) => {
        if (skipped.has(s.id)) {
          return `${s.label}\n[Section marked N/A — omit or minimize in draft]`;
        }
        const content = state.sectionContent?.[s.id]?.trim();
        if (!content) return null;
        return `${s.label}\n${content}`;
      })
      .filter(Boolean) as string[];
    if (lines.length > 0) {
      return buildGenerationBrief(state, `${header}\n\n${lines.join("\n\n")}`);
    }
  }

  const discoveryBrief = briefFromDiscoveryAnswers(
    typeLabel,
    state.discoveryAnswers,
    subtype,
  );
  const sectionLines = (resolveTemplateSections(state) ?? [])
    .map((s) => {
      const content = state.sectionContent?.[s.id]?.trim();
      return content ? `${s.label}\n${content}` : null;
    })
    .filter(Boolean) as string[];
  const withSections =
    sectionLines.length > 0
      ? `${discoveryBrief}\n\nTemplate sections:\n${sectionLines.join("\n\n")}`
      : discoveryBrief;
  return buildGenerationBrief(state, withSections);
}

export const BUILD_DRAFT_LOADING_MESSAGES = [
  "Using your answers.",
  "Applying your template.",
  "Formatting your draft.",
] as const;
