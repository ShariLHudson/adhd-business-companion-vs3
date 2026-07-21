/**
 * Document type plugins — same journey, different questions and enhancements.
 *
 * Discovery questions and intros come from documentCreationProfiles.ts.
 */

import { getDocumentCreationProfile } from "./documentCreationProfiles";
import type { UniversalDocumentPlugin } from "./types";

type PluginInput = Omit<
  UniversalDocumentPlugin,
  "discoveryQuestions" | "intro" | "label"
> & {
  label?: string;
  intro?: string;
  discoveryQuestions?: UniversalDocumentPlugin["discoveryQuestions"];
};

function plugin(partial: PluginInput): UniversalDocumentPlugin {
  const profile = getDocumentCreationProfile(partial.id);
  return {
    ...partial,
    label: partial.label ?? profile.label,
    intro: partial.intro ?? profile.intro,
    discoveryQuestions:
      partial.discoveryQuestions ?? profile.discoveryQuestions,
  };
}

export const UNIVERSAL_DOCUMENT_PLUGINS: readonly UniversalDocumentPlugin[] = [
  plugin({
    id: "email",
    createItemType: "Email",
    detectPatterns: [
      /\b(?:write|draft|compose|send|craft)\b.{0,48}\b(?:an?\s+)?e-?mails?\b/i,
      /\b(?:an?\s+)?e-?mail\s+to\b/i,
      /\bhelp me (?:write|draft|compose)\b.{0,36}\be-?mails?\b/i,
      /\bneed(?:s|ed)? to (?:write|draft|compose|send)\b.{0,36}\be-?mails?\b/i,
    ],
    enhancements: [
      { id: "subject-lines", label: "Subject line options", description: "A few subject lines to choose from" },
      { id: "preview-text", label: "Preview text", description: "Inbox preview that supports the subject" },
      { id: "cta-variants", label: "Call to action options", description: "Clear next-step wording" },
    ],
    completionActions: [
      { id: "copy", label: "Copy Email" },
      { id: "gmail-draft", label: "Create Gmail Draft" },
      { id: "send", label: "Send Email" },
      { id: "make-changes", label: "Make Changes" },
      { id: "save", label: "Save for Later" },
    ],
    uncertaintyPaths: ["recommend", "examples", "teach"],
  }),
  plugin({
    id: "newsletter",
    createItemType: "Newsletter",
    detectPatterns: [/\bnewsletter\b/i],
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
    id: "sales_funnel",
    createItemType: "Marketing Plan",
    detectPatterns: [
      /\b(?:sales funnel|marketing funnel|lead funnel|conversion funnel)\b/i,
      /\bfunnel\b/i,
    ],
    enhancements: [
      { id: "stage-map", label: "Stage map", description: "Visual flow from entry to offer" },
      { id: "email-sequence", label: "Email sequence outline", description: "Nurture emails between stages" },
      { id: "landing-copy", label: "Landing page copy", description: "Entry-point page draft" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "momentum", label: "Break into Momentum projects" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["teach", "recommend", "examples", "research"],
  }),
  plugin({
    id: "website",
    createItemType: "Document",
    detectPatterns: [
      /\b(?:website copy|web copy|homepage|home page|landing page|site copy)\b/i,
      /\b(?:website|web site)\b/i,
    ],
    enhancements: [
      { id: "page-outline", label: "Page outline", description: "All pages and sections" },
      { id: "seo-headlines", label: "SEO headlines", description: "Search-friendly titles" },
      { id: "cta-blocks", label: "CTA blocks", description: "Primary actions per page" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples", "research"],
  }),
  plugin({
    id: "sop",
    createItemType: "SOP",
    detectPatterns: [
      /\b(?:an? )?sop\b|standard operating procedure\b/i,
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
    createItemType: "Proposal",
    detectPatterns: [/\b(?:an? )?proposal\b/i],
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
    createItemType: "Social Post",
    detectPatterns: [
      /\b(?:social post|social media post|(?:facebook|linkedin|instagram) post|linkedin post|caption)\b/i,
    ],
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
    createItemType: "Checklist",
    detectPatterns: [/\b(?:an? )?checklist\b/i],
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
    createItemType: "Marketing Plan",
    detectPatterns: [
      // Marketing Plan Work Type (105) is UWE — keep business plan + social campaign here
      /\b(?:business plan|social media campaign|social campaign)\b/i,
    ],
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
    createItemType: "Document",
    detectPatterns: [/\b(?:an? )?course\b|training program\b/i],
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
    createItemType: "Document",
    detectPatterns: [/\b(?:blog(?:\s+post)?|article)\b/i],
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
    createItemType: "Document",
    detectPatterns: [
      /\b(?:how[- ]to guide|guide|playbook|lead magnet|client avatar)\b/i,
    ],
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
    createItemType: "Document",
    detectPatterns: [/\bworkbook\b/i],
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
    createItemType: "Document",
    detectPatterns: [/\b(?:training manual|training guide|onboarding guide)\b/i],
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
    createItemType: "Document",
    detectPatterns: [/\b(?:book chapter|chapter draft)\b/i],
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
    createItemType: "Document",
    detectPatterns: [/\b(?:meeting agenda|agenda for)\b/i],
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
    createItemType: "Document",
    detectPatterns: [/\bwhite paper\b/i],
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
    createItemType: "Workflow",
    detectPatterns: [/\b(?:an? )?workflow\b/i],
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
  // Sprint 2 — Workshop / Webinar are Event subtypes (045–065), not documents.
  // Profiles retained only so old sessions can resolve labels; detectPatterns empty.
  plugin({
    id: "workshop",
    createItemType: "Document",
    detectPatterns: [],
    enhancements: [
      { id: "agenda", label: "Session agenda", description: "Timed flow for delivery" },
      { id: "worksheets", label: "Participant worksheets", description: "Hands-on exercises" },
      { id: "follow-up", label: "Follow-up email", description: "Post-workshop nurture message" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples", "teach"],
  }),
  plugin({
    id: "webinar",
    createItemType: "Document",
    detectPatterns: [],
    enhancements: [
      { id: "slides", label: "Slide outline", description: "Key beats for each section" },
      { id: "registration", label: "Registration page copy", description: "Title and promise for sign-ups" },
      { id: "replay-email", label: "Replay follow-up", description: "Email for no-shows and replay viewers" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples", "research"],
  }),
  plugin({
    id: "presentation",
    createItemType: "Document",
    detectPatterns: [/\bpresentation\b/i],
    enhancements: [
      { id: "speaker-notes", label: "Speaker notes", description: "What to say on each slide" },
      { id: "handout", label: "Audience handout", description: "One-page takeaway summary" },
    ],
    completionActions: [
      { id: "google-docs", label: "Open in Google Docs" },
      { id: "pdf", label: "Download PDF" },
      { id: "save-template", label: "Save as Template" },
    ],
    uncertaintyPaths: ["recommend", "examples"],
  }),
  plugin({
    id: "document",
    createItemType: "Document",
    detectPatterns: [
      /\b(?:help me (?:create|write|draft|build|compose|design|outline|plan|develop|generate|make)|(?:create|write|draft|build|compose|design|outline|plan|develop|generate|make)\s+(?:a|an|my|the|new|our)|need a)\b/i,
    ],
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
