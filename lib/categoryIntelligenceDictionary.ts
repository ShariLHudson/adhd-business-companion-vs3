/**
 * Category Intelligence Dictionary — training wheels for brain-dump classification.
 * Layer 1 before entity match (PR 4) and AI fallback.
 */

import { normalizeCategory } from "./brainDumpCategories";

export type DictionaryGroup = "health" | "business" | "family" | "personal";

export type DictionaryClassifyResult = {
  topic: string;
  category: string;
  contextType: string;
  suggestion: string;
};

type DictionaryRule = {
  /** Lowercase phrase; matched on word boundaries where possible. */
  phrase: string;
  group: DictionaryGroup;
  category?: string;
  weight?: number;
};

const HEALTH_RULES: DictionaryRule[] = [
  "doctor",
  "dr",
  "dentist",
  "orthopedic",
  "physical therapy",
  "therapy",
  "ultrasound",
  "mri",
  "xray",
  "x-ray",
  "prescription",
  "medication",
  "tirzepatide",
  "levothyroxine",
  "bloodwork",
  "lab",
  "appointment",
  "hospital",
  "clinic",
  "arthritis",
  "pain",
  "knee",
  "hip",
  "foot",
  "leg",
  "swelling",
  "headache",
  "migraine",
  "sleep",
  "exercise",
  "bike",
  "walking",
  "nutrition",
  "meal plan",
  "factor meals",
  "weight",
].map((phrase) => ({ phrase, group: "health" as const, category: "Health" }));

const BUSINESS_RULES: DictionaryRule[] = [
  { phrase: "newsletter", group: "business", category: "Marketing" },
  { phrase: "marketing", group: "business", category: "Marketing" },
  { phrase: "sales", group: "business", category: "Sales" },
  { phrase: "client", group: "business", category: "Client Work" },
  { phrase: "customer", group: "business", category: "Sales" },
  { phrase: "lead", group: "business", category: "Sales" },
  { phrase: "prospect", group: "business", category: "Sales" },
  { phrase: "linkedin", group: "business", category: "Marketing" },
  { phrase: "facebook", group: "business", category: "Marketing" },
  { phrase: "instagram", group: "business", category: "Marketing" },
  { phrase: "pinterest", group: "business", category: "Marketing" },
  { phrase: "post", group: "business", category: "Content" },
  { phrase: "content", group: "business", category: "Content" },
  { phrase: "email sequence", group: "business", category: "Content" },
  { phrase: "landing page", group: "business", category: "Marketing" },
  { phrase: "funnel", group: "business", category: "Marketing" },
  { phrase: "affiliate", group: "business", category: "Marketing" },
  { phrase: "course", group: "business", category: "Product / Services" },
  { phrase: "workshop", group: "business", category: "Product / Services" },
  { phrase: "companion", group: "business", category: "Website / Tech" },
  { phrase: "app", group: "business", category: "Website / Tech" },
  { phrase: "ecosystem", group: "business", category: "Website / Tech" },
  { phrase: "postcraft", group: "business", category: "Website / Tech" },
  { phrase: "ghl", group: "business", category: "Admin" },
  { phrase: "highlevel", group: "business", category: "Admin" },
  { phrase: "crm", group: "business", category: "Admin" },
  { phrase: "odoo", group: "business", category: "Admin" },
  { phrase: "invoice", group: "business", category: "Finance" },
  { phrase: "proposal", group: "business", category: "Sales" },
  { phrase: "contract", group: "business", category: "Sales" },
  { phrase: "revenue", group: "business", category: "Finance" },
  { phrase: "launch", group: "business", category: "Marketing" },
  { phrase: "pricing", group: "business", category: "Finance" },
  { phrase: "founder", group: "business", category: "Admin" },
  { phrase: "demo", group: "business", category: "Sales" },
];

const FAMILY_RULES: DictionaryRule[] = [
  "grandson",
  "granddaughter",
  "grandkids",
  "daughter",
  "son",
  "mom",
  "dad",
  "sister",
  "brother",
  "family",
  "birthday",
  "holiday",
  "wedding",
  "hockey game",
].map((phrase) => ({ phrase, group: "family" as const, category: "Family" }));

const PERSONAL_RULES: DictionaryRule[] = [
  { phrase: "plants", group: "personal", category: "Personal Errands" },
  { phrase: "garden", group: "personal", category: "Home" },
  { phrase: "crafts", group: "personal", category: "Personal Errands" },
  { phrase: "journaling", group: "personal", category: "Personal Errands" },
  { phrase: "coloring", group: "personal", category: "Personal Errands" },
  { phrase: "painting", group: "personal", category: "Personal Errands" },
  { phrase: "concert", group: "personal", category: "Personal Errands" },
  { phrase: "movie", group: "personal", category: "Personal Errands" },
  { phrase: "netflix", group: "personal", category: "Personal Errands" },
  { phrase: "vacation", group: "personal", category: "Personal Errands" },
  { phrase: "shopping", group: "personal", category: "Personal Errands" },
  { phrase: "errands", group: "personal", category: "Personal Errands" },
  { phrase: "house", group: "personal", category: "Home" },
  { phrase: "laundry", group: "personal", category: "Home" },
  { phrase: "cleaning", group: "personal", category: "Home" },
];

export const CATEGORY_INTELLIGENCE_RULES: DictionaryRule[] = [
  ...HEALTH_RULES,
  ...BUSINESS_RULES,
  ...FAMILY_RULES,
  ...PERSONAL_RULES,
].sort((a, b) => b.phrase.length - a.phrase.length);

const GROUP_TOPIC: Record<DictionaryGroup, string> = {
  health: "Health",
  business: "Business",
  family: "Family",
  personal: "Personal",
};

const GROUP_DEFAULT_CATEGORY: Record<DictionaryGroup, string> = {
  health: "Health",
  business: "Admin",
  family: "Family",
  personal: "Personal Errands",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseMatches(text: string, phrase: string): boolean {
  if (phrase.includes(" ")) {
    return text.includes(phrase);
  }
  const re = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i");
  return re.test(text);
}

function inferContextType(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(urgent|asap|today|now|deadline)\b/.test(lower)) return "urgent";
  if (/\b(remind|remember|don't forget)\b/.test(lower)) return "reminder";
  if (/\b(idea|maybe|what if|brainstorm)\b/.test(lower)) return "idea";
  if (/\b(call|email|text|schedule|book|finish|send|pay|invoice)\b/.test(lower)) {
    return "task";
  }
  return "thought";
}

function inferSuggestion(text: string, contextType: string): string {
  const lower = text.toLowerCase();
  if (/\b(appointment|schedule|call|meeting|time block|at \d|tomorrow|monday|tuesday|wednesday|thursday|friday)\b/.test(lower)) {
    return "timeblock";
  }
  if (contextType === "reminder") return "reminder";
  if (/\b(project|launch|build|create|plan|campaign|funnel|website)\b/.test(lower)) {
    return "project";
  }
  return "keep";
}

function isNarrativeSingleThought(text: string): boolean {
  return /\b,\s*(but|and|which|because|although|though)\s+/i.test(text);
}

/**
 * Attempt dictionary classification. Returns null when confidence is not high
 * enough — caller should fall through to entity match (PR 4) then AI.
 */
export function classifyFromDictionary(
  raw: string,
): DictionaryClassifyResult | null {
  const text = raw.trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  if (isNarrativeSingleThought(lower)) return null;
  const groupScores = new Map<DictionaryGroup, number>();
  const categoryScores = new Map<string, number>();

  for (const rule of CATEGORY_INTELLIGENCE_RULES) {
    if (!phraseMatches(lower, rule.phrase)) continue;
    const weight = rule.weight ?? 1;
    groupScores.set(rule.group, (groupScores.get(rule.group) ?? 0) + weight);
    if (rule.category) {
      categoryScores.set(
        rule.category,
        (categoryScores.get(rule.category) ?? 0) + weight,
      );
    }
  }

  if (groupScores.size === 0) return null;

  const rankedGroups = [...groupScores.entries()].sort((a, b) => b[1] - a[1]);
  const [topGroup, topScore] = rankedGroups[0]!;
  const secondScore = rankedGroups[1]?.[1] ?? 0;

  // Require a clear winner — avoid false positives on mixed sentences.
  if (topScore < 1) return null;
  if (rankedGroups.length > 1 && topScore === secondScore) return null;
  if (rankedGroups.length > 1 && topScore < secondScore * 1.5 && topScore < 2) {
    return null;
  }

  const topic = GROUP_TOPIC[topGroup];
  const rankedCategories = [...categoryScores.entries()].sort(
    (a, b) => b[1] - a[1],
  );
  const category = normalizeCategory(
    rankedCategories[0]?.[0] ?? GROUP_DEFAULT_CATEGORY[topGroup],
  );
  const contextType = inferContextType(lower);
  const suggestion = inferSuggestion(lower, contextType);

  return { topic, category, contextType, suggestion };
}
