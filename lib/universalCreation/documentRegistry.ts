/**
 * Document type plugins — same journey, different questions and enhancements.
 */

import type { UniversalDocumentPlugin } from "./types";

const STANDARD_SLOTS = {
  why: (topic: string) =>
    `What's the main reason you're creating this ${topic}?`,
  who: "Who is this for?",
  success: "What would success look like when this is done?",
} as const;

function plugin(
  partial: Omit<UniversalDocumentPlugin, "discoveryQuestions"> & {
    discoveryQuestions?: UniversalDocumentPlugin["discoveryQuestions"];
  },
): UniversalDocumentPlugin {
  const label = partial.label.toLowerCase();
  return {
    ...partial,
    discoveryQuestions: partial.discoveryQuestions ?? [
      {
        id: `${partial.id}-why`,
        slot: "why",
        prompt: STANDARD_SLOTS.why(label),
        signalPatterns: [
          /\b(?:because|so that|to help|goal|purpose|need to|want to)\b/i,
        ],
      },
      {
        id: `${partial.id}-who`,
        slot: "who",
        prompt: STANDARD_SLOTS.who,
        signalPatterns: [
          /\b(?:for my|for a|client|customer|team|va|audience|reader)\b/i,
        ],
      },
      {
        id: `${partial.id}-success`,
        slot: "success",
        prompt: STANDARD_SLOTS.success,
        signalPatterns: [
          /\b(?:so they|result|outcome|convert|reply|sign up|follow|complete)\b/i,
        ],
      },
    ],
  };
}

export const UNIVERSAL_DOCUMENT_PLUGINS: readonly UniversalDocumentPlugin[] = [
  plugin({
    id: "email",
    label: "Email",
    createItemType: "Email",
    detectPatterns: [/\b(?:an? )?email\b/i],
    intro: "I'd be happy to help with this email.\n\nLet me understand what you're trying to accomplish.",
    enhancements: [
      { id: "subject-lines", label: "Subject line options", description: "A few subject lines to choose from" },
      { id: "preview-text", label: "Preview text", description: "Inbox preview that supports the subject" },
      { id: "cta-variants", label: "Call to action options", description: "Clear next-step wording" },
    ],
    completionActions: [
      { id: "copy", label: "Copy text" },
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "save-template", label: "Save as Template" },
      { id: "attach-project", label: "Attach to Project" },
    ],
    uncertaintyPaths: ["recommend", "examples", "teach"],
  }),
  plugin({
    id: "newsletter",
    label: "Newsletter",
    createItemType: "Newsletter",
    detectPatterns: [/\bnewsletter\b/i],
    intro: "Let's create a newsletter that feels like you.\n\nA couple of quick questions first.",
    enhancements: [
      { id: "subject-lines", label: "Subject lines", description: "Options for the inbox" },
      { id: "preview-text", label: "Preview text", description: "Supports the subject line" },
      { id: "social-posts", label: "Social posts", description: "Pull quotes for social media" },
      { id: "cta", label: "Call to action", description: "One clear next step for readers" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "save-template", label: "Save as Template" },
      { id: "schedule-social", label: "Draft social posts" },
    ],
    uncertaintyPaths: ["recommend", "examples", "research"],
  }),
  plugin({
    id: "sop",
    label: "SOP",
    createItemType: "SOP",
    detectPatterns: [
      /\b(?:an? )?sop\b|standard operating procedure\b/i,
    ],
    intro:
      "I'd be happy to help.\n\nLet me understand what you're trying to build.",
    discoveryQuestions: [
      {
        id: "sop-audience-type",
        slot: "who",
        prompt: "Is this SOP for your own business, or for a client?",
        signalPatterns: [
          /\b(?:my (?:own )?business|our (?:team|company)|for a client|client'?s)\b/i,
        ],
      },
      {
        id: "sop-starting-point",
        slot: "why",
        prompt:
          "Are you starting from scratch, or do you already have a process written down somewhere?",
        signalPatterns: [
          /\b(?:from scratch|starting fresh|already have|written down|existing)\b/i,
        ],
      },
      {
        id: "sop-audience-size",
        slot: "success",
        prompt:
          "Will one person use this, or will multiple people need to follow it?",
        signalPatterns: [
          /\b(?:just me|one person|solo|team|multiple|va|assistant|staff)\b/i,
        ],
      },
    ],
    enhancements: [
      { id: "checklist", label: "Printable checklist", description: "Quick-reference checklist from the SOP" },
      { id: "training-guide", label: "Training guide", description: "Onboarding companion for new users" },
      { id: "screenshots", label: "Screenshot placeholders", description: "Room for visuals where steps need them" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "checklist", label: "Generate checklist" },
      { id: "operations-manual", label: "Add to Operations Manual" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples", "research"],
  }),
  plugin({
    id: "proposal",
    label: "Proposal",
    createItemType: "Proposal",
    detectPatterns: [/\b(?:an? )?proposal\b/i],
    intro: "Let's build a proposal that wins trust.\n\nFirst, help me understand the opportunity.",
    enhancements: [
      { id: "cover-letter", label: "Cover letter", description: "Warm opening before the details" },
      { id: "timeline", label: "Timeline", description: "Clear phases and milestones" },
      { id: "pricing-summary", label: "Pricing summary", description: "Clean pricing section" },
      { id: "approval-page", label: "Approval page", description: "Simple yes path for the client" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "email", label: "Draft cover email" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples", "research"],
  }),
  plugin({
    id: "social_post",
    label: "Social Post",
    createItemType: "Social Post",
    detectPatterns: [
      /\b(?:social post|social media post|(?:facebook|linkedin|instagram) post|caption)\b/i,
    ],
    intro: "Let's craft something worth stopping the scroll for.",
    enhancements: [
      { id: "hook-variants", label: "Opening hook options", description: "Strong first lines" },
      { id: "hashtags", label: "Hashtag suggestions", description: "When they fit the platform" },
      { id: "cta", label: "Call to action", description: "What you want readers to do" },
    ],
    completionActions: [
      { id: "copy", label: "Copy text" },
      { id: "save-template", label: "Save as Template" },
      { id: "attach-project", label: "Attach to Project" },
    ],
    uncertaintyPaths: ["recommend", "examples"],
  }),
  plugin({
    id: "checklist",
    label: "Checklist",
    createItemType: "Checklist",
    detectPatterns: [/\b(?:an? )?checklist\b/i],
    intro: "Let's make a checklist people will actually use.",
    enhancements: [
      { id: "printable", label: "Printable layout", description: "Clean format for printing" },
      { id: "sop-link", label: "Link to related SOP", description: "When this supports a process" },
    ],
    completionActions: [
      { id: "pdf", label: "Download PDF" },
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples"],
  }),
  plugin({
    id: "business_plan",
    label: "Business Plan",
    createItemType: "Marketing Plan",
    detectPatterns: [/\b(?:business plan|marketing plan)\b/i],
    intro: "Let's shape a plan you can actually work from.",
    enhancements: [
      { id: "executive-summary", label: "Executive summary", description: "One-page overview" },
      { id: "financial-outline", label: "Financial outline", description: "High-level numbers section" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "momentum", label: "Break into Momentum projects" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["teach", "recommend", "research", "examples"],
  }),
  plugin({
    id: "course",
    label: "Course",
    createItemType: "Document",
    detectPatterns: [/\b(?:an? )?course\b|training program\b/i],
    intro: "Let's design a course that helps people grow.",
    enhancements: [
      { id: "workbook", label: "Workbook", description: "Exercises and worksheets" },
      { id: "slides", label: "Slide outline", description: "Lesson presentation structure" },
      { id: "handouts", label: "Handouts", description: "Takeaway materials" },
      { id: "certificate", label: "Certificate", description: "Completion certificate template" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "knowledge-library", label: "Add to Knowledge Library" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["teach", "recommend", "research", "examples"],
  }),
  plugin({
    id: "blog",
    label: "Blog",
    createItemType: "Document",
    detectPatterns: [/\b(?:blog(?:\s+post)?|article)\b/i],
    intro: "Let's write something your reader will be glad they found.",
    enhancements: [
      { id: "headlines", label: "Headline options", description: "Titles that earn the click" },
      { id: "seo-outline", label: "SEO outline", description: "Structure for search and skimming" },
      { id: "social-pull", label: "Social pull quotes", description: "Shareable snippets" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "copy", label: "Copy text" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples", "research"],
  }),
  plugin({
    id: "guide",
    label: "Guide",
    createItemType: "Document",
    detectPatterns: [/\b(?:how[- ]to guide|guide|playbook)\b/i],
    intro: "Let's build a guide that makes the path clear.",
    enhancements: [
      { id: "quick-start", label: "Quick-start page", description: "One-page overview" },
      { id: "examples", label: "Worked examples", description: "Show what good looks like" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "knowledge-library", label: "Add to Knowledge Library" },
    ],
    uncertaintyPaths: ["teach", "recommend", "examples"],
  }),
  plugin({
    id: "workbook",
    label: "Workbook",
    createItemType: "Document",
    detectPatterns: [/\bworkbook\b/i],
    intro: "Let's create a workbook people can work through step by step.",
    enhancements: [
      { id: "exercises", label: "Exercise pages", description: "Prompts and fill-in sections" },
      { id: "answer-key", label: "Facilitator notes", description: "For coaches and trainers" },
    ],
    completionActions: [
      { id: "pdf", label: "Download PDF" },
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples"],
  }),
  plugin({
    id: "training_manual",
    label: "Training Manual",
    createItemType: "Document",
    detectPatterns: [/\b(?:training manual|training guide|onboarding guide)\b/i],
    intro: "Let's build training materials that stick.",
    enhancements: [
      { id: "checklist", label: "Trainer checklist", description: "Session delivery guide" },
      { id: "quizzes", label: "Knowledge checks", description: "Short comprehension checks" },
    ],
    completionActions: [
      { id: "pdf", label: "Download PDF" },
      { id: "operations-manual", label: "Add to Operations Manual" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["teach", "recommend", "research", "examples"],
  }),
  plugin({
    id: "book_chapter",
    label: "Book Chapter",
    createItemType: "Document",
    detectPatterns: [/\b(?:book chapter|chapter draft)\b/i],
    intro: "Let's develop this chapter with a clear arc.",
    enhancements: [
      { id: "outline", label: "Chapter outline", description: "Section structure before drafting" },
      { id: "pull-quotes", label: "Pull quotes", description: "Memorable lines for promotion" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples", "teach"],
  }),
  plugin({
    id: "meeting_agenda",
    label: "Meeting Agenda",
    createItemType: "Document",
    detectPatterns: [/\b(?:meeting agenda|agenda for)\b/i],
    intro: "Let's plan a meeting that respects everyone's time.",
    enhancements: [
      { id: "pre-read", label: "Pre-read notes", description: "What to review beforehand" },
      { id: "follow-up", label: "Follow-up template", description: "Capture decisions after" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "copy", label: "Copy text" },
      { id: "calendar", label: "Add to calendar invite" },
    ],
    uncertaintyPaths: ["recommend", "examples"],
  }),
  plugin({
    id: "white_paper",
    label: "White Paper",
    createItemType: "Document",
    detectPatterns: [/\bwhite paper\b/i],
    intro: "Let's build a white paper that earns trust and clarity.",
    enhancements: [
      { id: "executive-summary", label: "Executive summary", description: "One-page overview" },
      { id: "research-citations", label: "Research section", description: "Evidence and sources" },
    ],
    completionActions: [
      { id: "pdf", label: "Download PDF" },
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "knowledge-library", label: "Add to Knowledge Library" },
    ],
    uncertaintyPaths: ["teach", "research", "examples"],
  }),
  plugin({
    id: "workflow",
    label: "Workflow",
    createItemType: "Workflow",
    detectPatterns: [/\b(?:an? )?workflow\b/i],
    intro: "Let's map a workflow your team can follow.",
    enhancements: [
      { id: "flowchart", label: "Flowchart outline", description: "Visual process map" },
      { id: "checklist", label: "Checklist", description: "Step-by-step reference" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples"],
  }),
  plugin({
    id: "document",
    label: "Document",
    createItemType: "Document",
    detectPatterns: [
      /\b(?:help me (?:create|write|draft)|create a|write a|draft a|need a)\b/i,
    ],
    intro: "I'd love to help you create this.\n\nLet me understand what you're building.",
    uncertaintyPaths: ["recommend", "examples", "teach"],
    enhancements: [],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "save-template", label: "Save as Template" },
    ],
  }),
];

export function pluginById(
  id: UniversalDocumentPlugin["id"],
): UniversalDocumentPlugin | undefined {
  return UNIVERSAL_DOCUMENT_PLUGINS.find((p) => p.id === id);
}

export function pluginByCreateItemType(
  itemType: string,
): UniversalDocumentPlugin | undefined {
  const t = itemType.toLowerCase();
  return UNIVERSAL_DOCUMENT_PLUGINS.find(
    (p) => p.createItemType.toLowerCase() === t,
  );
}
