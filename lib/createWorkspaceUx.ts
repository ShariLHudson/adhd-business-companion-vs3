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
  { id: "shorter", label: "Shorter", instruction: "Make it shorter while keeping the main points." },
  { id: "longer", label: "Longer", instruction: "Expand with more helpful detail and examples." },
  { id: "friendlier", label: "Friendlier", instruction: "Make the tone warmer and friendlier." },
  {
    id: "professional",
    label: "More Professional",
    instruction: "Make it more professional and polished.",
  },
  { id: "simpler", label: "Simpler", instruction: "Simplify the language — plain and skimmable." },
  {
    id: "cta",
    label: "Stronger CTA",
    instruction: "Add or strengthen the call to action.",
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
