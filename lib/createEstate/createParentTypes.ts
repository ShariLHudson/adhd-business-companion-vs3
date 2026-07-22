/**
 * Create Simplification & Category Evaluation — Parts 4, 6, 7.
 *
 * Consolidated parent creation types + the seven Browse More categories.
 * Generated from the Part 15 audit (`createOptionAudit.ts`) — every mapping
 * here traces back to a `CreateOptionAudit` row so old catalog labels are
 * never lost, only re-homed under a parent type + subtype (Part 14).
 *
 * Member language only — no Blueprint / Work Type / Registry jargon.
 */

import type { CreateCatalogItem } from "@/lib/createCatalog";
import { findCatalogItem } from "@/lib/createCatalog";

export type CreateBrowseCategoryId =
  | "write_communicate"
  | "market_sell"
  | "work_with_clients"
  | "plan_something"
  | "build_the_business"
  | "organize_information"
  | "personal";

export type CreateBrowseCategory = {
  id: CreateBrowseCategoryId;
  /** Part 4 — recommended top-level category label. */
  label: string;
  /** Short calm cue — one job per category. */
  hint: string;
};

/** Part 4 — the seven recommended top-level Browse More categories (in order). */
export const CREATE_BROWSE_CATEGORIES: readonly CreateBrowseCategory[] = [
  {
    id: "write_communicate",
    label: "Write & Communicate",
    hint: "Emails, posts, articles, and presentations",
  },
  {
    id: "market_sell",
    label: "Market & Sell",
    hint: "Campaigns, offers, funnels, and launches",
  },
  {
    id: "work_with_clients",
    label: "Work With Clients",
    hint: "Onboarding, proposals, and client care",
  },
  {
    id: "plan_something",
    label: "Plan Something",
    hint: "Events, workshops, courses, and short plans",
  },
  {
    id: "build_the_business",
    label: "Build the Business",
    hint: "Strategy, process, and business planning",
  },
  {
    id: "organize_information",
    label: "Organize Information",
    hint: "Checklists, guides, templates, and calendars",
  },
  {
    id: "personal",
    label: "Personal",
    hint: "Personal creations — more on the way",
  },
] as const;

export function browseCategoryById(
  id: CreateBrowseCategoryId,
): CreateBrowseCategory | undefined {
  return CREATE_BROWSE_CATEGORIES.find((c) => c.id === id);
}

export type CreateParentTypeSubtype = {
  id: string;
  label: string;
  /** Catalog label this subtype resolves to when confirmed (Part 14 mapping). */
  catalogLabel: string;
};

export type CreateParentType = {
  id: string;
  label: string;
  emoji: string;
  categoryId: CreateBrowseCategoryId;
  /** One-line "use when…" cue shown in curated lists. */
  hint: string;
  /**
   * Original catalog labels this parent type represents. First entry is the
   * default catalog item used when there is no subtype question.
   */
  catalogLabels: readonly string[];
  /** Part 9 — one guided question asked before creating, when there is more than one shape. */
  subtypeQuestion?: string;
  subtypes?: readonly CreateParentTypeSubtype[];
};

/**
 * Part 6/7 — consolidated parent creation types.
 * Every `catalogLabels` entry must have a matching row in
 * `CREATE_OPTION_AUDIT` (enforced by createParentTypes.test.ts).
 */
export const CREATE_PARENT_TYPES: readonly CreateParentType[] = [
  // ── Write & Communicate ─────────────────────────────────────────────
  {
    id: "email",
    label: "Email",
    emoji: "✉️",
    categoryId: "write_communicate",
    hint: "One email, shaped for the moment it needs to land in",
    catalogLabels: ["Email", "Follow-Up Email"],
    subtypeQuestion: "What kind of email are you creating?",
    subtypes: [
      { id: "follow-up", label: "Follow-up", catalogLabel: "Follow-Up Email" },
      { id: "introduction", label: "Introduction", catalogLabel: "Email" },
      { id: "request", label: "Request", catalogLabel: "Email" },
      { id: "thank-you", label: "Thank-you", catalogLabel: "Email" },
      { id: "sales", label: "Sales", catalogLabel: "Email" },
      { id: "reminder", label: "Reminder", catalogLabel: "Email" },
      { id: "difficult", label: "Difficult message", catalogLabel: "Email" },
      { id: "other", label: "Other", catalogLabel: "Email" },
    ],
  },
  {
    id: "social-content",
    label: "Social Content",
    emoji: "📱",
    categoryId: "write_communicate",
    hint: "A post, caption, or short piece for social media",
    catalogLabels: ["Social Post", "Facebook Post", "LinkedIn Post"],
    subtypeQuestion: "What kind of social content are you creating?",
    subtypes: [
      { id: "post", label: "Post", catalogLabel: "Social Post" },
      { id: "caption", label: "Caption", catalogLabel: "Social Post" },
      { id: "carousel", label: "Carousel", catalogLabel: "Social Post" },
      {
        id: "video-script",
        label: "Short video script",
        catalogLabel: "Video Script",
      },
      { id: "announcement", label: "Announcement", catalogLabel: "Social Post" },
      { id: "promotion", label: "Promotion", catalogLabel: "Social Post" },
    ],
  },
  {
    id: "article-or-blog",
    label: "Article or Blog",
    emoji: "📝",
    categoryId: "write_communicate",
    hint: "A blog post or article for your audience",
    catalogLabels: ["Blog Post"],
  },
  {
    id: "newsletter",
    label: "Newsletter",
    emoji: "📰",
    categoryId: "write_communicate",
    hint: "A regular email update for your list",
    catalogLabels: ["Newsletter"],
  },
  {
    id: "presentation",
    label: "Presentation",
    emoji: "📊",
    categoryId: "write_communicate",
    hint: "Slides for a talk, training, or pitch",
    catalogLabels: ["Presentation"],
    subtypeQuestion: "What kind of presentation are you creating?",
    subtypes: [
      { id: "keynote", label: "Keynote", catalogLabel: "Presentation" },
      { id: "training", label: "Training", catalogLabel: "Presentation" },
      {
        id: "sales-presentation",
        label: "Sales presentation",
        catalogLabel: "Presentation",
      },
      { id: "webinar-deck", label: "Webinar deck", catalogLabel: "Presentation" },
      {
        id: "internal-presentation",
        label: "Internal presentation",
        catalogLabel: "Presentation",
      },
    ],
  },
  {
    id: "script",
    label: "Script",
    emoji: "🎬",
    categoryId: "write_communicate",
    hint: "A script for a video, podcast, or recording",
    catalogLabels: ["Video Script"],
  },

  // ── Market & Sell ────────────────────────────────────────────────────
  {
    id: "marketing-campaign",
    label: "Marketing Campaign",
    emoji: "📬",
    categoryId: "market_sell",
    hint: "A series of emails or touches working together",
    catalogLabels: ["Email Sequence", "Email Campaign"],
    subtypeQuestion: "What kind of campaign are you creating?",
    subtypes: [
      { id: "email-sequence", label: "Email sequence", catalogLabel: "Email Sequence" },
      { id: "nurture", label: "Nurture campaign", catalogLabel: "Email Campaign" },
      { id: "sales", label: "Sales campaign", catalogLabel: "Email Campaign" },
    ],
  },
  {
    id: "offer",
    label: "Offer",
    emoji: "🎁",
    categoryId: "market_sell",
    hint: "A package or pricing offer",
    catalogLabels: ["Offer"],
  },
  {
    id: "sales-funnel",
    label: "Sales Funnel",
    emoji: "🔽",
    categoryId: "market_sell",
    hint: "The path someone follows from interest to buying",
    catalogLabels: ["Sales Funnel"],
  },
  {
    id: "lead-magnet",
    label: "Lead Magnet",
    emoji: "🧲",
    categoryId: "market_sell",
    hint: "A free resource that earns someone's email address",
    catalogLabels: ["Lead Magnet"],
  },
  {
    id: "promotion",
    label: "Promotion",
    emoji: "📄",
    categoryId: "market_sell",
    hint: "A flyer or handout promoting an offer or event",
    catalogLabels: ["Flyer"],
  },
  {
    id: "launch",
    label: "Launch",
    emoji: "🚀",
    categoryId: "market_sell",
    hint: "A plan for introducing something new",
    catalogLabels: ["Launch Plan"],
  },
  {
    id: "sales-page",
    label: "Sales Page",
    emoji: "💰",
    categoryId: "market_sell",
    hint: "A long-form page that sells one offer",
    catalogLabels: ["Sales Page"],
  },
  {
    id: "landing-page",
    label: "Landing Page",
    emoji: "🌐",
    categoryId: "market_sell",
    hint: "A page that captures interest or leads",
    catalogLabels: ["Landing Page"],
  },
  {
    id: "marketing-plan",
    label: "Marketing Plan",
    emoji: "📋",
    categoryId: "market_sell",
    hint: "Tactics and dates for reaching the right people",
    catalogLabels: ["Marketing Plan"],
  },
  {
    id: "facebook-community",
    label: "Facebook Community",
    emoji: "👥",
    categoryId: "market_sell",
    hint: "A guided Facebook group — positioned, branded, and ready to grow",
    catalogLabels: ["Facebook Community"],
  },

  // ── Work With Clients ─────────────────────────────────────────────────
  {
    id: "client-onboarding",
    label: "Client Onboarding",
    emoji: "🤝",
    categoryId: "work_with_clients",
    hint: "A clear path for a brand-new client",
    catalogLabels: ["Client Onboarding"],
  },
  {
    id: "proposal",
    label: "Proposal",
    emoji: "📄",
    categoryId: "work_with_clients",
    hint: "A scope of work or client proposal",
    catalogLabels: ["Proposal"],
  },
  {
    id: "client-communication",
    label: "Client Communication",
    emoji: "💬",
    categoryId: "work_with_clients",
    hint: "A warm, short message to someone you serve",
    catalogLabels: [
      "Client Check-In",
      "Referral Request",
      "Testimonial Request",
    ],
    subtypeQuestion: "What kind of message is this?",
    subtypes: [
      { id: "check-in", label: "Check-in", catalogLabel: "Client Check-In" },
      {
        id: "referral-request",
        label: "Referral request",
        catalogLabel: "Referral Request",
      },
      {
        id: "testimonial-request",
        label: "Testimonial request",
        catalogLabel: "Testimonial Request",
      },
    ],
  },

  // ── Plan Something ───────────────────────────────────────────────────
  {
    id: "event",
    label: "Event",
    emoji: "🎪",
    categoryId: "plan_something",
    hint: "A gathering — from an intimate meetup to a launch party",
    catalogLabels: ["Event Plan", "Workshop"],
    subtypeQuestion: "What kind of event are you planning?",
    subtypes: [
      { id: "webinar", label: "Webinar", catalogLabel: "Event Plan" },
      { id: "workshop", label: "Workshop", catalogLabel: "Workshop" },
      {
        id: "networking-event",
        label: "Networking event",
        catalogLabel: "Event Plan",
      },
      { id: "launch-event", label: "Launch event", catalogLabel: "Event Plan" },
      { id: "client-event", label: "Client event", catalogLabel: "Event Plan" },
      {
        id: "personal-event",
        label: "Personal event",
        catalogLabel: "Event Plan",
      },
    ],
  },
  {
    id: "course",
    label: "Course",
    emoji: "📚",
    categoryId: "plan_something",
    hint: "A course or curriculum outline",
    catalogLabels: ["Course Outline"],
  },
  {
    id: "five-day-plan",
    label: "5-Day Plan",
    emoji: "📅",
    categoryId: "plan_something",
    hint: "A short, focused sprint plan",
    catalogLabels: ["5-Day Plan"],
  },

  // ── Build the Business ────────────────────────────────────────────────
  {
    id: "strategy",
    label: "Strategy",
    emoji: "🎯",
    categoryId: "build_the_business",
    hint: "Your overall direction for marketing or content",
    catalogLabels: ["Marketing Strategy", "Content Strategy"],
    subtypeQuestion: "What kind of strategy are you shaping?",
    subtypes: [
      { id: "marketing", label: "Marketing", catalogLabel: "Marketing Strategy" },
      { id: "content", label: "Content", catalogLabel: "Content Strategy" },
    ],
  },
  {
    id: "standard-operating-procedure",
    label: "Standard Operating Procedure",
    emoji: "📋",
    categoryId: "build_the_business",
    hint: "How a process, automation, or workflow works — in writing",
    catalogLabels: ["SOP", "Process", "Automation", "GHL Workflow"],
    subtypeQuestion: "What kind of procedure is this?",
    subtypes: [
      { id: "standard-procedure", label: "Standard procedure", catalogLabel: "SOP" },
      { id: "general-process", label: "General process", catalogLabel: "Process" },
      { id: "automation", label: "Automation", catalogLabel: "Automation" },
      {
        id: "ghl-workflow",
        label: "Go High Level workflow",
        catalogLabel: "GHL Workflow",
      },
    ],
  },
  {
    id: "business-plan",
    label: "Business Plan",
    emoji: "🏢",
    categoryId: "build_the_business",
    hint: "A formal plan for the business as a whole",
    catalogLabels: ["Business Plan"],
  },

  // ── Organize Information ──────────────────────────────────────────────
  {
    id: "checklist",
    label: "Checklist",
    emoji: "✅",
    categoryId: "organize_information",
    hint: "A clear step list for a task, process, or event",
    catalogLabels: ["Checklist"],
  },
  {
    id: "guide",
    label: "Guide",
    emoji: "📖",
    categoryId: "organize_information",
    hint: "A guide that teaches a process to someone else",
    catalogLabels: ["Training Guide"],
  },
  {
    id: "template",
    label: "Template",
    emoji: "🤖",
    categoryId: "organize_information",
    hint: "A reusable template, including AI prompts",
    catalogLabels: ["Claude Prompt"],
  },
  {
    id: "reference-document",
    label: "Reference Document",
    emoji: "📄",
    categoryId: "organize_information",
    hint: "Anything else that does not fit the categories above",
    catalogLabels: ["Document"],
  },
  {
    id: "content-calendar",
    label: "Content Calendar",
    emoji: "🗓️",
    categoryId: "organize_information",
    hint: "When you will publish or share content",
    catalogLabels: ["Content Calendar"],
  },
] as const;

/** Look up the parent type that owns a given catalog label. */
export function parentTypeForCatalogLabel(
  label: string,
): CreateParentType | undefined {
  const target = label.trim().toLowerCase();
  return CREATE_PARENT_TYPES.find((p) =>
    p.catalogLabels.some((l) => l.toLowerCase() === target),
  );
}

export function parentTypesForCategory(
  categoryId: CreateBrowseCategoryId,
): CreateParentType[] {
  return CREATE_PARENT_TYPES.filter((p) => p.categoryId === categoryId);
}

/** Default catalog item for a parent type (before a subtype narrows it further). */
export function defaultCatalogItemForParentType(
  parent: CreateParentType,
): CreateCatalogItem | undefined {
  const first = parent.catalogLabels[0];
  return first ? findCatalogItem(first) : undefined;
}

/** Resolve the catalog item a chosen subtype should create. */
export function catalogItemForSubtype(
  parent: CreateParentType,
  subtypeId: string,
): CreateCatalogItem | undefined {
  const subtype = parent.subtypes?.find((s) => s.id === subtypeId);
  const label = subtype?.catalogLabel ?? parent.catalogLabels[0];
  return label ? findCatalogItem(label) : undefined;
}
