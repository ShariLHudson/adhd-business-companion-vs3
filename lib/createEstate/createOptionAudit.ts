/**
 * Create Simplification & Category Evaluation — Part 15 audit deliverable.
 *
 * Complete evaluation of every option currently in `CREATE_CATALOG`
 * (`lib/createCatalogData.ts`). One row per catalog item, answering the
 * Part 5 questions (different? understandable name? needs a full guided
 * experience? Create or Projects? too narrow? duplicate? subtype?) and
 * recording the Part 6/7 consolidation decision.
 *
 * This is the source of truth the new parent-type registry
 * (`lib/createEstate/createParentTypes.ts`) is generated from — old catalog
 * labels are never deleted, only re-homed under a parent type + subtype so
 * existing drafts/creations keep resolving (Part 14 data preservation).
 *
 * Human-readable companion: `docs/create-experience/136_CREATE_OPTION_AUDIT.md`.
 */

export type CreateOptionAudit = {
  currentName: string;
  currentCategory?: string;
  keep: boolean;
  newParentType?: string;
  newSubtype?: string;
  renameTo?: string;
  mergeWith?: string[];
  moveToProjects?: boolean;
  reason: string;
};

export const CREATE_OPTION_AUDIT: CreateOptionAudit[] = [
  // ── Business Assets ────────────────────────────────────────────────
  {
    currentName: "Automation",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Standard Operating Procedure",
    newSubtype: "Automation",
    mergeWith: ["Process", "GHL Workflow", "SOP"],
    reason:
      "Too narrow for its own card — it is one kind of documented process. Folds into Standard Operating Procedure with the others; original label preserved as subtype metadata.",
  },
  {
    currentName: "Checklist",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Checklist",
    reason:
      "Genuinely different output (a step list, not a narrative doc). Kept as its own parent type; \"what kind of checklist\" becomes a guided subtype question instead of separate cards.",
  },
  {
    currentName: "Claude Prompt",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Template",
    newSubtype: "AI Prompt",
    renameTo: "AI Prompt",
    reason:
      "Name assumes a specific AI tool and won't be understood immediately. Renamed to AI Prompt and folded into the general Template parent type as a subtype.",
  },
  {
    currentName: "GHL Workflow",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Standard Operating Procedure",
    newSubtype: "Go High Level Workflow",
    mergeWith: ["Process", "Automation", "SOP"],
    reason:
      "First-time users won't know what \"GHL\" means. Spelled out as a subtype under Standard Operating Procedure rather than its own unclear card.",
  },
  {
    currentName: "Newsletter",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Newsletter",
    reason: "Clear, distinct, working guided flow. Keep as its own parent type under Write & Communicate.",
  },
  {
    currentName: "Offer",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Offer",
    reason: "Clear, distinct output with a working guided flow. Keep under Market & Sell.",
  },
  {
    currentName: "Process",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Standard Operating Procedure",
    newSubtype: "General Process",
    mergeWith: ["SOP", "Automation", "GHL Workflow"],
    reason:
      "Duplicates SOP (both document \"how we do X\"). Consolidated as the default subtype under Standard Operating Procedure.",
  },
  {
    currentName: "Sales Page",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Sales Page",
    reason:
      "Distinct outcome from Landing Page (long-form persuasion vs. a capture page). Kept separate per prior taxonomy review (package 178).",
  },
  {
    currentName: "Landing Page",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Landing Page",
    reason: "Distinct, working output (lead capture). Kept as its own parent type under Market & Sell.",
  },
  {
    currentName: "Lead Magnet",
    currentCategory: "Business Assets",
    keep: true,
    newParentType: "Lead Magnet",
    reason: "Clear, distinct, the richest guided flow in the catalog. Keep under Market & Sell.",
  },

  // ── Content ─────────────────────────────────────────────────────────
  {
    currentName: "Blog Post",
    currentCategory: "Content",
    keep: true,
    newParentType: "Article or Blog",
    renameTo: "Article or Blog",
    reason:
      "Understandable, but narrower than needed — renamed to the parent-type name members recognize whether they call it an article or a blog post.",
  },
  {
    currentName: "Email",
    currentCategory: "Content",
    keep: true,
    newParentType: "Email",
    reason:
      "Correct parent for every one-off email. Absorbs Follow-Up Email as a subtype instead of a duplicate card.",
  },
  {
    currentName: "Email Sequence",
    currentCategory: "Content",
    keep: true,
    newParentType: "Marketing Campaign",
    newSubtype: "Email Sequence",
    mergeWith: ["Email Campaign"],
    reason:
      "Duplicates Email Campaign (both are multi-email series). Consolidated under Marketing Campaign in Market & Sell; a single email still lives under the Email parent type.",
  },
  {
    currentName: "Facebook Post",
    currentCategory: "Content",
    keep: true,
    newParentType: "Social Content",
    newSubtype: "Post",
    mergeWith: ["Social Post", "LinkedIn Post"],
    reason:
      "Platform-specific variant of the same job (write a social post). Folds into Social Content; platform becomes part of the subtype question, not a separate card.",
  },
  {
    currentName: "LinkedIn Post",
    currentCategory: "Content",
    keep: true,
    newParentType: "Social Content",
    newSubtype: "Post",
    mergeWith: ["Social Post", "Facebook Post"],
    reason: "Same job as Facebook Post and Social Post — merged into Social Content.",
  },
  {
    currentName: "Presentation",
    currentCategory: "Content",
    keep: true,
    newParentType: "Presentation",
    reason:
      "Clear, distinct output. Kept as its own parent type; keynote/training/sales/webinar/internal become a one-question subtype instead of separate cards.",
  },
  {
    currentName: "Social Post",
    currentCategory: "Content",
    keep: true,
    newParentType: "Social Content",
    newSubtype: "Post",
    mergeWith: ["Facebook Post", "LinkedIn Post"],
    reason: "Becomes the parent card for all social writing; platform and format are asked as one guided question.",
  },
  {
    currentName: "Video Script",
    currentCategory: "Content",
    keep: true,
    newParentType: "Script",
    newSubtype: "Video Script",
    renameTo: "Script",
    reason: "Renamed to the broader, immediately understood parent type Script.",
  },
  {
    currentName: "Workshop",
    currentCategory: "Content",
    keep: true,
    newParentType: "Event",
    newSubtype: "Workshop",
    reason:
      "One of the strongest working flows in the catalog. Preserved as its own guided workflow, now reached as the Workshop subtype of the Event parent type so it sits beside other gatherings instead of a separate top-level card.",
  },
  {
    currentName: "Event Plan",
    currentCategory: "Content",
    keep: true,
    newParentType: "Event",
    newSubtype: "Other Event",
    reason:
      "Becomes the Event parent type. Webinar / networking event / launch event / client event / personal event are asked as one guided question; Workshop keeps its own deeper flow as a subtype.",
  },

  // ── Documents ───────────────────────────────────────────────────────
  {
    currentName: "Business Plan",
    currentCategory: "Documents",
    keep: true,
    newParentType: "Business Plan",
    reason: "Clear, distinct, understandable name. Keep under Build the Business.",
  },
  {
    currentName: "Document",
    currentCategory: "Documents",
    keep: true,
    newParentType: "Reference Document",
    renameTo: "Other Document",
    reason:
      "\"Document\" is too generic to be understood immediately as its own choice. Renamed to Other Document and used as the catch-all subtype under Reference Document (Organize Information) — never the first thing offered.",
  },
  {
    currentName: "Course Outline",
    currentCategory: "Documents",
    keep: true,
    newParentType: "Course",
    newSubtype: "Course Outline",
    renameTo: "Course",
    reason: "Renamed to Course (Plan Something) so it reads as a planning outcome, not a document format.",
  },
  {
    currentName: "Client Onboarding",
    currentCategory: "Documents",
    keep: true,
    newParentType: "Client Onboarding",
    reason: "Clear, distinct, working flow. Keep under Work With Clients.",
  },
  {
    currentName: "Client Avatar",
    currentCategory: "Documents",
    keep: false,
    moveToProjects: false,
    reason:
      "Already routed to the dedicated Client Avatars room — it is not a Create output and should not appear as a Create card (unchanged from package 180).",
  },
  {
    currentName: "Proposal",
    currentCategory: "Documents",
    keep: true,
    newParentType: "Proposal",
    reason: "Clear, distinct, working flow. Keep under Work With Clients.",
  },
  {
    currentName: "SOP",
    currentCategory: "Documents",
    keep: true,
    newParentType: "Standard Operating Procedure",
    newSubtype: "Standard Procedure",
    renameTo: "Standard Operating Procedure",
    mergeWith: ["Process", "Automation", "GHL Workflow"],
    reason:
      "Becomes the parent for every \"how we do this\" document. Process, Automation, and GHL Workflow become subtype choices instead of separate cards.",
  },
  {
    currentName: "Training Guide",
    currentCategory: "Documents",
    keep: true,
    newParentType: "Guide",
    newSubtype: "Training Guide",
    reason: "Understandable but narrow. Folded into the broader Guide parent type under Organize Information.",
  },

  // ── Marketing ───────────────────────────────────────────────────────
  {
    currentName: "Content Strategy",
    currentCategory: "Marketing",
    keep: true,
    newParentType: "Strategy",
    newSubtype: "Content",
    mergeWith: ["Marketing Strategy"],
    reason:
      "Overlaps with Marketing Strategy — both are \"what is our direction\" documents. Consolidated under one Strategy parent type (Build the Business) with a one-question subtype.",
  },
  {
    currentName: "Email Campaign",
    currentCategory: "Marketing",
    keep: true,
    newParentType: "Marketing Campaign",
    newSubtype: "Nurture or Sales Campaign",
    mergeWith: ["Email Sequence"],
    reason: "Duplicates Email Sequence. Consolidated under Marketing Campaign.",
  },
  {
    currentName: "Flyer",
    currentCategory: "Marketing",
    keep: true,
    newParentType: "Promotion",
    newSubtype: "Flyer or Handout",
    reason: "Genuinely useful, but narrow — becomes a subtype of the broader Promotion parent type.",
  },
  {
    currentName: "Launch Plan",
    currentCategory: "Marketing",
    keep: true,
    newParentType: "Launch",
    reason:
      "Renamed conceptually to Launch to match Market & Sell language; kept as its own parent type rather than merged, since a launch has a genuinely different shape from an ongoing campaign.",
  },
  {
    currentName: "Marketing Strategy",
    currentCategory: "Marketing",
    keep: true,
    newParentType: "Strategy",
    newSubtype: "Marketing",
    mergeWith: ["Content Strategy"],
    reason: "Consolidated with Content Strategy under one Strategy parent type — same job, different focus.",
  },
  {
    currentName: "Sales Funnel",
    currentCategory: "Marketing",
    keep: true,
    newParentType: "Sales Funnel",
    reason: "Clear, distinct, working flow. Keep under Market & Sell.",
  },

  // ── Planning ────────────────────────────────────────────────────────
  {
    currentName: "5-Day Plan",
    currentCategory: "Planning",
    keep: true,
    newParentType: "5-Day Plan",
    reason:
      "Understandable and genuinely different from a full Marketing Plan (short sprint vs. ongoing plan). Kept as its own parent type under Plan Something.",
  },
  {
    currentName: "Content Calendar",
    currentCategory: "Planning",
    keep: true,
    newParentType: "Content Calendar",
    reason: "Clear, distinct organizing tool. Kept as its own parent type under Organize Information.",
  },
  {
    currentName: "Marketing Plan",
    currentCategory: "Planning",
    keep: true,
    newParentType: "Marketing Plan",
    reason:
      "Working, high-traffic flow with its own guided questions. Kept distinct from Marketing Strategy (plan = tactics/dates; strategy = direction) and from Marketing Campaign (a single sequence).",
  },
  {
    currentName: "Facebook Community",
    currentCategory: "Content",
    keep: true,
    newParentType: "Facebook Community",
    reason:
      "A complete guided experience (positioning, naming, setup, welcome, launch, growth, moderation, analytics) — genuinely different from a single Facebook Post and too broad to fold into Social Content. Kept as its own parent type under Market & Sell (587–598).",
  },

  // ── Relationships ───────────────────────────────────────────────────
  {
    currentName: "Client Check-In",
    currentCategory: "Relationships",
    keep: true,
    newParentType: "Client Communication",
    newSubtype: "Check-In",
    mergeWith: ["Referral Request", "Testimonial Request"],
    reason:
      "Too narrow for its own card next to two nearly identical asks. Consolidated with Referral Request and Testimonial Request under one Client Communication parent type with a one-question subtype.",
  },
  {
    currentName: "Follow-Up Email",
    currentCategory: "Relationships",
    keep: true,
    newParentType: "Email",
    newSubtype: "Follow-Up",
    mergeWith: ["Email"],
    reason:
      "A follow-up is an email, not a separate output. Folded into the Email parent type as the Follow-up subtype — no longer a duplicate top-level card.",
  },
  {
    currentName: "Referral Request",
    currentCategory: "Relationships",
    keep: true,
    newParentType: "Client Communication",
    newSubtype: "Referral Request",
    mergeWith: ["Client Check-In", "Testimonial Request"],
    reason: "Same shape as Client Check-In and Testimonial Request — one short, warm client message. Consolidated.",
  },
  {
    currentName: "Testimonial Request",
    currentCategory: "Relationships",
    keep: true,
    newParentType: "Client Communication",
    newSubtype: "Testimonial Request",
    mergeWith: ["Client Check-In", "Referral Request"],
    reason: "Same shape as Client Check-In and Referral Request. Consolidated under Client Communication.",
  },
];

/** Every catalog label this audit accounts for (completeness check). */
export function auditedCatalogLabels(): string[] {
  return CREATE_OPTION_AUDIT.map((row) => row.currentName);
}

export function auditForLabel(label: string): CreateOptionAudit | undefined {
  const target = label.trim().toLowerCase();
  return CREATE_OPTION_AUDIT.find((row) => row.currentName.toLowerCase() === target);
}

/** Rows that fold into a broader parent type instead of staying a standalone card. */
export function mergedAuditRows(): CreateOptionAudit[] {
  return CREATE_OPTION_AUDIT.filter((row) => row.mergeWith && row.mergeWith.length > 0);
}

/** Rows renamed for immediate understanding (Part 5 question 2). */
export function renamedAuditRows(): CreateOptionAudit[] {
  return CREATE_OPTION_AUDIT.filter((row) => Boolean(row.renameTo));
}

/** Rows hidden from Create entirely (routed elsewhere, or not a Create output). */
export function hiddenAuditRows(): CreateOptionAudit[] {
  return CREATE_OPTION_AUDIT.filter((row) => !row.keep);
}
