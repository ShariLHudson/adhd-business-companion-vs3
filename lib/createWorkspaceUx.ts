// ADHD-friendly Create workspace — one decision at a time.

import { matchCatalogFromText, type CreateCatalogItem } from "./createCatalog";

export type CreateFeaturedItem = {
  label: string;
  emoji: string;
  /** Catalog label when different (e.g. Social Post → Social Campaign). */
  typeLabel?: string;
};

export const CREATE_FEATURED: CreateFeaturedItem[] = [
  { label: "Proposal", emoji: "📄" },
  { label: "Workshop", emoji: "🎓" },
  { label: "Email", emoji: "✉️" },
  {
    label: "Social Post",
    emoji: "📱",
    typeLabel: "Social Campaign",
  },
  { label: "Presentation", emoji: "📊" },
];

const PROMPT_QUESTIONS: Record<string, string> = {
  Proposal: "What is the proposal for?",
  Workshop: "What is the workshop about?",
  Email: "What should this email accomplish?",
  "Social Post": "What is the post about?",
  "Social Campaign": "What is the campaign about?",
  Presentation: "What is the presentation for?",
  "LinkedIn Post": "What is the post about?",
  Blog: "What is the blog post about?",
  Script: "What is the script for?",
  Newsletter: "What is this newsletter about?",
  SOP: "What process should this SOP cover?",
  Offer: "What offer are you describing?",
  "Sales Page": "What are you selling?",
  "Business Plan": "What is the business or venture?",
  "Marketing Plan": "What are you marketing?",
};

export function createPromptQuestion(typeLabel: string): string {
  return PROMPT_QUESTIONS[typeLabel] ?? "What's this about?";
}

export function resolveFeaturedType(item: CreateFeaturedItem): string {
  return item.typeLabel ?? item.label;
}

export type DraftQuickEdit = {
  id: string;
  label: string;
  instruction: string;
};

export const DRAFT_QUICK_EDITS: DraftQuickEdit[] = [
  { id: "shorter", label: "Make it shorter", instruction: "Make it shorter while keeping the main points." },
  { id: "longer", label: "Make it longer", instruction: "Expand with more helpful detail." },
  { id: "warmer", label: "Make it warmer", instruction: "Make the tone warmer and more human." },
  {
    id: "professional",
    label: "More professional",
    instruction: "Make it more professional and polished.",
  },
  { id: "simpler", label: "Make it simpler", instruction: "Simplify the language — plain and skimmable." },
  {
    id: "detail",
    label: "Add more detail",
    instruction: "Add more helpful detail where it strengthens the piece.",
  },
  {
    id: "examples",
    label: "Add examples",
    instruction: "Add concrete examples that make the content clearer.",
  },
  {
    id: "pricing",
    label: "Add pricing",
    instruction: "Add or clarify pricing information where appropriate.",
  },
  {
    id: "next-steps",
    label: "Add next steps",
    instruction: "Add clear next steps at the end.",
  },
];

export const DRAFT_EDIT_EXAMPLES = [
  "Make it shorter",
  "Add pricing",
  "Make it friendlier",
  "Add examples",
  "Add CTA",
  "More professional",
];

/** Match search text to a create type or routed tool. */
export function matchCreateSearch(text: string): {
  type?: string;
  route?: CreateCatalogItem["route"];
} | null {
  return matchCatalogFromText(text);
}
